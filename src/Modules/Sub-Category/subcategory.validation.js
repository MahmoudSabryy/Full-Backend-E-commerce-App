import joi from "joi";
import { subCategoryGeneralFields } from "../../middleware/validation.middleware.js";

export const addSubCategorySchema = joi
  .object({
    categoryId: subCategoryGeneralFields._id.required(),
    isActive: joi.boolean().required(),
    name: subCategoryGeneralFields.name.required(),
    file: subCategoryGeneralFields.file.required(),
  })
  .required();

export const updateSubcategorySchema = joi
  .object({
    categoryId: subCategoryGeneralFields._id.required(),
    subcategoryId: subCategoryGeneralFields._id.required(),
    name: subCategoryGeneralFields.name,
    file: subCategoryGeneralFields.file,
  })
  .required();
