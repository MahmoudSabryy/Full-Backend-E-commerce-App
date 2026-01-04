import { Router } from "express";
import * as reviewServices from "./review.service.js";
import asyncHandler from "../../../utils/Error Handling/asyncHandler.js";
import { authentication } from "../../middleware/auth.middleware.js";

const router = Router({ mergeParams: true });

router.post("/", authentication, asyncHandler(reviewServices.createReview));

router.put(
  "/:reviewId",
  authentication,
  asyncHandler(reviewServices.updateReview)
);

export default router;
