import mongoose from "mongoose";
import Bill from "../models/billModel.js";
import Customer from "../models/customerModel.js";

// ======================================================
// HELPERS
// ======================================================

const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const processRows = (rows) => {
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    throw new Error("At least one row is required");
  }

  let processedRows = [];

  let totalQuantity = 0;

  let totalAmount = 0;

  for (const row of rows) {
    const { label, quantity, rate } = row;

    if (!label || quantity == null || rate == null) {
      throw new Error("Invalid row data");
    }

    const parsedQuantity = Number(quantity);

    const parsedRate = Number(rate);

    if (parsedQuantity <= 0 || parsedRate < 0) {
      throw new Error("Invalid quantity or rate");
    }

    const amount = parsedQuantity * parsedRate;

    totalQuantity += parsedQuantity;

    totalAmount += amount;

    processedRows.push({
      label: label.trim().toUpperCase(),

      quantity: parsedQuantity,

      rate: parsedRate,

      amount,
    });
  }

  return {
    processedRows,

    totalQuantity,

    totalAmount,
  };
};

const calculatePaymentDetails = (totalAmount, receivedAmount = 0) => {
  const safeReceivedAmount = Number(receivedAmount) || 0;

  const balanceAmount = totalAmount - safeReceivedAmount;

  let paymentStatus = "not_received";

  if (safeReceivedAmount > 0 && safeReceivedAmount < totalAmount) {
    paymentStatus = "partially";
  }

  if (safeReceivedAmount >= totalAmount) {
    paymentStatus = "received";
  }

  return {
    receivedAmount: safeReceivedAmount,

    balanceAmount,

    paymentStatus,
  };
};

// ======================================================
// CREATE BILL
// ======================================================

export const createBill = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      customer,

      lotNumber,

      vehicleNumber,

      fromName,

      address,

      rows,

      notes,

      receivedAmount = 0,

      status = "working",
    } = req.body;

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!customer || !lotNumber || !fromName) {
      await session.abortTransaction();

      return res.status(400).json({
        error: "Customer, lot number and from name are required",
      });
    }

    // ==================================================
    // VERIFY CUSTOMER OWNERSHIP
    // ==================================================

    const existingCustomer = await Customer.findOne({
      _id: customer,

      user: req.user._id,
    }).session(session);

    if (!existingCustomer) {
      await session.abortTransaction();

      return res.status(404).json({
        error: "Customer not found",
      });
    }

    // ==================================================
    // PROCESS ROWS
    // ==================================================

    const {
      processedRows,

      totalQuantity,

      totalAmount,
    } = processRows(rows);

    // ==================================================
    // PAYMENT
    // ==================================================

    const paymentData = calculatePaymentDetails(
      totalAmount,

      receivedAmount,
    );

    // Prepare payments array (new system)
    const payments =
      receivedAmount > 0
        ? [
            {
              amount: receivedAmount,
              paymentDate: new Date(),
              paymentMethod: "cash",
              reference: "",
              notes: "Initial payment on bill creation",
            },
          ]
        : [];

    // ==================================================
    // CREATE BILL
    // ==================================================

    const bill = await Bill.create(
      [
        {
          user: req.user._id,

          customer,

          lotNumber: `LOT-${lotNumber.trim()}`,

          vehicleNumber: vehicleNumber?.trim()?.toUpperCase() || "",

          fromName: fromName.trim(),

          toName: existingCustomer.name,

          address: address,

          rows: processedRows,

          totalQuantity,

          totalAmount,

          receivedAmount: paymentData.receivedAmount,

          balanceAmount: paymentData.balanceAmount,

          paymentStatus: paymentData.paymentStatus,

          payments: payments,

          status,
          billNumber:
            lotNumber.trim() + new Date().getDate() + new Date().getMinutes(),

          notes: notes?.trim() || "",
        },
      ],

      {
        session,
      },
    );

    // ==================================================
    // UPDATE CUSTOMER STATS
    // ==================================================

    existingCustomer.totalOrders += 1;

    existingCustomer.totalBusinessAmount += totalAmount;

    existingCustomer.totalReceivedAmount += paymentData.receivedAmount;

    existingCustomer.totalPendingAmount += paymentData.balanceAmount;

    await existingCustomer.save({
      session,
    });

    // ==================================================
    // COMMIT
    // ==================================================

    await session.commitTransaction();

    session.endSession();

    return res.status(201).json({
      message: "Bill created successfully",

      bill: bill[0],
    });
  } catch (error) {
    await session.abortTransaction();

    session.endSession();

    return res.status(500).json({
      error: error.message,
    });
  }
};

// ======================================================
// GET BILLS
// ======================================================

export const getBills = async (req, res) => {
  try {
    // ==================================================
    // PAGINATION
    // ==================================================

    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    // ==================================================
    // FILTERS
    // ==================================================

    const {
      search,

      status,

      paymentStatus,

      customer,

      startDate,

      endDate,

      sortBy = "createdAt",

      order = "desc",
    } = req.query;

    // ==================================================
    // BASE QUERY
    // ==================================================

    let query = {
      user: req.user._id,
    };

    // ==================================================
    // SEARCH
    // ==================================================

    if (search?.trim()) {
      query.$text = {
        $search: search.trim(),
      };
    }

    // ==================================================
    // STATUS
    // ==================================================

    if (status) {
      query.status = status;
    }

    // ==================================================
    // PAYMENT STATUS
    // ==================================================

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // ==================================================
    // CUSTOMER
    // ==================================================

    if (customer) {
      query.customer = customer;
    }

    // ==================================================
    // DATE RANGE
    // ==================================================

    if (startDate || endDate) {
      query.createdAt = {};
    }

    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }

    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }

    // ==================================================
    // SORTING
    // ==================================================

    const sortOptions = {
      [sortBy]: order === "asc" ? 1 : -1,
    };

    // ==================================================
    // QUERY
    // ==================================================

    const bills = await Bill.find(query)
      .populate("customer", "name phone")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalBills = await Bill.countDocuments(query);

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      page,

      limit,

      totalBills,

      totalPages: Math.ceil(totalBills / limit),

      count: bills.length,

      bills,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// ======================================================
// GET SINGLE BILL
// ======================================================
export const getSingleBill = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        error: "Invalid bill ID",
      });
    }

    const bill = await Bill.findOne({
      _id: id,

      user: req.user._id,
    }).populate("customer", "name phone address");

    if (!bill) {
      return res.status(404).json({
        error: "Bill not found",
      });
    }

    return res.status(200).json(bill);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE BILL
// ======================================================

export const updateBill = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        error: "Invalid bill ID",
      });
    }

    const existingBill = await Bill.findOne({
      _id: id,

      user: req.user._id,
    });

    if (!existingBill) {
      return res.status(404).json({
        error: "Bill not found",
      });
    }

    const {
      lotNumber,
      vehicleNumber,
      fromName,
      toName,
      address,
      rows,
      notes,
      receivedAmount = 0,
      status,
    } = req.body;

    // ================= PROCESS ROWS =================

    const { processedRows, totalQuantity, totalAmount } = processRows(rows);

    // ================= PAYMENT =================

    const paymentData = calculatePaymentDetails(totalAmount, receivedAmount);

    // ================= UPDATE =================

    existingBill.lotNumber =
      `LOT-${lotNumber.trim()}` || existingBill.lotNumber;

    existingBill.vehicleNumber = vehicleNumber?.trim()?.toUpperCase() || "";

    existingBill.fromName = fromName?.trim() || existingBill.fromName;

    existingBill.toName = toName?.trim() || existingBill.toName;

    existingBill.address = address?.trim() || "";

    existingBill.rows = processedRows;

    existingBill.totalQuantity = totalQuantity;

    existingBill.totalAmount = totalAmount;

    existingBill.receivedAmount = paymentData.receivedAmount;

    existingBill.balanceAmount = paymentData.balanceAmount;

    existingBill.paymentStatus = paymentData.paymentStatus;

    if (status) {
      existingBill.status = status;
    }

    existingBill.notes = notes?.trim() || "";

    await existingBill.save();

    return res.status(200).json({
      message: "Bill updated successfully",

      bill: existingBill,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// ======================================================
// DELETE BILL
// ======================================================

export const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        error: "Invalid bill ID",
      });
    }

    const bill = await Bill.findOne({
      _id: id,

      user: req.user._id,
    });

    if (!bill) {
      return res.status(404).json({
        error: "Bill not found",
      });
    }

    await bill.deleteOne();

    return res.status(200).json({
      message: "Bill deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// ======================================================
// ADD PAYMENT (Production-level payment tracking)
// ======================================================

export const addPayment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        error: "Invalid bill ID",
      });
    }

    const {
      amount,
      paymentDate,
      paymentMethod = "cash",
      reference = "",
      notes = "",
    } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: "Payment amount must be greater than 0",
      });
    }

    const bill = await Bill.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!bill) {
      return res.status(404).json({
        error: "Bill not found",
      });
    }

    // Add payment
    const newPayment = {
      amount: Number(amount),
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMethod: paymentMethod || "cash",
      reference: reference?.trim() || "",
      notes: notes?.trim() || "",
    };

    bill.payments.push(newPayment);

    // Sync payment fields
    bill.syncPaymentFields();

    // Update customer stats if needed
    const customer = await Customer.findById(bill.customer);
    if (customer) {
      const oldReceived = bill.payments
        .slice(0, -1)
        .reduce((sum, p) => sum + p.amount, 0);
      const newReceived = oldReceived + amount;
      const difference = newReceived - oldReceived;

      customer.totalReceivedAmount += difference;
      customer.totalPendingAmount -= difference;
      await customer.save();
    }

    await bill.save();

    return res.status(201).json({
      message: "Payment added successfully",
      payment: newPayment,
      bill: bill,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// ======================================================
// GET PAYMENTS
// ======================================================

export const getPayments = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        error: "Invalid bill ID",
      });
    }

    const bill = await Bill.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!bill) {
      return res.status(404).json({
        error: "Bill not found",
      });
    }

    return res.status(200).json({
      billId: bill._id,
      billNumber: bill.billNumber,
      totalAmount: bill.totalAmount,
      totalReceived: bill.receivedAmount,
      balanceAmount: bill.balanceAmount,
      paymentStatus: bill.paymentStatus,
      payments: bill.payments.sort(
        (a, b) => new Date(b.paymentDate) - new Date(a.paymentDate),
      ),
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// ======================================================
// UPDATE PAYMENT
// ======================================================

export const updatePayment = async (req, res) => {
  try {
    const { id, paymentId } = req.params;
    const { amount, paymentDate, paymentMethod, reference, notes } = req.body;

    if (!validateObjectId(id) || !validateObjectId(paymentId)) {
      return res.status(400).json({
        error: "Invalid bill or payment ID",
      });
    }

    const bill = await Bill.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!bill) {
      return res.status(404).json({
        error: "Bill not found",
      });
    }

    const paymentIndex = bill.payments.findIndex(
      (p) => p._id.toString() === paymentId,
    );

    if (paymentIndex === -1) {
      return res.status(404).json({
        error: "Payment not found",
      });
    }

    // Get old amount for customer update
    const oldAmount = bill.payments[paymentIndex].amount;

    // Update payment fields
    if (amount && amount > 0) {
      bill.payments[paymentIndex].amount = Number(amount);
    }
    if (paymentDate) {
      bill.payments[paymentIndex].paymentDate = new Date(paymentDate);
    }
    if (paymentMethod) {
      bill.payments[paymentIndex].paymentMethod = paymentMethod;
    }
    if (reference !== undefined) {
      bill.payments[paymentIndex].reference = reference?.trim() || "";
    }
    if (notes !== undefined) {
      bill.payments[paymentIndex].notes = notes?.trim() || "";
    }

    const newAmount = bill.payments[paymentIndex].amount;
    const amountDifference = newAmount - oldAmount;

    // Sync payment fields
    bill.syncPaymentFields();

    // Update customer stats
    const customer = await Customer.findById(bill.customer);
    if (customer && amountDifference !== 0) {
      customer.totalReceivedAmount += amountDifference;
      customer.totalPendingAmount -= amountDifference;
      await customer.save();
    }

    await bill.save();

    return res.status(200).json({
      message: "Payment updated successfully",
      payment: bill.payments[paymentIndex],
      bill: bill,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// ======================================================
// REMOVE PAYMENT
// ======================================================

export const removePayment = async (req, res) => {
  try {
    const { id, paymentId } = req.params;

    if (!validateObjectId(id) || !validateObjectId(paymentId)) {
      return res.status(400).json({
        error: "Invalid bill or payment ID",
      });
    }

    const bill = await Bill.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!bill) {
      return res.status(404).json({
        error: "Bill not found",
      });
    }

    const paymentIndex = bill.payments.findIndex(
      (p) => p._id.toString() === paymentId,
    );

    if (paymentIndex === -1) {
      return res.status(404).json({
        error: "Payment not found",
      });
    }

    const removedPayment = bill.payments[paymentIndex];
    bill.payments.splice(paymentIndex, 1);

    // Sync payment fields
    bill.syncPaymentFields();

    // Update customer stats
    const customer = await Customer.findById(bill.customer);
    if (customer) {
      customer.totalReceivedAmount -= removedPayment.amount;
      customer.totalPendingAmount += removedPayment.amount;
      await customer.save();
    }

    await bill.save();

    return res.status(200).json({
      message: "Payment removed successfully",
      removedPayment: removedPayment,
      bill: bill,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};
