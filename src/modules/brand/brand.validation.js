import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const addBrandVal = {
  body: joi.object().required().keys({
    name: generalFields.name.required(),
  }),
  file: generalFields.file.required(),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};
export const updateBrandVal = {
  body: joi.object().required().keys({
    name: generalFields.name,
  }),
  file: generalFields.file,
  params: joi.object().required().keys({
    id: generalFields.id.required(),
  }),
  query: joi.object().required().keys({}),
};