import mongoose, { Schema, Types } from "mongoose";

const subsubcategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    subcategoryId: { type: Types.ObjectId, ref: "Subcategory", required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const subsubcategoryModel = mongoose.model(
  "Subsubcategory",
  subsubcategorySchema
);

export default subsubcategoryModel;
