import mongoose, { model, Schema, Types } from "mongoose";

const reviewSchema = new Schema(
  {
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    productID: { type: Types.ObjectId, ref: "Product", required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const reviewModel = mongoose.models.Review || model("Review", reviewSchema);

export default reviewModel;
