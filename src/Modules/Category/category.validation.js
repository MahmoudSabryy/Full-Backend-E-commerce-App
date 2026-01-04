import joi from "joi";
import { categoryGeneralFields } from "../../middleware/validation.middleware.js";

export const addCategorySchema = joi
  .object({
    name: categoryGeneralFields.name.required(),
    isActive: joi.boolean().required(),
    file: categoryGeneralFields.file.required(),
  })
  .required();

export const updateCategorySchema = joi
  .object({
    _id: categoryGeneralFields._id.required(),
    name: categoryGeneralFields.name,
    file: categoryGeneralFields.file,
  })
  .required();
