import { Router } from "express";
import * as subCategoryController from "./controller/subCategory.js";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import { validation } from "../../middleware/validation.js";
import * as Val from "./subCategory.validation.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { idVal } from "../globalValidation.js";
import auth, { roles } from "../../middleware/auth.js";
const router = Router({ mergeParams: true });

router
  .route("/")
  .get(subCategoryController.getAllSubCategories)
  .post(
    auth([roles.admin]),
    fileUpload(fileValidation.image).single("image"),
    validation(Val.addSubCategoryVal),
    asyncHandler(subCategoryController.addSubCategory)
  );
router
  .route("/:id")
  .get(validation(idVal), asyncHandler(subCategoryController.getSubCatgory))
  .put(
    auth([roles.admin]),
    fileUpload(fileValidation.image).single("image"),
    validation(subCategoryController.updateSubCategory),
    asyncHandler(subCategoryController.updateSubCategory)
  )
  .delete(
    auth([roles.admin]),
    validation(idVal),
    asyncHandler(subCategoryController.deleteSubCategory)
  );

export default router;
