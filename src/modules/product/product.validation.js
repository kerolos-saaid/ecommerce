import joi from "joi";
import { generalFields } from "./../../middleware/validation.js";
export const addProductVal = {
  body: joi
    .object()
    .keys({
      name: generalFields.name.required(),
      description: generalFields.name.required(),
      price: joi.number().positive(),
      discount: joi.number().min(0).max(100),
      quantity: joi.number().min(0).positive().integer(),
      colors: joi.custom((value, helper) => {
        value = JSON.parse(value);
        const valueSchema = joi.object({
          value: joi.array().items(joi.string()),
        });
        const validationResult = valueSchema.validate({ value });
        if (validationResult.error)
          return helper.message(validationResult.error.details);
        return true;
      }),
      sizes: joi.custom((value, helper) => {
        value = JSON.parse(value);
        const valueSchema = joi.object({
          value: joi.array().items(joi.string()),
        });
        const validationResult = valueSchema.validate({ value });
        if (validationResult.error)
          return helper.message(validationResult.error.details);
        return true;
      }),
      categoryID: generalFields.id.required(),
      subCategoryID: generalFields.id.required(),
      brandID: generalFields.id.required(),
    })
    .required(),
  files: joi
    .object()
    .keys({
      image: joi.array().items(generalFields.file).length(1).required(),
      coverImages: joi.array().items(generalFields.file).max(10),
    })
    .required(),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};
