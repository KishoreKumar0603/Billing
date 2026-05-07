import express from "express";
import {
  forgotPassword,
  login,
  logout,
  refreshToken,
  registerUser,
  resendOtp,
  resetPassword,
  verifyOtp,
} from "../controller/authController.js";
import passport from "../config/passport.js";
import { googleCallback } from "../controller/authController.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", authLimiter, login);
router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/logout", logout);

router.post("/refresh-token", refreshToken);

router.post("/reset-password/:token", resetPassword);

router.post("/resend-otp", resendOtp);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback,
);

export default router;
