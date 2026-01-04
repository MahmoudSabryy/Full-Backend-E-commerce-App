import brandModel from "../../DB/Models/brand.model.js";
import cloudinary from "../../../utils/file uploading/cloudinary.js";
import slugify from "slugify";

export const addBrand = async (req, res, next) => {
  const name = req.body.name.toLowerCase();

  if (await brandModel.findOne({ name }))
    return next(new Error("This brand is already exist", { cause: 409 }));

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.APP_NAME}/brands`,
    }
  );

  const brand = await brandModel.create({
    name,
    slug: slugify(name, { lower: true }),
    image: { secure_url, public_id },
    createdBy: req.user._id,
  });

  return res.status(201).json({
    success: true,
    message: `${brand.name} created successfully`,
    data: brand,
  });
};

export const updateBrand = async (req, res, next) => {
  const { brandId } = req.params;

  const brand = await brandModel.findById(brandId);
  if (!brand) return next(new Error("Brand not found", { cause: 404 }));

  if (req.body.name) {
    req.body.name = req.body.name.toLowerCase();
    if (req.body.name === brand.name)
      return next(new Error("Brand name is the same old name", { cause: 400 }));

    if (await brandModel.findOne({ name: req.body.name }))
      return next(
        new Error("An brand is already exist with the same name", {
          cause: 409,
        })
      );
    brand.name = req.body.name;
    brand.slug = slugify(req.body.name, { lower: true });
  }

  if (req.file) {
    await cloudinary.uploader.destroy(brand.image.public_id);

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.APP_NAME}/brands`,
      }
    );
    brand.image = { secure_url, public_id };
  }
  brand.updatedBy = req.user._id;
  await brand.save();

  return res.status(200).json({
    success: true,
    message: `brand updated successfully`,
    data: brand,
  });
};

export const getAllBrands = async (req, res, next) => {
  const brands = await brandModel.find().populate("product");
  if (brands.length === 0)
    return res
      .status(200)
      .json({ success: true, message: "No brands found", data: brands });
  return res
    .status(200)
    .json({ success: true, message: "All brands :", data: brands });
};

export const softDeleteBrand = async (req, res, next) => {
  const brandId = req.params.brandId;

  const brand = await brandModel.findOneAndUpdate(
    {
      _id: brandId,
      isDeleted: false,
    },
    { isDeleted: true, isActive: false },
    { new: true, runValidators: true }
  );

  if (!brand) return next(new Error("can't find this brand", { cause: 400 }));

  return res.status(200).json({
    success: true,
    message: `${brand.name} deleted successfully`,
    data: brand,
  });
};

export const unDeleteBrand = async (req, res, next) => {
  const brandId = req.params.brandId;

  const brand = await brandModel.findOneAndUpdate(
    {
      _id: brandId,
      isDeleted: true,
    },
    { isDeleted: false, isActive: true },
    { new: true, runValidators: true }
  );

  if (!brand) return next(new Error("can't find this brand", { cause: 400 }));

  return res.status(200).json({
    success: true,
    message: `${brand.name} Enabled successfully`,
    data: brand,
  });
};

export const activateBrand = async (req, res, next) => {
  const brandId = req.params.brandId;

  const brand = await brandModel.findOneAndUpdate(
    { _id: brandId, isActive: false },
    { isActive: true },
    { new: true, runValidators: true }
  );

  if (!brand) return next(new Error("can't find this brand", { cause: 400 }));

  return res
    .status(200)
    .json({ success: true, message: `${brand.name} Activated` });
};

export const deActivateBrand = async (req, res, next) => {
  const brandId = req.params.brandId;

  const brand = await brandModel.findOneAndUpdate(
    { _id: brandId, isActive: true },
    { isActive: false },
    { new: true, runValidators: true }
  );

  if (!brand) return next(new Error("can't find this brand", { cause: 400 }));

  return res
    .status(200)
    .json({ success: true, message: `${brand.name} Deactivated` });
};
