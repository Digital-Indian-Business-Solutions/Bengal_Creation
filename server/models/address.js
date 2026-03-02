const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer"
  },
  fullName: String,
  phone: String,
  pincode: String,
  state: String,
  city: String,
  area: String,
  houseNo: String,
  landmark: String
}, { timestamps: true });

module.exports = mongoose.model("Address", addressSchema);