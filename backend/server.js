import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js";
import billRoutes from "./routes/billRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { protect } from "./middleware/authMiddleware.js";
import passport from "./config/passport.js"
dotenv.config();


const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());
app.set("trust proxy", 1);
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/user", protect, userRoutes);
app.use("/api/bill", protect, billRoutes);
app.use("/api/customer", protect ,customerRoutes);
app.use("/api/dashboard", protect, dashboardRoutes);
mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING)
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`Server is Running on PORT : ${process.env.PORT | 5000}`),
    );
  })
  .catch((err) => {
    console.error("Error : ", err);
  });
