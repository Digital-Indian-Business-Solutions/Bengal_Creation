
const Razorpay = require("razorpay");
require("dotenv").config();
console.log("KEY:", process.env.RAZORPAY_KEY);
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
});

module.exports = razorpay;