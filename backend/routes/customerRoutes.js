import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import {
  createCustomer,
  getCustomers,
  getCustomerDetails,
} from "../controllers/customerController.js";

const router = express.Router();

// CREATE
router.post("/", protect, createCustomer);

// GET ALL
router.get("/", protect, getCustomers);

// GET SINGLE
router.get("/:id", protect, getCustomerDetails);

export default router;
