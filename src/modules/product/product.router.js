import { fileUpload, fileValidation } from "../../utils/multer.js";
import { Router } from "express";
import * as productController from "./controller/product.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { validation } from "../../middleware/validation.js";
import * as Val from "./product.validation.js";
import auth, { roles } from "../../middleware/auth.js";
const router = Router();

router
  .route("/")
  .post(
    auth([roles.admin]),
    fileUpload(fileValidation.image).fields([
      { name: "image", maxCount: 1 },
      { name: "coverImages", maxCount: 5 },
    ]),
    validation(Val.addProductVal),
    asyncHandler(productController.addProduct)
  )
  .get(productController.getAllProducts);
router.route("/:id").delete(productController.deleteProduct);
export default router;
