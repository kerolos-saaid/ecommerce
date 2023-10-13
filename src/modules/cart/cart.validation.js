import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const addToCartVal = {
  body: joi
    .object()
    .required()
    .keys({
      productID: generalFields.id.required(),
      quantity: joi.number().required().min(1),
    }),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};
export const deleteFromCart = {
  body: joi.object().required().keys({}),
  params: joi
    .object()
    .required()
    .keys({ productID: generalFields.id.required() }),
  query: joi.object().required().keys({}),
};
export const getUserCart = {
  body: joi.object().required().keys(),
  params: joi.object().required().keys(),
  query: joi.object().required().keys(),
};
