import express from "express";

import {
  createBill,
  getBills,
  getSingleBill,
  updateBill,
  deleteBill,
  addPayment,
  getPayments,
  updatePayment,
  removePayment,
} from "../controller/billController.js";

import { protect } from "../middleware/authMiddleware.js";
import { generateBillPDF } from "../controller/pdfController.js";

const router = express.Router();

// CREATE
router.post("/", protect, createBill);

// GET ALL
router.get("/", protect, getBills);

// GET SINGLE
router.get("/:id", protect, getSingleBill);

// UPDATE
router.put("/:id", protect, updateBill);

// DELETE
router.delete("/:id", protect, deleteBill);

//Generate Pdf
router.get("/:id/pdf", protect, generateBillPDF);

// ======================================================
// PAYMENT MANAGEMENT (Production-level)
// ======================================================

// Add payment
router.post("/:id/payments", protect, addPayment);

// Get all payments for a bill
router.get("/:id/payments", protect, getPayments);

// Update payment
router.put("/:id/payments/:paymentId", protect, updatePayment);

// Remove payment
router.delete("/:id/payments/:paymentId", protect, removePayment);

export default router;
