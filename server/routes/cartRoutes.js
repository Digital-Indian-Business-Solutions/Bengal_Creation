const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/product");
const auth = require("../middleware/customerAuth");
const Vendor = require("../models/vendor");

// ADD TO CART
router.post("/add", async (req, res) => {
  try {
    const { productId, quantity, user } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    const userId = user.id;

    let cart = await Cart.findOne({ customer: userId });

    if (!cart) {
      cart = new Cart({
        customer: userId,
        items: [],
        totalAmount: 0,
      });
    }

    // 🔥 CHECK IF PRODUCT ALREADY EXISTS
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );

    if (existingItem) {
      // ✅ Increase quantity
      existingItem.quantity += quantity;

      // ✅ Update totalAmount
      cart.totalAmount += product.price * quantity;
    } else {
      // ✅ Add new item
      cart.items.push({
        product: productId,
        vendorId: product.vendor,
        quantity,
        price: product.price,
      });

      cart.totalAmount += product.price * quantity;
    }

    await cart.save();

    // Optional: populate product details
    await cart.populate("items.product");

    res.json({ msg: "Cart updated", cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});
// GET CART

router.get("/:id", async (req, res) => {
  const cart = await Cart.findOne({ customer: req.params.id }).populate(
    "items.product",
  );

  res.json(cart);
});

// CLEAR CART

router.delete("/clear", auth, async (req, res) => {
  await Cart.findOneAndDelete({ customer: req.body.user.id });
  res.json({ msg: "Cart cleared" });
});
router.patch("/remove/:productId", async (req, res) => {
  try {
    console.log(req.body);
    const { productId } = req.params;
    const userId = req.body.user.id;

    const cart = await Cart.findOne({ customer: userId });

    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    // 🔥 Find item to remove
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (itemIndex === -1) {
      return res.status(404).json({ msg: "Product not in cart" });
    }

    // 🔥 Remove item
    cart.items.splice(itemIndex, 1);

    // 🔥 Recalculate totalAmount
    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    await cart.save();

    res.json({ msg: "Item removed", cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});
// all user details with products
router.get("/", async (req, res) => {
  try {
    const carts = await Cart.find()
      .populate("customer")
      .populate({
        path: "items.product",
        populate: {
          path: "vendor",
          model: "Vendor"
        }
      });

    res.json(carts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
