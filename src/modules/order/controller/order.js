import { StatusCodes } from "http-status-codes";
import couponModel from "../../../../DB/model/Coupon.model.js";
import { ErrorClass } from "../../../utils/ErrorClass.js";
import productModel from "../../../../DB/model/Product.model.js";
import cartModel from "../../../../DB/model/Cart.model.js";
import orderModel, { order } from "../../../../DB/model/Order.model.js";
import Stripe from "stripe";
import { createInvoice } from "../../../utils/pdfkit/createInvoice.js";
import path, { join } from "path";
import { fileURLToPath } from "url";
import sendEmail from "../../../utils/email.js";
import crypto from "crypto-js";
import { __dirname } from "../../../../index.js";
import fs from "fs";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const createOrder = async (req, res, next) => {
  const { address, note, coupon, paymentMethod } = req.body;
  let phone = req.body.phone;
  let { products } = req.body;
  if (coupon) {
    const couponExist = await couponModel.findOne({ code: coupon });
    if (!couponExist)
      return next(new ErrorClass("coupon not found", StatusCodes.BAD_REQUEST));
    if (couponExist.expireDate < new Date())
      return next(new ErrorClass("coupon expired", StatusCodes.BAD_REQUEST));
    if (couponExist.usedBy.length >= (couponExist.noOfUses || Infinity))
      return next(
        new ErrorClass("coupon reched max use limit", StatusCodes.BAD_REQUEST)
      );
    req.body.coupon = couponExist;
    if (req.body.coupon.usedBy.includes(req.user._id))
      return next(
        new ErrorClass("coupon already used", StatusCodes.BAD_REQUEST)
      );
    req.body.coupon.usedBy.push(req.user._id);
  }

  if (!products) {
    const cart = await cartModel.findOne({ userID: req.user._id });
    if (!cart.products.length || !cart) {
      return next(new ErrorClass("cart is empty", StatusCodes.BAD_REQUEST));
    }
    products = cart.products;
  }

  const existingProducts = [];
  const foundIDs = [];
  req.body.price = 0;
  let checkProduct;
  for (const product of products) {
    checkProduct = await productModel.findById(product.product);
    if (!checkProduct)
      return next(new ErrorClass("product not found", StatusCodes.BAD_REQUEST));
    if (checkProduct.stock < product.quantity)
      return next(
        new ErrorClass(
          `not enough stock for product:${checkProduct._id}`,
          StatusCodes.BAD_REQUEST
        )
      );
    existingProducts.push({
      product: {
        name: checkProduct.name,
        price: checkProduct.price,
        description: checkProduct.description,
        paymentPrice: checkProduct.paymentPrice,
        _id: checkProduct._id,
      },
      quantity: product.quantity,
    });
    req.body.price += product.quantity * checkProduct.paymentPrice;
    foundIDs.push(checkProduct._id);
    checkProduct.stock -= product.quantity;
  }
  await checkProduct.save();
  if (!req.body.products) {
    const cart = await cartModel.findOne({ userID: req.user._id });
    if (!cart.products.length || !cart) {
      return next(new ErrorClass("cart is empty", StatusCodes.BAD_REQUEST));
    }
    products = cart.products;
    await cartModel.updateOne(
      { userID: req.user._id },
      {
        $pull: {
          products: {
            product: {
              $in: foundIDs,
            },
          },
        },
      }
    );
  } else await cartModel.updateOne({ userID: req.user._id }, { products: [] });
  req.body.products = existingProducts;
  const paymentPrice = (
    (req.body.price * (100 - (req.body.coupon?.amount || 0))) /
    100
  ).toFixed(2);
  phone =
    phone ||
    crypto.AES.decrypt(req.user.phone, process.env.ENCRYPTION_KEY).toString(
      crypto.enc.Utf8
    );
  const order = await orderModel.create({
    userID: req.user._id,
    address,
    products: existingProducts,
    phone,
    note,
    coupon: req.body.coupon?._id || null,
    price: req.body.price.toFixed(2),
    paymentPrice,
    paymentMethod,
    status: paymentMethod == "cash" ? "placed" : "pending",
  });
  const invoice = {
    customer: {
      email: req.user.email,
      paymentPrice,
      userName: req.user.name,
      address,
      phone,
    },
    items: existingProducts.map((product) => {
      return {
        item: product.product.name,
        amount: product.product.paymentPrice,
        quantity: product.quantity,
        description: product.product.description,
      };
    }),
    subtotal: req.body.price.toFixed(2),
  };
  const pdfPath = path.join("./src/utils/pdfkit/invoice.pdf");
  createInvoice(invoice, pdfPath);
  await sendEmail({
    to: req.user.email,
    subject: "Order Confirmation",
    attachments: [{ filename: `${req.user._id}.pdf`, path: pdfPath }],
  });
  fs.unlinkSync(pdfPath);
  if (paymentMethod == "card") {
    if (req.body.coupon) {
      const coupon = await stripe.coupons.create({
        percent_off: req.body.coupon.amount,
        duration: "once",
      });

      req.body.stripeCoupon = coupon.id;
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: req.user.email,
      metadata: { orderID: order._id.toString() },
      cancel_url: process.env.CANCEL_PAYMENT_REDIRECT,
      success_url: process.env.SUCCESS_PAYMENT_REDIRECT,
      discounts: req.body.stripeCoupon
        ? [{ coupon: req.body.stripeCoupon }]
        : [],
      line_items: existingProducts.map((product) => {
        return {
          price_data: {
            currency: "EGP",
            product_data: {
              name: product.product.name,
              images: [product.product.image],
            },
            unit_amount: parseInt(product.product.paymentPrice * 100),
          },
          quantity: product.quantity,
        };
      }),
    });
    return res
      .status(StatusCodes.CREATED)
      .json({ message: "done", order, url: session.url });
  }
  await req.body?.coupon?.save();
  return res.status(StatusCodes.CREATED).json({ message: "done", order });
};

export const orderWebHook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_ENDPOINT_SECRET
  );

  // Handle the event
  if (event.type == "checkout.session.completed") {
    const order = await orderModel.findByIdAndUpdate(
      event.data.object.metadata.orderID,
      { status: "placed" },
      { new: true }
    );
    res.json({ message: "done", order });
  } else {
    return next(
      new ErrorClass("Unhandled event type", StatusCodes.BAD_REQUEST)
    );
  }
  // Return a 200 response to acknowledge receipt of the event
};

export const cancelOrder = async (req, res, next) => {
  const userID = req.user._id;
  const orderID = req.params.id;
  const order = await orderModel.findOne({ userID, _id: orderID });
  if (!order)
    return next(new ErrorClass('order not found', StatusCodes.NOT_FOUND));
  let cancelArray = ["pending", "delivering", "placed"]
  if (!cancelArray.includes(order.status) || order.paymentMethod == "card")
    return next(new ErrorClass('can not be canceled', StatusCodes.NOT_ACCEPTABLE))
  for (const product of order.products) {
    const id = product.product._id
    await productModel.findByIdAndUpdate(id,
      {
        $inc: { stock: product.quantity }
      }
    )
  }
  if (order?.coupon) {
    await couponModel.findByIdAndUpdate(
      order.coupon,
      {
        $pull: {
          usedBy: userID
        }
      }
    )
  }
  return res.status(StatusCodes.GONE).json({ message: "done" });
}

/* 
export const myCreateOrder = async (req, res, next) => {
  if (req.body.coupon) {
    const couponExist = await couponModel.findOne({ code: req.body.coupon });
    if (!couponExist)
      return next(new ErrorClass("coupon not found", StatusCodes.BAD_REQUEST)); 
    if (couponExist.expireDate < new Date())
      return next(new ErrorClass("coupon expired", StatusCodes.BAD_REQUEST));
    if (couponExist.usedBy.length >= (couponExist.noOfUses || Infinity))
      return next(
        new ErrorClass("coupon reched max use limit", StatusCodes.BAD_REQUEST)
      );
    req.body.coupon = couponExist;
    if (req.body.coupon.usedBy.includes(req.user._id))
      return next(
        new ErrorClass("coupon already used", StatusCodes.BAD_REQUEST)
      );
    req.body.coupon.usedBy.push(req.user._id);
    await req.body.coupon.save();
  }
  if (!req.body.products) {
    const cart = await cartModel
      .findOne({ userID: req.user._id })
      .select("-products._id");
    if (!cart.products.length || !cart) {
      return next(new ErrorClass("cart is empty", StatusCodes.BAD_REQUEST));
    }
    req.body.products = cart.products;
  }
  req.body.price = 0;
  const products = [];
  for (const product of req.body.products) {
    const checkProduct = await productModel.findById(product.product);
    if (checkProduct && checkProduct?.stock >= product.quantity) {
      products.push({
        product: {
          name: checkProduct.name,
          price: checkProduct.price,
          paymentPrice: checkProduct.paymentPrice,
          _id: checkProduct._id,
        },
        quantity: product.quantity,
      });
      req.body.price += product.quantity * checkProduct.paymentPrice;
      checkProduct.stock -= product.quantity;
    }
  }
  if (req.body?.coupon) {
    req.body.coupon = req.body.coupon._id;
  }
  req.body.products = products;
  req.body.paymentPrice =
    (req.body.price * (100 - (req.body.coupon?.amount || 0))) / 100;
  return res.json(req.body);
  (req.body.price = 0), (req.body.paymentPrice = 0);
}; */
