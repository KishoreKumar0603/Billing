import { setMailContent } from "../utils/mailContent.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import sendMail from "../utils/sendMail.js";
import crypto from "crypto";

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" },
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;
    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    if (confirmPassword !== password) {
      return res.status(400).json({
        error: "Password doesn't match",
      });
    }

    const isExistingUser = await User.findOne({ email });
    if (isExistingUser) {
      return res.status(400).json({
        code: "USER_ALREADY_EXISTS",
        error: "User Already Exists... try different mail Id",
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const user = await User.create({
      name,
      email,
      phone,
      password,
      isVerified: false,
      otp: {
        code: otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
      },
    });
    const mailContent = setMailContent(name, otp, "verification");

    await sendMail(email, "Billing - Verify your account", mailContent);
    return res.status(201).json({
      message: "Otp sent to your email",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        error: "Both Fields Required",
      });
    }
    const user = await User.findOne({ email });
    if (!user || !user.otp?.code) {
      return res.status(400).json({
        error: "Invalid Request",
      });
    }
    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({
        error: "Otp Expired... Please Regenerate Otp",
      });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({
        error: "Invalid Otp",
      });
    }

    // ✅ Generate tokens on OTP verification
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.isVerified = true;
    user.otp = undefined;
    user.refreshToken = refreshToken;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();

    await user.save();

    // ✅ Set refresh token in httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const safeUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );

    return res.status(200).json({
      message: "Account Verified Successfully",
      accessToken,
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Both fields required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        error: "Invalid Credentials",
      });
    }

    // check password first
    if (!(await user.matchPassword(password))) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000;
      }

      await user.save();

      return res.status(400).json({
        error: "Invalid Credentials",
      });
    }

    // account not verified
    if (!user.isVerified) {
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      user.otp = {
        code: otp,
        expiresAt: Date.now() + 10 * 60 * 1000,
      };

      await user.save();

      const mailContent = setMailContent(user.name, otp, "otp");
      await sendMail(user.email, "Verify Your Account", mailContent);

      return res.status(200).json({
        requiresVerification: true,
        email: user.email,
        message: "OTP sent to email",
      });
    }

    if (user.isLocked()) {
      return res.status(403).json({
        error: "Account Locked, Try later",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();

    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const safeUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );

    return res.status(200).json({
      message: "Login Successful",
      accessToken,
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    // ✅ Check if refresh token exists
    if (!token) {
      return res.status(401).json({
        error: "No refresh token provided",
        code: "NO_REFRESH_TOKEN",
      });
    }

    // ✅ Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (verifyError) {
      if (verifyError.name === "TokenExpiredError") {
        return res.status(401).json({
          error: "Refresh token expired",
          code: "REFRESH_TOKEN_EXPIRED",
        });
      }
      return res.status(401).json({
        error: "Invalid refresh token",
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    // ✅ Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(403).json({
        error: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // ✅ Verify the token in DB matches (token rotation security)
    if (user.refreshToken !== token) {
      return res.status(403).json({
        error: "Invalid refresh token - token mismatch",
        code: "TOKEN_MISMATCH",
      });
    }

    // ✅ Generate new tokens (token rotation)
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // ✅ Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    // ✅ Set new refresh token in httpOnly cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      accessToken: newAccessToken,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    console.error("🔴 Refresh Token Error:", error.message);
    return res.status(500).json({
      error: "Token refresh failed",
      code: "REFRESH_ERROR",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      const user = await User.findOne({ refreshToken: token });
      if (user) {
        user.refreshToken = null;

        await user.save();
      }
    }

    res.clearCookie("refreshToken");

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const googleCallback = async (req, res) => {
  try {
    const user = req.user;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.redirect(
      `${process.env.CLIENT_URL}/auth/success?token=${accessToken}`,
    );
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // 🔥 generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 🔥 hash token before storing
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;

    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    // 🔥 frontend reset link
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const message = `
      <h2>Password Reset</h2>
      <p>Click below to reset password:</p>
      <a href="${resetURL}">
        Reset Password
      </a>
    `;

    await sendMail(email, "Billing- IT Reset Password", message);

    return res.status(200).json({
      message: "Password reset link sent",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({
        error: "All fields required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords do not match",
      });
    }

    // 🔥 hash incoming token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired token",
      });
    }

    // 🔥 update password
    user.password = password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        error: "User already verified",
      });
    }

    // 🔥 new OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    };

    await user.save();

    const mailContent = setMailContent(user.name, otp, "resend");

    await sendMail(email, "Resend OTP Verification", mailContent);

    return res.status(200).json({
      message: "OTP resent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};
