import { Router } from "express";
import * as analysisServices from "./analysis.services.js";
import asyncHandler from "../../../utils/Error Handling/asyncHandler.js";
import { authentication } from "../../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/overview",
  authentication,
  asyncHandler(analysisServices.dashboardOverview)
);
router.get(
  "/revenue",
  authentication,
  asyncHandler(analysisServices.dashboardRevenueVsOrders)
);
router.get(
  "/category",
  authentication,
  asyncHandler(analysisServices.salesByCategory)
);
router.get("/top", authentication, asyncHandler(analysisServices.topProducts));
router.get(
  "/status",
  authentication,
  asyncHandler(analysisServices.orderStatus)
);
router.get(
  "/bestSoldProductsOfSpecificCategory/:subCategoryId",
  asyncHandler(analysisServices.bestSoldProductsOfSpecificSubCategory)
);
export default router;
