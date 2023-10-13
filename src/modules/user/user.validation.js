import joi from "joi";
import { generalFields } from "../../middleware/validation.js";
import { Types } from "mongoose";

export const signupVal = {
  body: joi.object().required().keys({
    name: generalFields.name.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    phone: generalFields.phone.required(),
    DOB: joi.date(),
  }),
  file: generalFields.file.required(),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};
export const signinVal = {
  body: joi.object().required().keys({
    email: generalFields.email.required(),
    password: generalFields.password.required(),
  }),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};
export const sendCodeVal = {
  body: joi.object().required().keys({
    email: generalFields.email.required(),
  }),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};
export const resetPasswordVal = {
  body: joi
    .object()
    .required()
    .keys({
      email: generalFields.email.required(),
      code: joi.string().length(6).required(),
      newPassword: generalFields.password.required(),
    }),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};
export const confirmEmailVal = {
  body: joi
    .object()
    .required()
    .keys({
      email: generalFields.email.required(),
      code: joi.string().length(6).required(),
    }),
  params: joi.object().required().keys({}),
  query: joi.object().required().keys({}),
};
