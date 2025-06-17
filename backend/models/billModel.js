import mongoose from "mongoose";

const billEntry = mongoose.Schema({
  colour: String,
  description: { type: String, required: true },
  size: {
    type: String,
    required: true,
    enum: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
  },
  perPieceRate: { type: Number, default: 0 },
  totalSizeRate: { type: Number, default: 0 },
  quantity: { type: Number, required: true },
});

const billSchema = mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  entries: [billEntry],
  totalBillAmount: {
    type: Number,
    default: 0,
  },
  totalQuantity: {
    type: Number,
    default: 0,
  },
});

const billingSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: "User",
  },
  bills: [billSchema],
});

billingSchema.methods.doSizePrice = async function () {
  this.bills.forEach((bill) => {
    bill.entries.forEach((entry) => {
      entry.totalSizeRate = entry.perPieceRate * entry.quantity;
    });

    bill.totalBillAmount = bill.entries.reduce(
      (sum, entry) => sum + entry.totalSizeRate,
      0
    );
    bill.totalQuantity = bill.entries.reduce(
      (sum, entry) => sum + entry.quantity,
      0
    );
  });

  await this.save();
};

const Bill = mongoose.model("Bill", billingSchema);
export default Bill;
