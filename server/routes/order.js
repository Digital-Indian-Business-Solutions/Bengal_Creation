const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const Cart = require("../models/Cart");
const Product = require("../models/product");
const Address = require("../models/address");
// const auth = require("../middleware/customerAuth");


// CREATE ORDER


router.post("/", async (req, res) => {
  const { addressId,user_id } = req.body;

  const cart = await Cart.findOne({ customer: user_id });
  if (!cart) return res.status(400).json({ msg: "Cart empty" });

  const address = await Address.findOne({
    _id: addressId,
    customer: user_id,
  });

  if (!address) return res.status(404).json({ msg: "Address not found" });

  // INVENTORY CHECK
  for (let item of cart.items) {
    const product = await Product.findById(item.product);

    if (product.stock < item.quantity)
      return res.status(400).json({
        msg: product.name + " out of stock",
      });

    product.stock -= item.quantity;
    await product.save();
  }
  const tax = Math.round(cart.totalAmount * 0.05);
  const totalAmount = cart.totalAmount + tax;
  const order = new Order({
    customer: req.user.id,
    items: cart.items,
    address,
    totalAmount:  totalAmount,
  });

  await order.save();
  await Cart.findOneAndDelete({ customer: req.user.id });

  res.json( order );
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
    .populate("user", "name email")
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
