const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  vendor:   { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
  price:    Number,
  variant:  { type: String, default: "" },  // selected size/variant saved with order
});

const orderSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  items:   [orderItemSchema],
  address: { type: mongoose.Schema.Types.ObjectId, ref: "Address", required: true },

  // ── Charge breakdown ──────────────────────────────────────────────────────
  subtotal:         { type: Number, default: 0 },   // cart total before any charges
  gstRate:          { type: Number, default: 0 },   // % applied at order time
  gstAmount:        { type: Number, default: 0 },
  platformFeeRate:  { type: Number, default: 0 },   // % applied at order time
  platformFeeAmount:{ type: Number, default: 0 },
  deliveryCharge:   { type: Number, default: 0 },
  discountAmount:   { type: Number, default: 0 },   // coupon discount
  couponCode:       { type: String, default: "" },
  totalAmount:      { type: Number, required: true },// final amount customer pays

  // ── Payment ───────────────────────────────────────────────────────────────
  paymentMethod:  { type: String, enum: ["COD","UPI","BANK_TRANSFER"], default: "COD" },
  paymentStatus:  { type: String, enum: ["Pending","Paid","Failed"], default: "Pending" },
  upiTransactionId: String,

  // ── Order state ───────────────────────────────────────────────────────────
  status: {
    type: String,
    enum: ["Pending","Processing","Shipped","Delivered","Cancelled"],
    default: "Pending",
  },
  followUp: {
    type: String,
    enum: ["NOT CALLED","INITIATED","CALLED","NOT INTERESTED","FOLLOW UP LATER"],
    default: "NOT CALLED",
  },

  // ── Refund ────────────────────────────────────────────────────────────────
  refundStatus:      { type: String, enum: ["None","Requested","Approved","Rejected","Processed"], default: "None" },
  refundReason:      { type: String, default: "" },
  refundAmount:      { type: Number, default: 0 },
  refundRequestedAt: Date,

  // legacy Razorpay fields kept for backward compat
  razorpayPaymentId: String,
  razorpayOrderId:   String,
  razorpaySignature: String,
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
