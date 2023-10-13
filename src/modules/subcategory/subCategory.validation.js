import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const addSubCategoryVal = {
  body: joi.object().required().keys({
    name: generalFields.name.required(),
    categoryID: generalFields.id.required(),
  }),
  file: generalFields.file.required(),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};
export const updateSubCategoryVal = {
  body: joi.object().required().keys({
    name: generalFields.name,
  }),
  file: generalFields.file.required(),
  params: joi.object().required().keys({
    id: generalFields.id.required(),
  }),
  query: joi.object().required().keys({}),
};
