import mongoose, { Schema, Types } from "mongoose";

export const genderTypes = {
  male: "male",
  female: "female",
};

export const roleTypes = {
  admin: "admin",
  user: "user",
};
export const providerTypes = {
  system: "system",
  google: "Google",
};
const userSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    userName: {
      type: String,
      required: [true, "Username is required"],
      minLength: [3, "your username must be at least 3 character"],
      maxLength: [20, "your username must be at most 20 character"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email must be unique"],
      lowercase: true,
      trim: true,

      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid email format"],
    },

    password: {
      type: String,
      required: [true, "password is required"],
    },

    gender: {
      type: String,
      enum: Object.values(genderTypes),
      message: "Gender must be either male or female",
    },

    confirmEmail: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: Object.values(roleTypes),
      default: roleTypes.user,
    },

    wishList: [{ type: Types.ObjectId, ref: "Product" }],
    image: Object,
    phone: String,
    age: Number,
    DOB: Date,
    changedAt: Date,

    address: String,

    isBlocked: {
      type: Boolean,
      default: false,
    },

    provider: {
      type: String,
      enum: Object.values(providerTypes),
      default: providerTypes.system,
    },
    forgetPasswordOtp: String,
    confirmEmailOtp: String,
    changecredentials: Date,
  },

  { timestamps: true }
);

// userSchema.virtual("product", {
//   ref: "Product",
//   localField:"wi"
// });

userSchema.pre("save", function () {
  if (this.DOB) {
    const ageDifMs = Date.now() - this.DOB.getTime();
    const ageDate = new Date(ageDifMs);
    this.age = Math.abs(ageDate.getUTCFullYear() - 1970);
  }
});

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
