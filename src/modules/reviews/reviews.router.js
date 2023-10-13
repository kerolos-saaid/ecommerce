import { Router } from "express";
import { asyncHandler } from "../../utils/errorHandling.js";
import * as reviewController from "./controller/reviews.js";
import auth, { roles } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
const router = Router();

router
  .route("/")
  .post(
    auth([roles.user]),
    //validation(Val.addReviewVal),
    asyncHandler(reviewController.addReview) 
  )
  .get(
    //validation(Val.addReviewVal),
    asyncHandler(reviewController.getReviews)
    );
router
  .route("/:reviewID")
  .put(
    auth([roles.user]),
    //validation(Val.updateReviewVal),
    asyncHandler(reviewController.updateReview)
  )
  .delete(
    auth([roles.user]),
    //validation(Val.deleteReviewVal),
    asyncHandler(reviewController.deleteReview)
  );

export default router;
