import mongoose, { model, Schema, Types } from "mongoose";

export const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true },
    image: { type: Object },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
  },
  {
    id: false,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

categorySchema.virtual("subCategories", {
  localField: "_id",
  foreignField: "categoryID",
  ref: "SubCategory",
});

const categoryModel =
  mongoose.models.Category || model("Category", categorySchema);

export default categoryModel;
