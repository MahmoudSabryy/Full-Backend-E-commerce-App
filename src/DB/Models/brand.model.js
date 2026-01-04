import mongoose, { Schema, Types } from "mongoose";

const brandSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true },
    image: { type: Object, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
brandSchema.virtual("product", {
  ref: "Product",
  localField: "_id",
  foreignField: "brandId",
  justOne: false,
});

const brandModel = mongoose.model("Brand", brandSchema);

export default brandModel;
