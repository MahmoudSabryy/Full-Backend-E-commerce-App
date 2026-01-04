import { decrypt, encrypt } from "../../../utils/encryption/encrypt.js";
import { compare, hash } from "../../../utils/hashing/hash.js";
import UserModel from "../../DB/Models/user.model.js";

export const getUserdata = async (req, res, next) => {
  let user = await UserModel.findById(req.user._id).populate({
    path: "wishList",
    select: "name mainImage price finalPrice stock",
    populate: [
      { path: "categoryId", select: "name" },
      { path: "subcategoryId", select: "name" },
    ],
  });

  if (user.phone) {
    user.phone = decrypt({
      Encrypted_Text: user.phone,
      Encryption_Secret_Key: process.env.ENCRYPTION_SECRET_KEY,
    });
  }
  return res.status(200).json({
    success: true,
    message: "User Profile",
    data: user,
  });
};

export const updateUserdata = async (req, res, next) => {
  let { user } = req;

  if (req.body.phone) {
    user.phone = encrypt({ plainText: req.body.phone });
  }

  user = await UserModel.findByIdAndUpdate(
    req.user._id,
    { ...req.body, phone: user.phone },
    { new: true, runValidators: true }
  ).select("-password");

  return res.status(200).json({
    success: true,
    message: "User Data updated Successfully",
    data: user,
  });
};

export const changePassword = async (req, res, next) => {
  let user = req.user;

  const match = compare({
    plainText: req.body.oldPassword,
    hashed: user.password,
  });

  if (!match)
    return next(new Error("Old Password is incorrect", { cause: 400 }));

  if (req.body.password === req.body.oldPassword)
    return next(new Error("old password is same new password", { cause: 400 }));

  req.body.password = hash({ plainText: req.body.password });

  user = await UserModel.findByIdAndUpdate(
    user._id,
    { password: req.body.password, changecredentials: Date.now() },
    { new: true, runValidators: true }
  );

  return res
    .status(200)
    .json({ success: true, message: "Password changed successfully" });
};
