import Stripe from "stripe";
import productModel from "../../src/DB/Models/product.model.js";
import orderModel from "../../src/DB/Models/order.model.js";
import mongoose from "mongoose";
import cartModel from "../../src/DB/Models/cart.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const WebhookFn = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log("Stripe Event:", event.type);
  } catch (err) {
    console.error("Webhook error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const sessionObj = event.data.object;
  const orderId = sessionObj?.metadata?.orderId;

  if (!orderId) {
    return res.status(200).json({ received: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await orderModel.findById(orderId).session(session);
      if (!order) throw new Error("Order not found");

      order.isPaid = true;
      order.paidAt = new Date();
      order.status = "pending";
      order.paymentIntent = sessionObj.payment_intent;
      await order.save({ session: session });

      for (const p of order.products) {
        const updated = await productModel.findOneAndUpdate(
          { _id: p.productId, stock: { $gte: p.quantity } },
          { $inc: { stock: -p.quantity } },
          { session: session }
        );
        if (!updated) throw new Error("Stock not enough");
      }
      await cartModel.updateOne(
        { userId: order.userId },
        { products: [], totalPrice: 0 },
        { session }
      );

      await session.commitTransaction();
      session.endSession();
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error(err);
    }
  }

  res.status(200).json({ received: true });
};
