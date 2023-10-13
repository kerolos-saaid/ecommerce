import { StatusCodes } from "http-status-codes";
import { ErrorClass } from "../../../utils/ErrorClass.js";
import productModel from "../../../../DB/model/Product.model.js";
import orderModel from "../../../../DB/model/Order.model.js";
import reviewModel from "../../../../DB/model/Review.model.js";
import { ApiFeatures } from "../../../utils/apiFeatures.js";

export const addReview = async (req, res, next) => {
  const createdBy = req.user._id;
  const { productID, rating, comment } = req.body;
  const checkProduct = await productModel.findById(productID);
  if (!checkProduct) {
    return next(new ErrorClass("Product not found", StatusCodes.NOT_FOUND));
  }
  const checkReviews = await reviewModel.findOne({
    createdBy,
    productID,
  });
  if (checkReviews) {
    return next(
      new ErrorClass(
        "user already reviewed this product",
        StatusCodes.BAD_REQUEST
      )
    );
  }
  const checkOrder = await orderModel.findOne({
    userID: req.user._id,
    "products.product._id": productID,
    status: "delivered",
  });
  if (!checkOrder) {
    return next(
      new ErrorClass(
        "user not allowed to review order",
        StatusCodes.BAD_REQUEST
      )
    );
  }
  const review = await reviewModel.create({
    createdBy,
    productID,
    rating,
    comment,
  });
  const newAvg =
    (checkProduct.avgRate * checkProduct.rateNo + rating) /
    (checkProduct.rateNo + 1);
  checkProduct.avgRate = newAvg;
  checkProduct.rateNo += 1;
  await checkProduct.save();
  return res.status(StatusCodes.CREATED).json({ message: "done", review });
};

export const updateReview = async (req, res, next) => {
  const { reviewID } = req.params;
  const { rating, comment } = req.body;
  const checkReview = await reviewModel.findById(reviewID);
  if (!checkReview) {
    return next(new ErrorClass("Review not found", StatusCodes.NOT_FOUND));
  }
  if (checkReview.createdBy.toString() != req.user._id.toString()) {
    return next(
      new ErrorClass(
        "user not allowed to update this review",
        StatusCodes.BAD_REQUEST
      )
    );
  }
  const review = await reviewModel.findById(reviewID);
  if (rating) {
    const product = await productModel.findById(checkReview.productID);
    product.avgRate =
      (product.avgRate * product.rateNo - checkReview.rating + rating) /
      product.rateNo;
    review.rating = rating;
    await product.save();
  }
  if (comment) {
    review.comment = comment;
  }
  await review.save();
  return res.status(StatusCodes.CREATED).json({ message: "done", review });
};

export const deleteReview = async (req, res, next) => {
  const { reviewID } = req.params;
  const checkReview = await reviewModel.findById(reviewID);
  if (!checkReview) {
    return next(new ErrorClass("Review not found", StatusCodes.NOT_FOUND));
  }
  if (checkReview.createdBy.toString() != req.user._id.toString()) {
    return next(
      new ErrorClass(
        "user not allowed to update this review",
        StatusCodes.BAD_REQUEST
      )
    );
  }
  //update product avgRate
  const product = await productModel.findByIdAndUpdate(checkReview.productID);
  console.log(
    `${product.avgRate} = (${product.avgRate} * ${product.rateNo} - ${
      checkReview.rating
    } ) / ${product.rateNo - 1 || 1}`
  );
  product.avgRate =
    (product.avgRate * product.rateNo - checkReview.rating) /
    (product.rateNo - 1 || 1);
  product.rateNo -= 1;
  product.save();
  await reviewModel.findByIdAndDelete(reviewID);

  return res.status(StatusCodes.CREATED).json({ message: "done", product });
};

export const getReviews = async (req, res, next) => {
  let { page, size } = req.query;
  const apiFeatures = await new ApiFeatures(
    reviewModel.find().populate([{ path: "createdBy", select: "name image.secure_url" }]),
    req.query
  )
    .filter()
    .search()
    .sort()
    .select()
    .pagination();
  const reviews = await apiFeatures.mongooseQuery;
  const reviewsCount = apiFeatures.count;
  return res.status(StatusCodes.ACCEPTED).json({
    message: "Done",
    reviews,
    pagination: apiFeatures.pagination,
  });
};
