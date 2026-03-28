const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const orderRoutes = require("./routes/order");
const cartRoutes = require("./routes/cartRoutes");
const addressRoutes = require("./routes/addressRoutes");

const customerAuth = require("./routes/customerAuth");
const wishlistRoutes = require("./routes/wishlistRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const Category = require("./models/category");
const Vendor = require("./models/vendor");
const Product = require("./models/product");
const { connectDB } = require("./db/db");
// const cachedDb=require("./db/db")
const app = express();
const port = process.env.PORT || 5000;
const { seedCategories, seedVendorAndProducts } = require("./seed");
const swaggerUi = require("swagger-ui-express");
const path = require("path");
require("dotenv").config();

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// Serve static files (if needed)
app.use("/uploads", express.static("uploads"));

// Database connection with caching for serverless

// async function connectToDatabase() {
//   if (cachedDb) {
//     console.log("Using cached database connection");
//     return cachedDb;
//   }

//   try {
//     cachedDb = db;
//     console.log(`MongoDB Connected: ${db.connection.host}`);

//     // Seed categories after successful connection
//     await seedCategories();

//     return db;
//   } catch (error) {
//     console.error("MongoDB connection error:", error);
//     throw error;
//   }
// }

// Database connection middleware
connectDB().catch((err) => {
  console.error("Initial DB connection failed:", err);
});

// Routes
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

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Vendor API Server",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    endpoints: {
      vendors: "/api/vendors",
      products: "/api/products",
      categories: "/api/categories",
      orders: "/api/orders",
      cart: "/api/cart",
      addresses: "/api/addresses",
      auth: "/api/auth",
      wishlist: "/api/wishlist",
      payment: "/api/payment",
      webhook: "/api/webhook",
      health: "/health",
    },
  });
});

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    await seedVendorAndProducts();
    await seedCategories();
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


// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Use a try-catch because the file might not exist yet during local coding
try {
  const swaggerFile = require("./swagger-output.json");
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
} catch (err) {
  console.log("Swagger file not yet generated.");
}

// ... rest of your routes and app.listen
// console.log("KEY:", process.env.RAZORPAY_KEY);
// For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📚 API Documentation available at http://localhost:${port}`);
  });
}
// Export for Vercel
module.exports = app;
