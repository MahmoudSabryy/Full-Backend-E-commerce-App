import couponModel from "../../DB/Models/coupon.model.js";
import cloudinary from "../../../utils/file uploading/cloudinary.js";

export const createCoupon = async (req, res, next) => {
  const name = req.body.name.toLowerCase();

  if (await couponModel.findOne({ name }))
    return next(new Error(`This ${name} already exist`), { cause: 409 });

  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.APP_NAME}/coupon`,
      }
    );
    req.body.image = { secure_url, public_id };
  }
  const coupon = await couponModel.create({
    name,
    image: req.body?.image,
    amount: req.body.amount,
    expireDate: new Date(req.body.expireDate),
    createdBy: req.user._id,
  });

  return res.status(201).json({
    success: true,
    message: "Coupon Created Successfully",
    data: coupon,
  });
};

export const updateCoupon = async (req, res, next) => {
  const { couponId } = req.params;

  const coupon = await couponModel.findById(couponId);
  if (!coupon) return next(new Error("Can't find this coupon", { cause: 404 }));

  if (req.body.name) {
    req.body.name = req.body.name.toLowerCase();

    if (await couponModel.findOne({ name: req.body.name }))
      return next(new Error("Duplicate Coupon name", { cause: 409 }));
    if (coupon.name === req.body.name)
      return next(
        new Error("Can't update coupon name with the same name", { cause: 400 })
      );

    coupon.name = req.body.name;
  }

  if (req.body.amount) {
    if (coupon.amount === req.body.amount)
      return next(new Error("Can't update coupon amount with the same amount"));

    coupon.amount = req.body.amount;
  }

  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        folder: `${process.env.APP_NAME}/coupon`,
      }
    );
    if (coupon.image) {
      await cloudinary.uploader.destroy(coupon.image.public_id);
    }
    coupon.image = { secure_url, public_id };
  }
  coupon.updatedBy = req.user._id;

  if (req.body.expireDate) {
    coupon.expireDate = new Date(req.body.expireDate);
  }
  await coupon.save();

  return res.status(200).json({
    success: true,
    message: "Coupon updated Successfully",
    data: coupon,
  });
};

export const getAllCoupons = async (req, res, next) => {
  const coupons = await couponModel.find();

  if (coupons.length === 0)
    return res
      .status(200)
      .json({ success: true, message: "No Coupons found", data: coupons });
  return res
    .status(200)
    .json({ success: true, message: "All Coupons :", data: coupons });
};

export const validateCoupon = async (req, res, next) => {
  const { name } = req.body;

  const coupon = await couponModel.findOne({
    name: name.toLowerCase(),
  });

  if (!coupon) return next(new Error("Invalid coupon code", { cause: 400 }));

  if (coupon.expireDate < new Date())
    return next(new Error("Coupon expired", { cause: 400 }));

  return res.status(200).json({
    success: true,
    message: "Coupon is valid",
    data: {
      name: coupon.name,
      discountPercent: coupon.amount, // نسبة
    },
  });
};

export const softDeleteCoupon = async (req, res, next) => {
  const couponId = req.params.couponId;

  const coupon = await couponModel.findOneAndUpdate(
    { _id: couponId, isDeleted: false },
    { isDeleted: true, isActive: false },
    { new: true, runValidators: true }
  );

  if (!coupon) return next(new Error(`coupon not found`, { cause: 400 }));

  return res.status(200).json({
    success: true,
    message: `${coupon.name} deleted successfully`,
    data: coupon,
  });
};

export const unDeleteCoupon = async (req, res, next) => {
  const couponId = req.params.couponId;

  const coupon = await couponModel.findOneAndUpdate(
    { _id: couponId, isDeleted: true },
    { isDeleted: false, isActive: true },
    { new: true, runValidators: true }
  );

  if (!coupon) return next(new Error(`coupon not found`, { cause: 400 }));

  return res.status(200).json({
    success: true,
    message: `${coupon.name} Enabled successfully`,
    data: coupon,
  });
};

export const activateCoupon = async (req, res, next) => {
  const couponId = req.params.couponId;

  const coupon = await couponModel.findOneAndUpdate(
    { _id: couponId, isActive: false },
    { isActive: true },
    { new: true, runValidators: true }
  );

  if (!coupon) return next(new Error("can't find this coupon", { cause: 400 }));

  return res
    .status(200)
    .json({ success: true, message: `${coupon.name} Activated` });
};

export const deActivateCoupon = async (req, res, next) => {
  const couponId = req.params.couponId;

  const coupon = await couponModel.findOneAndUpdate(
    { _id: couponId, isActive: true },
    { isActive: false },
    { new: true, runValidators: true }
  );

  if (!coupon) return next(new Error("can't find this coupon", { cause: 400 }));

  return res
    .status(200)
    .json({ success: true, message: `${coupon.name} Deactivated` });
};
