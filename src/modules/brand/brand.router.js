import { Router } from "express";
import * as brandController from "./controller/brand.js";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import { validation } from "../../middleware/validation.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import * as Val from "./brand.validation.js";
import { idVal } from "../globalValidation.js";
import auth, { roles } from "../../middleware/auth.js";

const router = Router();

router
  .route("/")
  .post(
    auth([roles.admin]),
    fileUpload(fileValidation.image).single("image"),
    validation(Val.addBrandVal),
    brandController.addBrand
  );
router
  .route("/:id")
  .get(validation(idVal), asyncHandler(brandController.getBrand))
  .delete(
    auth([roles.admin]),
    validation(idVal),
    asyncHandler(brandController.deleteBrand)
  )
  .put(
    auth([roles.admin]),
    fileUpload(fileValidation.image).single("image"),
    validation(Val.updateBrandVal),
    asyncHandler(brandController.updateBrand)
  )
  .delete(validation(idVal), asyncHandler(brandController.deleteBrand));

export default router;
