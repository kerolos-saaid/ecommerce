import mongoose, { model, Schema, Types } from "mongoose";

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, lowercase: true },
    noOfUses: { type: Number },
    usedBy: [{ type: Types.ObjectId, ref: "User"}],
    amount: { type: Number, required: true, min: 1, max: 100 },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    expireDate: { type: Date, required: true, min: new Date() },
  },
  { timestamps: true }
);

const couponModel = mongoose.models.Coupon || model("Coupon", couponSchema);
export default couponModel;
