import joi from "joi";
import { Types } from "mongoose";
import { genderTypes } from "../DB/Models/user.model.js";
export const isValidObjectID = (value, helper) => {
  return Types.ObjectId.isValid(value) ? true : helper.message("In-valid Id");
};
export const generalfields = {
  firstName: joi.string(),
  lastName: joi.string(),
  UserName: joi.string().min(3).max(30),
  email: joi.string().email({
    minDomainSegments: 2,
    maxDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  password: joi.string(),
  confirmPassword: joi.string().valid(joi.ref("password")),
  phone: joi.string(),
  otp: joi.string(),
  id: joi.string().custom(isValidObjectID),
  gender: joi.string().valid(...Object.values(genderTypes)),
  DOB: joi.string(),
  age: joi.number(),
  address: joi.string(),
  // addresses: joi.object({
  //   homeAddress: joi.object({
  //     governorate: joi.string().required(),
  //     city: joi.string().required(),
  //     addressDetails: joi.string().required(),
  //     isDefault: joi.boolean().default(true),
  //   }),
  //   workAddress: joi.object({
  //     governorate: joi.string().required(),
  //     city: joi.string().required(),
  //     addressDetails: joi.string().required(),
  //     isDefault: joi.boolean().default(false),
  //   }),
  // }),
};

export const imageSchema = joi
  .object({
    mimetype: joi
      .string()
      .valid("image/jpeg", "image/png", "image/jpg")
      .required(),
    size: joi
      .number()
      .max(2 * 1024 * 1024)
      .required(),
  })
  .unknown(true);

export const categoryGeneralFields = {
  _id: joi.string(),
  isActive: joi.boolean(),
  name: joi.string(),
  file: imageSchema,
};

export const subCategoryGeneralFields = {
  _id: joi.string(),
  name: joi.string().min(2).max(25),
  file: imageSchema,
  category: joi.string(),
};

export const couponGeneralFields = {
  couponId: joi.string(),
  name: joi.string(),
  amount: joi.number().positive().min(1).max(100),
  expireDate: joi.date().greater(Date.now()),
  file: imageSchema,
};
export const orderGeneralFields = {
  note: joi.string(),
  address: joi.string().min(5).required(),
  phone: joi.array().items(joi.string()),
  couponName: joi.string(),
  paymentMethod: joi.string().valid("cash", "card"),
};

export const brandGeneralFields = {
  brandId: joi.string(),
  name: joi.string(),
  file: imageSchema,
};

export const productGeneralFields = {
  productId: joi.string().custom(isValidObjectID),
  categoryId: joi.string().custom(isValidObjectID),
  subcategoryId: joi.string().custom(isValidObjectID),
  brandId: joi.string().custom(isValidObjectID),
  name: joi.string().min(2).max(30),
  description: joi.string().min(10).max(1000),
  stock: joi.number().positive().integer().min(1),
  price: joi.number().positive().min(1),
  discount: joi.number().positive().min(1),
  size: joi.array().items(joi.string()),
  colors: joi.array().items(joi.string()),
  isActive: joi.boolean(),
  isDeleted: joi.boolean(),
  file: joi.object({
    mainImage: joi.array().items(imageSchema).length(1).required(),
    subImages: joi.array().items(imageSchema).min(1).max(5),
  }),
};

export const Validation = (schema) => {
  return (req, res, next) => {
    const data = { ...req.body, ...req.params, ...req.query };

    if (req.file || req.files) {
      data.file = req.file || req.files;
    }

    const results = schema.validate(data, { abortEarly: false });

    if (results.error) {
      const errorMessages = results.error.details.map((obj) => obj.message);
      return next(new Error(errorMessages), { cause: 400 });
    }
    return next();
  };
};
