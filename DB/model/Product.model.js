import { model, Schema, Types } from "mongoose";
const productSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true, unique: true },
    stock: { type: Number, default: 1, required: true, default: 1 },
    price: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    paymentPrice: { type: Number, required: true, default: 0 },
    colors: { type: Array },
    sizes: { type: Array },
    coverImages: { type: Array },
    image: { type: Object, required: true },
    categoryID: { type: Types.ObjectId, ref: "Category", required: true },
    subCategoryID: { type: Types.ObjectId, ref: "SubCategory", required: true },
    brandID: { type: Types.ObjectId, ref: "Brand", required: true },
    rateNo: { type: Number, default: 0 },
    avgRate: { type: Number, required: true, default: 0 },
    sold: { type: Number, required: true, default: 0 },
    QRCode: { type: String, required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    wishList: [{ type: Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);
const productModel = model("Product", productSchema);
export default productModel;
