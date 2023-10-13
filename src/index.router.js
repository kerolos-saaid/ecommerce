import { StatusCodes } from "http-status-codes";
import connectDB from "../DB/connection.js";
import authRouter from "./modules/auth/auth.router.js";
import branRouter from "./modules/brand/brand.router.js";
import cartRouter from "./modules/cart/cart.router.js";
import categoryRouter from "./modules/category/category.router.js";
import couponRouter from "./modules/coupon/coupon.router.js";
import orderRouter from "./modules/order/order.router.js";
import productRouter from "./modules/product/product.router.js";
import reviewsRouter from "./modules/reviews/reviews.router.js";
import subcategoryRouter from "./modules/subcategory/subcategory.router.js";
import userRouter from "./modules/user/user.router.js";
import { ErrorClass } from "./utils/ErrorClass.js";
import { asyncHandler, globalErrorHandling } from "./utils/errorHandling.js";
import cors from "cors"
const initApp = (app, express) => {
  //convert Buffer Data
  app.use((req, res, next) => {
    if (req.originalUrl == "/order/webhook") return next();
    express.json({})(req, res, next);
  });

  const whitelist = ["https://www.google.com/", undefined, 'https://www.postman.com/']
  app.use(
    async (req, res, next) => {
      const origin = req.headers.origin
      if (whitelist.indexOf(origin) == -1) {
        return next(new ErrorClass('Not allowed by CORS', StatusCodes.FORBIDDEN))
      }
      res.header('Access-Control-Allow-Origin', origin || `http://localhost:${process.env.PORT}`);
      res.header('Access-Control-Allow-Headers', '*');
      res.header('Access-Control-Allow-Private-Network', '*');
      res.header('Access-Control-Allow-Private-Method', 'post');
      return next()
    }
  );
  //Setup API Routing
  app.use(`/auth`, authRouter);
  app.use(`/user`, userRouter);
  app.use(`/product`, productRouter);
  app.use(`/category`, categoryRouter);
  app.use(`/subCategory`, subcategoryRouter);
  app.use(`/review`, reviewsRouter);
  app.use(`/coupon`, couponRouter);
  app.use(`/cart`, cartRouter);
  app.use(`/order`, orderRouter);
  app.use(`/brand`, branRouter);

  app.all("*", (req, res, next) => {
    res.send("In-valid Routing Plz check url  or  method");
  });
  app.use(globalErrorHandling);

  connectDB();
};

export default initApp;
