require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { connectDB } = require("./config/db");
const buildApiDocsHtml = require("./utils/apiDocsHtml");

// Routes
const vendorRoutes = require("./routes/vendorRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const orderRoutes = require("./routes/order");
const cartRoutes = require("./routes/cartRoutes");
const addressRoutes = require("./routes/addressRoutes");
const customerAuth = require("./routes/customerAuth");
const wishlistRoutes = require("./routes/wishlistRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const couponRoutes = require("./routes/couponRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");

const app = express();
const port = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (
      allowedOrigins.length === 0 ||
      allowedOrigins.includes(origin) ||
      origin.includes("bengalcreations.in") ||
      origin.endsWith(".vercel.app") ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1")
    ) {
      return cb(null, true);
    }
    cb(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
}));

// ── Body parsers ──────────────────────────────────────────────────────────────
// Webhook raw body must come before express.json()
app.use("/api/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static files ──────────────────────────────────────────────────────────────
app.use("/uploads", express.static("uploads"));

// Image Upload Endpoint (Cloudinary)
const { upload, uploadToCloudinary } = require("./middleware/upload");
app.post("/api/upload", (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      console.error("Multer upload error:", err);
      return res.status(400).json({ success: false, error: err.message || "File upload failed" });
    }
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "No file provided" });
      }
      const result = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname,
        "bengal_creations"
      );
      res.json({
        success: true,
        url: result.url || result.secureUrl,
        secure_url: result.secureUrl || result.url,
      });
    } catch (uploadErr) {
      console.error("Cloudinary upload error:", uploadErr);
      res.status(500).json({ success: false, error: uploadErr.message || "Failed to upload image" });
    }
  });
});

// ── DB per request ─────────────────────────────────────────────────────────────
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use("/api/vendors", vendorRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/auth", customerAuth);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/chatbot", require("./routes/chatbotRoutes"));
app.use("/api/coupon", couponRoutes);
app.use("/api/super-admin", superAdminRoutes);



// Public platform settings (for frontend checkout to read charges)
app.get("/api/settings", async (req, res) => {
  try {
    const PlatformSettings = require("./models/PlatformSettings");
    let s = await PlatformSettings.findOne({ key: "global" });
    if (!s) s = await PlatformSettings.create({ key: "global" });
    res.json({ gstRate: s.gstRate, gstEnabled: s.gstEnabled, platformFeeRate: s.platformFeeRate, platformFeeEnabled: s.platformFeeEnabled, platformFeeLabel: s.platformFeeLabel, deliveryCharge: s.deliveryCharge, deliveryChargeEnabled: s.deliveryChargeEnabled, freeDeliveryAbove: s.freeDeliveryAbove });
  } catch (err) { res.status(500).json({ msg: err.message }); }
});

// ── Custom API Docs (no Swagger) ──────────────────────────────────────────────
app.get("/api-docs", (req, res) => {
  const html = buildApiDocsHtml(
    `${req.protocol}://${req.get("host")}`,
    process.env.NODE_ENV || "development"
  );
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

// ── Root index ─────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bengal Creations API Server",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    docs: `${req.protocol}://${req.get("host")}/api-docs`,
    health: `${req.protocol}://${req.get("host")}/health`,
    endpoints: {
      auth: "/api/auth",
      vendors: "/api/vendors",
      products: "/api/products",
      categories: "/api/categories",
      orders: "/api/orders",
      cart: "/api/cart",
      addresses: "/api/addresses",
      wishlist: "/api/wishlist",
      payment: "/api/payment",
      coupon: "/api/coupon",
      contact: "/api/contact",
      chatbot: "/api/chatbot",
      superAdmin: "/api/super-admin",
    },
  });
});

// ── Health check ───────────────────────────────────────────────────────────────
app.get("/health", async (req, res) => {
  try {
    await connectDB();
    res.status(200).json({
      success: true,
      status: "OK",
      database: "Connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: "ERROR",
      database: "Not connected",
      error: error.message,
    });
  }
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || origin.includes("bengalcreations.in") || origin.endsWith(".vercel.app") || origin.includes("localhost"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ── Local server ──────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📚 API Docs at http://localhost:${port}/api-docs`);
    console.log(`👑 Super Admin login: POST http://localhost:${port}/api/super-admin/auth/send-otp`);
  });
}

module.exports = app;
