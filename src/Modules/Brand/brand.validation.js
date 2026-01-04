import joi from "joi";
import {
  brandGeneralFields,
  categoryGeneralFields,
} from "../../middleware/validation.middleware.js";

export const addBrandSchema = joi
  .object({
    name: brandGeneralFields.name.required(),
    isActive: categoryGeneralFields.isActive.required(),
    file: brandGeneralFields.file.required(),
  })
  .required();

export const updateBrandSchema = joi
  .object({
    brandId: brandGeneralFields.brandId,
    isActive: categoryGeneralFields.isActive,
    name: brandGeneralFields.name,
    file: brandGeneralFields.file,
  })
  .required();
