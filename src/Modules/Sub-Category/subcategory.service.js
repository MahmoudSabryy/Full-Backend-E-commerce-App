import slugify from "slugify";
import cloudinary from "../../../utils/file uploading/cloudinary.js";
import categoryModel from "../../DB/Models/category.model.js";
import subcategoryModel from "../../DB/Models/subCategory.model.js";
import { nanoid } from "nanoid";

export const getAllSubcategories = async (req, res, next) => {
  const subcategories = await subcategoryModel
    .find()
    .populate("categoryId subsubcategory");

  if (subcategories.length === 0)
    return next(new Error("No Sub-Categories to Show"), { cause: 404 });

  return res.status(200).json({
    success: true,
    message: "All sub-categories :",
    data: subcategories,
  });
};

export const addSubcategory = async (req, res, next) => {
  const name = req.body.name.toLowerCase();

  if (await subcategoryModel.findOne({ name }))
    return next(new Error(`${name} already exist`), { cause: 409 });

  const category = await categoryModel.findById(req.params.categoryId);

  if (!category) return next(new Error("Category not found"), { cause: 404 });

  const customId = nanoid();

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.APP_NAME}/category/${category._id}/${customId}`,
    }
  );

  const subcategory = await subcategoryModel.create({
    name,
    slug: slugify(req.body.name, { lower: true }),
    image: { secure_url, public_id },
    categoryId: category._id,
    customId,
    createdBy: req.user._id,
  });

  return res.status(201).json({
    success: true,
    message: `${subcategory.name} created successfully`,
    data: subcategory,
  });
};

export const updateSubcategory = async (req, res, next) => {
  if (!req.body.name && !req.body.category && !req.file) {
    return next(new Error("No data provided to update"), { cause: 400 });
  }

  const subCategory = await subcategoryModel.findOne({
    _id: req.params.subcategoryId,
    categoryId: req.params.categoryId,
  });
  if (!subCategory)
    return next(
      new Error("Can't find this Sub-category or their related category"),
      { cause: 404 }
    );

  if (req.body.name) {
    req.body.name = req.body.name.toLowerCase();
    if (req.body.name === subCategory.name)
      return next(new Error("Can't update the name with same name"), {
        cause: 400,
      });
    if (await subcategoryModel.findOne({ name: req.body.name }))
      return next(new Error("Sub-Category already exist"), { cause: 400 });

    subCategory.name = req.body.name;
    subCategory.slug = slugify(req.body.name, { lower: true });
  }

  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.APP_NAME}/category/${req.params.categoryId}/${subCategory.customId}`,
      }
    );

    await cloudinary.uploader.destroy(subCategory.image.public_id);

    subCategory.image = { secure_url, public_id };
  }
  subCategory.updatedBy = req.user._id;

  await subCategory.save();

  return res.status(200).json({
    success: true,
    message: `${subCategory.name} updated Successfully`,
    data: subCategory,
  });
};

export const activateSubCategory = async (req, res, next) => {
  const subcategoryId = req.params._id;

  const subCategory = await subcategoryModel.findOneAndUpdate(
    { _id: subcategoryId, isActive: false },
    { isActive: true },
    { new: true, runValidators: true }
  );
  if (!subCategory)
    return next(new Error("can't find this sub-categrory", { cause: 400 }));

  return res.status(200).json({
    success: true,
    message: `${subCategory.name} Activated successfully`,
  });
};

export const deActivateSubCategory = async (req, res, next) => {
  const subcategoryId = req.params._id;

  const subCategory = await subcategoryModel.findOneAndUpdate(
    { _id: subcategoryId, isActive: true },
    { isActive: false },
    { new: true, runValidators: true }
  );
  if (!subCategory)
    return next(new Error("can't find this sub-categrory", { cause: 400 }));

  return res.status(200).json({
    success: true,
    message: `${subCategory.name} Deactivated successfully`,
  });
};

export const softDeleteSubCategory = async (req, res, next) => {
  const subcategoryId = req.params._id;

  const subcategory = await subcategoryModel.findOneAndUpdate(
    { _id: subcategoryId, isDeleted: false },
    { isDeleted: true, isActive: false },
    { new: true, runValidators: true }
  );

  if (!subcategory)
    return next(new Error("can't find this sub-categrory", { cause: 400 }));

  return res.status(200).json({
    success: true,
    message: `${subcategory.name} deleted successfully`,
  });
};

export const unDeleteSubCategory = async (req, res, next) => {
  const subcategoryId = req.params._id;

  const subcategory = await subcategoryModel.findOneAndUpdate(
    { _id: subcategoryId, isDeleted: true },
    { isDeleted: false, isActive: true },
    { new: true, runValidators: true }
  );

  if (!subcategory)
    return next(new Error("can't find this sub-categrory", { cause: 400 }));

  return res.status(200).json({
    success: true,
    message: `${subcategory.name} Enabled successfully`,
  });
};
