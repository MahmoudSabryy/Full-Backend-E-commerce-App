import mongoose, { Schema, Types } from "mongoose";

const reviewSchema = new Schema(
  {
    productId: { type: Types.ObjectId, ref: "Product", required: true },
    orderId: { type: Types.ObjectId, ref: "Order", required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: true },
    raiting: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

const reviewModel = mongoose.model("Review", reviewSchema);

export default reviewModel;
