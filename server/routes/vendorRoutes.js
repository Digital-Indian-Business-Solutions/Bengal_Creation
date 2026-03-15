// routes/vendorRoutes.js
const express = require("express");
const router = express.Router();
const Vendor = require("../models/vendor");
const Product = require("../models/product");
const { cloudinaryUploadArray } = require("../middleware/upload"); // Changed from cloudinaryUploadFields
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

// REGISTER VENDOR WITH DOCUMENTS
router.post("/register", async (req, res) => {
  try {
    // // Check mandatory docs
    // if (!req.cloudinaryFiles?.tradeLicense?.[0] ||
    //     !req.cloudinaryFiles?.aadhaarCard?.[0] ||
    //     !req.cloudinaryFiles?.panCard?.[0]) {
    //   return res.status(400).json({
    //     success: false,
    //     msg: "Trade Licence, Aadhaar, PAN are mandatory",
    //   });
    // }

    // Extract Cloudinary URLs
    // const getUrl = (field) => req.cloudinaryFiles?.[field]?.[0]?.url;

    // Hash password
    const hashed = await bcrypt.hash(req.body.password, 10);

    // Generate vendor ID
    const vendorId =
      "VEND-" +
      new Date().getFullYear() +
      uuidv4().substring(0, 6).toUpperCase();

    // Create vendor object
    console.log(req.body);
    const vendor = new Vendor({
      vendorId: vendorId,
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
      isVerified: false, // Default to unverified
    });

    console.log("Saving vendor...");
    await vendor.save();

    // Remove password from response
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
});
// UPDATE VENDOR
router.put("/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Hash password if provided
    if (req.body.password) {
      updateData.password = await bcrypt.hash(req.body.password, 10);
    }

    const vendor = await Vendor.findOneAndUpdate(
      { vendorId: req.params.id },
      updateData,
      { new: true, runValidators: true }, // Use 'new' instead of 'returnDocument'
    ).select("-password");

    if (!vendor) {
      return res.status(404).json({
        success: false,
        msg: "Vendor not found",
      });
    }

    res.json({
      success: true,
      msg: "Vendor updated successfully",
      vendor,
    });
  } catch (err) {
    console.error("Vendor update error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// VERIFY VENDOR (Admin only)
router.patch("/verify/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findOneAndUpdate(
      { vendorId: req.params.id },
      { isVerified: true },
      { new: true },
    ).select("-password");

    if (!vendor) {
      return res.status(404).json({
        success: false,
        msg: "Vendor not found",
      });
    }

    res.json({
      success: true,
      msg: "Vendor verified successfully",
      vendor,
    });
  } catch (err) {
    console.error("Vendor verification error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// GET ALL VENDORS
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, verified } = req.query;
    const query = {};

    if (verified !== undefined) {
      query.isVerified = verified === "true";
    }

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
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// GET VENDOR BY ID
router.get("/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ vendorId: req.params.id }).select(
      "-password",
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        msg: "Vendor not found",
      });
    }

    res.json({
      success: true,
      vendor,
    });
  } catch (err) {
    console.error("Fetch vendor error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// DELETE VENDOR
router.delete("/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findOneAndDelete({ vendorId: req.params.id });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        msg: "Vendor not found",
      });
    }

    // Optional: Delete vendor's products
    await Product.deleteMany({ vendor: vendor._id });

    res.json({
      success: true,
      msg: "Vendor and associated products deleted successfully",
    });
  } catch (err) {
    console.error("Vendor deletion error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// GET VENDOR PRODUCTS
router.get("/:vendorId/products", async (req, res) => {
  try {
    console.log(req.params.vendorId, "vendorId");

    const vendor = await Vendor.findOne({ vendorId: req.params.vendorId });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        msg: "Vendor not found",
      });
    }

    const products = await Product.find({ vendor: vendor._id })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    console.log(products, "products");

    res.json({
      success: true,
      vendor: {
        id: vendor.vendorId,
        name: vendor.shopName,
        logo: vendor.logo,
      },
      products,
    });
  } catch (err) {
    console.error("Fetch vendor products error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// VENDOR LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", { email });

    const vendor = await Vendor.findOne({ email });
    console.log("Vendor found:", vendor ? "Yes" : "No");

    if (!vendor) {
      return res.status(400).json({
        success: false,
        msg: "Invalid email or password",
      });
    }

    const match = await bcrypt.compare(password, vendor.password);
    console.log("Password match:", match);

    if (!match) {
      return res.status(400).json({
        success: false,
        msg: "Invalid email or password",
      });
    }

    // Check if admin verified vendor
    if (!vendor.isVerified) {
      return res.status(403).json({
        success: false,
        msg: "Vendor not verified by admin yet. Please wait for approval.",
      });
    }

    const token = jwt.sign(
      {
        id: vendor._id,
        vendorId: vendor.vendorId,
        email: vendor.email,
        role: "vendor",
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: process.env.JWT_EXPIRE || "7d" },
    );

    const safeVendor = vendor.toObject();
    delete safeVendor.password;

    res.json({
      success: true,
      msg: "Login successful",
      token,
      vendor: safeVendor,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// GET PENDING VENDORS (Admin only)
router.get("/pending/all", async (req, res) => {
  try {
    const vendors = await Vendor.find({ isVerified: false })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      vendors,
    });
  } catch (err) {
    console.error("Fetch pending vendors error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// SEARCH VENDORS

router.get("/search/query", async (req, res) => {
  try {
    const q = req.query.q;

    const vendors = await Vendor.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { shopName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    }).select("-password");

    res.json({
      success: true,
      vendors,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// VENDOR ANALYTICS

router.get("/analytics/summary", async (req, res) => {
  try {
    const totalVendors = await Vendor.countDocuments();
    const verified = await Vendor.countDocuments({ isVerified: true });
    const pending = await Vendor.countDocuments({ isVerified: false });
    const totalProducts = await Product.countDocuments();

    res.json({
      success: true,
      analytics: {
        totalVendors,
        verified,
        pending,
        totalProducts,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
