import { Router } from "express";
import { validation } from "../../middleware/validation.js";
import auth, { roles } from "../../middleware/auth.js";
import * as Val from "./cart.validation.js";
import * as cartController from "./controller/cart.js";
import { asyncHandler } from "../../utils/errorHandling.js";
const router = Router();

router
  .route("/")
  .post(
    validation(Val.addToCartVal),
    auth([roles.user]),
    asyncHandler(cartController.addToCart)
  )
  .get(
    validation(Val.getUserCart),
    auth([roles.user]),
    asyncHandler(cartController.getUserCart)
  );

router.delete(
  "/deleteFromCart/:productID",
  validation(Val.deleteFromCart),
  auth([roles.user]),
  asyncHandler(cartController.deleteFromCart)
);

export default router;
