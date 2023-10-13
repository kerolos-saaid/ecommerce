import { StatusCodes } from "http-status-codes";
import { ErrorClass } from "../../../utils/ErrorClass.js";
import couponModel from "../../../../DB/model/Coupon.model.js";

export const addCoupon = async (req, res, next) => {
  const { code, amount, noOfUses, expireDate } = req.body;
  const coupon = await couponModel.findOne({ code });
  if (coupon) {
    return next(new ErrorClass("coupon already exist", StatusCodes.CONFLICT));
  }
  const newCoupon = await couponModel.create({
    ...req.body,
    createdBy: req.user._id,
  });
  return res.status(StatusCodes.CREATED).json({ message: "done", newCoupon });
};
