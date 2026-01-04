import slugify from "slugify";
import cloudinary from "../../../utils/file uploading/cloudinary.js";
import categoryModel from "../../DB/Models/category.model.js";

export const addCategory = async (req, res, next) => {
  const { name, isActive } = req.body;

  const categoryExist = await categoryModel.findOne({ name });

  if (categoryExist)
    return next(new Error(`${categoryExist.name} already exist`), {
      cause: 409,
    });

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.APP_NAME}/category`,
    }
  );

  const category = await categoryModel.create({
    name,
    isActive,
    image: { secure_url, public_id },
    slug: slugify(name),
    createdBy: req.user._id,
  });

  return res.status(201).json({
    success: true,
    message: "Category Created Successfully",
    data: category,
  });
};

export const updateCategory = async (req, res, next) => {
  if (!req.body.name && req.file)
    return next(
      new Error("please write the field you want to update", { cause: 400 })
    );
  const category = await categoryModel.findById(req.params._id);
  if (!category) return next(new Error("Category not found"), { cause: 404 });

  if (req.body.name) {
    req.body.name = req.body.name.toLowerCase();
    if (req.body.name === category.name)
      return next(
        new Error("Can't update the name with same name", { cause: 400 })
      );
    if (await categoryModel.findOne({ name: req.body.name }))
      return next(new Error("Category already exist"), { cause: 400 });
  }
  category.name = req.body.name || category.name;
  category.slug = slugify(req.body.name) || category.slug;

  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.APP_NAME}/category`,
      }
    );
    await cloudinary.uploader.destroy(category.image.public_id);
    category.image = { secure_url, public_id } || category.image;
  }

  category.updatedBy = req.user._id || category.updatedBy;
  await category.save();

  return res.status(200).json({
    success: true,
    message: "Category updated Successfully",
    data: category,
  });
};

export const getAllCategories = async (req, res, next) => {
  const categories = await categoryModel.find().populate({
    path: "subcategories",

    populate: {
      path: "subsubcategory",
    },
  });

  if (categories.length === 0)
    return next(new Error("No Categories to Show"), { cause: 404 });

  return res.status(200).json({
    success: true,
    message: "All Categories :",
    data: categories,
  });
};

export const softDeleteCategory = async (req, res, next) => {
  const categoryId = req.params._id;

  const category = await categoryModel.findOneAndUpdate(
    { _id: categoryId, isDeleted: false },
    { isDeleted: true, isActive: false },
    { new: true, runValidators: true }
  );

  if (!category) return next(new Error(`Category not found`, { cause: 400 }));

  return res.status(200).json({
    success: true,
    message: `${category.name} deleted successfully`,
    data: category,
  });
};

export const unDeleteCategory = async (req, res, next) => {
  const categoryId = req.params._id;

  const category = await categoryModel.findOneAndUpdate(
    { _id: categoryId, isDeleted: true },
    { isDeleted: false, isActive: true },
    { new: true, runValidators: true }
  );

  if (!category) return next(new Error(`Category not found`, { cause: 400 }));

  return res.status(200).json({
    success: true,
    message: `${category.name} Enabled successfully`,
    data: category,
  });
};

export const activateCategroy = async (req, res, next) => {
  const categoryId = req.params._id;

  const category = await categoryModel.findOneAndUpdate(
    { _id: categoryId, isActive: false },
    { isActive: true },
    { new: true, runValidators: true }
  );

  if (!category)
    return next(new Error("can't find this category", { cause: 400 }));

  return res
    .status(200)
    .json({ success: true, message: `${category.name} Activated` });
};

export const deActivateCategroy = async (req, res, next) => {
  const categoryId = req.params._id;

  const category = await categoryModel.findOneAndUpdate(
    { _id: categoryId, isActive: true },
    { isActive: false },
    { new: true, runValidators: true }
  );

  if (!category)
    return next(new Error("can't find this category", { cause: 400 }));

  return res
    .status(200)
    .json({ success: true, message: `${category.name} Deactivated` });
};
