import { Router } from "express";
import * as subsubcategoryServices from "./sub-subcategory.service.js";
import * as subsubcategoryValidation from "./sub-subcategory.validation.js";
import asyncHandler from "../../../utils/Error Handling/asyncHandler.js";

import { allowto, authentication } from "../../middleware/auth.middleware.js";

const router = Router({ mergeParams: true });

router.get("/", asyncHandler(subsubcategoryServices.getAllSubSubcategories));

router.post(
  "/",
  authentication,
  allowto(["admin"]),
  asyncHandler(subsubcategoryServices.addsSubSubcategory)
);

router.put(
  "/:subsubcategoryId",
  authentication,
  allowto(["admin"]),
  asyncHandler(subsubcategoryServices.updateSubSubcategory)
);
export default router;
