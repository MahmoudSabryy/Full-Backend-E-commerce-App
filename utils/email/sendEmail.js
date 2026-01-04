import nodemailer from "nodemailer";

export const sendEmails = async ({ to, subject, html }) => {
  //SENDER
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });
  //RECEIVER
  const info = await transporter.sendMail({
    from: `"E-Commerce Store" <${process.env.EMAIL}>`,
    to,
    subject,
    html,
  });
  return info.rejected.length == 0 ? true : false;
};

export const subject = {
  Register: "Verify Email",
  resetPassword: "Reset Password",
};
