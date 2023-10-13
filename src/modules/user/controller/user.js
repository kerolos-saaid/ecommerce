import bcryptjs from "bcryptjs";
import userModel from "../../../../DB/model/User.model.js";
import cartModel from "../../../../DB/model/Cart.model.js";
import { ErrorClass } from "../../../utils/ErrorClass.js";
import { StatusCodes } from "http-status-codes";
import cloudinary from "../../../utils/cloudinary.js";
import crypto from "crypto-js";
import { customAlphabet, nanoid } from "nanoid";
import sendEmail, { createHTML } from "../../../utils/email.js";
import productModel from "../../../../DB/model/Product.model.js";
import { OAuth2Client } from 'google-auth-library';
import { createToken } from "../../../utils/createToken.js";

export const signup = async (req, res, next) => {
  let { name, email, password, phone, DOB } = req.body;
  const isEmailExist = await userModel.findOne({ email });
  if (isEmailExist)
    return next(new ErrorClass("email alredy exist", StatusCodes.CONFLICT));
  password = bcryptjs.hashSync(password, +process.env.SALT_ROUND);
  phone = crypto.AES.encrypt(phone, process.env.ENCRYPTION_KEY).toString();
  /*  const cimage = await streamifier
    .createReadStream(req.file.buffer)
    .pipe(cloudinary.uploader.upload_stream({ folder: "users" })); */
  const code = nanoid(6);
  const html = createHTML(code);
  await sendEmail({ to: email, subject: "Confirmation Code", html });
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: "users" }
  );
  const user = await userModel.create({
    name,
    email,
    password,
    phone,
    image: { secure_url, public_id },
    DOB: new Date(DOB),
    code,
  });
  await cartModel.create({ userID: user._id });
  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};
export const confirmEmail = async (req, res, next) => {
  const { email, code } = req.body;
  const emailExist = await userModel.findOne({ email });
  if (!emailExist)
    return next(new ErrorClass("email not found", StatusCodes.NOT_FOUND));
  if (emailExist.confirmEmail)
    return next(new ErrorClass("email alreay confirmed", StatusCodes.CONFLICT));
  if (code != emailExist.code)
    return next(
      new ErrorClass("invalid confirmation code", StatusCodes.NOT_ACCEPTABLE)
    );
  (emailExist.confirmEmail = true), (emailExist.code = nanoid(6));
  await emailExist.save();
  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};
export const socialLogin = async (req, res, next) => {
  const { idToken } = req.body;
  const client = new OAuth2Client();
  async function verify() {
    const ticket = await client.verifyIdToken(
      {
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
      }
    );
    const payload = ticket.getPayload();
    const checkEmail = await userModel.findOne({ email: payload.email })
    if (!checkEmail) {
      const newUser = await userModel.create(
        {
          name: payload.name,
          email: payload.email,
          image: payload.picture,
          password: bcryptjs.hashSync(nanoid(16), process.env.SALT_ROUND),
          confirmEmail: true,
          provider: 'google'
        }
      )
      const token = createToken(newUser);
      res.status(StatusCodes.CREATED).json({ message: "done", token })
    }
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
  }
  verify().catch(console.error);
}
export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  const checkEmail = await userModel.findOne({ email });
  if (!checkEmail)
    return next(new ErrorClass("invalid login info", StatusCodes.BAD_REQUEST));
  const match = bcryptjs.compareSync(password, checkEmail.password);
  if (!match)
    return next(new ErrorClass("invalid login info", StatusCodes.BAD_REQUEST));
  const token = createToken(checkEmail)
  res.status(StatusCodes.ACCEPTED).json({ message: "done", token });
};
export const sendCode = async (req, res, next) => {
  const { email } = req.body;
  const emailExist = await userModel.findOne({ email });
  if (!emailExist)
    return next(new ErrorClass("email not found", StatusCodes.NOT_FOUND));
  const code = nanoid(6);
  const html = createHTML(code);
  await sendEmail({
    to: email,
    subject: "Change password confirmation code",
    html,
  });
  emailExist.code = nanoid(6);
  await emailExist.save();
  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};

export const resetPassword = async (req, res, next) => {
  const { email, code, newPassword } = req.body;
  const emailExist = await userModel.findOne({ email });
  if (!emailExist)
    return next(new ErrorClass("email not found", StatusCodes.NOT_FOUND));
  if (code != emailExist.code)
    return next(
      new ErrorClass("invalid confirmation code", StatusCodes.NOT_ACCEPTABLE)
    );
  emailExist.password = bcryptjs.hashSync(newPassword, +process.env.SALT_ROUND);
  emailExist.code = nanoid(6);
  await emailExist.save();
  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};

export const addTofavorites = async (req, res, next) => {
  const { productID } = req.params;
  const product = await productModel.findById(productID);
  if (!product) {
    return next(new ErrorClass("product not found", StatusCodes.NOT_FOUND));
  }
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { favorites: productID },
    },
    { new: true }
  );
  return res.status(StatusCodes.ACCEPTED).json({ message: "done", user });
};

export const getUserFavorites = async (req, res, next) => {
  let favorites = req.user.favorites;
  const user = await userModel.findById(req.user._id).populate("favorites");
  user.favorites = user.favorites.filter((ele) => {
    if (ele) return ele;
  });
  return res
    .status(StatusCodes.ACCEPTED)
    .json({ message: "done", favorites: user.favorites });
};
