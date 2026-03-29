const Wishlist = require("../models/Wishlist");
const Product = require("../models/product");

const addToWishlist = async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return res.status(404).json({ msg: "Product not found" });

  let wishlist = await Wishlist.findOne({ customer: req.user.id });
  if (!wishlist) {
    wishlist = new Wishlist({ customer: req.user.id, products: [] });
  }

  if (!wishlist.products.includes(req.params.productId)) {
    wishlist.products.push(req.params.productId);
  }

  await wishlist.save();
  res.json({ msg: "Added to wishlist", wishlist });
};

const getWishlist = async (req, res) => {
  const wishlist = await Wishlist.findOne({ customer: req.user.id }).populate("products");
  res.json(wishlist || { products: [] });
};

const removeFromWishlist = async (req, res) => {
  const wishlist = await Wishlist.findOne({ customer: req.user.id });
  if (!wishlist) return res.status(404).json({ msg: "Wishlist empty" });

  wishlist.products = wishlist.products.filter(
    (p) => p.toString() !== req.params.productId
  );

  await wishlist.save();
  res.json({ msg: "Removed from wishlist" });
};

module.exports = { addToWishlist, getWishlist, removeFromWishlist };
