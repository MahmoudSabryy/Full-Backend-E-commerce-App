import emailEvent from "../../../utils/email/email.event.js";
import { encrypt } from "../../../utils/encryption/encrypt.js";
import { compare, hash } from "../../../utils/hashing/hash.js";
import { generateToken } from "../../../utils/token/token.js";
import UserModel, {
  providerTypes,
  roleTypes,
} from "../../DB/Models/user.model.js";
import { OAuth2Client } from "google-auth-library";

export const register = async (req, res, next) => {
  const { email, password, phone } = req.body;

  if (await UserModel.findOne({ email }))
    return next(new Error("User already Exist", { cause: 409 }));

  const hashedPassword = hash({
    plainText: password,
    saltRound: process.env.SALT_ROUNDS,
  });

  const encryptedPhone = encrypt({
    plainText: phone,
    Encryption_Secret_Key: process.env.ENCRYPTION_SECRET_KEY,
  });

  const user = await UserModel.create({
    ...req.body,
    password: hashedPassword,
    phone: encryptedPhone,
  });

  if (!user)
    return next(
      new Error("Can not create your account right now", { cause: 400 })
    );
  emailEvent.emit("sendEmail", {
    email: user.email,
    userName: user.userName,
    id: user._id,
  });

  return res
    .status(201)
    .json({ success: true, message: "User Registerd successfully", user });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) return next(new Error("Email not Found", { cause: 404 }));

  if (user.isBlocked == true)
    return next(new Error("User Account is Blocked", { cause: 400 }));

  // if (user.confirmEmail == false)
  //   return next(new Error("please confirm your email ", { cause: 400 }));

  const compareHashedPasswored = compare({
    plainText: password,
    hashed: user.password,
  });

  if (!compareHashedPasswored)
    return next(new Error("Invalid Email or Password"));

  const token = generateToken({
    payload: {
      id: user._id,
      userName: user.userName,
      role: user.role,
      email: user.email,
    },
    signature:
      user.role === roleTypes.user
        ? process.env.USER_ACCESS_TOKEN
        : process.env.ADMIN_ACCESS_TOKEN,
    options: { expiresIn: "1d" },
  });

  return res.status(200).json({
    success: true,
    message: `${user.role} login successfully`,
    token: user.role + " " + token,
  });
};

export const confirmEmail = async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) return next(new Error("Email not Found", { cause: 404 }));

  const compareOtp = compare({
    plainText: req.body.otp,
    hashed: user.confirmEmailOtp,
  });

  if (!compareOtp) return next(new Error("Invalid-Otp", { cause: 400 }));
  await UserModel.updateOne(
    { _id: user._id },
    { $set: { confirmEmail: true, confirmEmailOtp: "" } }
  );

  return res
    .status(200)
    .json({ message: "your account has been activated Successfully" });
};

export const forgetPassword = async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });

  if (!user) return next(new Error("Email not Found", { cause: 404 }));

  emailEvent.emit("resetPassword", {
    email: user.email,
    userName: user.userName,
    id: user._id,
  });

  return res
    .status(200)
    .json({ success: true, message: "Otp sent to this Email" });
};

export const verifyForgetPasswordOtp = async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });

  if (!user) return next(new Error("Email not Found", { cause: 404 }));

  const compareOtp = compare({
    plainText: req.body.otp,
    hashed: user.forgetPasswordOtp,
  });

  if (!compareOtp)
    return next(new Error("Invalid Email or Otp", { cause: 400 }));

  await UserModel.updateOne(
    { _id: user._id },

    { $unset: { forgetPasswordOtp: "" } }
  );
  return res
    .status(200)
    .json({ success: true, message: "otp confirmed Successfully" });
};

export const changeForgetedPassword = async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });

  if (!user) return next(new Error("Email not Found", { cause: 404 }));

  const comparePassword = compare({
    plainText: req.body.password,
    hashed: user.password,
  });

  if (comparePassword)
    return next(new Error("you entered your old password ", { cause: 400 }));

  const hashedPassword = hash({ plainText: req.body.password });

  await UserModel.findOneAndUpdate(
    { _id: user._id },
    {
      password: hashedPassword,
      changecredentials: Date.now(),
    },
    { new: true, runValidators: true }
  );

  return res
    .status(200)
    .json({ success: true, message: "Password changed Successfully" });
};

export const loginWithGmail = async (req, res, next) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({
      success: false,
      message: "Google credential is required",
    });
  }

  const client = new OAuth2Client(process.env.CLIENT_ID);

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
    });

    const payload = ticket.getPayload();

    return payload;
  }

  const { email_verified, given_name, family_name, picture, email, name } =
    await verify();

  if (!email_verified)
    return next(new Error("Email not verified", { cause: 400 }));

  let user = await UserModel.findOne({ email });

  if (user?.provider === providerTypes.system)
    return next(new Error("Email already exist", { cause: 409 }));

  if (!user) {
    user = await UserModel.create({
      firstName: given_name,
      lastName: family_name,
      userName: name,
      confirmEmail: email_verified,
      image: { url: picture },
      email,
      provider: providerTypes.google,
      password: "Google",
    });
  }
  const token = generateToken({
    payload: {
      id: user._id,
      userName: user.userName,
      role: user.role,
      email: user.email,
    },
    signature:
      user.role === roleTypes.user
        ? process.env.USER_ACCESS_TOKEN
        : process.env.ADMIN_ACCESS_TOKEN,
    options: { expiresIn: "1d" },
  });

  return res.status(200).json({
    success: true,
    message: `${user.role} login successfully`,
    token: user.role + " " + token,
  });
};
