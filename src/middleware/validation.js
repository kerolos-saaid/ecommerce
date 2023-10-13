import joi from "joi";
import { Types } from "mongoose";
//import phoneNumber from {phoneNumber}
const dataMethods = ["body", "params", "query", "headers", "file", "files"];
const validateObjectId = (value, helper) => {
  (Types.ObjectId.isValid(value)) ? true : helper.message("In-valid objectId");
};
export const generalFields = {
  email: joi
    .string()
    .email({
      minDomainSegments: 2,
      maxDomainSegments: 4,
      tlds: { allow: ["com", "net"] },
    })
    .required(),
  password: joi.string(),
  cPassword: joi.string().required(),
  id: joi.string().custom(validateObjectId),
  name: joi.string(),
  phone: joi.string(),
  file: joi.object({
    size: joi.number().positive().required(),
    path: joi.string().required(),
    filename: joi.string().required(),
    destination: joi.string().required(),
    mimetype: joi.string().required(),
    encoding: joi.string().required(),
    originalname: joi.string().required(),
    fieldname: joi.string().required(),
  }),
  phone: joi.string(),
};

export const validation = (schema) => {
  return (req, res, next) => {
    const validationErr = [];
    dataMethods.forEach((key) => {
      if (schema[key]) {
        const validationResult = schema[key].validate(req[key], {
          abortEarly: false,
        });
        if (validationResult.error) {
          validationErr.push(validationResult.error.details);
        }
      }
    });

    if (validationErr.length) {
      return res.json({ message: "Validation Err", validationErr });
    }
    return next();
  };
};
