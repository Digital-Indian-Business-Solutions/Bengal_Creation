require("dotenv").config();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/mail-sender");
const SuperAdminOtp = require("../models/SuperAdmin");
const Vendor = require("../models/vendor");
const Customer = require("../models/Customer");
const Order = require("../models/order");
const Product = require("../models/product");
const Category = require("../models/category");
const Coupon = require("../models/coupon");

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getSuperAdmins = () => {
  const admins = [];
  
  if (process.env.SUPER_ADMIN_EMAILS) {
    process.env.SUPER_ADMIN_EMAILS.split(",").forEach((e) => {
      if (e.trim()) admins.push(e.toLowerCase().trim());
    });
  }

  for (let i = 1; i <= 10; i++) {
    const email = process.env[`SUPER_ADMIN_${i}_EMAIL`];
    if (email) admins.push(email.toLowerCase().trim());
  }

  if (process.env.SUPER_ADMIN_EMAIL) {
    const single = process.env.SUPER_ADMIN_EMAIL.toLowerCase().trim();
    if (!admins.includes(single)) admins.push(single);
  }

  // Always ensure default primary super admin is included
  if (!admins.includes("it.digitalindian@gmail.com")) {
    admins.push("it.digitalindian@gmail.com");
  }

  return admins;
};

const generateOtp = () =>
  crypto.randomInt(100000, 999999).toString();

// ─── Send OTP ─────────────────────────────────────────────────────────────────
const sendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email is required" });

    const cleanEmail = email.toLowerCase().trim();
    const allowedEmails = getSuperAdmins();
    if (!allowedEmails.includes(cleanEmail)) {
      return res.status(403).json({
        msg: `Unauthorized email. Authorized Super Admin emails: ${allowedEmails.join(", ")}`,
      });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Invalidate old OTPs
    await SuperAdminOtp.deleteMany({ email: cleanEmail });

    await SuperAdminOtp.create({
      email: cleanEmail,
      otp,
      expiresAt,
    });

    console.log(`\n==================================================`);
    console.log(`🔑 SUPER ADMIN LOGIN OTP for ${cleanEmail}: ${otp}`);
    console.log(`==================================================\n`);

    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#7a1c2e;margin-bottom:8px">Bengal Creations</h2>
        <p style="color:#64748b;margin-bottom:24px">Super Admin Login OTP</p>
        <div style="background:#fdf8f5;border:1px solid #f0d8d8;border-radius:8px;padding:24px;text-align:center">
          <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#7a1c2e">${otp}</span>
        </div>
        <p style="color:#94a3b8;font-size:13px;margin-top:16px">Expires in 10 minutes. Do not share this OTP with anyone.</p>
      </div>
    `;

    let emailSent = false;
    try {
      await sendEmail(cleanEmail, "Super Admin OTP — Bengal Creations", html);
      emailSent = true;
    } catch (mailErr) {
      console.error("⚠️ Email dispatch warning:", mailErr.message);
    }

    res.json({
      success: true,
      msg: emailSent
        ? "OTP sent to your email"
        : `OTP generated (${otp}). Check server terminal output or email logs.`,
    });
  } catch (err) {
    console.error("sendLoginOtp error:", err);
    res.status(500).json({ msg: "Failed to process OTP request" });
  }
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────
const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ msg: "Email and OTP required" });

    const record = await SuperAdminOtp.findOne({
      email: email.toLowerCase(),
      otp,
      used: false,
    });

    if (!record) return res.status(400).json({ msg: "Invalid OTP" });
    if (record.expiresAt < new Date())
      return res.status(400).json({ msg: "OTP expired" });

    record.used = true;
    await record.save();

    const token = jwt.sign(
      { email: email.toLowerCase(), role: "superadmin" },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ success: true, token, email: email.toLowerCase() });
  } catch (err) {
    console.error("verifyLoginOtp error:", err);
    res.status(500).json({ msg: "Verification failed" });
  }
};

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalVendors,
      pendingVendors,
      totalCustomers,
      totalOrders,
      totalProducts,
      recentOrders,
      revenue,
      refundRequests,
    ] = await Promise.all([
      Vendor.countDocuments(),
      Vendor.countDocuments({ isVerified: false }),
      Customer.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(5)
        .populate("user", "name email")
        .populate("items.vendor", "shopName"),
      Order.aggregate([
        { $match: { paymentStatus: "Paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments({ refundStatus: "Requested" }),
    ]);

    res.json({
      success: true,
      stats: {
        totalVendors,
        pendingVendors,
        totalCustomers,
        totalOrders,
        totalProducts,
        totalRevenue: revenue[0]?.total || 0,
        pendingRefunds: refundRequests,
      },
      recentOrders,
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    res.status(500).json({ msg: "Failed to fetch stats" });
  }
};

// ─── Vendors ──────────────────────────────────────────────────────────────────
const listVendors = async (req, res) => {
  try {
    const { page = 1, limit = 20, verified, search } = req.query;
    const filter = {};
    if (verified !== undefined) filter.isVerified = verified === "true";
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { shopName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const vendors = await Vendor.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Vendor.countDocuments(filter);
    res.json({ success: true, vendors, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const approveVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).select("-password");
    if (!vendor) return res.status(404).json({ msg: "Vendor not found" });

    // Notify vendor
    await sendEmail(
      vendor.email,
      "Your vendor account has been approved — Bengal Creations",
      `<p>Hi ${vendor.name},</p><p>Your vendor account for <b>${vendor.shopName}</b> has been approved. You can now log in and start selling!</p>`
    ).catch(() => {});

    res.json({ success: true, msg: "Vendor approved", vendor });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const rejectVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) return res.status(404).json({ msg: "Vendor not found" });
    res.json({ success: true, msg: "Vendor rejected and removed" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ─── Customers ────────────────────────────────────────────────────────────────
const listCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const customers = await Customer.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Customer.countDocuments(filter);
    res.json({ success: true, customers, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ─── Orders ───────────────────────────────────────────────────────────────────
const listAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    let orders = await Order.find(filter)
      .populate("user", "name email phone")
      .populate("items.product", "name price")
      .populate("items.vendor", "shopName")
      .populate("address")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    if (search) {
      orders = orders.filter(
        (o) =>
          o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
          o.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
          o._id.toString().includes(search)
      );
    }

    const total = await Order.countDocuments(filter);
    res.json({ success: true, orders, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const update = {};
    if (status) update.status = status;
    if (paymentStatus) update.paymentStatus = paymentStatus;
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ msg: "Order not found" });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Bulk charge / manual charge (mark multiple orders as paid)
const bulkUpdateOrders = async (req, res) => {
  try {
    const { orderIds, status, paymentStatus } = req.body;
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ msg: "orderIds array required" });
    }
    const update = {};
    if (status) update.status = status;
    if (paymentStatus) update.paymentStatus = paymentStatus;

    const result = await Order.updateMany(
      { _id: { $in: orderIds } },
      { $set: update }
    );
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Manual charge: mark COD orders as paid
const manualCharge = async (req, res) => {
  try {
    const { orderId, amount, method, note } = req.body;
    if (!orderId) return res.status(400).json({ msg: "orderId required" });

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: "Paid",
        status: "Processing",
        upiTransactionId: note || `MANUAL-${Date.now()}`,
        ...(amount && { totalAmount: amount }),
      },
      { new: true }
    );
    if (!order) return res.status(404).json({ msg: "Order not found" });
    res.json({ success: true, msg: "Payment recorded", order });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ─── Refunds ──────────────────────────────────────────────────────────────────
const listRefunds = async (req, res) => {
  try {
    const orders = await Order.find({
      refundStatus: { $in: ["Requested", "Approved", "Rejected", "Processed"] },
    })
      .populate("user", "name email phone")
      .populate("items.product", "name price")
      .sort({ refundRequestedAt: -1 });
    res.json({ success: true, refunds: orders });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const processRefundAdmin = async (req, res) => {
  try {
    const { orderId, action, refundAmount, note } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ msg: "Order not found" });

    if (action === "approve") {
      order.refundStatus = "Processed";
      order.refundAmount = refundAmount || order.totalAmount;
    } else if (action === "reject") {
      order.refundStatus = "Rejected";
    } else {
      return res.status(400).json({ msg: "action must be approve or reject" });
    }
    if (note) order.refundReason = order.refundReason + " | Admin: " + note;
    await order.save();
    res.json({ success: true, msg: `Refund ${action}d`, order });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ─── Coupons ──────────────────────────────────────────────────────────────────
const listCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ created_at: -1 });
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const createCoupon = async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      discount_type,
      discount_value,
      max_discount_amount,
      min_order_amount,
      usage_limit,
      usage_limit_per_customer,
      start_at,
      end_at,
      is_active,
      is_public,
      applicable_for,
    } = req.body;

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      title,
      description,
      discount_type,
      discount_value,
      max_discount_amount,
      min_order_amount,
      usage_limit,
      usage_limit_per_customer,
      start_at,
      end_at,
      is_active: is_active !== false,
      is_public: is_public !== false,
      applicable_for: applicable_for || "ALL",
    });

    res.status(201).json({ success: true, coupon });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ msg: "Coupon code already exists" });
    res.status(500).json({ msg: err.message });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!coupon) return res.status(404).json({ msg: "Coupon not found" });
    res.json({ success: true, coupon });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: "Coupon deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// ─── Revenue Report ───────────────────────────────────────────────────────────
const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = { paymentStatus: "Paid" };
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    const [orders, monthlyRevenue, topVendors] = await Promise.all([
      Order.find(match)
        .populate("user", "name email")
        .populate("items.vendor", "shopName")
        .sort({ createdAt: -1 })
        .limit(100),

      Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 12 },
      ]),

      Order.aggregate([
        { $match: match },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.vendor",
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
            orders: { $sum: 1 },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "vendors",
            localField: "_id",
            foreignField: "_id",
            as: "vendor",
          },
        },
        { $unwind: { path: "$vendor", preserveNullAndEmpty: true } },
        {
          $project: {
            revenue: 1,
            orders: 1,
            shopName: "$vendor.shopName",
            name: "$vendor.name",
          },
        },
      ]),
    ]);

    const totalRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
    const totalRefunds = await Order.aggregate([
      { $match: { refundStatus: "Processed" } },
      { $group: { _id: null, total: { $sum: "$refundAmount" } } },
    ]);

    res.json({
      success: true,
      totalRevenue,
      totalRefunds: totalRefunds[0]?.total || 0,
      netRevenue: totalRevenue - (totalRefunds[0]?.total || 0),
      monthlyRevenue,
      topVendors,
      recentOrders: orders.slice(0, 20),
    });
  } catch (err) {
    console.error("getRevenueReport error:", err);
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
  sendLoginOtp,
  verifyLoginOtp,
  getDashboardStats,
  listVendors,
  approveVendor,
  rejectVendor,
  listCustomers,
  deleteCustomer,
  listAllOrders,
  updateOrderStatus,
  bulkUpdateOrders,
  manualCharge,
  listRefunds,
  processRefundAdmin,
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getRevenueReport,
};

// ─── Platform Settings ────────────────────────────────────────────────────────
const PlatformSettings = require("../models/PlatformSettings");
const { bustSettingsCache } = require("./orderController");

const getPlatformSettings = async (req, res) => {
  try {
    let s = await PlatformSettings.findOne({ key: "global" });
    if (!s) s = await PlatformSettings.create({ key: "global" });
    res.json({ success: true, settings: s });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const updatePlatformSettings = async (req, res) => {
  try {
    const allowed = [
      "gstRate","gstEnabled",
      "platformFeeRate","platformFeeEnabled","platformFeeLabel",
      "deliveryCharge","deliveryChargeEnabled","freeDeliveryAbove",
      "maxCouponDiscountPct","adminNote",
    ];
    const update = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) update[k] = req.body[k]; });

    const s = await PlatformSettings.findOneAndUpdate(
      { key: "global" },
      { $set: update },
      { new: true, upsert: true }
    );
    bustSettingsCache(); // invalidate in-process cache immediately
    res.json({ success: true, settings: s });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// append to module.exports
const existing = module.exports;
existing.getPlatformSettings   = getPlatformSettings;
existing.updatePlatformSettings = updatePlatformSettings;
