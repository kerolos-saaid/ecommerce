import slugify from "slugify";
import cloudinary from "./../../../utils/cloudinary.js";
import categoryModel from "../../../../DB/model/Category.model.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { deleteImages } from "../../../utils/handlers/delete.js";
import { ErrorClass } from "../../../utils/ErrorClass.js";
import { ApiFeatures } from "../../../utils/apiFeatures.js";
import subCategoryModel from "../../../../DB/model/SubCategory.model.js";
import productModel from "../../../../DB/model/Product.model.js";
export const addCategory = async (req, res, next) => {
  const name = req.body.name.toLowerCase();
  const userID = req.user._id;
  const isExist = await categoryModel.findOne({ name });
  if (isExist)
    return next(new ErrorClass("name is exist", StatusCodes.CONFLICT));
  const slug = slugify(name);
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: "category" }
  );
  const category = await categoryModel.create({
    name,
    slug,
    image: { secure_url, public_id },
    createdBy: userID,
  });
  res
    .status(StatusCodes.CREATED)
    .json({ message: "Done", category, status: ReasonPhrases.CREATED });
};

export const deleteCategory = async (req, res, next) => {
  const categoryID = req.params.id;
  const isExist = await categoryModel.findByIdAndDelete(categoryID);
  if (!isExist) return next(new ErrorClass("not found", 404));
  await deleteImages(isExist);
  const subCategories = await subCategoryModel.find({ categoryID });
  for (const subCategory of subCategories) {
    await deleteImages(subCategory);
  }
  await subCategoryModel.deleteMany({ categoryID });
  const products = await productModel.find({ categoryID });
  for (const product of products) {
    await deleteImages(product);
  }
  await productModel.deleteMany({ categoryID });
  return res
    .status(StatusCodes.OK)
    .json({ message: "done", status: ReasonPhrases.OK });
};

export const updateCategory = async (req, res, next) => {
  const categoryID = req.params.id;
  const categoryExist = await categoryModel.findById(categoryID);
  if (!categoryExist)
    return next(
      new ErrorClass(`category doesn't exist`, StatusCodes.NOT_FOUND)
    );
  if (req.body.name) {
    const nameExist = await categoryModel.findOne({
      name: req.body.name,
      _id: { $ne: categoryID },
    });
    if (nameExist)
      return next(new ErrorClass("name already exists", StatusCodes.CONFLICT));
    req.body.slug = slugify(req.body.name);
  }
  if (req.file) {
    await cloudinary.uploader.destroy(updatedCategory.image.public_id);
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: "category" }
    );
    req.body.image = { secure_url, public_id };
  }
  const result = await categoryModel.findByIdAndUpdate(categoryID, req.body);
  return res
    .status(StatusCodes.OK)
    .json({ message: "Done", result, status: ReasonPhrases.OK });
};

export const getAllCategories = async (req, res, next) => {
  const apiFeatures = await new ApiFeatures(categoryModel.find(), req.query)
    .filter()
    .search()
    .sort()
    .select()
    .pagination();
  const categories = await apiFeatures.mongooseQuery;
  return res.status(StatusCodes.ACCEPTED).json({
    message: "Done",
    categories,
    pagination: apiFeatures.pagination,
  });
};

export const getCategory = async (req, res, next) => {
  const { id } = req.params;
  const category = await categoryModel.findById(id);
  if (!category)
    return next(ErrorClass("category not found", StatusCodes.NOT_FOUND));
  return res.status(StatusCodes.OK).json({ message: "done", category });
};
