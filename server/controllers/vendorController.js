const Vendor = require("../models/vendor");
const Product = require("../models/product");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const registerVendor = async (req, res) => {
  try {
    const hashed = await bcrypt.hash(req.body.password, 10);
    const vendorId =
      "VEND-" + new Date().getFullYear() + uuidv4().substring(0, 6).toUpperCase();

    console.log(req.body);
    const vendor = new Vendor({
      vendorId,
      name: req.body.name,
      shopName: req.body.shopName,
      email: req.body.email,
      password: hashed,
      phone: req.body.phone,
      address: req.body.address,
      description: req.body.description,
      logo: req.body.logo,
      banner: req.body.banner,
      documents: {
        tradeLicense: req.body.tradeLicense,
        aadhaarCard: req.body.aadhaarCard,
        panCard: req.body.panCard,
        otherDoc: req.body.otherDoc,
      },
      isVerified: false,
    });

    console.log("Saving vendor...");
    await vendor.save();

    const safeVendor = vendor.toObject();
    delete safeVendor.password;

    res.status(201).json({
      success: true,
      msg: "Vendor Registered Successfully",
      vendor: safeVendor,
    });
  } catch (err) {
    console.error("Vendor registration error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
      msg: "Failed to register vendor",
    });
  }
};

const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", { email });

    const vendor = await Vendor.findOne({ email });
    console.log("Vendor found:", vendor ? "Yes" : "No");

    if (!vendor) {
      return res.status(400).json({ success: false, msg: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, vendor.password);
    console.log("Password match:", match);

    if (!match) {
      return res.status(400).json({ success: false, msg: "Invalid email or password" });
    }

    if (!vendor.isVerified) {
      return res.status(403).json({
        success: false,
        msg: "Vendor not verified by admin yet. Please wait for approval.",
      });
    }

    const token = jwt.sign(
      { id: vendor._id, vendorId: vendor.vendorId, email: vendor.email, role: "vendor" },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    const safeVendor = vendor.toObject();
    delete safeVendor.password;

    res.json({ success: true, msg: "Login successful", token, vendor: safeVendor });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const getAllVendors = async (req, res) => {
  try {
    const { page = 1, limit = 10, verified } = req.query;
    const query = {};
    if (verified !== undefined) query.isVerified = verified === "true";

    const vendors = await Vendor.find(query)
      .select("-password")
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Vendor.countDocuments(query);

    res.json({
      success: true,
      vendors,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Fetch vendors error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ vendorId: req.params.id }).select("-password");
    if (!vendor) {
      return res.status(404).json({ success: false, msg: "Vendor not found" });
    }
    res.json({ success: true, vendor });
  } catch (err) {
    console.error("Fetch vendor error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateVendor = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.body.password) {
      updateData.password = await bcrypt.hash(req.body.password, 10);
    }

    const vendor = await Vendor.findOneAndUpdate(
      { vendorId: req.params.id },
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!vendor) {
      return res.status(404).json({ success: false, msg: "Vendor not found" });
    }

    res.json({ success: true, msg: "Vendor updated successfully", vendor });
  } catch (err) {
    console.error("Vendor update error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const verifyVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findOneAndUpdate(
      { vendorId: req.params.id },
      { isVerified: true },
      { new: true }
    ).select("-password");

    if (!vendor) {
      return res.status(404).json({ success: false, msg: "Vendor not found" });
    }

    res.json({ success: true, msg: "Vendor verified successfully", vendor });
  } catch (err) {
    console.error("Vendor verification error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findOneAndDelete({ vendorId: req.params.id });
    if (!vendor) {
      return res.status(404).json({ success: false, msg: "Vendor not found" });
    }
    await Product.deleteMany({ vendor: vendor._id });
    res.json({ success: true, msg: "Vendor and associated products deleted successfully" });
  } catch (err) {
    console.error("Vendor deletion error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const getVendorProducts = async (req, res) => {
  try {
    console.log(req.params.vendorId, "vendorId");
    const vendor = await Vendor.findOne({ vendorId: req.params.vendorId });
    if (!vendor) {
      return res.status(404).json({ success: false, msg: "Vendor not found" });
    }

    const products = await Product.find({ vendor: vendor._id })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    console.log(products, "products");

    res.json({
      success: true,
      vendor: { id: vendor.vendorId, name: vendor.shopName, logo: vendor.logo },
      products,
    });
  } catch (err) {
    console.error("Fetch vendor products error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const getPendingVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ isVerified: false })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({ success: true, vendors });
  } catch (err) {
    console.error("Fetch pending vendors error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const searchVendors = async (req, res) => {
  try {
    const q = req.query.q;
    const vendors = await Vendor.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { shopName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    }).select("-password");
    res.json({ success: true, vendors });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getVendorAnalytics = async (req, res) => {
  try {
    const [totalVendors, verified, pending, totalProducts] = await Promise.all([
      Vendor.countDocuments(),
      Vendor.countDocuments({ isVerified: true }),
      Vendor.countDocuments({ isVerified: false }),
      Product.countDocuments(),
    ]);
    res.json({ success: true, analytics: { totalVendors, verified, pending, totalProducts } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  registerVendor,
  loginVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  verifyVendor,
  deleteVendor,
  getVendorProducts,
  getPendingVendors,
  searchVendors,
  getVendorAnalytics,
};
