import joi from "joi";
import { generalFields } from "./../../middleware/validation.js";
export const addPCouponVal = {
  body: joi
    .object()
    .keys({
      code: joi.string().required(),
      amount: joi.number().min(1).max(100).required(),
      noOfUses: joi.number(),
      expireDate: joi.date().min(new Date()).required(),
    })
    .required(),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};
