import joi from "joi";
import {
  imageSchema,
  productGeneralFields,
} from "../../middleware/validation.middleware.js";

export const addProductSchema = joi
  .object({
    categoryId: productGeneralFields.categoryId.required(),
    subcategoryId: productGeneralFields.subcategoryId.required(),
    brandId: productGeneralFields.brandId.required(),
    name: productGeneralFields.name.required(),
    description: productGeneralFields.description.required(),
    stock: productGeneralFields.stock.required(),
    price: productGeneralFields.price.required(),
    discount: productGeneralFields.discount,
    size: productGeneralFields.size,
    colors: productGeneralFields.colors.required(),
    file: productGeneralFields.file,
    // isActive: productGeneralFields.isActive.required(),
    // isDeleted: productGeneralFields.isDeleted,
    file: joi.object({
      mainImage: joi.array().items(imageSchema).length(1),
      subImages: joi.array().items(imageSchema).min(1).max(5),
    }),
  })
  .required();

export const updateProductSchema = joi
  .object({
    productId: productGeneralFields.productId.required(),
    categoryId: productGeneralFields.categoryId,
    subcategoryId: productGeneralFields.subcategoryId,
    brandId: productGeneralFields.brandId,
    name: productGeneralFields.name,
    description: productGeneralFields.description,
    stock: productGeneralFields.stock,
    price: productGeneralFields.price,
    discount: productGeneralFields.discount,
    size: productGeneralFields.size,
    colors: productGeneralFields.colors,
    isActive: productGeneralFields.isActive.required(),
    isDeleted: productGeneralFields.isDeleted,
    file: joi.object({
      mainImage: joi.array().items(imageSchema).length(1),
      subImages: joi.array().items(imageSchema).min(1).max(5),
    }),
  })
  .required();
