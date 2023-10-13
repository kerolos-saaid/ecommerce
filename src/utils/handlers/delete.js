import { ErrorClass } from "../ErrorClass.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import cloudinary from "../cloudinary.js";
const deleteDocument = (model) => {
  return async (req, res, next) => {
    const { id } = req.params;
    const isExist = await model.findByIdAndDelete(id);
    if (!isExist) {
      return next(new ErrorClass("not found", StatusCodes.NOT_FOUND));
    }
    if (isExist.image) {
      await cloudinary.uploader.destroy(isExist.image.public_id);
    }
    if (isExist.coverImages) {
      for (const cover of isExist.coverImages) {
        await cloudinary.uploader.destroy(cover.public_id);
      }
    }
    return res
      .status(StatusCodes.OK)
      .json({ message: "done", status: ReasonPhrases.OK });
  };
};
export const deleteImages = async (document) => {
  if (document.image) {
    await cloudinary.uploader.destroy(document.image.public_id);
  }
  if (document.coverImages) {
    for (const cover of document.coverImages) {
      await cloudinary.uploader.destroy(cover.public_id);
    }
  }
};
export default deleteDocument;
