const express = require("express");
const router = express.Router();
const razorpay = require("../utils/razorpay");
const Order = require("../models/order");
const crypto = require("crypto");

// CREATE RAZORPAY ORDER

router.post("/create/:orderId", async (req, res) => {

  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ msg: "Order not found" });

  const razorOrder = await razorpay.orders.create({
    amount: order.totalAmount * 100,
    currency: "INR",
    receipt: "order_" + order._id
  });

  order.razorpayOrderId = razorOrder.id;
  await order.save();

  res.json({
    key: process.env.RAZORPAY_KEY,
    razorOrder
  });
});
router.post("/verify", async (req, res) => {

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId
  } = req.body;

  const generated = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated !== razorpay_signature)
    return res.status(400).json({ msg: "Payment failed" });

  await Order.findByIdAndUpdate(orderId, {
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
    paymentStatus: "paid"
  });

  res.json({ msg: "Payment successful" });
});
router.post("/failed", async (req, res) => {
  await Order.findByIdAndUpdate(req.body.orderId, {
    paymentStatus: "failed"
  });

  res.json({ msg: "Payment marked failed" });
});
module.exports = router;