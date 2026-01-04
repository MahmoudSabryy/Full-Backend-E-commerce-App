import EventEmitter from "events";
import { sendEmails, subject } from "./sendEmail.js";
import { customAlphabet } from "nanoid";
import { hash } from "../hashing/hash.js";
import UserModel from "../../src/DB/Models/user.model.js";
import { template } from "./generateHtml.js";

const emailEvent = new EventEmitter();

// Register event
emailEvent.on("sendEmail", async ({ email, userName, id }) => {
  await sendCode({
    data: { email, userName, id },
    subjectType: subject.Register,
  });
});

emailEvent.on("resetPassword", async ({ email, userName, id }) => {
  await sendCode({
    data: { email, userName, id },
    subjectType: subject.resetPassword,
  });
});

export const sendCode = async ({
  data = {},
  subjectType = subject.Register,
}) => {
  const { userName, email, id } = data;

  // Create 6-digit OTP
  const Otp = customAlphabet("0123456789", 6)();

  const hashOtp = hash({
    plainText: Otp,
    saltRound: process.env.SALT_ROUNDS,
  });

  let updatedData = {};

  // Set the correct field
  switch (subjectType) {
    case subject.Register:
      updatedData = { confirmEmailOtp: hashOtp };
      break;

    case subject.resetPassword:
      updatedData = { forgetPasswordOtp: hashOtp };
      break;

    default:
      break;
  }

  await UserModel.updateOne({ _id: id }, { $set: updatedData });

  // Send email
  await sendEmails({
    to: email,
    subject: subjectType,
    html: template(userName, Otp, subjectType),
  });
};

export default emailEvent;
