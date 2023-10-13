import jwt from "jsonwebtoken";
import userModel from "../../DB/model/User.model.js";
import { StatusCodes } from "http-status-codes";
import { ErrorClass } from "../utils/ErrorClass.js";
export const roles = {
  admin: "admin",
  user: "user",
};
const auth = (roles = []) => {
  return async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization?.startsWith(process.env.BEARER_KEY)) {
      return res.json({ message: "In-valid bearer key" });
    }
    const token = authorization.split(process.env.BEARER_KEY)[1];
    if (!token) {
      return res.json({ message: "In-valid token" });
    }
    const decoded = jwt.verify(token, process.env.TOKEN_SIGNATURE);
    if (!decoded?.id) {
      return res.json({ message: "In-valid token payload" });
    }
    const authUser = await userModel.findById(decoded.id).select("-password");
    if (!authUser) {
      return res.json({ message: "Not register account" });
    }
    if (!authUser.confirmEmail)
      return next(new ErrorClass("email not confirmed", StatusCodes.FORBIDDEN));
    if (!roles.includes(authUser.role)) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "not authorized" });
    }
    req.user = authUser;
    return next();
  };
};

export default auth;
