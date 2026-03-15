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
const vendorEmail = process.env.VENDOR_EMAIL;
const vendorShopName = process.env.VENDOR_SHOP_NAME;
const vendorOwnerName = process.env.VENDOR_OWNER_NAME;
const vendorPassword = process.env.VENDOR_PASSWORD;
const vendorPhoneNumber = process.env.VENDOR_PHONE_NO;
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
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

const seedVendorAndProducts = async () => {
  try {
    console.log("🌱 Seeding vendor & products...");

    // Check if demo vendor already exists
    let existingVendor = await Vendor.findOne({ email: vendorEmail });
    if (existingVendor) {
      console.log("⚠️ Demo vendor already exists");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(vendorPassword, 10);

    // Create Vendor
    const vendor = await Vendor.create({
      vendorId:
        "VEND-" +
        new Date().getFullYear() +
        uuidv4().substring(0, 6).toUpperCase(),
      name: vendorOwnerName,
      shopName: vendorShopName,
      email: vendorEmail,
      password: hashedPassword,
      phone: vendorPhoneNumber,
      address:
        "Digital Indian EN-9, Sector V, Salt Lake Kolkata – 700091 West Bengal, India",
      description:
        "Digital Indian Store is a dedicated platform committed to preserving and promoting the rich cultural heritage of Bengal. We specialize in authentic, handcrafted traditional products that reflect the artistry, history, and soul of Bengali craftsmanship. \n From elegant handloom sarees and traditional textiles to ethnic jewelry, terracotta art, handcrafted decor, and cultural gift items — every product tells a story of tradition, skill, and timeless beauty. \n Our mission is to: \n 🌾 Support local artisans and weavers\n 🎨 Promote traditional Bengali art and craftsmanship\n 🛍️ Deliver authentic heritage products to modern customers \n 🇮🇳 Preserve India’s cultural legacy in the digital era \n At Digital Indian Store, we blend tradition with technology, bringing Bengal’s heritage to your doorstep while empowering rural craftsmen and small businesses.",
      logo: "https://res.cloudinary.com/dncmyykoh/image/upload/v1772653143/WhatsApp_Image_2025-12-06_at_19.01.11_y9zyzb.jpg",
      banner:
        "https://res.cloudinary.com/dncmyykoh/image/upload/v1772653147/WhatsApp_Image_2025-12-06_at_19.01.11_1_myuowg.jpg",
      documents: {
        tradeLicense: " ",
        aadhaarCard: " ",
        panCard: " ",
      },
      isVerified: true,
    });

    console.log("✅ Vendor created");

    // Fetch Categories
    const Handloom_Sarees = await Category.findOne({ name: "Handloom Sarees" });
    if (!Handloom_Sarees) {
      console.log("Category not found!");
    }
    const Terracotta_Crafts = await Category.findOne({ name: "Terracotta Crafts" });
    if (!Terracotta_Crafts) {
      console.log("Category not found!");
    }
    const Dokra_Art = await Category.findOne({ name: "Dokra Art" });
    if (!Dokra_Art) {
      console.log("Category not found!");
    }
    const Wooden_Handicrafts = await Category.findOne({ name: "Wooden Handicrafts" });
    if (!Wooden_Handicrafts) {
      console.log("Category not found!");
    }
    const Jute_Products = await Category.findOne({ name: "Jute Products" });
    if (!Jute_Products) {
      console.log("Category not found!");
    }
    const Bengal_Sweets = await Category.findOne({ name: "Bengal Sweets" });
    if (!Bengal_Sweets) {
      console.log("Category not found!");
    }

    // Products Data (Each product has < 5 images)
    // Products Data (Each product has < 5 images)
const productsData = [
  {
    name: "Baluchari Black",
    description: "Elegant black Baluchari saree featuring intricate mythological motifs woven in traditional silk craftsmanship.",
    price: 5890,
    orginalPrice: 7000,
    stock: 8,
    district: "Bankura",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690856/3_bdpn74.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690855/2_diexp2.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690855/1_wog9nf.jpg",
    ],
  },
  {
    name: "Baluchari Blue",
    description: "Royal blue Baluchari saree with detailed narrative pallu designs inspired by classical Bengali weaving traditions.",
    price: 6120,
    orginalPrice: 8300,
    stock: 6,
    district: "Nadia",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690856/3_udq6lx.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690856/1_luqxtu.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690855/2_ktctbf.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690855/4_bzqls6.jpg",
    ],
  },
  {
    name: "Baluchari Maroon",
    description: "Rich maroon Baluchari saree with finely woven temple and mythological patterns in contrasting silk threads.",
    price: 6450,
    orginalPrice: 7800,
    stock: 12,
    district: "Murshidabad",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690857/4_cjssgp.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690857/3_wrpoeh.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690856/2_evzpnz.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690855/1_r9kwjk.jpg",
    ],
  },
  {
    name: "Baluchari Red",
    description: "Traditional red Baluchari saree adorned with elaborate storytelling motifs and ornate borders.",
    price: 6310,
    orginalPrice: 7300,
    stock: 7,
    district: "Hooghly",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690858/3_wd52x6.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690858/4_wuncrk.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690858/2_hpszh5.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690857/1_fsms8n.jpg",
    ],
  },
  {
    name: "Baluchari Sky",
    description: "Soft sky blue Baluchari saree with delicate woven patterns reflecting the heritage of Bengal handloom artistry.",
    price: 6025,
    orginalPrice: 8000,
    stock: 10,
    district: "Purba Medinipur",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690861/3_haae10.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690860/2_okgcnw.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690858/1_tciv06.jpg",
    ],
  },
  {
    name: "Baluchari Steel",
    description: "Modern steel grey Baluchari saree featuring elegant silk weaving and subtle mythological motifs.",
    price: 6180,
    orginalPrice: 7500,
    stock: 5,
    district: "Birbhum",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690862/3_s2z3u6.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690861/2_dcfdfb.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690861/1_jbbopq.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690861/4_mylkpl.jpg",
    ],
  },
  {
    name: "Baluchari Yellow",
    description: "Bright yellow Baluchari saree with vibrant traditional patterns and finely woven silk narrative designs.",
    price: 5750,
    orginalPrice: 6800,
    stock: 14,
    district: "South 24 Parganas",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690862/3_fm7nfq.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690862/2_hnq8t2.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690862/1_abj8id.jpg",
    ],
  },
  {
    name: "Terracotta Pure silk Maroon",
    description: "Handcrafted terracotta maroon pure silk saree inspired by Bengal temple art with rich woven borders.",
    price: 6890,
    orginalPrice: 8200,
    stock: 9,
    district: "Bankura", // Bishnupur is in Bankura district
    category: Terracotta_Crafts._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772693220/kcsjm1632-6-1000x1000_kcped1.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772693219/kcsjm1632-5-1000x1000_f7wvqc.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772693215/kcsjm1632-3-1000x1000_ngwptk.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772693212/kcsjm1632-1-1000x1000_ten9nb.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772693212/kcsjm1632-2-1000x1000_ggd1pu.webp",
    ],
  },
  {
    name: "Satin Terracotta Saaree",
    description: "Elegant satin terracotta saree with smooth drape and subtle woven traditional motifs.",
    price: 4980,
    orginalPrice: 6400,
    stock: 11,
    district: "Purba Bardhaman", // Bardhaman is now Purba Bardhaman
    category: Terracotta_Crafts._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772693202/4_gettnc.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772693198/3_ivclpg.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772693196/2_udkpvb.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772693195/1_c0kxg0.webp",
    ],
  },
  {
    name: "Terracotta Brown Floral Pure silk",
    description: "Brown terracotta floral pure silk saree featuring delicate handwoven floral patterns and elegant borders.",
    price: 7420,
    orginalPrice: 8900,
    stock: 7,
    district: "Birbhum",
    category: Terracotta_Crafts._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772692910/5R1A1200_670f2815-ffb3-4a79-8e71-82c1f9673297_pppmdj.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772692909/5R1A1193_669770fa-1690-45b2-b4d9-aea8a04baf08_kabnhj.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772692906/5R1A1187_53f8118f-090a-45a6-a0c1-677bcfb14d5b_l7ambv.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772692906/5R1A1181_a923ec81-cfe7-4eb4-b1cd-ba25b2f01d92_m7uurc.webp",
    ],
  },
  {
    name: "Terracotta Peach Kanjivaram Silk",
    description: "Peach terracotta Kanjivaram silk saree with luxurious texture and traditional South Indian inspired weaving.",
    price: 9150,
    orginalPrice: 11200,
    stock: 5,
    district: "Nadia",
    category:Terracotta_Crafts._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772692915/MSlh3_554fb258-f1c1-4a51-aa9c-3c2631e6f9b1_lnonyx.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772692914/MSlh2_14f55c81-db02-4145-8cc8-1321f5f17b2b_e6rgn5.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772692911/MSlh1_2583755d-55ce-4311-afe9-bdaa43ea49a0_jmchqu.webp",
    ],
  },
  {
    name: "Terracotta Tile print",
    description: "Terracotta tile print saree with artistic geometric motifs inspired by traditional Bengal terracotta temples.",
    price: 4320,
    orginalPrice: 5600,
    stock: 13,
    district: "Hooghly",
    category: Terracotta_Crafts._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772692923/Untitled-224_1077c329-028b-4623-a857-7cb36a30a982_1000x_wapi5i.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772692921/Untitled-223_0aaeb99c-152d-4a04-a78a-18b0ff00190e_1000x_wx46lg.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772692920/Untitled-222_485f9233-3e18-4f27-9a8c-42690a04244c_1000x_jbezrh.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772692918/Untitled-221_8c204f23-d7ca-40ff-8385-7633b35eb8c7_1000x_drvmk3.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772692917/Untitled-220_1000x_cegvs5.webp",
    ],
  },
  {
    name: "Terracotta Elephant Indoor Decoration",
    description: "Handcrafted terracotta elephant decorative piece inspired by traditional Bengal temple art, ideal for home interiors.",
    price: 1450,
    orginalPrice: 1900,
    stock: 11,
    district: "Bankura",
    category: Terracotta_Crafts._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772695262/tr6-1-500x500_mltm72.webp"
    ],
  },
  {
    name: "Shabari-ke-Ber Terracotta art",
    description: "Terracotta wall panel depicting the Ramayana scene of Shabari offering berries to Lord Rama, crafted in traditional style.",
    price: 2380,
    orginalPrice: 3200,
    stock: 7,
    district: "Birbhum",
    category: Terracotta_Crafts._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772695260/Shabari-ke-Ber-Terracotta-art-by-Dolon-Kundu-3_900x_npqwaw.webp"
    ],
  },
  {
    name: "Shabari-ke-Ber Terracotta art (Alternate)",
    description: "Traditional terracotta artwork portraying the devotional moment of Shabari presenting berries to Lord Rama.",
    price: 2260,
    orginalPrice: 3100,
    stock: 6,
    district: "Purulia",
    category: Terracotta_Crafts._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772695258/Shabari-ke-Ber-Terracotta-art-by-Dolon-Kundu-1_900x_b6xi4z.webp"
    ],
  },
  {
    name: "Ganesha Idol terracotta art",
    description: "Handcrafted terracotta idol of Lord Ganesha with intricate carvings inspired by traditional Indian temple sculpture.",
    price: 1890,
    orginalPrice: 2600,
    stock: 10,
    district: "Bankura",
    category: Terracotta_Crafts._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772695256/Portrayal-of-Lord-Ganesha-in-Terracotta-by-Dinesh-Molela-1_900x_quj56q.webp"
    ],
  },
  {
    name: "Elephant Holder Terracotta art",
    description: "Decorative terracotta elephant holder that can be used as a planter or pen stand, crafted using traditional clay techniques.",
    price: 1350,
    orginalPrice: 1800,
    stock: 13,
    district: "Hooghly",
    category: Terracotta_Crafts._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772695251/MPElephantHolderscumplantersL_vtuc7k.webp"
    ],
  },
  {
    name: "Wall art Terracotta style",
    description: "Traditional terracotta wall art panel inspired by Bengal temple architecture and decorative clay carvings.",
    price: 1980,
    orginalPrice: 2600,
    stock: 9,
    district: "Murshidabad",
    category: Terracotta_Crafts._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772695248/de3f5c44a04d0084abcef86a9908f310_n20rcb.jpg"
    ],
  },
  {
    name: "Handmade Idols Terracotta art",
    description: "Handmade terracotta idols crafted by rural Bengal artisans using traditional kiln fired clay techniques.",
    price: 1720,
    orginalPrice: 2400,
    stock: 8,
    district: "Bankura", // Bishnupur is in Bankura district
    category: Terracotta_Crafts._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772695245/BengalhandmadeterracottaartifactproductfromPanchmura_Bishnupur_Bankura_WestBengalbyBONGONIKETAN66_lqke17.webp"
    ],
  },
  {
    name: "Durga Idol Terracotta art",
    description: "Terracotta idol of Goddess Durga handcrafted with detailed sculptural work inspired by Bengal temple art.",
    price: 2490,
    orginalPrice: 3400,
    stock: 6,
    district: "Bankura",
    category: Terracotta_Crafts._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772695240/61gedFnCBcL._SX679__mhiqhq.jpg"
    ],
  },
  {
    name: "God feet Terracotta art",
    description: "Sacred terracotta representation of divine footprints used for traditional decor and spiritual spaces.",
    price: 980,
    orginalPrice: 1400,
    stock: 14,
    district: "Purba Bardhaman", // Bardhaman is now Purba Bardhaman
    category: Terracotta_Crafts._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772695239/5ff07a34413b2737ee5376357a4bf816_dixbkm.jpg"
    ],
  },
  {
    name: "Saraswati Idol Terracotta art",
    description: "Handcrafted terracotta idol of Goddess Saraswati symbolizing wisdom and art, made by traditional clay artisans.",
    price: 2150,
    orginalPrice: 2900,
    stock: 7,
    district: "Birbhum",
    category: Terracotta_Crafts._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772695235/5bccd1b628671e5e99bac66b4af0ed92_zcjjkp.webp"
    ],
  },
   {
    name: "Sitabhog",
    description: "Traditional sweet from Bardhaman made from fine vermicelli-like strands of rice flour, sugar, and ghee.",
    price: 380,
    orginalPrice: 450,
    stock: 14,
    district: "Purba Bardhaman",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700407/sitabhog_pvaprs.webp"
    ],
  },
  {
    name: "Rossogolla",
    description: "Soft and spongy chenna balls soaked in light sugar syrup, one of the most iconic Bengali sweets.",
    price: 320,
    orginalPrice: 400,
    stock: 12,
    district: "Kolkata",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700400/Rosogolla_caf0az.jpg"
    ],
  },
  {
    name: "Rosh-Malai",
    description: "Soft cottage cheese dumplings soaked in thickened sweetened milk flavored with cardamom and saffron.",
    price: 420,
    orginalPrice: 520,
    stock: 9,
    district: "Nadia",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700394/Rosh-Malai_o6wjxl.png"
    ],
  },
  {
    name: "Rajbhog",
    description: "Large stuffed rasgulla filled with dry fruits and flavored syrup, a royal Bengali dessert.",
    price: 450,
    orginalPrice: 560,
    stock: 10,
    district: "Hooghly",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700393/rajbhog_pgvrbu.jpg"
    ],
  },
  {
    name: "Pantua",
    description: "Deep fried chenna sweet soaked in sugar syrup, similar to gulab jamun but richer in flavor.",
    price: 340,
    orginalPrice: 420,
    stock: 11,
    district: "Murshidabad",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700389/Pantua_x3qtpx.jpg"
    ],
  },
  {
    name: "Patishapta",
    description: "Traditional Bengali winter dessert made from thin crepes filled with coconut, jaggery, and khoya.",
    price: 280,
    orginalPrice: 350,
    stock: 13,
    district: "North 24 Parganas",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700389/patishapta_gembpd.jpg"
    ],
  },
  {
    name: "Mishti Doi",
    description: "Sweet caramelized yogurt set in earthen pots, a classic dessert from Bengal.",
    price: 260,
    orginalPrice: 330,
    stock: 15,
    district: "Nadia",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700383/mishti-dahi_x8etyj.webp"
    ],
  },
  {
    name: "Mihidana",
    description: "Tiny golden sweet pearls made from gram flour and soaked lightly in sugar syrup, a specialty of Bardhaman.",
    price: 360,
    orginalPrice: 440,
    stock: 12,
    district: "Purba Bardhaman",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700382/Mihidana_xzzry1.jpg"
    ],
  },
  {
    name: "Keshar Sandesh",
    description: "Soft Bengali sandesh flavored with saffron and made from fresh chenna.",
    price: 390,
    orginalPrice: 470,
    stock: 10,
    district: "Kolkata",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700379/kesar-sandesh_e2ilev.jpg"
    ],
  },
  {
    name: "Langcha",
    description: "Deep fried cylindrical sweet soaked in sugar syrup, a famous delicacy from Shaktigarh.",
    price: 350,
    orginalPrice: 430,
    stock: 11,
    district: "Paschim Bardhaman", // Shaktigarh is in Paschim Bardhaman
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700377/langcha_oxidlh.webp"
    ],
  },
  {
    name: "Kheer Kodom",
    description: "Sweet made from khoya and chenna with a soft outer layer and powdered coating.",
    price: 420,
    orginalPrice: 510,
    stock: 9,
    district: "Nadia",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700375/kheer-kodom_i4oepp.jpg"
    ],
  },
  {
    name: "Joynagarer Moa",
    description: "Seasonal winter sweet made from puffed rice and nolen gur, famous from Joynagar in Bengal.",
    price: 310,
    orginalPrice: 380,
    stock: 8,
    district: "South 24 Parganas", // Joynagar is in South 24 Parganas
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700371/joynagarer-moa_yg2idz.webp"
    ],
  },
  {
    name: "Chanar Jilapi",
    description: "Sweet made from chenna shaped like jalebi and soaked in sugar syrup.",
    price: 370,
    orginalPrice: 450,
    stock: 10,
    district: "Hooghly",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700367/chanar_jilapi_mpegto.jpg"
    ],
  },
  {
    name: "Cham Cham",
    description: "Soft cylindrical sweet made from chenna and soaked in syrup, popular across Bengal.",
    price: 340,
    orginalPrice: 420,
    stock: 12,
    district: "Nadia",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700365/cham-cham_rplzax.jpg"
    ],
  },
  {
    name: "Malpua",
    description: "Traditional fried pancake soaked in sugar syrup, often served during festivals in Bengal.",
    price: 290,
    orginalPrice: 360,
    stock: 13,
    district: "Murshidabad",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700363/Bengali-Malpua_rzrssb.jpg"
    ],
  },{
    name: "Jamdani Black",
    description: "Elegant black Jamdani saree with delicate handwoven motifs, lightweight fabric, traditional Bengal craftsmanship, perfect for weddings, festivals, and cultural occasions.",
    price: 4500,
    orginalPrice: 5400,
    stock: 5,
    district: "Purba Bardhaman",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691140/2_hxmjng.jpg",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691140/1_t8bbpq.jpg",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691139/3_oaurgk.jpg"
    ],
  },
  {
    name: "Jamdani Blue",
    description: "Graceful blue Jamdani saree with delicate handwoven motifs, breathable cotton fabric, showcasing traditional Bengal weaving, perfect for festive occasions.",
    price: 4800,
    orginalPrice: 5760,
    stock: 5,
    district: "Purba Bardhaman",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691141/3_xfmbwd.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691140/2_tmzpdi.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691140/1_agsa4z.webp"
    ],
  },
  {
    name: "Jamdani Green",
    description: "Traditional green Jamdani saree crafted with artistic handwoven motifs, soft breathable fabric, reflecting rich Bengal textile heritage.",
    price: 4600,
    orginalPrice: 5520,
    stock: 5,
    district: "Purba Bardhaman",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691141/3_nub2ye.jpg",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691141/2_fjfybb.jpg",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691141/1_cyjflp.jpg"
    ],
  },
  {
    name: "Jamdani Off-White",
    description: "Classic off-white Jamdani saree featuring fine woven motifs, lightweight cotton texture, representing authentic Bengal craftsmanship.",
    price: 4400,
    orginalPrice: 5280,
    stock: 5,
    district: "Purba Bardhaman",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691142/3_syw5n5.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691140/2_tmzpdi.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691140/1_agsa4z.webp"
    ],
  },
  {
    name: "Jamdani Orange",
    description: "Bright orange Jamdani saree with elegant handwoven designs, breathable cotton fabric, perfect for festive celebrations.",
    price: 4200,
    orginalPrice: 5040,
    stock: 5,
    district: "Purba Bardhaman",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691142/3_ltvpvl.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691142/2_tlhesr.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691142/1_tvcfat.webp"
    ],
  },
  {
    name: "Jamdani Peach",
    description: "Soft peach Jamdani saree with graceful woven motifs, lightweight comfortable fabric, ideal for ethnic and festive occasions.",
    price: 4300,
    orginalPrice: 5160,
    stock: 5,
    district: "Purba Bardhaman",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691143/3_ckqprv.jpg",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691143/2_l4xaeq.jpg",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691142/1_wuh890.jpg"
    ],
  },
  {
    name: "Jamdani Pink",
    description: "Elegant pink Jamdani saree with delicate handwoven motifs, lightweight breathable fabric, traditional Bengal craftsmanship, perfect for festive and ethnic occasions.",
    price: 4300,
    orginalPrice: 5160,
    stock: 5,
    district: "Purba Bardhaman",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691143/3_njeos3.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691143/1_potryo.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691143/2_lbeztb.webp"
    ],
  },
  {
    name: "Jamdani Red Premium",
    description: "Traditional red Jamdani saree with elegant handwoven motifs, soft breathable cotton fabric, perfect for festivals, weddings, and ethnic occasions.",
    price: 4800,
    orginalPrice: 5760,
    stock: 5,
    district: "Purba Bardhaman",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691146/3_euvb6u.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691145/2_o9j0vg.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691145/1_jqtkva.webp"
    ],
  },
  {
    name: "Jamdani Red Value",
    description: "Elegant red Jamdani saree with traditional handwoven motifs, soft breathable fabric, perfect for weddings, festivals, and graceful ethnic wear.",
    price: 2500,
    orginalPrice: 3000,
    stock: 5,
    district: "Purba Bardhaman",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691144/4_efi4vz.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691144/3_ct2q4e.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691144/2_imxael.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691143/1_lirpny.webp"
    ],
  },
  {
    name: "Kantha Stitch Blue",
    description: "Traditional blue Kantha stitch saree with intricate hand embroidery reflecting rich Bengal folk art craftsmanship.",
    price: 3500,
    orginalPrice: 4200,
    stock: 5,
    district: "Purba Bardhaman",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691146/3_xtvz8d.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691146/2_j3rlzn.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691146/1_eg0aqd.webp"
    ],
  },
  {
    name: "Murshidabad Silk Purple",
    description: "Luxurious purple Murshidabad silk saree with rich shine, smooth texture, perfect for weddings and special occasions.",
    price: 5000,
    orginalPrice: 6000,
    stock: 5,
    district: "Murshidabad", // Changed to correct district
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691150/4_mn2pfz.jpg",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691150/3_f1jyku.jpg",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691150/2_zbrjr1.jpg",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691149/1_jqu9ob.jpg"
    ],
  },
  {
    name: "Muslin Red",
    description: "Elegant red muslin saree made with ultra-fine cotton weave, breathable lightweight fabric, reflecting Bengal textile heritage.",
    price: 3900,
    orginalPrice: 4680,
    stock: 5,
    district: "Purba Bardhaman",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691153/3_kwwzgp.jpg",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691153/2_gdd2zt.jpg",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691153/1_bjefjs.jpg"
    ],
  },
    {
    name: "Baluchari Black",
    description: "Elegant black Baluchari saree featuring intricate mythological motifs woven in traditional silk craftsmanship.",
    price: 5890,
    orginalPrice: 7000,
    stock: 8,
    district: "Bankura",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690856/3_bdpn74.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690855/2_diexp2.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690855/1_wog9nf.jpg"
    ],
  },
  {
    name: "Baluchari Blue",
    description: "Royal blue Baluchari saree with detailed narrative pallu designs inspired by classical Bengali weaving traditions.",
    price: 6120,
    orginalPrice: 8300,
    stock: 6,
    district: "Nadia",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690856/3_udq6lx.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690856/1_luqxtu.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690855/2_ktctbf.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690855/4_bzqls6.jpg"
    ],
  },
  {
    name: "Baluchari Maroon",
    description: "Rich maroon Baluchari saree with finely woven temple and mythological patterns in contrasting silk threads.",
    price: 6450,
    orginalPrice: 7800,
    stock: 12,
    district: "Murshidabad",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690857/4_cjssgp.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690857/3_wrpoeh.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690856/2_evzpnz.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690855/1_r9kwjk.jpg"
    ],
  },
  {
    name: "Baluchari Red",
    description: "Traditional red Baluchari saree adorned with elaborate storytelling motifs and ornate borders.",
    price: 6310,
    orginalPrice: 7300,
    stock: 7,
    district: "Hooghly",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690858/3_wd52x6.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690858/4_wuncrk.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690858/2_hpszh5.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690857/1_fsms8n.jpg"
    ],
  },
  {
    name: "Baluchari Sky",
    description: "Soft sky blue Baluchari saree with delicate woven patterns reflecting the heritage of Bengal handloom artistry.",
    price: 6025,
    orginalPrice: 8000,
    stock: 10,
    district: "Purba Medinipur",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690861/3_haae10.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690860/2_okgcnw.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690858/1_tciv06.jpg"
    ],
  },
  {
    name: "Baluchari Steel",
    description: "Modern steel grey Baluchari saree featuring elegant silk weaving and subtle mythological motifs.",
    price: 6180,
    orginalPrice: 7500,
    stock: 5,
    district: "Birbhum",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690862/3_s2z3u6.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690861/2_dcfdfb.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690861/1_jbbopq.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690861/4_mylkpl.jpg"
    ],
  },
  {
    name: "Baluchari Yellow",
    description: "Bright yellow Baluchari saree with vibrant traditional patterns and finely woven silk narrative designs.",
    price: 5750,
    orginalPrice: 6800,
    stock: 14,
    district: "South 24 Parganas",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690862/3_fm7nfq.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690862/2_hnq8t2.jpg",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772690862/1_abj8id.jpg"
    ],
  },

  // ========== TERRACOTTA PURE SILK SAREES ==========
  {
    name: "Terracotta Pure Silk Maroon",
    description: "Handcrafted terracotta maroon pure silk saree inspired by Bengal temple art with rich woven borders.",
    price: 6890,
    orginalPrice: 8200,
    stock: 9,
    district: "Bankura",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772693220/kcsjm1632-6-1000x1000_kcped1.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772693219/kcsjm1632-5-1000x1000_f7wvqc.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772693215/kcsjm1632-3-1000x1000_ngwptk.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772693212/kcsjm1632-1-1000x1000_ten9nb.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772693212/kcsjm1632-2-1000x1000_ggd1pu.webp"
    ],
  },
  {
    name: "Satin Terracotta Saree",
    description: "Elegant satin terracotta saree with smooth drape and subtle woven traditional motifs.",
    price: 4980,
    orginalPrice: 6400,
    stock: 11,
    district: "Purba Bardhaman",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772693202/4_gettnc.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772693198/3_ivclpg.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772693196/2_udkpvb.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772693195/1_c0kxg0.webp"
    ],
  },
  {
    name: "Terracotta Brown Floral Pure Silk",
    description: "Brown terracotta floral pure silk saree featuring delicate handwoven floral patterns and elegant borders.",
    price: 7420,
    orginalPrice: 8900,
    stock: 7,
    district: "Birbhum",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772692910/5R1A1200_670f2815-ffb3-4a79-8e71-82c1f9673297_pppmdj.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772692909/5R1A1193_669770fa-1690-45b2-b4d9-aea8a04baf08_kabnhj.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772692906/5R1A1187_53f8118f-090a-45a6-a0c1-677bcfb14d5b_l7ambv.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772692906/5R1A1181_a923ec81-cfe7-4eb4-b1cd-ba25b2f01d92_m7uurc.webp"
    ],
  },
  {
    name: "Terracotta Peach Kanjivaram Silk",
    description: "Peach terracotta Kanjivaram silk saree with luxurious texture and traditional South Indian inspired weaving.",
    price: 9150,
    orginalPrice: 11200,
    stock: 5,
    district: "Nadia",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772692915/MSlh3_554fb258-f1c1-4a51-aa9c-3c2631e6f9b1_lnonyx.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772692914/MSlh2_14f55c81-db02-4145-8cc8-1321f5f17b2b_e6rgn5.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772692911/MSlh1_2583755d-55ce-4311-afe9-bdaa43ea49a0_jmchqu.webp"
    ],
  },
  {
    name: "Terracotta Tile Print Saree",
    description: "Terracotta tile print saree with artistic geometric motifs inspired by traditional Bengal terracotta temples.",
    price: 4320,
    orginalPrice: 5600,
    stock: 13,
    district: "Hooghly",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772692923/Untitled-224_1077c329-028b-4623-a857-7cb36a30a982_1000x_wapi5i.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772692921/Untitled-223_0aaeb99c-152d-4a04-a78a-18b0ff00190e_1000x_wx46lg.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772692920/Untitled-222_485f9233-3e18-4f27-9a8c-42690a04244c_1000x_jbezrh.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772692918/Untitled-221_8c204f23-d7ca-40ff-8385-7633b35eb8c7_1000x_drvmk3.webp",
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772692917/Untitled-220_1000x_cegvs5.webp"
    ],
  },

  // ========== TERRACOTTA CRAFTS ==========
  {
    name: "Terracotta Elephant Indoor Decoration",
    description: "Handcrafted terracotta elephant decorative piece inspired by traditional Bengal temple art, ideal for home interiors.",
    price: 1450,
    orginalPrice: 1900,
    stock: 11,
    district: "Bankura",
    category: Terracotta_Crafts._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772695262/tr6-1-500x500_mltm72.webp"
    ],
  },
  {
    name: "Shabari-ke-Ber Terracotta Art",
    description: "Terracotta wall panel depicting the Ramayana scene of Shabari offering berries to Lord Rama, crafted in traditional style.",
    price: 2380,
    orginalPrice: 3200,
    stock: 7,
    district: "Birbhum",
    category: Terracotta_Crafts._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772695260/Shabari-ke-Ber-Terracotta-art-by-Dolon-Kundu-3_900x_npqwaw.webp"
    ],
  },
  {
    name: "Shabari-ke-Ber Terracotta Art (Alternate)",
    description: "Traditional terracotta artwork portraying the devotional moment of Shabari presenting berries to Lord Rama.",
    price: 2260,
    orginalPrice: 3100,
    stock: 6,
    district: "Purulia",
    category: Terracotta_Crafts._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772695258/Shabari-ke-Ber-Terracotta-art-by-Dolon-Kundu-1_900x_b6xi4z.webp"
    ],
  },
  {
    name: "Ganesha Idol Terracotta Art",
    description: "Handcrafted terracotta idol of Lord Ganesha with intricate carvings inspired by traditional Indian temple sculpture.",
    price: 1890,
    orginalPrice: 2600,
    stock: 10,
    district: "Bankura",
    category: Terracotta_Crafts._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772695256/Portrayal-of-Lord-Ganesha-in-Terracotta-by-Dinesh-Molela-1_900x_quj56q.webp"
    ],
  },
  {
    name: "Elephant Holder Terracotta Art",
    description: "Decorative terracotta elephant holder that can be used as a planter or pen stand, crafted using traditional clay techniques.",
    price: 1350,
    orginalPrice: 1800,
    stock: 13,
    district: "Hooghly",
    category: Terracotta_Crafts._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772695251/MPElephantHolderscumplantersL_vtuc7k.webp"
    ],
  },
  {
    name: "Wall Art Terracotta Style",
    description: "Traditional terracotta wall art panel inspired by Bengal temple architecture and decorative clay carvings.",
    price: 1980,
    orginalPrice: 2600,
    stock: 9,
    district: "Murshidabad",
    category: Terracotta_Crafts._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772695248/de3f5c44a04d0084abcef86a9908f310_n20rcb.jpg"
    ],
  },
  {
    name: "Handmade Idols Terracotta Art",
    description: "Handmade terracotta idols crafted by rural Bengal artisans using traditional kiln fired clay techniques.",
    price: 1720,
    orginalPrice: 2400,
    stock: 8,
    district: "Bankura",
    category: Terracotta_Crafts._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772695245/BengalhandmadeterracottaartifactproductfromPanchmura_Bishnupur_Bankura_WestBengalbyBONGONIKETAN66_lqke17.webp"
    ],
  },
  {
    name: "Durga Idol Terracotta Art",
    description: "Terracotta idol of Goddess Durga handcrafted with detailed sculptural work inspired by Bengal temple art.",
    price: 2490,
    orginalPrice: 3400,
    stock: 6,
    district: "Bankura",
    category: Terracotta_Crafts._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772695240/61gedFnCBcL._SX679__mhiqhq.jpg"
    ],
  },
  {
    name: "God Feet Terracotta Art",
    description: "Sacred terracotta representation of divine footprints used for traditional decor and spiritual spaces.",
    price: 980,
    orginalPrice: 1400,
    stock: 14,
    district: "Purba Bardhaman",
    category: Terracotta_Crafts._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772695239/5ff07a34413b2737ee5376357a4bf816_dixbkm.jpg"
    ],
  },
  {
    name: "Saraswati Idol Terracotta Art",
    description: "Handcrafted terracotta idol of Goddess Saraswati symbolizing wisdom and art, made by traditional clay artisans.",
    price: 2150,
    orginalPrice: 2900,
    stock: 7,
    district: "Birbhum",
    category: Terracotta_Crafts._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772695235/5bccd1b628671e5e99bac66b4af0ed92_zcjjkp.webp"
    ],
  },

  // ========== BENGAL SWEETS ==========
  {
    name: "Sitabhog",
    description: "Traditional sweet from Bardhaman made from fine vermicelli-like strands of rice flour, sugar, and ghee.",
    price: 380,
    orginalPrice: 450,
    stock: 14,
    district: "Purba Bardhaman",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700407/sitabhog_pvaprs.webp"
    ],
  },
  {
    name: "Rossogolla",
    description: "Soft and spongy chenna balls soaked in light sugar syrup, one of the most iconic Bengali sweets.",
    price: 320,
    orginalPrice: 400,
    stock: 12,
    district: "Kolkata",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700400/Rosogolla_caf0az.jpg"
    ],
  },
  {
    name: "Rosh-Malai",
    description: "Soft cottage cheese dumplings soaked in thickened sweetened milk flavored with cardamom and saffron.",
    price: 420,
    orginalPrice: 520,
    stock: 9,
    district: "Nadia",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700394/Rosh-Malai_o6wjxl.png"
    ],
  },
  {
    name: "Rajbhog",
    description: "Large stuffed rasgulla filled with dry fruits and flavored syrup, a royal Bengali dessert.",
    price: 450,
    orginalPrice: 560,
    stock: 10,
    district: "Hooghly",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700393/rajbhog_pgvrbu.jpg"
    ],
  },
  {
    name: "Pantua",
    description: "Deep fried chenna sweet soaked in sugar syrup, similar to gulab jamun but richer in flavor.",
    price: 340,
    orginalPrice: 420,
    stock: 11,
    district: "Murshidabad",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700389/Pantua_x3qtpx.jpg"
    ],
  },
  {
    name: "Patishapta",
    description: "Traditional Bengali winter dessert made from thin crepes filled with coconut, jaggery, and khoya.",
    price: 280,
    orginalPrice: 350,
    stock: 13,
    district: "North 24 Parganas",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700389/patishapta_gembpd.jpg"
    ],
  },
  {
    name: "Mishti Doi",
    description: "Sweet caramelized yogurt set in earthen pots, a classic dessert from Bengal.",
    price: 260,
    orginalPrice: 330,
    stock: 15,
    district: "Nadia",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700383/mishti-dahi_x8etyj.webp"
    ],
  },
  {
    name: "Mihidana",
    description: "Tiny golden sweet pearls made from gram flour and soaked lightly in sugar syrup, a specialty of Bardhaman.",
    price: 360,
    orginalPrice: 440,
    stock: 12,
    district: "Purba Bardhaman",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700382/Mihidana_xzzry1.jpg"
    ],
  },
  {
    name: "Keshar Sandesh",
    description: "Soft Bengali sandesh flavored with saffron and made from fresh chenna.",
    price: 390,
    orginalPrice: 470,
    stock: 10,
    district: "Kolkata",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700379/kesar-sandesh_e2ilev.jpg"
    ],
  },
  {
    name: "Langcha",
    description: "Deep fried cylindrical sweet soaked in sugar syrup, a famous delicacy from Shaktigarh.",
    price: 350,
    orginalPrice: 430,
    stock: 11,
    district: "Paschim Bardhaman",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700377/langcha_oxidlh.webp"
    ],
  },
  {
    name: "Kheer Kodom",
    description: "Sweet made from khoya and chenna with a soft outer layer and powdered coating.",
    price: 420,
    orginalPrice: 510,
    stock: 9,
    district: "Nadia",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700375/kheer-kodom_i4oepp.jpg"
    ],
  },
  {
    name: "Joynagarer Moa",
    description: "Seasonal winter sweet made from puffed rice and nolen gur, famous from Joynagar in Bengal.",
    price: 310,
    orginalPrice: 380,
    stock: 8,
    district: "South 24 Parganas",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700371/joynagarer-moa_yg2idz.webp"
    ],
  },
  {
    name: "Chanar Jilapi",
    description: "Sweet made from chenna shaped like jalebi and soaked in sugar syrup.",
    price: 370,
    orginalPrice: 450,
    stock: 10,
    district: "Hooghly",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700367/chanar_jilapi_mpegto.jpg"
    ],
  },
  {
    name: "Cham Cham",
    description: "Soft cylindrical sweet made from chenna and soaked in syrup, popular across Bengal.",
    price: 340,
    orginalPrice: 420,
    stock: 12,
    district: "Nadia",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700365/cham-cham_rplzax.jpg"
    ],
  },
  {
    name: "Malpua",
    description: "Traditional fried pancake soaked in sugar syrup, often served during festivals in Bengal.",
    price: 290,
    orginalPrice: 360,
    stock: 13,
    district: "Murshidabad",
    category: Bengal_Sweets._id,
    images: [
      "https://res.cloudinary.com/dwhrfilpd/image/upload/v1772700363/Bengali-Malpua_rzrssb.jpg"
    ],
  },

  // ========== JAMDANI SAREES ==========
  {
    name: "Jamdani Black",
    description: "Elegant black Jamdani saree with delicate handwoven motifs, lightweight fabric, traditional Bengal craftsmanship, perfect for weddings, festivals, and cultural occasions.",
    price: 4500,
    orginalPrice: 5400,
    stock: 5,
    district: "Purba Bardhaman",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691140/2_hxmjng.jpg",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691140/1_t8bbpq.jpg",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691139/3_oaurgk.jpg"
    ],
  },
  {
    name: "Jamdani Blue",
    description: "Graceful blue Jamdani saree with delicate handwoven motifs, breathable cotton fabric, showcasing traditional Bengal weaving, perfect for festive occasions.",
    price: 4800,
    orginalPrice: 5760,
    stock: 5,
    district: "Purba Bardhaman",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691141/3_xfmbwd.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691140/2_tmzpdi.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691140/1_agsa4z.webp"
    ],
  },
  {
    name: "Jamdani Green",
    description: "Traditional green Jamdani saree crafted with artistic handwoven motifs, soft breathable fabric, reflecting rich Bengal textile heritage.",
    price: 4600,
    orginalPrice: 5520,
    stock: 5,
    district: "Purba Bardhaman",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691141/3_nub2ye.jpg",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691141/2_fjfybb.jpg",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691141/1_cyjflp.jpg"
    ],
  },
  {
    name: "Jamdani Off-White",
    description: "Classic off-white Jamdani saree featuring fine woven motifs, lightweight cotton texture, representing authentic Bengal craftsmanship.",
    price: 4400,
    orginalPrice: 5280,
    stock: 5,
    district: "Purba Bardhaman",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691142/3_syw5n5.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691140/2_tmzpdi.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691140/1_agsa4z.webp"
    ],
  },
  {
    name: "Jamdani Orange",
    description: "Bright orange Jamdani saree with elegant handwoven designs, breathable cotton fabric, perfect for festive celebrations.",
    price: 4200,
    orginalPrice: 5040,
    stock: 5,
    district: "Purba Bardhaman",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691142/3_ltvpvl.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691142/2_tlhesr.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691142/1_tvcfat.webp"
    ],
  },
  {
    name: "Jamdani Peach",
    description: "Soft peach Jamdani saree with graceful woven motifs, lightweight comfortable fabric, ideal for ethnic and festive occasions.",
    price: 4300,
    orginalPrice: 5160,
    stock: 5,
    district: "Purba Bardhaman",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691143/3_ckqprv.jpg",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691143/2_l4xaeq.jpg",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691142/1_wuh890.jpg"
    ],
  },
  {
    name: "Jamdani Pink",
    description: "Elegant pink Jamdani saree with delicate handwoven motifs, lightweight breathable fabric, traditional Bengal craftsmanship, perfect for festive and ethnic occasions.",
    price: 4300,
    orginalPrice: 5160,
    stock: 5,
    district: "Purba Bardhaman",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691143/3_njeos3.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691143/1_potryo.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691143/2_lbeztb.webp"
    ],
  },
  {
    name: "Jamdani Red Premium",
    description: "Traditional red Jamdani saree with elegant handwoven motifs, soft breathable cotton fabric, perfect for festivals, weddings, and ethnic occasions.",
    price: 4800,
    orginalPrice: 5760,
    stock: 5,
    district: "Purba Bardhaman",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691146/3_euvb6u.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691145/2_o9j0vg.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691145/1_jqtkva.webp"
    ],
  },
  {
    name: "Jamdani Red Value",
    description: "Elegant red Jamdani saree with traditional handwoven motifs, soft breathable fabric, perfect for weddings, festivals, and graceful ethnic wear.",
    price: 2500,
    orginalPrice: 3000,
    stock: 5,
    district: "Purba Bardhaman",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691144/4_efi4vz.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691144/3_ct2q4e.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691144/2_imxael.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691143/1_lirpny.webp"
    ],
  },

  // ========== KANTHA, MURSHIDABAD SILK & MUSLIN SAREES ==========
  {
    name: "Kantha Stitch Blue",
    description: "Traditional blue Kantha stitch saree with intricate hand embroidery reflecting rich Bengal folk art craftsmanship.",
    price: 3500,
    orginalPrice: 4200,
    stock: 5,
    district: "Purba Bardhaman",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691146/3_xtvz8d.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691146/2_j3rlzn.webp",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691146/1_eg0aqd.webp"
    ],
  },
  {
    name: "Murshidabad Silk Purple",
    description: "Luxurious purple Murshidabad silk saree with rich shine, smooth texture, perfect for weddings and special occasions.",
    price: 5000,
    orginalPrice: 6000,
    stock: 5,
    district: "Murshidabad",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691150/4_mn2pfz.jpg",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691150/3_f1jyku.jpg",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691150/2_zbrjr1.jpg",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691149/1_jqu9ob.jpg"
    ],
  },
  {
    name: "Muslin Red",
    description: "Elegant red muslin saree made with ultra-fine cotton weave, breathable lightweight fabric, reflecting Bengal textile heritage.",
    price: 3900,
    orginalPrice: 4680,
    stock: 5,
    district: "Purba Bardhaman",
    category: Handloom_Sarees._id,
    images: [
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691153/3_kwwzgp.jpg",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691153/2_gdd2zt.jpg",
      "https://res.cloudinary.com/dnplp91xz/image/upload/v1772691153/1_bjefjs.jpg"
    ],
  }
];

    const createdProducts = [];

    // Create Products
    for (let item of productsData) {
      const product = await Product.create({
        ...item,
        vendor: vendor._id,
      });

      createdProducts.push(product._id);
    }

    // Link products to vendor
    vendor.products = createdProducts;
    await vendor.save();

    console.log("✅ Products seeded successfully");
  } catch (error) {
    console.error("❌ Seeding error:", error);
  }
};

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
console.log("KEY:", process.env.RAZORPAY_KEY);
// For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📚 API Documentation available at http://localhost:${port}`);
  });
}
// Export for Vercel
module.exports = app;
