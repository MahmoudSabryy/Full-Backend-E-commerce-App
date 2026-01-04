import { Router } from "express";
import * as couponServices from "./coupon.service.js";
import * as couponValidation from "./coupon.validation.js";
import { Validation } from "../../middleware/validation.middleware.js";
import { uploadCloud } from "../../../utils/file uploading/multerCloud.js";
import asyncHandler from "../../../utils/Error Handling/asyncHandler.js";
import { allowto, authentication } from "../../middleware/auth.middleware.js";
const router = Router();

router.get("/", authentication, asyncHandler(couponServices.getAllCoupons));

router.post(
  "/",
  authentication,
  allowto(["admin"]),
  uploadCloud().single("image"),
  Validation(couponValidation.createCouponSchema),
  asyncHandler(couponServices.createCoupon)
);
router.post("/validate", asyncHandler(couponServices.validateCoupon));

router.put(
  "/:couponId",
  authentication,
  allowto(["admin"]),
  uploadCloud().single("image"),
  Validation(couponValidation.updateCouponSchema),
  asyncHandler(couponServices.updateCoupon)
);

router.delete(
  "/delete/:couponId",
  authentication,
  asyncHandler(couponServices.softDeleteCoupon)
);

router.patch(
  "/undelete/:couponId",
  authentication,
  asyncHandler(couponServices.unDeleteCoupon)
);
router.patch(
  "/activate/:couponId",
  authentication,
  asyncHandler(couponServices.activateCoupon)
);
router.patch(
  "/deactivate/:couponId",
  authentication,
  asyncHandler(couponServices.deActivateCoupon)
);
export default router;
