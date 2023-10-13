import brandModel from "../../../../DB/model/Brand.model.js";
import slugify from "slugify";
import cloudinary from "../../../utils/cloudinary.js";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../../utils/errorHandling.js";
import { ApiFeatures } from "../../../utils/apiFeatures.js";
import { ErrorClass } from "../../../utils/ErrorClass.js";
import productModel from "../../../../DB/model/Product.model.js";

export const addBrand = asyncHandler(async (req, res, next) => {
  req.body.name = req.body.name.toLowerCase();
  req.body.createdBy = req.user._id;
  const isExist = await brandModel.findOne({ name: req.body.name });
  if (isExist)
    return next(new ErrorClass(`Brand ${req.body.name} already exists`));
  req.body.slug = slugify(req.body.name);
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: "Brand" }
  );
  req.body.image = { secure_url, public_id };
  const brand = await brandModel.create(req.body);
  return res.status(StatusCodes.CREATED).json({ message: "Done", brand });
});

export const getAllBrands = async (req, res, next) => {
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
export const updateBrand = async (req, res, next) => {
  const id = req.params.id;
  const brand = await brandModel.findById(id);
  if (!brand)
    return next(new ErrorClass(`brand doesn't exist`, StatusCodes.NOT_FOUND));
  if (req.body?.name) {
    const nameExist = await brandModel.findOne({
      name: req.body.name,
      _id: { $ne: id },
    });
    if (nameExist) {
      return next(new ErrorClass("name already exists", StatusCodes.CONFLICT));
    }
    req.body.slug = slugify(req.body.name);
  }
  if (req.file) {
    await cloudinary.uploader.destroy(brand.image.public_id);
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: "brand" }
    );
    req.body.image = { secure_url, public_id };
  }
  const result = await brandModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  return res
    .status(StatusCodes.OK)
    .json({ message: "Done", result, status: ReasonPhrases.OK });
};

export const deleteBrand = async (req, res, next) => {
  const brandID = req.params.id;
  const isExist = await brandModel.findByIdAndDelete(brandID);
  if (!isExist) return next(new ErrorClass("not found", 404));
  await deleteImages(isExist);
  const products = await productModel.find({ brandID });
  for (const product of products) {
    await deleteImages(product);
  }
  await productModel.deleteMany({ brandID });
  return res
    .status(StatusCodes.OK)
    .json({ message: "done", status: ReasonPhrases.OK });
};

export const getBrand = async (req, res, next) => {
  const id = req.params.id;
  const brand = await brandModel.findById(id);
  if (!brand) return next(ErrorClass("brand not found", StatusCodes.NOT_FOUND));
  return res.status(StatusCodes.OK).json({ message: "done", brand });
};
