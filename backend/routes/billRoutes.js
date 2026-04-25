import express from "express";

import {
  createBill,
  getBills,
  getSingleBill,
  updateBill,
  deleteBill,
} from "../controllers/billController.js";

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

export default router;
