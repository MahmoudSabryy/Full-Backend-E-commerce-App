import { Router } from "express";
import * as subcategoryServices from "./subcategory.service.js";
import * as subcategoryValidation from "./subcategory.validation.js";
import asyncHandler from "../../../utils/Error Handling/asyncHandler.js";
import { uploadCloud } from "../../../utils/file uploading/multerCloud.js";
import { Validation } from "../../middleware/validation.middleware.js";
import { allowto, authentication } from "../../middleware/auth.middleware.js";
import subsubcategoryRouter from "../sub-subcategory/sub-subcategory.controller.js";
import productRouter from "../Product/product.controller.js";
const router = Router({ mergeParams: true });

router.use("/:subcategoryId/subsubcategory", subsubcategoryRouter);

router.use("/slug/:subCategorySlug/product", productRouter);
router.get("/", asyncHandler(subcategoryServices.getAllSubcategories));

router.post(
  "/",
  authentication,
  allowto(["admin"]),
  uploadCloud().single("file"),
  Validation(subcategoryValidation.addSubCategorySchema),
  asyncHandler(subcategoryServices.addSubcategory)
);

router.put(
  "/:subcategoryId",
  authentication,
  allowto(["admin"]),
  uploadCloud().single("file"),
  Validation(subcategoryValidation.updateSubcategorySchema),
  asyncHandler(subcategoryServices.updateSubcategory)
);

router.patch(
  "/activate/:_id",
  authentication,
  asyncHandler(subcategoryServices.activateSubCategory)
);

router.patch(
  "/deactivate/:_id",
  authentication,
  asyncHandler(subcategoryServices.deActivateSubCategory)
);

router.patch(
  "/undelete/:_id",
  authentication,
  asyncHandler(subcategoryServices.unDeleteSubCategory)
);

router.delete(
  "/:_id",
  authentication,
  asyncHandler(subcategoryServices.softDeleteSubCategory)
);

export default router;
