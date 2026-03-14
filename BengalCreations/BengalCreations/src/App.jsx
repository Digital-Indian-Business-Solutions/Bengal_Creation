import { useState, useEffect, useRef, useCallback } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/NavBar";
import CartPanel from "./components/CartPanel";
import HomePage from "./components/HomePage";
import ShopPage from "./components/ShopPage";
import ProductDetailPage from "./components/ProductDetailPage";
import WishlistPage from "./components/WishlistPage";
import CheckoutPage from "./components/CheckoutPage";
import OrdersPage from "./components/OrdersPage";
import LoginPage from "./components/LoginPage";
import VendorPage from "./components/VendorPage";
import DashboardPage from "./components/DashboardPage";
import AboutPage from "./components/AboutPage";
import ContactPage from "./components/ContactPage";
const API = import.meta.env.VITE_API || "http://localhost:5000/api";
// ============================================================
// DATA
// ============================================================
const WB_DISTRICTS = [
  "Bankura",
  "Birbhum",
  "Cooch Behar",
  "Dakshin Dinajpur",
  "Darjeeling",
  "Hooghly",
  "Howrah",
  "Jalpaiguri",
  "Jhargram",
  "Kalimpong",
  "Kolkata",
  "Malda",
  "Murshidabad",
  "Nadia",
  "North 24 Parganas",
  "Paschim Bardhaman",
  "Paschim Medinipur",
  "Purba Bardhaman",
  "Purba Medinipur",
  "Purulia",
  "South 24 Parganas",
  "Uttar Dinajpur",
];

// const vendors = [
//   {
//     id: 1,
//     name: "Bishnupur Crafts House",
//     owner: "Ratan Kumar Mondal",
//     district: "Bankura",
//     rating: 4.8,
//     products: 24,
//     avatar: "🏺",
//     category: "Terracotta Crafts",
//   },
//   {
//     id: 2,
//     name: "Murshidabad Silk Palace",
//     owner: "Farida Begum",
//     district: "Murshidabad",
//     rating: 4.9,
//     products: 38,
//     avatar: "🥻",
//     category: "Handloom Sarees",
//   },
//   {
//     id: 3,
//     name: "Dokra Tribal Art Studio",
//     owner: "Suresh Mahato",
//     district: "Jhargram",
//     rating: 4.7,
//     products: 19,
//     avatar: "🔔",
//     category: "Dokra Art",
//   },
//   {
//     id: 4,
//     name: "Santiniketan Handloom",
//     owner: "Priya Banerjee",
//     district: "Birbhum",
//     rating: 4.6,
//     products: 45,
//     avatar: "🎨",
//     category: "Handloom Sarees",
//   },
//   {
//     id: 5,
//     name: "Darjeeling Tea & Crafts",
//     owner: "Pemba Sherpa",
//     district: "Darjeeling",
//     rating: 4.8,
//     products: 22,
//     avatar: "🍵",
//     category: "Jute Products",
//   },
//   {
//     id: 6,
//     name: "Kolkata Mishti Bhandar",
//     owner: "Tapan Das",
//     district: "Kolkata",
//     rating: 4.9,
//     products: 31,
//     avatar: "🍬",
//     category: "Bengal Sweets",
//   },
//   {
//     id: 7,
//     name: "Purulia Wooden Art",
//     owner: "Gita Mandi",
//     district: "Purulia",
//     rating: 4.5,
//     products: 17,
//     avatar: "🪵",
//     category: "Wooden Handicrafts",
//   },
//   {
//     id: 8,
//     name: "Nadia Jute Creations",
//     owner: "Manas Ghosh",
//     district: "Nadia",
//     rating: 4.7,
//     products: 28,
//     avatar: "🧺",
//     category: "Jute Products",
//   },
// ];

// const allProducts = [
//   {
//     id: 1,
//     name: "Baluchari Silk Saree",
//     vendor: "Murshidabad Silk Palace",
//     vendorId: 2,
//     category: "Handloom Sarees",
//     price: 4500,
//     original: 5500,
//     district: "Murshidabad",
//     rating: 4.9,
//     reviews: 124,
//     emoji: "🥻",
//     stock: 8,
//     thumb:
//       "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80",
//     images: [
//       {
//         url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&q=85",
//         label: "Front View",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&q=85",
//         label: "Weave Detail",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=700&q=85",
//         label: "Zari Border",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1558171813-8a7e53f69090?w=700&q=85",
//         label: "Drape Style",
//       },
//     ],
//     desc: "Exquisite hand-woven Baluchari silk saree featuring intricate mythological scenes from the Ramayana and Mahabharata. Made by master weavers in Bishnupur, this saree represents the pinnacle of Bengali textile art. Each piece takes 2-3 weeks to complete.",
//   },
//   {
//     id: 2,
//     name: "Bishnupur Terracotta Horse",
//     vendor: "Bishnupur Crafts House",
//     vendorId: 1,
//     category: "Terracotta Crafts",
//     price: 850,
//     original: 1100,
//     district: "Bankura",
//     rating: 4.8,
//     reviews: 89,
//     emoji: "🐴",
//     stock: 25,
//     thumb:
//       "https://images.unsplash.com/photo-1566895733044-d2bdda8b6234?w=400&q=80",
//     images: [
//       {
//         url: "https://images.unsplash.com/photo-1566895733044-d2bdda8b6234?w=700&q=85",
//         label: "Full View",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1604497181015-76590d828b65?w=700&q=85",
//         label: "Side Profile",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=85",
//         label: "Hand Painted",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=700&q=85",
//         label: "Clay Detail",
//       },
//     ],
//     desc: "Traditional Bankura horse crafted from terracotta clay with hand-painted motifs. A timeless symbol of Bengali folk art, these horses have been crafted in Bishnupur for over 300 years.",
//   },
//   {
//     id: 3,
//     name: "Dokra Dancing Girl Figurine",
//     vendor: "Dokra Tribal Art Studio",
//     vendorId: 3,
//     category: "Dokra Art",
//     price: 1200,
//     original: 1500,
//     district: "Jhargram",
//     rating: 4.7,
//     reviews: 56,
//     emoji: "🔔",
//     stock: 12,
//     thumb:
//       "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80",
//     images: [
//       {
//         url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=700&q=85",
//         label: "Front View",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1517697471339-4aa32003c11a?w=700&q=85",
//         label: "Metal Detail",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1604664801335-1c74c6e41c97?w=700&q=85",
//         label: "Side View",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=700&q=85",
//         label: "Tribal Motifs",
//       },
//     ],
//     desc: "Ancient lost-wax cast metal figurine depicting a dancing woman. Dokra is one of India's oldest metal casting traditions, dating back 4000+ years.",
//   },
//   {
//     id: 4,
//     name: "Santiniketan Batik Stole",
//     vendor: "Santiniketan Handloom",
//     vendorId: 4,
//     category: "Handloom Sarees",
//     price: 680,
//     original: 900,
//     district: "Birbhum",
//     rating: 4.6,
//     reviews: 73,
//     emoji: "🎨",
//     stock: 30,
//     thumb:
//       "https://images.unsplash.com/photo-1558171813-8a7e53f69090?w=400&q=80",
//     images: [
//       {
//         url: "https://images.unsplash.com/photo-1558171813-8a7e53f69090?w=700&q=85",
//         label: "Full Stole",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=700&q=85",
//         label: "Alpona Motif",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=700&q=85",
//         label: "Batik Texture",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=700&q=85",
//         label: "Colour Detail",
//       },
//     ],
//     desc: "Beautiful batik-printed cotton stole inspired by Tagore's Santiniketan. Features traditional Alpona motifs and natural dye colors.",
//   },
//   {
//     id: 5,
//     name: "Jute Eco Tote Bag — Alpona",
//     vendor: "Nadia Jute Creations",
//     vendorId: 8,
//     category: "Jute Products",
//     price: 320,
//     original: 420,
//     district: "Nadia",
//     rating: 4.8,
//     reviews: 210,
//     emoji: "🧺",
//     stock: 50,
//     thumb:
//       "https://images.unsplash.com/photo-1597149305765-e5e1fdbbf6b0?w=400&q=80",
//     images: [
//       {
//         url: "https://images.unsplash.com/photo-1597149305765-e5e1fdbbf6b0?w=700&q=85",
//         label: "Front View",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&q=85",
//         label: "Back View",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=700&q=85",
//         label: "Handle Detail",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1595341595379-cf1cb693b474?w=700&q=85",
//         label: "Pattern Close-up",
//       },
//     ],
//     desc: "Eco-friendly jute bag decorated with traditional Alpona patterns in natural colors. Handcrafted by SHG women artisans in Nadia.",
//   },
//   {
//     id: 6,
//     name: "Rosogolla Gift Box (12 pcs)",
//     vendor: "Kolkata Mishti Bhandar",
//     vendorId: 6,
//     category: "Bengal Sweets",
//     price: 480,
//     original: 480,
//     district: "Kolkata",
//     rating: 4.9,
//     reviews: 340,
//     emoji: "🍬",
//     stock: 100,
//     thumb:
//       "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80",
//     images: [
//       {
//         url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=700&q=85",
//         label: "Gift Box",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=700&q=85",
//         label: "Close-up",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&q=85",
//         label: "Sweet Platter",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=700&q=85",
//         label: "Packaging",
//       },
//     ],
//     desc: "Authentic sponge rosogolla made from fresh chhena. Soft, melt-in-mouth texture soaked in light sugar syrup. GI-tagged product from Kolkata.",
//   },
//   {
//     id: 7,
//     name: "Wooden Durga Panel (Wall Art)",
//     vendor: "Purulia Wooden Art",
//     vendorId: 7,
//     category: "Wooden Handicrafts",
//     price: 2200,
//     original: 2800,
//     district: "Purulia",
//     rating: 4.5,
//     reviews: 34,
//     emoji: "🪵",
//     stock: 6,
//     thumb:
//       "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&q=80",
//     images: [
//       {
//         url: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=700&q=85",
//         label: "Full Panel",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=700&q=85",
//         label: "Carving Detail",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1510507767-4e574fe8e7ee?w=700&q=85",
//         label: "Wood Grain",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=700&q=85",
//         label: "Wall Display",
//       },
//     ],
//     desc: "Hand-carved wooden panel depicting Goddess Durga. Made from seasoned sheesham wood by master craftsmen. Finished with natural lacquer.",
//   },
//   {
//     id: 8,
//     name: "Muslin Cotton Saree — Dhaniakhali",
//     vendor: "Santiniketan Handloom",
//     vendorId: 4,
//     category: "Handloom Sarees",
//     price: 1800,
//     original: 2400,
//     district: "Birbhum",
//     rating: 4.7,
//     reviews: 98,
//     emoji: "🥻",
//     stock: 15,
//     thumb:
//       "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&q=80",
//     images: [
//       {
//         url: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=700&q=85",
//         label: "Full Drape",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&q=85",
//         label: "Check Pattern",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&q=85",
//         label: "Weave Texture",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1558171813-8a7e53f69090?w=700&q=85",
//         label: "Border Detail",
//       },
//     ],
//     desc: "Pure cotton Dhaniakhali saree with traditional check pattern in deep red and white. A staple of Bengali culture for over a century.",
//   },
//   {
//     id: 9,
//     name: "Darjeeling Tea Premium Gift Set",
//     vendor: "Darjeeling Tea & Crafts",
//     vendorId: 5,
//     category: "Jute Products",
//     price: 950,
//     original: 1200,
//     district: "Darjeeling",
//     rating: 4.8,
//     reviews: 187,
//     emoji: "🍵",
//     stock: 40,
//     thumb:
//       "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80",
//     images: [
//       {
//         url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=700&q=85",
//         label: "Gift Set",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=700&q=85",
//         label: "Tea Leaves",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=700&q=85",
//         label: "Brew Ready",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1597149305765-e5e1fdbbf6b0?w=700&q=85",
//         label: "Jute Box",
//       },
//     ],
//     desc: "Premium Darjeeling first-flush tea in a handmade jute gift box. Includes 3 varieties: Silver Tips, Muscatel, and Classic FTGFOP1.",
//   },
//   {
//     id: 10,
//     name: "Dokra Elephant Pair",
//     vendor: "Dokra Tribal Art Studio",
//     vendorId: 3,
//     category: "Dokra Art",
//     price: 1850,
//     original: 2200,
//     district: "Jhargram",
//     rating: 4.9,
//     reviews: 45,
//     emoji: "🐘",
//     stock: 8,
//     thumb:
//       "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80",
//     images: [
//       {
//         url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=700&q=85",
//         label: "Pair View",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1604497181015-76590d828b65?w=700&q=85",
//         label: "Trunk Detail",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=700&q=85",
//         label: "Motif Close-up",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=700&q=85",
//         label: "Side Profile",
//       },
//     ],
//     desc: "Charming pair of Dokra brass elephants with intricate tribal motifs. Traditional metal craft using the 4000-year-old cire perdue technique.",
//   },
//   {
//     id: 11,
//     name: "Bankura Terracotta Wall Plate",
//     vendor: "Bishnupur Crafts House",
//     vendorId: 1,
//     category: "Terracotta Crafts",
//     price: 550,
//     original: 700,
//     district: "Bankura",
//     rating: 4.6,
//     reviews: 62,
//     emoji: "🏺",
//     stock: 20,
//     thumb:
//       "https://images.unsplash.com/photo-1604664801335-1c74c6e41c97?w=400&q=80",
//     images: [
//       {
//         url: "https://images.unsplash.com/photo-1604664801335-1c74c6e41c97?w=700&q=85",
//         label: "Front View",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=700&q=85",
//         label: "Temple Motif",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1566895733044-d2bdda8b6234?w=700&q=85",
//         label: "Clay Detail",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=85",
//         label: "Wall Display",
//       },
//     ],
//     desc: "Decorative terracotta wall plate with hand-painted Bishnupur temple motifs. Fired in traditional kilns and finished with natural oxide colors.",
//   },
//   {
//     id: 12,
//     name: "Sandesh Box — Nolen Gur",
//     vendor: "Kolkata Mishti Bhandar",
//     vendorId: 6,
//     category: "Bengal Sweets",
//     price: 380,
//     original: 380,
//     district: "Kolkata",
//     rating: 5.0,
//     reviews: 280,
//     emoji: "🍮",
//     stock: 80,
//     thumb:
//       "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80",
//     images: [
//       {
//         url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=700&q=85",
//         label: "Box Open",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=700&q=85",
//         label: "Close-up",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=700&q=85",
//         label: "Gift Pack",
//       },
//       {
//         url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&q=85",
//         label: "Platter View",
//       },
//     ],
//     desc: "Seasonal specialty: Nolen Gur sandesh from old Kolkata. Soft, crumbly texture with the unmistakable aroma of winter date-palm jaggery.",
//   },
//   {
//     id: 13,
//     name: "Fabwomen Floral Handloom Saree",
//     vendor: "Santiniketan Handloom",
//     vendorId: 4,
//     category: "Handloom Sarees",
//     price: 380,
//     original: 380,
//     district: "Kolkata",
//     rating: 5.0,
//     reviews: 280,
//     emoji: "🥻",
//     stock: 80,
//     thumb:
//       "https://images.unsplash.com/photo-1558171813-8a7e53f69090?w=400&q=80",
//     images: [
//       {
//         url: "https://images.unsplash.com/photo-1558171813-8a7e53f69090?w=700&q=85",
//         label: "Full View",
//       },
//     ],
//     desc: "Floral handloom saree crafted with traditional Bengal weaving techniques.",
//   },
// ];

const categoryTiles = [
  {
    name: "Handloom Sarees",
    img: "https://tse1.explicit.bing.net/th/id/OIP.Zg7uFgC6lYoOjW8T3FoVCgHaLH?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    name: "Terracotta Crafts",
    img: "https://tse2.mm.bing.net/th/id/OIP.MhgWzzb0X1KeS32-GfhZbgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    name: "Dokra Art",
    img: "https://tse1.mm.bing.net/th/id/OIP.dZg0GozWyULPdKSFkg73AwHaJQ?rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    name: "Wooden Handicrafts",
    img: "https://live.staticflickr.com/5710/23612913191_23802d0d0a_b.jpg",
  },
  {
    name: "Jute Products",
    img: "https://www.taxscan.in/wp-content/uploads/2022/09/Anti-Dumping-Duty-Jute-Products-CBIC-taxscan.jpg",
  },
  {
    name: "Bengal Sweets",
    img: "https://media.istockphoto.com/id/843602938/photo/rajbhog-or-bengali-rasgulla-indian-sweet.jpg?s=170667a&w=0&k=20&c=mmV4LMPXnYEHEYmPMLj3sB7oaW4UYlk-KbvhbLfuqp4=",
  },
];

const emojiOptions = [
  "🥻",
  "🏺",
  "🔔",
  "🪵",
  "🧺",
  "🍬",
  "🐴",
  "🎨",
  "🍵",
  "🐘",
  "🏅",
  "🍮",
  "🌸",
  "🪡",
  "🎭",
  "🛕",
  "🪆",
  "🧵",
  "🌿",
  "🍯",
];
// const catOptions = [
//   { name: "Handloom Sarees", emoji: "🥻" },
//   { name: "Terracotta Crafts", emoji: "🏺" },
//   { name: "Dokra Art", emoji: "🔔" },
//   { name: "Wooden Handicrafts", emoji: "🪵" },
//   { name: "Jute Products", emoji: "🧺" },
//   { name: "Bengal Sweets", emoji: "🍬" },
// ];

// const demoAccounts = {
//   "customer@demo.com": {
//     password: "demo123",
//     role: "customer",
//     name: "Priya Sen",
//   },
//   "vendor@demo.com": {
//     password: "demo123",
//     role: "vendor",
//     name: "Ratan Kumar",
//     store: "Bishnupur Crafts House",
//   },
// };

// ============================================================
// COMPONENTS
// ============================================================

function Toast({ message, visible }) {
  return <div className={`toast${visible ? " show" : ""}`}>{message}</div>;
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [filterCategory, setFilterCategory] = useState("");
  const [cart, setCart] = useState([]);

  const [wishlist, setWishlist] = useState(() =>
    JSON.parse(localStorage.getItem("sm_wishlist") || "[]"),
  );
  const [orders, setOrders] = useState(() =>
    JSON.parse(localStorage.getItem("sm_orders") || "[]"),
  );
  const [currentUser, setCurrentUser] = useState(() =>
    JSON.parse(localStorage.getItem("sm_user") || "null"),
  );
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState({ msg: "", visible: false });
  const toastTimer = useRef(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [categoryTiles, setCategoryTiles] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [catOptions, setCatOptions] = useState([]);
  const getAllVendors = async () => {
    try {
      const res = await fetch(`${API}/vendors`);
      const data = await res.json();

      const formattedVendors = data.vendors.map((v) => ({
        id: v._id,
        name: v.shopName,
        owner: v.name,
        district: v.address,
        rating: v.rating || 4.5,
        products: v.products?.length || 0,
        avatar: "🛍️",
        category: "Handmade",
      }));

      setVendors(formattedVendors); // IMPORTANT
      // console.log(formattedVendors);
    } catch (err) {
      console.error("Vendor fetch error:", err);
    }
  };
  const getAllCategory = async () => {
    try {
      // setLoading(true);

      const res = await fetch(`${API}/categories`, {
        method: "GET",
      });
      console.log(res);
      const data = await res.json();
      console.log(data);
      // setCategoryTiles(data)
      // data.vendor.role = "vendor";
      setCatOptions(data);
    } catch (err) {
      // setError(err.message);
      console.error("Login error:", err);
    } finally {
      // setLoading(false);
    }
  };
  const getAllCart = async () => {
    try {
      // setLoading(true);
      const user = JSON.parse(localStorage.getItem("sm_user"));
      const res = await fetch(`${API}/cart/${user._id}`, {
        method: "GET",
      });

      // console.log(res)
      const data = await res.json();
      console.log(data.items);
      setCart(data.items || []);
      // data.vendor.role = "vendor";
      setCatOptions(data);
    } catch (err) {
      // setError(err.message);
      console.error("Login error:", err);
    } finally {
      // setLoading(false);
    }
  };

  const getAllProduct = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API}/products`, {
        method: "GET",
      });
      const data = await res.json();
      // console.log(data);

      // Transform server data to expected format
      const transformed = data.map((item) => ({
        id: item._id,
        name: item.name,
        vendor: item.vendor?.shopName || "Unknown Store",
        vendorId: item.vendor?._id,
        category: item.category?.name || "Uncategorized",
        price: item.price,
        original: item.orginalPrice,
        district: item.district?.replace("📍 ", "") || "", // strip emoji if stored with it
        rating: item.rating || 0,
        reviews: item.reviews || 0,
        emoji: item.emoji || "🛍️",
        stock: item.stock,
        thumb: item.images?.[0] || null,
        images:
          item.images?.map((url, i) => ({
            url,
            label: i === 0 ? "Front View" : `View ${i + 1}`,
          })) || [],
        desc: item.description || "",
        isActive: item.isActive,
      }));

      setAllProducts(transformed);
      setLoading(false)
    } catch (err) {
      console.error("Fetch products error:", err);
    }
  };

  useEffect(() => {
    getAllCategory();
    getAllProduct();
    getAllVendors();
    getAllCart();
  }, []);
  // useEffect(() => {
  //   // getAllProducts();
  // }, [allProducts.length]);
  const showToast = useCallback((msg) => {
    setToast({ msg, visible: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(
      () => setToast((t) => ({ ...t, visible: false })),
      3000,
    );
  }, []);
  // const addToCart = useCallback(
  //   (id) => {
  //     // const p = allProducts.find((x) => x.id === id);
  //     // if (!p) return;
  //     // setCart((prev) => {
  //     //   const existing = prev.find((c) => c.id === id);
  //     //   const updated = existing
  //     //     ? prev.map((c) => (c.id === id ? { ...c, qty: (c.qty || 1) + 1 } : c))
  //     //     : [...prev, { ...p, qty: 1 }];
  //     //   localStorage.setItem("sm_cart", JSON.stringify(updated));
  //     //   return updated;
  //     // });
  //     try{

  //     }
  //     showToast(`${p.emoji} "${p.name}" added to cart!`);
  //   },
  //   [showToast],
  // );
  const addToCart = useCallback(
    async (id) => {
      try {
        console.log("1");
        console.log(id);
        // const token = localStorage.getItem("token");
        // if (!token) {
        //   showToast("Please login first!");
        //   return;
        // }
        let user = JSON.parse(localStorage.getItem("sm_user"));

        // Call backend API
        console.log("3");
        const res = await fetch(`${API}/cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: id,
            quantity: 1,
            user: {
              id: user._id,
            },
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to add to cart");
        }

        // Optional: update cart state from response
        console.log(data);
        setCart(data.cart.items);
        console.log("3");
        showToast("Product added to cart successfully!");
      } catch (err) {
        console.error(err);
        showToast(err.message || "Something went wrong");
      }
    },
    [showToast],
  );
  const removeFromCart = useCallback(
    async (productId) => {
      try {
        // const token = localStorage.getItem("token");
        console.log(productId);
        let user = JSON.parse(localStorage.getItem("sm_user"));
        console.log(user);
        const res = await fetch(`${API}/cart/remove/${productId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: {
              id: user._id,
            },
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.msg || "Failed to remove item");
        }

        // ✅ Update cart from backend response
        // setCart(data.cart.items);

        showToast("Item removed from cart");
      } catch (err) {
        console.error(err);
        showToast("Something went wrong");
      }
    },
    [showToast],
  );

  const toggleWishlist = useCallback(
    (id) => {
      setWishlist((prev) => {
        const updated = prev.includes(id)
          ? prev.filter((w) => w !== id)
          : [...prev, id];
        localStorage.setItem("sm_wishlist", JSON.stringify(updated));
        showToast(
          prev.includes(id)
            ? "💔 Removed from wishlist"
            : "❤️ Added to wishlist!",
        );
        return updated;
      });
    },
    [showToast],
  );

  const handleLogin = useCallback(
    (user) => {
      setCurrentUser(user);
      localStorage.setItem("sm_user", JSON.stringify(user));
      showToast(`Welcome back, ${user.name}!`);
      navigate(user.role === "vendor" ? "/dashboard" : "/");
    },
    [showToast, navigate],
  );

  const doLogout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem("sm_user");
    navigate("/");
    showToast("Signed out. See you soon!");
  }, [showToast, navigate]);

  const handlePlaceOrder = useCallback(
    (order) => {
      setOrders((prev) => {
        const updated = [order, ...prev];
        localStorage.setItem("sm_orders", JSON.stringify(updated));
        return updated;
      });
      setCart([]);
      localStorage.setItem("sm_cart", JSON.stringify([]));
      showToast('🎉 Order placed! Check "My Orders" for tracking.');
    },
    [showToast],
  );

  const handleSearch = useCallback(
    (q) => {
      setFilterCategory("");
      navigate("/shop", { state: { searchQuery: q } });
    },
    [navigate],
  );

  const handleCheckout = () => {
    if (!cart.length) {
      showToast("⚠️ Cart is empty!");
      return;
    }
    setCartOpen(false);
    navigate("/checkout");
  };

  const isLoginPage = location.pathname === "/login";

  return (
    <div className="bc-app">
      {!isLoginPage && (
        <Navbar
          cart={cart}
          wishlist={wishlist}
          currentUser={currentUser}
          openCart={() => setCartOpen(true)}
          onSearch={handleSearch}
          openLogin={() => navigate("/login")}
          doLogout={doLogout}
        />
      )}

      <CartPanel
        cart={cart}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        removeFromCart={removeFromCart}
        onCheckout={handleCheckout}
      />

      <Toast message={toast.msg} visible={toast.visible} />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              setFilterCategory={(cat) => {
                setFilterCategory(cat);
              }}
              cart={cart}
              wishlist={wishlist}
              onAddCart={addToCart}
              onToggleWish={toggleWishlist}
              categoryTiles={categoryTiles}
              allProducts={allProducts}
              loading={loading}
            />
          }
        />

        <Route
          path="/shop"
          element={
            <ShopPage
              cart={cart}
              wishlist={wishlist}
              onAddCart={addToCart}
              onToggleWish={toggleWishlist}
              allProducts={allProducts}
              WB_DISTRICTS={WB_DISTRICTS}
              // catOptions={catOptions}
            />
          }
        />
        <Route
          path="/product/:id"
          element={
            <ProductDetailPage
              cart={cart}
              wishlist={wishlist}
              onAddCart={addToCart}
              onToggleWish={toggleWishlist}
              openCart={() => setCartOpen(true)}
              setFilterCategory={setFilterCategory}
              allProducts={allProducts}
              // vendors={vendors}
            />
          }
        />
        <Route
          path="/wishlist"
          element={
            <WishlistPage
              wishlist={wishlist}
              cart={cart}
              onAddCart={addToCart}
              onToggleWish={toggleWishlist}
              onClearWishlist={() => {
                setWishlist([]);
                localStorage.setItem("sm_wishlist", "[]");
                showToast("Wishlist cleared");
              }}
              allProducts={allProducts}
            />
          }
        />
        <Route
          path="/checkout"
          element={<CheckoutPage cart={cart} onPlaceOrder={handlePlaceOrder} />}
        />
        <Route
          path="/orders"
          element={<OrdersPage userId={currentUser!==null?currentUser._id:null} />}
        />
        <Route
          path="/login"
          element={<LoginPage onLogin={handleLogin} showToast={showToast} />}
        />
        <Route
          path="/vendor"
          element={
            <VendorPage
              onShowToast={showToast}
              catOptions={catOptions}
              WB_DISTRICTS={WB_DISTRICTS}
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            <DashboardPage
              currentUser={currentUser}
              onShowToast={showToast}
              emojiOptions={emojiOptions}
              WB_DISTRICTS={WB_DISTRICTS}
            />
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route
          path="/contact"
          element={<ContactPage onShowToast={showToast} />}
        />
        {/* Fallback: redirect unknown paths to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
