import mongoose, { Schema, Types } from "mongoose";

const subcategorySchema = new Schema(
  {
    customId: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true },
    image: { type: Object, required: true },
    categoryId: { type: Types.ObjectId, ref: "Category", required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

subcategorySchema.virtual("subsubcategory", {
  ref: "Subsubcategory",
  localField: "_id",
  foreignField: "subcategoryId",
  justOne: false,
});
const subcategoryModel = mongoose.model("Subcategory", subcategorySchema);

export default subcategoryModel;
