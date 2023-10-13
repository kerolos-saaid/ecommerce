import { Router } from "express";
import * as categoryController from "./controller/category.js";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import { validation } from "../../middleware/validation.js";
import * as Val from "./category.validation.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import subCategoryRouter from "../subcategory/subcategory.router.js";
import { idVal } from "../globalValidation.js";
import auth, { roles } from "../../middleware/auth.js";
const router = Router();
router.use("/:categoryID/subCategory", subCategoryRouter);
router
  .route("/")
  .get(
    categoryController.getAllCategories,
    validation(Val.findByNameVal),
    asyncHandler(categoryController.getAllCategories)
  )
  .post(
    auth([roles.admin]),
    fileUpload(fileValidation.image).single("image"),
    validation(Val.addCategoryVal),
    asyncHandler(categoryController.addCategory)
  );

router
  .route("/:id")
  .put(
    auth([roles.admin]),
    fileUpload(fileValidation.image).single("image"),
    validation(Val.updateCategoryVal),
    asyncHandler(categoryController.updateCategory)
  )
  .delete(
    auth([roles.admin]),
    validation(idVal),
    categoryController.deleteCategory
  )
  .get(validation(idVal), asyncHandler(categoryController.getCategory));

export default router;
