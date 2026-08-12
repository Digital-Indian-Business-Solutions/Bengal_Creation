const mongoose = require("mongoose");
const Order = require("../models/order");
const Cart  = require("../models/Cart");
const Product = require("../models/product");
const Address = require("../models/address");
const PlatformSettings = require("../models/PlatformSettings");
require("dotenv").config();

// ── Helper: load platform settings (cached per process, refreshes every 5 min)
let _settingsCache = null;
let _settingsCacheAt = 0;
async function getSettings() {
  if (_settingsCache && Date.now() - _settingsCacheAt < 5 * 60 * 1000) return _settingsCache;
  let s = await PlatformSettings.findOne({ key: "global" });
  if (!s) s = await PlatformSettings.create({ key: "global" }); // seed defaults
  _settingsCache = s;
  _settingsCacheAt = Date.now();
  return s;
}
// expose so super-admin controller can bust the cache
const bustSettingsCache = () => { _settingsCache = null; };
module.exports.bustSettingsCache = bustSettingsCache;

// ── createOrder ────────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  const { addressId, user_id, PaymentMethod, couponCode, discountAmount: clientDiscount } = req.body;

  const cart = await Cart.findOne({ customer: new mongoose.Types.ObjectId(user_id) });
  if (!cart) return res.status(400).json({ msg: "Cart empty" });

  const address = await Address.findOne({
    _id:      new mongoose.Types.ObjectId(addressId),
    customer: new mongoose.Types.ObjectId(user_id),
  });
  if (!address) return res.status(404).json({ msg: "Address not found" });

  // Inventory check & deduct
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (!product) return res.status(404).json({ msg: "Product not found" });
    if (product.stock < item.quantity) return res.status(400).json({ msg: product.name + " out of stock" });
    product.stock -= item.quantity;
    await product.save();
  }

  const settings = await getSettings();

  const subtotal       = Number(cart.totalAmount) || 0;
  const discountAmount = Math.min(Number(clientDiscount) || 0, subtotal);

  // GST on (subtotal - discount)
  const taxBase       = subtotal - discountAmount;
  const gstAmount     = settings.gstEnabled
    ? Math.round(taxBase * Number(settings.gstRate || 0) / 100) : 0;

  // Platform fee (flat charge per order, e.g. ₹10 or ₹20)
  const platformFeeAmount = settings.platformFeeEnabled
    ? Number(settings.platformFeeRate || 0) : 0;

  // Delivery charge
  let deliveryCharge = 0;
  if (settings.deliveryChargeEnabled && Number(settings.deliveryCharge) > 0) {
    const freeThreshold = Number(settings.freeDeliveryAbove) || 0;
    deliveryCharge = (freeThreshold > 0 && subtotal >= freeThreshold) ? 0 : Number(settings.deliveryCharge);
  }

  const totalAmount = Number(taxBase) + Number(gstAmount) + Number(platformFeeAmount) + Number(deliveryCharge);

  const orderItems = cart.items.map((item) => ({
    product:  item.product,
    vendor:   item.vendorId,
    quantity: item.quantity,
    price:    item.price,
    variant:  item.variant || "",
  }));

  const order = new Order({
    user:     user_id,
    items:    orderItems,
    address:  addressId,
    subtotal,
    gstRate:          settings.gstEnabled ? Number(settings.gstRate || 0) : 0,
    gstAmount,
    platformFeeRate:  settings.platformFeeEnabled ? Number(settings.platformFeeRate || 0) : 0,
    platformFeeAmount,
    deliveryCharge,
    discountAmount,
    couponCode:       couponCode || "",
    totalAmount,
    paymentMethod:    PaymentMethod,
  });

  await order.save();
  await Cart.findOneAndDelete({ customer: user_id });

  res.json(order);
};

// ── getChargePreview (called before order creation to show breakdown) ──────────
const getChargePreview = async (req, res) => {
  try {
    const { subtotal = 0, discountAmount = 0 } = req.query;
    const settings = await getSettings();
    const sub  = Number(subtotal) || 0;
    const disc = Math.min(Number(discountAmount) || 0, sub);
    const taxBase = sub - disc;

    const gstAmount         = settings.gstEnabled ? Math.round(taxBase * Number(settings.gstRate || 0) / 100) : 0;
    const platformFeeAmount = settings.platformFeeEnabled ? Number(settings.platformFeeRate || 0) : 0;

    let deliveryCharge = 0;
    if (settings.deliveryChargeEnabled && Number(settings.deliveryCharge) > 0) {
      const freeThreshold = Number(settings.freeDeliveryAbove) || 0;
      deliveryCharge = (freeThreshold > 0 && sub >= freeThreshold) ? 0 : Number(settings.deliveryCharge);
    }

    const total = Number(taxBase) + Number(gstAmount) + Number(platformFeeAmount) + Number(deliveryCharge);

    res.json({
      subtotal:           sub,
      discountAmount:     disc,
      gstRate:            settings.gstEnabled ? Number(settings.gstRate || 0) : 0,
      gstAmount,
      platformFeeLabel:   settings.platformFeeLabel || "Platform Fee",
      platformFeeRate:    settings.platformFeeEnabled ? Number(settings.platformFeeRate || 0) : 0,
      platformFeeAmount,
      deliveryCharge,
      total,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const getOrdersByUser = async (req, res) => {
  const orders = await Order.find({ user: req.params.userId })
    .populate("items.product", "name price images orginalPrice variants")
    .populate("items.vendor", "shopName")
    .populate("address")
    .sort({ createdAt: -1 });
  res.json(orders);
};

const getOrdersByStatus = async (req, res) => {
  const orders = await Order.find({ status: req.params.status })
    .populate("user", "name email")
    .populate("items.product", "name price images orginalPrice variants")
    .populate("items.vendor", "shopName")
    .populate("address")
    .sort({ createdAt: -1 });
  res.json(orders);
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email phone")
    .populate("items.product", "name price images orginalPrice variants")
    .populate("items.vendor", "shopName")
    .populate("address")
    .sort({ createdAt: -1 });
  res.json(orders);
};

const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user")
    .populate("items.product")
    .populate("items.vendor")
    .populate("address");
  if (!order) return res.status(404).json({ msg: "Order not found" });
  res.json(order);
};

const updateOrderStatus = async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(order);
};

const updatePaymentStatus = async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { paymentStatus: req.body.paymentStatus }, { new: true });
  res.json(order);
};

const getOrdersByVendor = async (req, res) => {
  try {
    const orders = await Order.find({ "items.vendor": req.params.vendorId })
      .populate("user", "name email")
      .populate("items.product", "name price");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteOrder = async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ msg: "Order deleted" });
};

module.exports = {
  createOrder,
  getChargePreview,
  getOrdersByUser,
  getOrdersByStatus,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  getOrdersByVendor,
  deleteOrder,
};
