import mongoose, { model, Schema, Types } from "mongoose";

export const cart = new Schema(
  {
    userID: { type: Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: { type: Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, default: 1, required: true },
        _id:false
      },
    ],
  },
  { timestamps: true,id: false },
);
const cartModel = mongoose.models.Cart || model("Cart", cart);

export default cartModel;
