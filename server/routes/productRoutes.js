const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const Vendor = require("../models/vendor");
const upload = require("../middleware/upload");
const uploadImage = require("../middleware/cloudinary");

// CREATE PRODUCT

router.post("/", uploadImage.array("images", 5), async (req, res) => {
  try {
    req.body.price = parseFloat(req.body.price);
    req.body.stock = parseInt(req.body.stock);
    if (req.files && req.files.length > 0) {
      console.log("Received files:", req.files);
    } else {
      console.log("No files received");
      return res.status(400).json({ msg: "At least one image is required" });
    }

    const imageUrls = [];

    if (req.files) {
      for (let file of req.files) {
        if (file.size === 0) continue;
        const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

        for (let file of req.files || []) {
          if (!allowedTypes.includes(file.mimetype)) {
            console.log("Invalid file type:", file.originalname);
            return res.status(400).json({ msg: "Only PNG, JPG, JPEG allowed" });
          }
        }
      }
      for (let file of req.files) {
        if (file.size === 0) continue; // Skip empty files
        const result = await uploadImage(file.path); // using disk storage
        imageUrls.push(result.secure_url);
      }
    }

    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      district: req.body.district,
      orginalPrice: req.body.orginalPrice,
      stock: req.body.stock,
      category: req.body.category,
      vendor: req.body.vendor,
      images: imageUrls,
    });

    await product.save();
    await Vendor.findByIdAndUpdate(req.body.vendor, {
      $push: { products: product._id },
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
