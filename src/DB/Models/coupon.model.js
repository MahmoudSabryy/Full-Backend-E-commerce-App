import mongoose, { Schema, Types } from "mongoose";

const couponSchema = new Schema(
  {
    name: { type: String, unique: true },
    image: Object,
    amount: { type: Number, required: true, default: 1 },
    expireDate: { type: Date, required: true },
    usedBy: [{ type: Types.ObjectId, ref: "User" }],
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const couponModel = mongoose.model("Coupon", couponSchema);

export default couponModel;
