const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const Vendor = require("../models/vendor");
const { cloudinaryUpload, cloudinaryUploadFields } = require("../middleware/upload");
// CREATE PRODUCT
router.post("/", async (req, res) => {
  try {
    console.log("Request body:", req.body);

    if (!req.body) {
      return res.status(400).json({ msg: "Request body missing" });
    }

    const price = parseFloat(req.body.price);
    const stock = parseInt(req.body.stock);
    const originalPrice = req.body.originalPrice
      ? parseFloat(req.body.originalPrice)
      : null;

    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: price,
      district: req.body.district,
      originalPrice: originalPrice,
      stock: stock,
      category: req.body.category,
      vendor: req.body.vendor,
      images: req.body.images || [],
    });

    await product.save();

    await Vendor.findByIdAndUpdate(req.body.vendor, {
      $push: { products: product._id },
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    console.error("Product creation error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});
// GET ALL PRODUCTS

router.get("/", async (req, res) => {
  const products = await Product.find()
    .populate("vendor", "shopName")
    .populate("category", "name");

  res.json(products);
});

// GET PRODUCT BY ID

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("vendor")
    .populate("category");

  if (!product) return res.status(404).json({ msg: "Product not found" });

  res.json(product);
});

// UPDATE PRODUCT

router.put("/:id", async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: "after",
  });

  res.json(product);
});

// DELETE PRODUCT

router.delete("/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ msg: "Product deleted" });
});
module.exports = router;
