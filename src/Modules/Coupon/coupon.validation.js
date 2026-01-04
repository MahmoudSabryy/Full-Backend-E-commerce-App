import joi from "joi";
import {
  categoryGeneralFields,
  couponGeneralFields,
} from "../../middleware/validation.middleware.js";

export const createCouponSchema = joi
  .object({
    name: couponGeneralFields.name.required(),
    isActive: categoryGeneralFields.isActive.required(),
    amount: couponGeneralFields.amount.required(),
    expireDate: couponGeneralFields.expireDate,
    file: couponGeneralFields.file,
  })
  .required();
export const updateCouponSchema = joi
  .object({
    couponId: couponGeneralFields.couponId.required(),
    name: couponGeneralFields.name,
    amount: couponGeneralFields.amount,
    expireDate: couponGeneralFields.expireDate,
    file: couponGeneralFields.file,
  })
  .required();
