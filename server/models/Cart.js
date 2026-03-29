const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer"
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    },
    vendorId: String,
    quantity: Number,
    price: Number
  }],
  followUp: {
        type: String,
        enum: ["NOT CALLED", "INITIATED", "CALLED","NOT INTERESTED","FOLLOW UP LATER"],
        default: "NOT CALLED"
    },
  totalAmount: Number
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);