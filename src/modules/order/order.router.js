import express, { Router } from "express";
import * as orderController from "./controller/order.js";
import auth, { roles } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/errorHandling.js";
const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({ message: "order Module" });
});
router.post("/", auth([roles.user]), asyncHandler(orderController.createOrder));
router.patch("/:id", auth([roles.user]), asyncHandler(orderController.cancelOrder));
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(orderController.orderWebHook)
);
export default router;
