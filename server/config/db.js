const mongoose = require("mongoose");
const dns = require("dns");

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder("ipv4first");
}

let cachedDb = null;
require("dotenv").config();

const connectDB = async () => {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    cachedDb = db;
    console.log(`MongoDB Connected: ${db.connection.host}`);
    return db;
  } catch (err) {
    console.error("Primary MongoDB connection error:", err.message);
    if (err.code === "ECONNREFUSED" || (err.message && err.message.includes("querySrv"))) {
      try {
        console.log("Retrying MongoDB connection with Google/Cloudflare DNS...");
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
        const db = await mongoose.connect(process.env.MONGO_URI, {
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
        });
        cachedDb = db;
        console.log(`MongoDB Connected (via Fallback DNS): ${db.connection.host}`);
        return db;
      } catch (retryErr) {
        console.error("MongoDB Fallback DNS connection error:", retryErr.message);
        throw retryErr;
      }
    }
    throw err;
  }
};

module.exports = { connectDB };

