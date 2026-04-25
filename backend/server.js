import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js";
import billRoutes from "./routes/billRoutes.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
dotenv.config();

const alllowedOrigin = ["http://localhost:5173"];

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: alllowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/bill", billRoutes);
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
