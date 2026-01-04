import express, { Router } from "express";
import * as orderServices from "./order.service.js";
import { allowto, authentication } from "../../middleware/auth.middleware.js";
import asyncHandler from "../../../utils/Error Handling/asyncHandler.js";

import { WebhookFn } from "../../../utils/paymentwebhook/web.hook.js";
const router = Router();

router.post("/", authentication, asyncHandler(orderServices.placeOrder));

router.get("/", authentication, asyncHandler(orderServices.getAllOrders));

router.get(
  "/latest",
  authentication,
  asyncHandler(orderServices.getLatestOrder)
);

router.patch(
  "/:orderId",
  authentication,
  allowto(["admin"]),
  asyncHandler(orderServices.changeOrderStatus)
);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(WebhookFn)
);

router.patch(
  "/refund/:orderId",
  authentication,
  asyncHandler(orderServices.refund)
);

router.patch(
  "/cancel/:orderId",
  authentication,
  asyncHandler(orderServices.cancelOrder)
);
export default router;
