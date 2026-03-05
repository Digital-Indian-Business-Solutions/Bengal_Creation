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
const Category = require("./models/category");
const customerAuth = require("./routes/customerAuth");
const wishlistRoutes = require("./routes/wishlistRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const {connectDB}=require("./db/db")
// const cachedDb=require("./db/db")
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        origin.includes("vercel.app") ||
        origin.includes("localhost")
      ) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
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
connectDB().catch(err => {
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
      health: "/health"
    }
  });
});

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    await connectDB();
    await seedCategories()
    res.status(200).json({
      success: true,
      status: "OK",
      database: "Connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: "ERROR",
      database: "Not connected",
      error: error.message
    });
  }
});

// Auto category creation function
const seedCategories = async () => {
  try {
    const exists = await Category.findOne();

    if (!exists) {
      await Category.insertMany([
        {
          name: "Handloom Sarees",
          slug: "handloom-sarees",
          parent: null,
        },
        {
          name: "Terracotta Crafts",
          slug: "terracotta-crafts",
          parent: null,
        },
        {
          name: "Dokra Art",
          slug: "dokra-art",
          parent: null,
        },
        {
          name: "Wooden Handicrafts",
          slug: "wooden-handicrafts",
          parent: null,
        },
        {
          name: "Jute Products",
          slug: "jute-products",
          parent: null,
        },
        {
          name: "Bengal Sweets",
          slug: "bengal-sweets",
          parent: null,
        },
      ]);

      console.log("✅ Categories seeded successfully");
    }
  } catch (error) {
    console.error("Error seeding categories:", error);
  }
};

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📚 API Documentation available at http://localhost:${port}`);
  });
}
// Export for Vercel
module.exports = app;
