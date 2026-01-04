import { Router } from "express";
import * as userService from "./user.service.js";
import asyncHandler from "../../../utils/Error Handling/asyncHandler.js";
import { allowto, authentication } from "../../middleware/auth.middleware.js";
import { Validation } from "../../middleware/validation.middleware.js";
import * as userValidation from "./user.validation.js";
import { roleTypes } from "../../DB/Models/user.model.js";
const router = Router();

router.get(
  "/",
  authentication,
  allowto([roleTypes.user, roleTypes.admin]),
  asyncHandler(userService.getUserdata)
);

router.put(
  "/updateprofile",
  authentication,
  Validation(userValidation.updateUserSchema),
  asyncHandler(userService.updateUserdata)
);

router.patch(
  "/changepassword",
  Validation(userValidation.changePasswordSchema),
  authentication,
  userService.changePassword
);

export default router;
