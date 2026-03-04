// routes/vendorRoutes.js
const express = require("express");
const router = express.Router();
const Vendor = require("../models/vendor");
const Product = require("../models/product");
const { cloudinaryUploadFields } = require("../middleware/upload");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const uploadImage = require("../middleware/cloudinary");
const jwt = require("jsonwebtoken");

// REGISTER VENDOR WITH DOCUMENTS
router.post(
  "/register",
  cloudinaryUploadFields([
    { name: "tradeLicense", maxCount: 1 },
    { name: "aadhaarCard", maxCount: 1 },
    { name: "panCard", maxCount: 1 },
    { name: "otherDoc", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log("Files received:", req.files ? Object.keys(req.files) : "No files");
      console.log("Cloudinary files:", req.cloudinaryFiles);

      // Check mandatory docs
      if (!req.cloudinaryFiles?.tradeLicense?.[0] || 
          !req.cloudinaryFiles?.aadhaarCard?.[0] || 
          !req.cloudinaryFiles?.panCard?.[0]) {
        return res.status(400).json({
          msg: "Trade Licence, Aadhaar, PAN are mandatory",
        });
      }

      // Extract Cloudinary URLs
      const getUrl = (field) => req.cloudinaryFiles?.[field]?.[0]?.url;

      // Hash password
      const hashed = await bcrypt.hash(req.body.password, 10);
      
      // Generate vendor ID
      const vendorId = "VEND-" + new Date().getFullYear() + 
                      uuidv4().substring(0, 6).toUpperCase();

      // Create vendor object
      const vendor = new Vendor({
        vendorId,
        name: req.body.name,
        shopName: req.body.shopName,
        email: req.body.email,
        password: hashed,
        phone: req.body.phone,
        address: req.body.address,
        description: req.body.description,
        logo: getUrl('logo'),
        banner: getUrl('banner'),
        documents: {
          tradeLicense: getUrl('tradeLicense'),
          aadhaarCard: getUrl('aadhaarCard'),
          panCard: getUrl('panCard'),
          otherDoc: getUrl('otherDoc'),
        },
      });

      console.log("Saving vendor...");
      await vendor.save();

      // Remove password from response
      const safeVendor = vendor.toObject();
      delete safeVendor.password;

      res.json({ 
        msg: "Vendor Registered Successfully", 
        vendor: safeVendor 
      });

    } catch (err) {
      console.error("Vendor registration error:", err);
      res.status(500).json({ 
        error: err.message,
        msg: "Failed to register vendor" 
      });
    }
  }
);

router.put("/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };
    // if(req.body.password){
    //     updateData.password = await bcrypt.hash(req.body.password,10);
    // }
    // console.log(req);
    console.log(
      updateData,
      "updateData",
      req.body,
      "req.body",
      req.params.id,
      "id",
    );
    const vendor = await Vendor.findOneAndUpdate(
      { vendorId: req.params.id },
      updateData,
      { returnDocument: "after" },
    ).select("-password");
    console.log(vendor, "updatedVendor");
    if (!vendor) return res.status(404).json({ msg: "Vendor not found" });
    res.json({ msg: "Vendor updated", vendor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
router.patch("/isVerified/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findOneAndUpdate(
      { vendorId: req.params.id },
      { isVerified: true },
      { returnDocument: "after" },
    );

    if (!vendor) return res.status(404).json({ msg: "Vendor not found" });

    res.json({
      msg: "Vendor verified successfully",
      vendor,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/", async (req, res) => {
  const vendors = await Vendor.find().select("-password");
  res.json(vendors);
}
);
router.get("/:id", async (req, res) => {
  const vendor = await Vendor.findOne({ vendorId: req.params.id }).select(
    "-password",
  );
    if (!vendor) return res.status(404).json({ msg: "Vendor not found" });
    res.json(vendor);
});
router.delete("/:id", async (req, res) => {
  await Vendor.findOneAndDelete({ vendorId: req.params.id });
  res.json({ msg: "Vendor deleted" });
});

router.get("/vendor/:vendorId", async (req, res) => {
    try {
      console.log(req.params.vendorId, "vendorId");
  const products = await Product.find({ vendor: req.params.vendorId });
      console.log(products, "products");
      res.json(products);
    } catch (err) {

        res.status(500).json({ error: err.message });
    }
});
/// Login 
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body)

    const vendor = await Vendor.findOne({ email });
    console.log(vendor)

    if (!vendor)
      return res.status(400).json({ msg: "Invalid email or password" });

    const match = await bcrypt.compare(password, vendor.password);

    if (!match)
      return res.status(400).json({ msg: "Invalid email or password" });

    // Check if admin verified vendor
    if (!vendor.isVerified)
      return res.status(403).json({
        msg: "Vendor not verified by admin yet"
      });

    const token = jwt.sign(
      {
        id: vendor._id,
        vendorId: vendor.vendorId,
        role: "vendor"
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    const safeVendor = vendor.toObject();
    delete safeVendor.password;

    res.json({
      msg: "Login successful",
      token,
      vendor: safeVendor
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
