import { StatusCodes } from "http-status-codes";
import productModel from "../../../../DB/model/Product.model.js";
import { ErrorClass } from "../../../utils/ErrorClass.js";
import cartModel from "../../../../DB/model/Cart.model.js";

export const addToCart = async (req, res, next) => {
  const { productID, quantity } = req.body;
  const product = await productModel.findById(productID);

  if (!product) {
    return next(new ErrorClass("Product not found", StatusCodes.NOT_FOUND));
  }
  if (quantity > product.stock) {
    await productModel.findByIdAndUpdate(productID, {
      $addToSet: { wishList: req.user._id },
    });
    return next(
      new ErrorClass("Quantity not available", StatusCodes.BAD_REQUEST)
    );
  }
  //check if product is already in cart
  const cart = await cartModel.findOne({
    userID: req.user._id,
  });
  const productIndex = cart.products.findIndex((element) => {
    return element.product.toString() == productID;
  });
  if (productIndex == -1) {
    cart.products.push({
      product: productID,
      quantity,
    });
  } else {
    cart.products[productIndex].quantity += quantity;
  }
  /* 
  let exist = false;
  for (const product of cart.products) {
    if (product.product.toString() == productID) {
      product.quantity += quantity;
      exist = true;
      break;
    }
  }
  if (!exist) {
    cart.products.push({
      product: productID,
      quantity,
    });
  } 
  */
  await cart.save();
  return res.status(StatusCodes.OK).json({ message: "done", cart });
};

export const deleteFromCart = async (req, res, next) => {
  const { productID } = req.params;
  const product = await productModel.findById(productID);
  if (!product) {
    return next(new ErrorClass("Product not found", StatusCodes.NOT_FOUND));
  }
  const cart = await cartModel.findOneAndUpdate(
    { userID: req.user._id },
    { $pull: { products: { product: productID } } },
    { new: true }
  );
  return res.status(StatusCodes.OK).json({ message: "done", cart });
};

export const getUserCart = async (req, res, next) => {
  const cart = await cartModel
    .findOne({ userID: req.user._id })
    .populate([
      { path: "products.product", select: "name price paymentPrice stock" },
    ]);
  if (!cart) {
    return next(new ErrorClass("Cart not found", StatusCodes.NOT_FOUND));
  }
  let total_price = 0;
  let subTotalPrice = 0;
  //remove null values after populate and calculate total price and subTotalPrice
  cart.products = cart.products.filter((element) => {
    //return console.log(element);
    if (element.product && element.product.stock) {
      if (element.product.stock <= element.quantity) {
        element.quantity = element.product.stock;
      }
      total_price += element.quantity * element.product.paymentPrice;
      subTotalPrice += element.quantity * element.product.price;
      return element;
    }
  });
  await cart.save();
  return res.status(StatusCodes.OK).json({
    message: "done",
    cart,
    subTotalPrice: subTotalPrice.toFixed(2),
    total_price: total_price.toFixed(2),
  });
};
