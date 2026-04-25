import Bill from "../models/billModel.js";
import Customer from "../models/customerModel.js";
import mongoose from "mongoose";

export const createCustomer = async (req, res) => {
  try {
    const { name, phone, address, notes } = req.body;

    if (!name) {
      return res.status(400).json({
        error: "Customer name is required",
      });
    }

    // duplicate prevention
    const existingCustomer = await Customer.findOne({
      user: req.user._id,

      name: name.trim(),
    });

    if (existingCustomer) {
      return res.status(400).json({
        error: "Customer already exists",
      });
    }

    const customer = await Customer.create({
      user: req.user._id,

      name: name.trim(),

      phone: phone?.trim() || "",

      address: address?.trim() || "",

      notes: notes?.trim() || "",
    });

    return res.status(201).json({
      message: "Customer created successfully",

      customer,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// ======================================================
// GET CUSTOMERS
// ======================================================

export const getCustomers = async (req, res) => {
  try {
    const search = req.query.search;

    let query = {
      user: req.user._id,
    };

    if (search?.trim()) {
      query.$text = {
        $search: search.trim(),
      };
    }

    const customers = await Customer.find(query)

      .sort({
        createdAt: -1,
      })

      .lean();

    return res.status(200).json({
      customers,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// ======================================================
// GET SINGLE CUSTOMER DETAILS
// ======================================================

export const getCustomerDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // ==================================================
    // VALIDATE ID
    // ==================================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid customer ID",
      });
    }

    // ==================================================
    // GET CUSTOMER
    // ==================================================

    const customer = await Customer.findOne({
      _id: id,

      user: req.user._id,
    }).lean();

    if (!customer) {
      return res.status(404).json({
        error: "Customer not found",
      });
    }

    // ==================================================
    // RECENT BILLS
    // ==================================================

    const recentBills = await Bill.find({
      customer: id,

      user: req.user._id,
    })

      .sort({
        createdAt: -1,
      })

      .limit(10)

      .select(
        `
            lotNumber
            totalAmount
            receivedAmount
            balanceAmount
            paymentStatus
            status
            createdAt
            `,
      )

      .lean();

    // ==================================================
    // PAYMENT SUMMARY
    // ==================================================

    const paymentSummary = await Bill.aggregate([
      {
        $match: {
          customer: new mongoose.Types.ObjectId(id),

          user: req.user._id,
        },
      },

      {
        $group: {
          _id: null,

          totalOrders: {
            $sum: 1,
          },

          totalBusinessAmount: {
            $sum: "$totalAmount",
          },

          totalReceivedAmount: {
            $sum: "$receivedAmount",
          },

          totalPendingAmount: {
            $sum: "$balanceAmount",
          },
        },
      },
    ]);

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      customer,

      analytics: paymentSummary[0] || {
        totalOrders: 0,

        totalBusinessAmount: 0,

        totalReceivedAmount: 0,

        totalPendingAmount: 0,
      },

      recentBills,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};
