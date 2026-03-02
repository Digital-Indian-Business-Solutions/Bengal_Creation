const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/product");
const auth = require("../middleware/customerAuth");


// ADD TO CART


router.post("/add",  async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ msg: "Product not found" });

  let cart = await Cart.findOne({ customer: req.user.id });

  if (!cart) {
    cart = new Cart({ customer: req.user.id, items: [], totalAmount: 0 });
  }

  cart.items.push({
    product: productId,
    vendorId: product.vendor,
    quantity,
    price: product.price
  });

  cart.totalAmount += product.price * quantity;
  await cart.save();

  res.json({ msg: "Added to cart", cart });
});



// GET CART


router.get("/",  async (req, res) => {
  const cart = await Cart.findOne({ customer: req.user.id })
    .populate("items.product");

  res.json(cart);
});



// CLEAR CART


router.delete("/clear", auth, async (req, res) => {
  await Cart.findOneAndDelete({ customer: req.user.id });
  res.json({ msg: "Cart cleared" });
});

module.exports = router;