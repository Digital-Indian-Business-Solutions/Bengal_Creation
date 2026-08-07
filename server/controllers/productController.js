const Product = require("../models/product");
const Vendor = require("../models/vendor");
const Category = require("../models/category");
const mongoose = require("mongoose");
require("dotenv").config();
const createProduct = async (req, res) => {
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
      price,
      district: req.body.district,
      orginalPrice: originalPrice,
      stock,
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
    res.status(500).json({ success: false, error: err.message });
  }
};

// Search Suggation //

const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) return res.json([]);

    // Step 1: find matching category
    const categoryDocs = await Category.find({
      name: { $regex: q, $options: "i" },
    }).select("_id name");

    const categoryIds = categoryDocs.map((c) => c._id);

    // Step 2: find matching products
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { district: { $regex: q, $options: "i" } },
        { category: { $in: categoryIds } },
      ],
    })
      .limit(8)
      .select("name district");

    // Step 3: format suggestions (important)
    const suggestions = [
      ...products.map((p) => ({
        type: "product",
        text: p.name,
      })),
      ...categoryDocs.map((c) => ({
        type: "category",
        text: c.name,
      })),
    ];

    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// end search suggation //
const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category || "";
    const search = req.query.search || "";

    const conditions = [];

    // Step 1: Category filter
    if (category) {
      const cat = await Category.findOne({
        name: { $regex: `^${category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
      });
      if (cat) {
        conditions.push({ category: cat._id });
      } else if (mongoose.Types.ObjectId.isValid(category)) {
        conditions.push({ category });
      } else {
        // If category is specified but not found in DB, return empty result
        conditions.push({ _id: null });
      }
    }

    // Step 2: Search filter
    if (search) {
      const categoryDoc = await Category.findOne({
        name: { $regex: search, $options: "i" },
      });

      const searchConditions = [
        { name: { $regex: search, $options: "i" } },
        { district: { $regex: search, $options: "i" } },
      ];

      if (categoryDoc) {
        searchConditions.push({ category: categoryDoc._id });
      }

      conditions.push({ $or: searchConditions });
    }

    const query = conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : { $and: conditions }) : {};

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("vendor", "shopName")
      .populate("category", "name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (err) {
    console.error("Error in getAllProducts:", err);
    res.status(500).json({ error: err.message });
  }
};
const getProducs = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("vendor", "shopName")
      .populate("category", "name")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("vendor")
    .populate("category");
  if (!product) return res.status(404).json({ msg: "Product not found" });
  res.json(product);
};

const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: "after",
  });
  res.json(product);
};

const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (product && product.vendor) {
    await Vendor.findByIdAndUpdate(product.vendor, {
      $pull: { products: product._id },
    });
  }
  res.json({ msg: "Product deleted" });
};

const getLowStockProducts = async (req, res) => {
  const products = await Product.find({ stock: { $lte: 5 } });
  res.json(products);
};

const bulkUpdateStock = async (req, res) => {
  const { productIds, stock } = req.body;
  await Product.updateMany({ _id: { $in: productIds } }, { $set: { stock } });
  res.json({ message: "Stock updated successfully" });
};

const getProductsByVendor = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.params.vendorId })
      .populate("category", "name")
      .populate("vendor", "shopName");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getProductByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  bulkUpdateStock,
  getProductsByVendor,
  getProductByCategory,
  getProducs,
  getSearchSuggestions,
};
