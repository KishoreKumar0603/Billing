import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    // 🔐 owner
    user: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,

      index: true,
    },

    // 👤 customer name
    name: {
      type: String,

      required: true,

      trim: true,

      maxlength: 100,

      index: true,
    },

    // 📞 phone
    phone: {
      type: String,

      trim: true,
    },

    // 📍 address
    address: {
      type: String,

      trim: true,
    },

    // 📌 optional notes
    notes: {
      type: String,

      maxlength: 500,
    },

    // 📊 auto stats
    totalOrders: {
      type: Number,

      default: 0,
    },

    totalBusinessAmount: {
      type: Number,

      default: 0,
    },

    totalReceivedAmount: {
      type: Number,

      default: 0,
    },

    totalPendingAmount: {
      type: Number,

      default: 0,
    },
  },

  {
    timestamps: true,
  },
);

// ======================================================
// INDEXES
// ======================================================

// fast lookup
customerSchema.index({
  user: 1,
  name: 1,
});

// search support
customerSchema.index({
  name: "text",
  phone: "text",
});

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
