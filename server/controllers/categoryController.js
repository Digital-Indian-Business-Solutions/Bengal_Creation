const Category = require("../models/category");
const Product = require("../models/product");
const { uploadToCloudinary } = require("../middleware/upload");

const createCategory = async (req, res) => {
  try {
    console.log("Creating category:", req.body);
    console.log("Cloudinary file:", req.cloudinaryFile);

    const imageUrl = req.cloudinaryFile ? req.cloudinaryFile.url : null;

    const category = new Category({
      name: req.body.name,
      slug: req.body.name.toLowerCase().replace(/ /g, "-"),
      parent: req.body.parent || null,
      image: imageUrl,
    });

    await category.save();

    res.status(201).json({ success: true, message: "Category created successfully", category });
  } catch (err) {
    console.error("Category creation error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const getAllCategories = async (req, res) => {
  console.log(req);
  const categories = await Category.find().populate("parent", "name");
  res.json(categories);
};

const getCategoryById = async (req, res) => {
  const category = await Category.findById(req.params.id).populate("parent", "name");
  if (!category) return res.status(404).json({ msg: "Category not found" });
  res.json(category);
};

const updateCategory = async (req, res) => {
  try {
    let updateData = req.body;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, req.file.originalname, "categories");
      updateData.image = result.url;
    }
    const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ msg: "Category deleted" });
};

const getProductsByCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ msg: "Category not found" });

    const products = await Product.find({ category: req.params.categoryId })
      .populate("vendor", "shopName")
      .populate("category", "name");

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getProductsByCategory,
};
