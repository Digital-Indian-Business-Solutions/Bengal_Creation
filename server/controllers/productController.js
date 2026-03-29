const Product = require("../models/product");
const Vendor = require("../models/vendor");

const createProduct = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    if (!req.body) {
      return res.status(400).json({ msg: "Request body missing" });
    }

    const price = parseFloat(req.body.price);
    const stock = parseInt(req.body.stock);
    const originalPrice = req.body.originalPrice ? parseFloat(req.body.originalPrice) : null;

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
    await Vendor.findByIdAndUpdate(req.body.vendor, { $push: { products: product._id } });

    res.status(201).json({ success: true, message: "Product created successfully", product });
  } catch (err) {
    console.error("Product creation error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const getAllProducts = async (req, res) => {
  const products = await Product.find()
    .populate("vendor", "shopName")
    .populate("category", "name");
  res.json(products);
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
  await Product.findByIdAndDelete(req.params.id);
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

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  bulkUpdateStock,
  getProductsByVendor,
};
