const Cart = require("../models/Cart");
const Product = require("../models/product");

const addToCart = async (req, res) => {
  try {
    const { productId, quantity, user } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ msg: "Product not found" });

    const userId = user.id;
    let cart = await Cart.findOne({ customer: userId });

    if (!cart) {
      cart = new Cart({ customer: userId, items: [], totalAmount: 0 });
    }

    const existingItem = cart.items.find((item) => item.product.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
      cart.totalAmount += product.price * quantity;
    } else {
      cart.items.push({ product: productId, vendorId: product.vendor, quantity, price: product.price });
      cart.totalAmount += product.price * quantity;
    }

    await cart.save();
    await cart.populate("items.product");

    res.json({ msg: "Cart updated", cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

const getCart = async (req, res) => {
  const cart = await Cart.findOne({ customer: req.params.id }).populate("items.product");
  res.json(cart);
};

const clearCart = async (req, res) => {
  await Cart.findOneAndDelete({ customer: req.body.user.id });
  res.json({ msg: "Cart cleared" });
};

const removeFromCart = async (req, res) => {
  try {
    console.log(req.body);
    const { productId } = req.params;
    const userId = req.body.user.id;

    const cart = await Cart.findOne({ customer: userId });
    if (!cart) return res.status(404).json({ msg: "Cart not found" });

    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (itemIndex === -1) return res.status(404).json({ msg: "Product not in cart" });

    cart.items.splice(itemIndex, 1);
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await cart.save();
    res.json({ msg: "Item removed", cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

const getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find()
      .populate("customer")
      .populate({ path: "items.product", populate: { path: "vendor", model: "Vendor" } });
    res.json(carts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addToCart, getCart, clearCart, removeFromCart, getAllCarts };
