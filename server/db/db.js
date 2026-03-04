// db/db.js
const mongoose = require("mongoose");

let cachedDb = null;

const connectDB = async () => {

  if (cachedDb) {
    console.log("Using cached database connection");
    return cachedDb;
  }
if (!process.env.MONGO_URI) {
    console.error("❌ MONGODB_URI is not defined in environment variables");
    throw new Error("MONGODB_URI is not defined");
  }
  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
      socketTimeoutMS: 45000, // Close sockets after 45s
    });
    cachedDb = db;
    console.log(`MongoDB Connected: ${db.connection.host}`);
    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
module.exports=cachedDb;