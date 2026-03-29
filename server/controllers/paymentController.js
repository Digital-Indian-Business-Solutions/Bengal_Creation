const crypto = require("crypto");
const razorpay = require("../utils/razorpay");
const Order = require("../models/order");

const createPaymentOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ msg: "Order not found" });

    const razorOrder = await razorpay.orders.create({
      amount: order.totalAmount * 100,
      currency: "INR",
      receipt: "order_" + order._id,
    });

    order.razorpayOrderId = razorOrder.id;
    await order.save();

    res.json({ success: true, key: process.env.RAZORPAY_KEY, razorOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Payment order creation failed" });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ msg: "Payment verification failed" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paymentStatus: "paid",
        orderStatus: "confirmed",
      },
      { new: true }
    );

    res.json({ success: true, message: "Payment verified", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Payment verification error" });
  }
};

const markPaymentFailed = async (req, res) => {
  try {
    const { orderId } = req.body;
    await Order.findByIdAndUpdate(orderId, { paymentStatus: "failed" });
    res.json({ success: true, msg: "Payment marked as failed" });
  } catch (error) {
    res.status(500).json({ msg: "Failed to update order" });
  }
};

const refundPayment = async (req, res) => {
  try {
    const refund = await razorpay.payments.refund(req.params.paymentId, {
      amount: req.body.amount * 100,
    });
    res.json({ success: true, refund });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Refund failed" });
  }
};

const retryPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ msg: "Order not found" });

    const razorOrder = await razorpay.orders.create({
      amount: order.totalAmount * 100,
      currency: "INR",
      receipt: "retry_" + order._id,
    });

    order.razorpayOrderId = razorOrder.id;
    order.paymentStatus = "retry";
    await order.save();

    res.json({ success: true, key: process.env.RAZORPAY_KEY, razorOrder });
  } catch (error) {
    res.status(500).json({ msg: "Retry payment failed" });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  markPaymentFailed,
  refundPayment,
  retryPayment,
};
