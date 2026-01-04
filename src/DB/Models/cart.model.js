import mongoose, { Schema, Types } from "mongoose";

const cartSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, unique: true },
    products: [
      {
        productId: { type: Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, default: 1, required: true },
        price: { type: Number, default: 1, required: true },
      },
    ],
    totalPrice: Number,
  },
  { timestamps: true }
);

const cartModel = mongoose.model("Cart", cartSchema);

export default cartModel;
