const mongoose = require("mongoose");

let cachedDb = null;

const connectDB = async () => {
  if (cachedDb) {
    console.log("Using cached database connection");
    return cachedDb;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  const db = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  cachedDb = db;
  console.log(`MongoDB Connected: ${db.connection.host}`);
  return db;
};

module.exports = { connectDB };
