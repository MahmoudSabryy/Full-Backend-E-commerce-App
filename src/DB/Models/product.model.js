import mongoose, { Schema, Types } from "mongoose";

const productSchema = new Schema(
  {
    customId: String, // for images
    name: { type: String, required: true, trim: true, lowercase: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: String,

    stock: { type: Number, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    finalPrice: { type: Number, default: 1 },

    colors: [String],
    size: [String],

    mainImage: { type: Object, required: true },
    subImages: { type: [Object] },

    categoryId: { type: Types.ObjectId, ref: "Category", required: true },
    subcategoryId: { type: Types.ObjectId, ref: "Subcategory", required: true },
    brandId: { type: Types.ObjectId, ref: "Brand", required: true },

    wishUserList: [{ type: Types.ObjectId, ref: "User" }],

    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    totalReviews: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
productSchema.virtual("review", {
  ref: "Review",
  localField: "_id",
  foreignField: "productId",
  justOne: false,
});
const productModel = mongoose.model("Product", productSchema);

export default productModel;
