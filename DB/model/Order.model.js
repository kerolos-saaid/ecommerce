import mongoose, { model, Schema, Types } from "mongoose";

export const order = new Schema(
  {
    userID: { type: Types.ObjectId, ref: "User", required: true },
    address: { type: String, required: true },
    products: [
      {
        product: {
          name: { type: String, required: true },
          price: { type: Number, required: true },
          paymentPrice: { type: Number, required: true },
          _id: { type: Types.ObjectId, ref: "Product", required: true },
        },
        quantity: { type: Number, default: 1, required: true },
      },
    ],
    phone: { type: String, required: true },
    note: { type: String },
    coupon: { type: Types.ObjectId, ref: "Coupon" },
    price: { type: Number, required: true },
    paymentPrice: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["cash", "card"],
      default: "cash",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "delivering",
        "delivered",
        "placed",
        "canceled",
        "rejected",
      ],
      default: "placed",
      required: true,
    },
    reason: String,
  },
  { id: false, timestamps: true }
);
const orderModel = mongoose.models.Order || model("Order", order);

export default orderModel;
