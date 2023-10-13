import joi from "joi";
import { generalFields } from "../middleware/validation.js";
export const idVal = {
  body: joi.object().required().keys({}),
  params: joi.object().required().keys({ id: generalFields.id.required() }),
  query: joi.object().required().keys({}),
};
