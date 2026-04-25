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
        error: "Not authorized",
      });
    }

    // 🔥 verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // 🔥 attach user
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid token",
    });
  }
};
