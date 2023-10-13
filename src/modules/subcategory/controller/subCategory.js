import slugify from "slugify";
import categoryModel from "../../../../DB/model/Category.model.js";
import subCategoryModel from "../../../../DB/model/SubCategory.model.js";
import cloudinary from "../../../utils/cloudinary.js";
//import { deleteDocByKey } from "../../../utils/handlers/delete.js";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { ErrorClass } from "../../../utils/ErrorClass.js";
import { ApiFeatures } from "../../../utils/apiFeatures.js";
export const addSubCategory = async (req, res, next) => {
  let { name, categoryID } = req.body;
  name = name.toLowerCase();
  const categoryExist = await categoryModel.findById(categoryID);
  if (!categoryExist) {
    return next(
      new ErrorClass("Couldn't find category", StatusCodes.NOT_FOUND)
    );
  }
  const nameExist = await subCategoryModel.findOne({ name });
  if (nameExist) {
    return next(new ErrorClass("name already exist", StatusCodes.CONFLICT));
  }
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: "subCategory" }
  );
  const subCategory = await subCategoryModel.create({
    name,
    slug: slugify(name),
    categoryID,
    image: { secure_url, public_id },
  });
  return res.status(200).json({ message: "Done", subCategory });
};

export const getAllSubCategories = async (req, res, next) => {
  const apiFeatures = await new ApiFeatures(
    subCategoryModel.find().populate([{ path: "categoryID" }]),
    req.query
  )
    .filter()
    .search()
    .sort()
    .select()
    .pagination();
  const subCategory = await apiFeatures.mongooseQuery;
  return res.status(StatusCodes.ACCEPTED).json({
    message: "Done",
    subCategory,
    pagination: apiFeatures.pagination,
  });
};

export const updateSubCategory = async (req, res, next) => {
  const id = req.params.id;
  const subCategory = await subCategoryModel.findById(id);
  if (!subCategory)
    return next(
      new ErrorClass(`sub-category doesn't exist`, StatusCodes.NOT_FOUND)
    );
  if (req.body?.name) {
    const nameExist = await subCategoryModel.findOne({
      name: req.body.name,
      _id: { $ne: id },
    });
    if (nameExist) {
      return next(new ErrorClass("name already exists", StatusCodes.CONFLICT));
    }
    req.body.slug = slugify(req.body.name);
  }
  if (req.file) {
    await cloudinary.uploader.destroy(subCategory.image.public_id);
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: "subCategory" }
    );
    req.body.image = { secure_url, public_id };
  }
  const result = await subCategoryModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  return res
    .status(StatusCodes.OK)
    .json({ message: "Done", result, status: ReasonPhrases.OK });
};

export const deleteSubCategory = async (req, res, next) => {
  const subCategoryID = req.params.id;
  const isExist = await brandModel.findByIdAndDelete(subCategoryID);
  if (!isExist) return next(new ErrorClass("not found", 404));
  const products = await productModel.find({ subCategoryID });
  for (const product of products) {
    await deleteImages(product);
  }
  await productModel.deleteMany({ subCategoryID });
  return res
    .status(StatusCodes.OK)
    .json({ message: "done", status: ReasonPhrases.OK });
};

export const getSubCatgory = async (req, res, next) => {
  const id = req.params.id;
  const subCategory = await subCategoryModel
    .findById(id)
    .populate("categoryID");
  if (!subCategory)
    return next(ErrorClass("sub-category not found", StatusCodes.NOT_FOUND));
  return res.status(StatusCodes.OK).json({ message: "done", subCategory });
};
