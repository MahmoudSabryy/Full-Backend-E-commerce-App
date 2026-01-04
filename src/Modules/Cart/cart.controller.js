import { Router } from "express";
import * as cartServices from "./cart.service.js";
import asyncHandler from "../../../utils/Error Handling/asyncHandler.js";
import { allowto, authentication } from "../../middleware/auth.middleware.js";
import { Validation } from "../../middleware/validation.middleware.js";
const router = Router();

router.post("/merge", authentication, asyncHandler(cartServices.mergeCart));
router.post(
  "/:productId",
  authentication,
  asyncHandler(cartServices.addToCart)
);
router.delete(
  "/remove/:productId",
  authentication,
  asyncHandler(cartServices.removeFromCart)
);
router.delete("/clear", authentication, asyncHandler(cartServices.clearCart));
router.patch(
  "/increase/:productId",
  authentication,
  asyncHandler(cartServices.increaseQuantity)
);
router.patch(
  "/decrease/:productId",
  authentication,
  asyncHandler(cartServices.decreaseQuantity)
);

router.get("/", authentication, asyncHandler(cartServices.getUserCart));

export default router;
