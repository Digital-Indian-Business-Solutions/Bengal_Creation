const crypto = require("crypto");
const Order = require("../models/order");

const razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];

  const expected = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (signature !== expected) return res.status(400).send("Invalid webhook");

  const event = req.body.event;

  if (event === "payment.captured") {
    const payment = req.body.payload.payment.entity;
    await Order.findOneAndUpdate(
      { razorpayOrderId: payment.order_id },
      { paymentStatus: "paid" }
    );
  }

  res.json({ status: "ok" });
};

module.exports = { razorpayWebhook };
