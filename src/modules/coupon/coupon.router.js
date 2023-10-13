import { Router } from "express";
import auth, { roles } from "../../middleware/auth.js";
import * as Val from "./coupon.validation.js";
import * as couponController from "./controller/coupon.js";
import { validation } from "../../middleware/validation.js";

import { asyncHandler } from "../../utils/errorHandling.js";
import { fileUpload, fileValidation } from "../../utils/multer.js";
const router = Router();

router
  .route("/")
  .post(
    auth([roles.admin]),
    validation(Val.addPCouponVal),
    asyncHandler(couponController.addCoupon)
  );
export default router;
