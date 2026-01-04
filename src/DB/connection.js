import mongoose from "mongoose";

import chalk from "chalk";
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log(`Connected Successfully to Database ${chalk.green("✅")}`);
  } catch (error) {
    console.log(
      `Unable to connect to database ${chalk.yellow("⚠ \n")}  ${error.message} `
    );
  }
};

export default connectDB;
