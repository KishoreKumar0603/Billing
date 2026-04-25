import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import { getDashboardSummary, getRevenueAnalytics, getOrderAnalytics } from "../controller/dashboardController.js";

const router = express.Router();

// 📈 completed orders
router.get("/orders", protect, getOrderAnalytics);

// 💰 revenue analytics
router.get("/revenue", protect, getRevenueAnalytics);
router.get("/summary", protect, getDashboardSummary);

export default router;
