import mongoose from "mongoose";

// ================= ROW SCHEMA =================

const rowSchema = new mongoose.Schema(
  {
    label: {
      type: String,

      required: true,

      trim: true,

      uppercase: true,
    },

    quantity: {
      type: Number,

      required: true,

      min: 1,
    },

    rate: {
      type: Number,

      required: true,

      min: 0,
    },

    amount: {
      type: Number,

      required: true,

      min: 0,
    },
  },
  {
    _id: false,
  },
);

// ================= BILL SCHEMA =================

const billSchema = new mongoose.Schema(
  {
    // 🔐 owner
    user: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,

      index: true,
    },

    // 📦 LOT
    lotNumber: {
      type: String,

      required: true,

      trim: true,

      uppercase: true,

      index: true,
    },

    // 🚚 VEHICLE
    vehicleNumber: {
      type: String,

      trim: true,

      uppercase: true,

      index: true,
    },

    // FROM
    fromName: {
      type: String,

      required: true,

      trim: true,
    },
    address : {
      type: String,

      required: true,
      
    }
    ,

    // 👤 customer
    customer: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Customer",

      required: true,

      index: true,
    },

    deliveryDate: {
      type: Date,

      default: Date.now,

      index: true,
    },

    // 🔥 DYNAMIC ROWS
    rows: {
      type: [rowSchema],

      validate: {
        validator: (rows) => rows.length > 0,

        message: "At least one row required",
      },
    },

    // 📦 TOTAL PIECES
    totalQuantity: {
      type: Number,

      required: true,
    },

    // 💰 TOTAL
    totalAmount: {
      type: Number,

      required: true,

      min: 0,

      index: true,
    },

    // 💵 RECEIVED
    receivedAmount: {
      type: Number,

      default: 0,

      min: 0,
    },

    // 💳 BALANCE
    balanceAmount: {
      type: Number,

      default: 0,

      min: 0,
    },

    // 📌 ORDER STATUS
    status: {
      type: String,

      enum: ["working", "completed"],

      default: "working",

      index: true,
    },
    billNumber: {
      type: String,
      index: true,
    },

    // 💰 PAYMENT STATUS
    paymentStatus: {
      type: String,

      enum: ["not_received", "partially", "received"],

      default: "not_received",

      index: true,
    },

    notes: {
      type: String,

      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

// ================= INDEXES =================

// latest bills
billSchema.index({
  user: 1,
  createdAt: -1,
});

// lot lookup
billSchema.index({
  user: 1,
  lotNumber: 1,
});

// payment filtering
billSchema.index({
  user: 1,
  paymentStatus: 1,
});

// work tracking
billSchema.index({
  user: 1,
  status: 1,
});

// search
billSchema.index({
  toName: "text",
  lotNumber: "text",
  vehicleNumber: "text",
});

const Bill = mongoose.model("Bill", billSchema);

export default Bill;
