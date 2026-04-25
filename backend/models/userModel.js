import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },

    password: {
      type: String,
      minlength: 6,
      select: false, // 🔥 hide password by default
    },

    phone: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: "Phone number must be exactly 10 digits",
      },
    },

    profile_url: {
      type: String,
      default:
        "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg",
    },

    // 🔥 AUTH PROVIDERS
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    googleId: {
      type: String,
      default: null,
    },

    // 🔥 ACCOUNT STATUS
    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // 🔥 OTP SYSTEM (for email verification / reset)
    otp: {
      code: String,
      expiresAt: Date,
    },

    // 🔥 SECURITY
    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: Date,

    // 🔥 SESSION / TRACKING
    lastLogin: Date,

    refreshToken: String,
    
    resetPasswordToken: String,

    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  },
);

// 🔐 PASSWORD MATCH
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false; // for google users

  return await bcrypt.compare(enteredPassword, this.password);
};

// 🔐 HASH PASSWORD
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (!this.password) return next(); // skip for google users

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔥 ACCOUNT LOCK CHECK
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

const User = mongoose.model("User", userSchema);
export default User;
