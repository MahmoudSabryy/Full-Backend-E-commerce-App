import { Router } from "express";
import * as brandServices from "./brand.service.js";
import * as brandValidation from "./brand.validation.js";
import asyncHandler from "../../../utils/Error Handling/asyncHandler.js";
import { Validation } from "../../middleware/validation.middleware.js";
import { uploadCloud } from "../../../utils/file uploading/multerCloud.js";
import { allowto, authentication } from "../../middleware/auth.middleware.js";
import productRouter from "../Product/product.controller.js";
const router = Router();

router.use("/:brandSlug/:brandId/product", productRouter);

router.get("/", asyncHandler(brandServices.getAllBrands));

router.post(
  "/",
  authentication,
  allowto(["admin"]),
  uploadCloud().single("image"),
  Validation(brandValidation.addBrandSchema),
  asyncHandler(brandServices.addBrand)
);

router.put(
  "/:brandId",
  authentication,
  allowto(["admin"]),
  uploadCloud().single("image"),
  Validation(brandValidation.updateBrandSchema),
  asyncHandler(brandServices.updateBrand)
);

router.delete(
  "/delete/:brandId",
  authentication,
  allowto(["admin"]),
  asyncHandler(brandServices.softDeleteBrand)
);

router.patch(
  "/undelete/:brandId",
  authentication,
  allowto(["admin"]),
  asyncHandler(brandServices.unDeleteBrand)
);
router.patch(
  "/activate/:brandId",
  authentication,
  allowto(["admin"]),
  asyncHandler(brandServices.activateBrand)
);

router.patch(
  "/deactivate/:brandId",
  authentication,
  allowto(["admin"]),
  asyncHandler(brandServices.deActivateBrand)
);

export default router;
