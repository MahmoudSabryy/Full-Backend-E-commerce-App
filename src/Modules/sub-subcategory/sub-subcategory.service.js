import slugify from "slugify";
import subsubcategoryModel from "../../DB/Models/sub-subcategory.model.js";
import subcategoryModel from "../../DB/Models/subCategory.model.js";

export const getAllSubSubcategories = async (req, res, next) => {
  const subsubcategories = await subsubcategoryModel
    .find({ isDeleted: false, isActive: true })
    .populate("subcategoryId");

  if (subsubcategories.length === 0)
    return next(new Error("No Sub-subcategories to Show"), { cause: 404 });

  return res.status(200).json({
    success: true,
    message: "All sub-subcategories :",
    data: subsubcategories,
  });
};

export const addsSubSubcategory = async (req, res, next) => {
  const name = req.body.name.toLowerCase();

  if (
    await subsubcategoryModel.findOne({
      name,
      subcategoryId: req.params.subcategoryId,
    })
  )
    return next(new Error(`${name} already exist`), { cause: 409 });

  const subCategory = await subcategoryModel.findById(req.params.subcategoryId);

  if (!subCategory)
    return next(new Error("SubCategory not found"), { cause: 404 });

  //   const customId = nanoid();

  //   const { secure_url, public_id } = await cloudinary.uploader.upload(
  //     req.file.path,
  //     {
  //       folder: `${process.env.APP_NAME}/category/${category._id}/${customId}`,
  //     }
  //   );

  const subsubcategory = await subsubcategoryModel.create({
    name,
    slug: slugify(req.body.name, { lower: true }),
    subcategoryId: subCategory._id,
    createdBy: req.user._id,
  });

  return res.status(201).json({
    success: true,
    message: `${subsubcategory.name} created successfully`,
    data: subsubcategory,
  });
};

export const updateSubSubcategory = async (req, res, next) => {
  if (!req.body.name && !req.body.category && !req.file) {
    return next(new Error("No data provided to update"), { cause: 400 });
  }

  const subsubCategory = await subsubcategoryModel.findOne({
    _id: req.params.subsubcategoryId,
    subcategoryId: req.params.subcategoryId,
  });
  if (!subsubCategory)
    return next(
      new Error("Can't find this Sub-Subcategory or their related category"),
      { cause: 404 }
    );

  if (req.body.name) {
    req.body.name = req.body.name.toLowerCase();
    if (req.body.name === subsubCategory.name)
      return next(new Error("Can't update the name with same name"), {
        cause: 400,
      });
    if (await subsubcategoryModel.findOne({ name: req.body.name }))
      return next(new Error("Sub-subcategory already exist"), { cause: 400 });

    subsubCategory.name = req.body.name;
    subsubCategory.slug = slugify(req.body.name, { lower: true });
  }

  subsubCategory.updatedBy = req.user._id;

  await subsubCategory.save();

  return res.status(200).json({
    success: true,
    message: `${subsubCategory.name} updated Successfully`,
    data: subsubCategory,
  });
};
