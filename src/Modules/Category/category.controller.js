import { Router } from "express";
import * as categoryServices from "./category.service.js";
import * as categoryValidation from "./category.validation.js";
import { uploadCloud } from "../../../utils/file uploading/multerCloud.js";
import asyncHandler from "../../../utils/Error Handling/asyncHandler.js";
import { Validation } from "../../middleware/validation.middleware.js";
import subcategoryRouter from "../Sub-Category/subcategory.controller.js";
import productRouter from "../Product/product.controller.js";
import { allowto, authentication } from "../../middleware/auth.middleware.js";
const router = Router();

router.use("/:categoryId/subcategory", subcategoryRouter);
router.use("/id/:categoryId/product", productRouter);
router.use("/slug/:categorySlug/product", productRouter);

router.get("/", asyncHandler(categoryServices.getAllCategories));
router.post(
  "/",
  authentication,
  allowto(["admin"]),
  uploadCloud().single("file"),
  Validation(categoryValidation.addCategorySchema),
  asyncHandler(categoryServices.addCategory)
);
router.put(
  "/update/:_id",
  authentication,
  allowto(["admin"]),
  uploadCloud().single("file"),
  Validation(categoryValidation.updateCategorySchema),
  asyncHandler(categoryServices.updateCategory)
);

router.delete(
  "/:_id",
  authentication,
  asyncHandler(categoryServices.softDeleteCategory)
);

router.patch(
  "/undelete/:_id",
  authentication,
  asyncHandler(categoryServices.unDeleteCategory)
);
router.patch(
  "/activate/:_id",
  authentication,
  asyncHandler(categoryServices.activateCategroy)
);
router.patch(
  "/deactivate/:_id",
  authentication,
  asyncHandler(categoryServices.deActivateCategroy)
);
export default router;
