import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // 🔥 Check Bearer token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        error: "Not authorized - No token provided",
        code: "NO_TOKEN",
      });
    }

    // 🔥 Verify token and handle different error scenarios
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (verifyError) {
      if (verifyError.name === "TokenExpiredError") {
        return res.status(401).json({
          error: "Access token expired",
          code: "TOKEN_EXPIRED",
        });
      }
      return res.status(401).json({
        error: "Invalid token",
        code: "INVALID_TOKEN",
      });
    }

    // 🔥 Attach user
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        error: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Authentication failed",
      code: "AUTH_ERROR",
    });
  }
};
