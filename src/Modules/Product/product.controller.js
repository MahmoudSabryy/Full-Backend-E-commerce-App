import { Router } from "express";
import * as productServices from "./product.service.js";
import * as productValidation from "./product.validation.js";
import asyncHandler from "../../../utils/Error Handling/asyncHandler.js";
import { allowto, authentication } from "../../middleware/auth.middleware.js";
import { uploadCloud } from "../../../utils/file uploading/multerCloud.js";
import { Validation } from "../../middleware/validation.middleware.js";
import reviewRouter from "../Reviews/review.controller.js";
import pagination from "../../middleware/pagination.middleware.js";
import productModel from "../../DB/Models/product.model.js";
const router = Router({ mergeParams: true });

router.use("/:_id/review", reviewRouter);

router.get("/details/:productId", asyncHandler(productServices.getProductById));

router.get(
  "/allslug/:productsSlug",
  asyncHandler(productServices.getAllProductsBySlug)
);

router.get(
  "/slug/related",
  asyncHandler(productServices.getAllProductsByCategorySlug)
);
router.get(
  "/slug/related/sub",
  asyncHandler(productServices.getAllProductsBySubCategorySlug)
);

router.get(
  "/slugandid",
  asyncHandler(productServices.getAllProductsByBrandSlugAndId)
);

router.post(
  "/",
  authentication,
  allowto(["admin"]),
  uploadCloud().fields([
    { name: "mainImage", maxCount: 1 },
    { name: "subImages", maxCount: 5 },
  ]),

  asyncHandler(productServices.addProduct)
);

router.put(
  "/:productId",
  authentication,
  allowto(["admin"]),
  uploadCloud().fields([
    { name: "mainImage", maxCount: 1 },
    { name: "subImages", maxCount: 5 },
  ]),
  Validation(productValidation.updateProductSchema),
  asyncHandler(productServices.updateProduct)
);

router.patch(
  "/wishlist/:productId",
  authentication,
  asyncHandler(productServices.addtoWishlist)
);

router.delete(
  "/wishlist/:productId",
  authentication,
  asyncHandler(productServices.removeFromWishlist)
);

router.get(
  "/pagination",
  pagination(productModel),
  asyncHandler(productServices.getAllPaginatedProducts)
);
router.get("/all", asyncHandler(productServices.getAllProducts));

router.delete(
  "/delete/:_id",
  authentication,
  allowto(["admin"]),
  asyncHandler(productServices.softDeleteProduct)
);

router.patch(
  "/enable/:_id",
  authentication,
  allowto(["admin"]),
  asyncHandler(productServices.unDeleteProduct)
);
export default router;
