import { Router } from "express";
import * as authServices from "./auth.service.js";
import { Validation } from "../../middleware/validation.middleware.js";
import * as authValidation from "./auth.validation.js";

import asyncHandler from "../../../utils/Error Handling/asyncHandler.js";
import rateLimit from "express-rate-limit";
const router = Router();
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 2,
});

router.use(limiter);
router.post(
  "/register",
  Validation(authValidation.registerSchema),
  asyncHandler(authServices.register)
);
router.post("/loginWithGmail", asyncHandler(authServices.loginWithGmail));
router.post(
  "/login",
  Validation(authValidation.loginSchema),
  asyncHandler(authServices.login)
);
router.post(
  "/activation",
  Validation(authValidation.confirmEmailSchema),
  asyncHandler(authServices.confirmEmail)
);
router.post(
  "/forgetpassword",
  Validation(authValidation.forgetPasswordSchema),
  asyncHandler(authServices.forgetPassword)
);
router.post(
  "/confirmotp",
  Validation(authValidation.verifyForgetPasswordOtpSchema),
  asyncHandler(authServices.verifyForgetPasswordOtp)
);
router.patch(
  "/changepassword",
  Validation(authValidation.resetPasswordSchema),
  asyncHandler(authServices.changeForgetedPassword)
);

export default router;
