import { Schema, Types, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      min: [2, "minimum length 2 char"],
      max: [20, "maximum length 20 char"],
    },
    email: {
      type: String,
      unique: [true, "email must be unique value"],
      required: [true, "email is required"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
      lowercase: true,
      enum: ["user", "admin"],
    },
    status: {
      type: Boolean,
      default: false,
      // true = unbanned
      // false = banned
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    image: { type: Object },
    DOB: Date,
    code: { type: String, length: [6, "code must be 6 characters"] },
    favorites: [{ type: Types.ObjectId, ref: "Product" }],
    provider: { type: String, default: "system", enum: ["system", "google"] }
  },
  {
    timestamps: true,
  }
);

const userModel = model("User", userSchema);
export default userModel;
