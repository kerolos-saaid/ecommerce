import { Router } from "express";
import * as userController from "./controller/user.js";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import * as Val from "./user.validation.js";
import { validation } from "../../middleware/validation.js";
import auth, { roles } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/errorHandling.js";
const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({ message: "User Module" });
});
router.post(
  "/add-to-favorites/:productID",
  auth(roles.user),
  //validation(Val.addTofavoriteVal),
  userController.addTofavorites
);
router.get(
  "/get-favorites",
  auth(roles.user),
  asyncHandler(userController.getUserFavorites)
);
router.post(
  "/signup",
  fileUpload(fileValidation.image).single("image"),
  validation(Val.signupVal),
  asyncHandler(userController.signup)
);
router.patch(
  "/confirm-email",
  validation(Val.confirmEmailVal),
  asyncHandler(userController.confirmEmail)
);
router.post(
  "/signin",
  validation(Val.signinVal),
  asyncHandler(userController.signin)
);
router.get(
  "/send-code",
  validation(Val.sendCodeVal),
  asyncHandler(userController.sendCode)
);
router.patch(
  "/reset-password",
  validation(Val.resetPasswordVal),
  asyncHandler(userController.resetPassword)
);
router.post('/google-login', userController.socialLogin);
export default router;

