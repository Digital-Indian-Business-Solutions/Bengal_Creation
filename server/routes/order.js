const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const Cart = require("../models/Cart");
const Product = require("../models/product");
const Address = require("../models/address");
const Customer = require("../models/Customer");
const { default: mongoose } = require("mongoose");
// const auth = require("../middleware/customerAuth");

// CREATE ORDER

router.post("/", async (req, res) => {
  console.log(req.body)
  const { addressId, user_id, PaymentMethod } = req.body;
  
   console.log("USER ID:", user_id);

  const cart = await Cart.findOne({ customer: new mongoose.Types.ObjectId( user_id) });
if (!cart) {
    console.log(cart)
    return res.status(400).json({ msg: "Cart empty" });
  }
  console.log("CART FOUND:", cart);
  const address = await Address.findOne({
    _id:new mongoose.Types.ObjectId( addressId),
    customer:new mongoose.Types.ObjectId( user_id),
  });

  if (!address) return res.status(404).json({ msg: "Address not found" });

  // INVENTORY CHECK
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (!product) return res.status(404).json({ msg: "Product not found" });
    if (product.stock < item.quantity){
      console.log(product);
      
      return res.status(400).json({
        msg: product.name + " out of stock",
      });

    }
    product.stock -= item.quantity;
    await product.save();
  }
  const tax = Math.round(cart.totalAmount * 0.05);
  const totalAmount = cart.totalAmount + tax;
  const orderItems = cart.items.map((item) => ({
    product: item.product,
    vendor: item.vendorId,
    quantity: item.quantity,
    price: item.price,
  }));
  const order = new Order({
    user: user_id,
    items: orderItems,
    address: addressId,
    totalAmount: totalAmount,
    paymentMethod: PaymentMethod,
  });

  await order.save();
  await Cart.findOneAndDelete({ customer: user_id });

  res.json(order);
});

// GET BY USER

router.get("/user/:userId", async (req, res) => {
  const orders = await Order.find({ user: req.params.userId })
    .populate("items.product", "name price")
    .populate("items.vendor", "shopName")
    .populate("address")
    .sort({ createdAt: -1 });

  res.json(orders);
});

// GET BY STATUS

router.get("/status/:status", async (req, res) => {
  const orders = await Order.find({ status: req.params.status })
    .populate("user", "name email")
    .populate("items.product", "name price")
    .populate("items.vendor", "shopName")
    .populate("address")
    .sort({ createdAt: -1 });

  res.json(orders);
});

// GET ALL

router.get("/", async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email phone")
    .populate("items.product", "name price")
    .populate("items.vendor", "shopName")
    .populate("address")
    .sort({ createdAt: -1 });

  res.json(orders);
});

// GET BY ID

router.get("/:id", async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user")
    .populate("items.product")
    .populate("items.vendor")
    .populate("address");
  if (!order) return res.status(404).json({ msg: "Order not found" });

  res.json(order);
});

// UPDATE STATUS

router.patch("/status/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true },
  );
  res.json(order);
});

// UPDATE Payment Status

router.patch("/payment-status/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { paymentStatus: req.body.paymentStatus },
    { new: true },
  );
  res.json(order);
});

//GEt orders by vendor

router.get("/vendor/:vendorId", async (req, res) => {
  try {
    const orders = await Order.find({ "items.vendor": req.params.vendorId })
      .populate("user", "name email")
      .populate("items.product", "name price");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE

router.delete("/:id", async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ msg: "Order deleted" });
});

module.exports = router;
