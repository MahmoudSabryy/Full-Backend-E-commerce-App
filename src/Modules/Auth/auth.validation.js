import joi from "joi";
import { generalfields } from "../../middleware/validation.middleware.js";

export const registerSchema = joi
  .object({
    firstName: generalfields.firstName.required(),
    lastName: generalfields.lastName.required(),
    userName: generalfields.UserName.required(),
    email: generalfields.email.required(),
    password: generalfields.password.required(),
    confirmPassword: generalfields.confirmPassword.required(),
    phone: generalfields.phone.required(),
    DOB: generalfields.DOB,
    gender: generalfields.gender,
    age: generalfields.age,
    address: generalfields.address,
  })
  .required();
export const confirmEmailSchema = joi
  .object({
    email: generalfields.email.required(),
    otp: generalfields.otp.required(),
  })
  .required();
export const loginSchema = joi
  .object({
    email: generalfields.email.required(),
    password: generalfields.password.required(),
  })
  .required();
export const forgetPasswordSchema = joi
  .object({
    email: generalfields.email.required(),
  })
  .required();
export const verifyForgetPasswordOtpSchema = joi
  .object({
    email: generalfields.email.required(),
    otp: generalfields.otp.required(),
  })
  .required();
export const resetPasswordSchema = joi
  .object({
    email: generalfields.email.required(),
    password: generalfields.password.required(),
    confirmPassword: generalfields.confirmPassword,
  })
  .required();
