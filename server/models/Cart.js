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
  totalAmount: Number
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);