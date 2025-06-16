import mongoose from "mongoose";

const billSchema = mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  entries: [
    {
      colour: String,
      description: { type: String, required: true },
      size: { type: String, required: true ,enum:['XS', 'S','M','L','XL','XXL','XXXL']},
      perPieceRate: {type: Number, default:0},
      totalSizeRate: {type: Number, default:0},
      quantity:{ type: Number, required: true},
    },
  ],
  totalBillAmount:{
    type: Number,
    default:0
  },
  totalQuantity: {
    type: Number,
    default:0
  },
});

billSchema.methods.doSizePrice = async function(){
    this.entries.forEach(entry =>{
        entry.totalSizeRate = entry.perPieceRate * entry.quantity;
    });

    this.totalBillAmount = this.entries.reduce((sum,entry) => sum + entry.totalSizeRate, 0);
    this.totalQuantity = this.entries.reduce((sum,entry) => sum + entry.quantity, 0);

    await this.save();
};

const Bill = mongoose.model("Bill",billSchema);
export default Bill;