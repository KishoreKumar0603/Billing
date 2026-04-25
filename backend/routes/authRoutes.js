import express from "express";
import {
  forgotPassword,
  login,
  registerUser,
  resendOtp,
  resetPassword,
  verifyOtp,
} from "../controller/authController.js";
import passport from "../config/passport.js";
import { googleCallback } from "../controller/authController.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const route = express.Router();

route.post("/login", authLimiter, login);
route.post("/register", registerUser);
route.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.post("/resend-otp", resendOtp);

route.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
route.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback,
);

export default route;
