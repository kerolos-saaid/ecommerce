import { StatusCodes } from "http-status-codes";
import productModel from "../../../../DB/model/Product.model.js";
import categoryModel from "../../../../DB/model/Category.model.js";
import subCategoryModel from "../../../../DB/model/SubCategory.model.js";
import brandModel from "../../../../DB/model/Brand.model.js";
import cloudinary from "../../../utils/cloudinary.js";
import { ErrorClass } from "../../../utils/ErrorClass.js";
import slugify from "slugify";
//import { deleteDocByKey } from "../../../utils/handlers/delete.js";
import QRCode from "qrcode";
import { pagination } from "../../../utils/pagination.js";
import { ApiFeatures } from "../../../utils/apiFeatures.js";
export const addProduct = async (req, res, next) => {
  req.body.name = req.body.name.toLowerCase();
  const isNameExist = await productModel.findOne({ name: req.body.name });
  if (isNameExist) {
    isNameExist.stock += Number(req.body.quantity);
    await isNameExist.save();
    return res
      .status(StatusCodes.ACCEPTED)
      .json({ message: "Done", product: isNameExist });
  }
  const isCategoryExist = await categoryModel.findById(req.body.categoryID);
  if (!isCategoryExist)
    return next(
      new ErrorClass(`category not found`, StatusCodes.NOT_ACCEPTABLE)
    );
  const isSubCategoryExist = await subCategoryModel.findById(
    req.body.subCategoryID
  );
  if (!isSubCategoryExist)
    return next(new ErrorClass(`SubCategory not found`, StatusCodes.NOT_FOUND));
  const isBrandExist = await brandModel.findById(req.body.brandID);
  if (!isBrandExist)
    return next(new ErrorClass(`SubCategory not found`, StatusCodes.NOT_FOUND));
  req.body.slug = slugify(req.body.name);
  req.body.stock = Number(req.body.quantity);
  req.body.paymentPrice =
    req.body.price * (100 - (req.body.discount || 0)) / 100;
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.image[0].path,
    { folder: "product/image" }
  );
  req.body.image = { secure_url, public_id };
  if (req.files.coverImages?.length) {
    const coverImages = [];
    for (const cover of req.files.coverImages) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        cover.path,
        { folder: "product/coverImages" }
      );
      coverImages.push({ secure_url, public_id });
    }
    req.body.coverImages = coverImages;
  }
  req.body.QRCode = await QRCode.toDataURL(
    JSON.stringify({
      name: req.body.name,
      description: req.body.description,
      imageURL: req.body.image.secure_url,
      price: req.body.price,
      paymentPrice: req.body.paymentPrice,
    })
  );
  req.body.createdBy = req.user._id;
  const product = await productModel.create(req.body);
  return res.status(StatusCodes.CREATED).json({ message: "Done", product });
};
export const getAllProducts = async (req, res, next) => {
  let { page, size } = req.query;
  const apiFeatures = await new ApiFeatures(productModel.find(), req.query)
    .filter()
    .search()
    .sort()
    .select()
    .pagination();
  const products = await apiFeatures.mongooseQuery;
  const productsCount = apiFeatures.count;
  return res.status(StatusCodes.ACCEPTED).json({
    message: "Done",
    products,
    pagination: apiFeatures.pagination,
  });
};
export const deleteProduct = async (req, res, next) => {
  const productID = req.params.id;
  const isExist = await productModel.findByIdAndDelete(productID);
  if (!isExist) return next(new ErrorClass("not found", 404));
  await deleteImages(isExist);
  return res
    .status(StatusCodes.OK)
    .json({ message: "done", status: ReasonPhrases.OK });
};
