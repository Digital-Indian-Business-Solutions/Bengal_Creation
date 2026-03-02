const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const mongoose = require("mongoose");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const orderRoutes = require("./routes/order");
const cartRoutes = require("./routes/cartRoutes");
const addressRoutes = require("./routes/addressRoutes");
const Category = require("./models/category");
const customerAuth = require("./routes/customerAuth");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  }),
);
app.use("/uploads", express.static("uploads"));
// database connection
const connectDB = require("./db/db");
connectDB();
// routes
app.use("/api/vendors", vendorRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/auth", customerAuth);
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/webhook", require("./routes/webhookRoutes"));

// auto category creation

const seedCategories = async () => {
  const exists = await Category.findOne();

  if (!exists) {
    await Category.insertMany([
      {
        name: "Handloom Sarees",
        slug: "Handloom Sarees".toLowerCase().replace(/ /g, "-"),
        parent: null,
      },
      {
        name: "Terracotta Crafts",
        slug: "Terracotta Crafts".toLowerCase().replace(/ /g, "-"),
        parent: null,
      },
      {
        name: "Dokra Art",
        slug: "Dokra Art".toLowerCase().replace(/ /g, "-"),
        parent: null,
      },
      {
        name: "Wooden Handicrafts",
        slug: "Wooden Handicrafts".toLowerCase().replace(/ /g, "-"),
        parent: null,
      },
      {
        name: "Jute Products",
        slug: "Jute Products".toLowerCase().replace(/ /g, "-"),
        parent: null,
      },
      {
        name: "Bengal Sweets",
        slug: "Bengal Sweets".toLowerCase().replace(/ /g, "-"),
        parent: null,
      },
    ]);

    console.log("Categories added first time ✅");
  }
};
seedCategories();
// START SERVER
app.listen(port, () => {
  console.log(`${process.env.HOSTNAME}:${port}`);
});
