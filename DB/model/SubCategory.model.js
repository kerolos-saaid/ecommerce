import mongoose, { model, Schema, Types } from "mongoose";

const subCategorySchema = new Schema(
  {
    name: { type: String, lowercase: true, required: true, unique: true },
    slug: { type: String, lowercase: true, required: true },
    image: { type: Object, required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    categoryID: { type: Types.ObjectId, ref: "Category", required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
);

const subCategoryModel = model("SubCategory", subCategorySchema);

export default subCategoryModel;
