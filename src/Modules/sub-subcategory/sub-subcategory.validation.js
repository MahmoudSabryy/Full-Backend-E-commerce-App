import joi from "joi";
import { subCategoryGeneralFields } from "../../middleware/validation.middleware.js";

export const addSubSubCategorySchema = joi
  .object({
    categoryId: subCategoryGeneralFields._id.required(),

    name: subCategoryGeneralFields.name.required(),
    file: subCategoryGeneralFields.file.required(),
    category: subCategoryGeneralFields.category.required(),
  })
  .required();

export const updateSubcategorySchema = joi
  .object({
    categoryId: subCategoryGeneralFields._id.required(),
    subcategoryId: subCategoryGeneralFields._id.required(),
    name: subCategoryGeneralFields.name,
    file: subCategoryGeneralFields.file,
    category: subCategoryGeneralFields.category,
  })
  .required();
