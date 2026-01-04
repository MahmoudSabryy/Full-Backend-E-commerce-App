import mongoose, { Schema, Types } from "mongoose";

const orderSchema = new Schema(
  {
    RecipientName: String,
    userId: { type: Types.ObjectId, ref: "User", required: true },
    note: String,
    products: [
      {
        name: { type: String, required: true },
        productId: { type: Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, default: 1, required: true },
        price: { type: Number, default: 1, required: true },
        finalPrice: { type: Number, default: 1, required: true },
      },
    ],
    address: { type: String, required: true },
    phone: [{ type: String, required: true }],
    couponId: { type: Types.ObjectId, ref: "Coupon" },
    subTotalPrice: { type: Number, required: true, default: 1 },
    finalPrice: { type: Number, default: 1, required: true },
    paymentMethod: { type: String, enum: ["cash", "card"], default: "cash" },
    paidAt: Date,
    isPaid: { type: Boolean, default: false },
    isCancelled: { type: Boolean, default: false },
    cancelledAt: Date,
    deliveredAt: Date,
    cancelReason: String,
    shippingPrice: { type: Number, default: 50 },
    trackingNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: [
        "pending",
        "preparing",
        "ready_to_ship",
        "shipped",
        "shipping_failed",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },
    paymentIntent: String,
    statusHistory: [
      {
        status: String,
        changedAt: Date,
        note: String,
      },
    ],
  },
  { timestamps: true }
);

const orderModel = mongoose.model("Order", orderSchema);

export default orderModel;
