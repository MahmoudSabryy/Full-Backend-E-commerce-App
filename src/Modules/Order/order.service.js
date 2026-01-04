import mongoose from "mongoose";
import cartModel from "../../DB/Models/cart.model.js";
import couponModel from "../../DB/Models/coupon.model.js";
import orderModel from "../../DB/Models/order.model.js";
import productModel from "../../DB/Models/product.model.js";
import { customAlphabet } from "nanoid";
import createInvoice from "../../../utils/pdf/pdf.js";
import payment from "../../../utils/payment/payment.js";
import Stripe from "stripe";

const allowedTransitions = {
  pending: ["preparing", "cancelled"],
  preparing: ["ready_to_ship", "cancelled"],
  ready_to_ship: ["shipped"],
  shipped: ["delivered", "shipping_failed"],
  shipping_failed: ["preparing", "cancelled"],
  delivered: ["returned"],
  cancelled: ["preparing"],
};

export const placeOrder = async (req, res, next) => {
  const userId = req.user._id;

  const cart = await cartModel.findOne({ userId });

  const { couponName, address, phone, paymentMethod } = req.body;

  if (!cart || cart.products.length === 0)
    return next(new Error("Your cart is empty", { cause: 400 }));

  let appliedCoupon = null;

  if (couponName) {
    const coupon = await couponModel.findOne({
      name: couponName,
    });

    if (!coupon) return next(new Error("Invalid coupon", { cause: 400 }));

    if (coupon.expireDate < Date.now())
      return next(new Error("this coupon is expired", { cause: 400 }));

    if (coupon.usedBy.includes(req.user._id))
      return next(
        new Error("you have already used this coupon", { cause: 400 })
      );

    appliedCoupon = coupon;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let orderProducts = [];
    let subTotalPrice = 0;
    for (const item of cart.products) {
      const product = await productModel.findOne(
        {
          _id: item.productId,
          stock: { $gte: item.quantity },
        },
        null,
        { session }
      );

      if (!product) throw new Error("Product not found or out of stock");

      const itemTotalPrice = item.quantity * product.finalPrice;

      orderProducts.push({
        name: product.name,
        productId: product._id,
        quantity: item.quantity,
        price: product.finalPrice,
        finalPrice: itemTotalPrice,
      });

      subTotalPrice += itemTotalPrice;

      if (paymentMethod === "cash") {
        await productModel.updateOne(
          { _id: product._id },
          { $inc: { stock: -item.quantity } },
          { session }
        );
      }
    }

    let discount = 0;
    if (appliedCoupon) {
      discount = (subTotalPrice * appliedCoupon.amount) / 100;
      appliedCoupon.usedBy.push(userId);
      await appliedCoupon.save({ session });
    }

    const shippingPrice = 50;
    const finalPrice = subTotalPrice - discount + shippingPrice;
    const random = customAlphabet("0123456789", 6);

    const order = new orderModel({
      userId,
      products: orderProducts,
      address,
      phone,
      couponId: appliedCoupon?._id,
      subTotalPrice,
      finalPrice,
      paymentMethod,
      status: "pending",
      trackingNumber: random(),
    });

    await order.save({ session });

    if (paymentMethod === "cash") {
      await cartModel.updateOne(
        { userId },
        { products: [], totalPrice: 0 },
        { session }
      );
    }

    //Generate pdf
    const invoice = {
      shipping: {
        name: req.user.userName,
        address: order.address,
        city: "Cairo",
        state: "Cairo",
        country: "Egypt",
        postal_code: 94111,
      },
      items: order.products,
      subtotal: order.subTotalPrice,
      Total: order.finalPrice,
      invoice_nr: order.trackingNumber,
    };

    await createInvoice(invoice, `invoice-${order.trackingNumber}.pdf`);

    await session.commitTransaction();
    session.endSession();

    if (order.paymentMethod === "card") {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        let stripeCoupon = null;

        if (appliedCoupon) {
          stripeCoupon = await stripe.coupons.create({
            percent_off: appliedCoupon.amount,
            duration: "once",
          });
        }

        const paymentSession = await payment({
          stripe,
          payment_method_types: ["card"],
          mode: "payment",
          customer_email: req.user.email,
          metadata: {
            orderId: order._id.toString(),
          },

          cancel_url: `${
            process.env.CANCEL_URL
          }?orderId=${order._id.toString()}`,

          line_items: order.products.map((product) => {
            return {
              price_data: {
                currency: "egp",
                product_data: {
                  name: product.name,
                },
                unit_amount: product.finalPrice * 100, // convert from dollar to cent
              },
              quantity: product.quantity,
            };
          }),
          discounts: stripeCoupon ? [{ coupon: stripeCoupon.id }] : [],
        });

        return res.status(201).json({
          success: true,
          message: "card payment details ",
          data: paymentSession,
          url: paymentSession.url,
        });
      } catch (error) {
        return next(error);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
};

export const changeOrderStatus = async (req, res, next) => {
  const { orderId } = req.params;
  const { status, note, cancelReason } = req.body;

  if (req.user.role !== "admin") {
    return next(new Error("Not authorized", { cause: 403 }));
  }

  const order = await orderModel.findById(orderId);
  if (!order) {
    return next(new Error("Order not found", { cause: 404 }));
  }

  const currentStatus = order.status;

  if (!allowedTransitions[currentStatus]?.includes(status)) {
    return next(
      new Error(
        `Invalid status transition from ${currentStatus} to ${status}`,
        { cause: 400 }
      )
    );
  }

  if (["cancelled", "returned"].includes(status)) {
    for (const item of order.products) {
      await productModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }
  }

  if (status === "delivered") {
    order.deliveredAt = new Date();

    if (order.paymentMethod === "cash") {
      order.isPaid = true;
      order.paidAt = new Date();
    }
  }

  if (status === "cancelled") {
    order.isCancelled = true;
    order.cancelledAt = new Date();
    order.cancelReason = cancelReason || "Cancelled by admin";
  }

  order.status = status;

  order.statusHistory.push({
    status,
    changedAt: new Date(),
    note: note || `Status changed to ${status}`,
  });

  await order.save();

  return res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    data: order,
  });
};

export const getLatestOrder = async (req, res, next) => {
  const userId = req.user._id;

  const order = await orderModel
    .findOne({ userId })
    .populate("userId", "userName -_id")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json({ success: true, message: "your order", data: order });
};

export const getAllOrders = async (req, res, next) => {
  if (req.user.role === "user") {
    const orders = await orderModel
      .find({ userId: req.user._id })
      .populate("products.productId userId", "mainImage name userName ")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json({ success: true, message: "All Orders :", data: orders });
  } else {
    const orders = await orderModel
      .find()
      .populate("products.productId userId", "mainImage name userName ")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json({ success: true, message: "All Orders :", data: orders });
  }
};

export const refund = async (req, res, next) => {
  const orderId = req.params.orderId;

  const order = await orderModel.findOne({
    _id: orderId,
    status: { $in: ["pending", "preparing", "ready_to_ship"] },
  });

  if (!order) {
    return next(
      new Error("Can't refund this order in this status", { cause: 400 })
    );
  }

  if (order.paymentMethod !== "card") {
    return next(
      new Error("Refund is only allowed for card payments", { cause: 400 })
    );
  }

  if (!order.isPaid) {
    return next(new Error("Order is not paid yet", { cause: 400 }));
  }

  if (!order.paymentIntent) {
    return next(new Error("Payment intent not found", { cause: 400 }));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const product of order.products) {
      const productExist = await productModel.findById(product.productId);
      if (!productExist) throw new Error("Product not found");

      await productModel.findByIdAndUpdate(
        product.productId,
        { $inc: { stock: product.quantity } },
        { session, runValidators: true }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    await stripe.refunds.create({
      payment_intent: order.paymentIntent,
      reason: "requested_by_customer",
    });

    order.status = "cancelled";
    order.isCancelled = true;
    order.cancelledAt = new Date();
    order.cancelReason = req.body?.cancelReason;

    order.statusHistory.push({
      status: "cancelled",
      changedAt: new Date(),
      note: req.body?.cancelReason || "Refunded by user",
    });

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Order refunded and cancelled successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  const orderId = req.params.orderId;

  const order = await orderModel.findOne({
    _id: orderId,
    status: { $in: ["pending", "preparing", "ready_to_ship"] },
  });

  if (!order) return next(new Error("Can't find this order", { cause: 404 }));

  for (const product of order.products) {
    const productExist = await productModel.findById(product.productId);
    if (!productExist)
      return next(new Error("Can't find this product", { cause: 404 }));

    await productModel.updateOne(
      { _id: product.productId },
      { $inc: { stock: +product.quantity } }
    );
  }
  await orderModel.updateOne(
    { _id: orderId },
    { status: "cancelled", cancelledAt: Date.now(), isCancelled: true }
  );
  return res
    .status(200)
    .json({ success: true, message: "order cancelled successfully" });
};
