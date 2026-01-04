import joi from "joi";
import { generalfields } from "../../middleware/validation.middleware.js";

export const updateUserSchema = joi
  .object({
    firstName: generalfields.firstName,
    lastName: generalfields.lastName,
    userName: generalfields.UserName,
    address: generalfields.address,
    phone: generalfields.phone,
    DOB: generalfields.DOB,
  })
  .required();

export const changePasswordSchema = joi
  .object({
    oldPassword: generalfields.password.required(),
    password: generalfields.password.required(),
    confirmPassword: generalfields.confirmPassword.required(),
  })
  .required();
