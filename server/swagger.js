const swaggerAutogen = require("swagger-autogen")();
const path = require("path");

const doc = {
  info: {
    title: "Bengal Creations Marketplace API",
    description: "Complete REST API for a multi-vendor marketplace — vendors, products, categories, cart, orders, payments, wishlist, and addresses.",
    version: "1.0.0",
  },
  host: null,
  schemes: ["https", "http"],
  securityDefinitions: {
    BearerAuth: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description: "Enter your JWT token as: Bearer <token>",
    },
  },
  definitions: {
    // ── AUTH ──────────────────────────────────────────────
    CustomerRegisterBody: {
      name: "Jane Doe",
      email: "jane@example.com",
      password: "secret123",
      phone: "9876543210",
    },
    CustomerLoginBody: {
      email: "jane@example.com",
      password: "secret123",
    },
    CustomerLoginResponse: {
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      user: {
        _id: "64f1a2b3c4d5e6f7a8b9c0d1",
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "9876543210",
      },
    },

    // ── VENDOR ────────────────────────────────────────────
    VendorRegisterBody: {
      name: "Rahul Sharma",
      shopName: "Rahul Handicrafts",
      email: "rahul@shop.com",
      password: "pass1234",
      phone: "9123456789",
      address: "12 MG Road, Mumbai",
      description: "Handmade products from Maharashtra",
      logo: "https://res.cloudinary.com/demo/image/upload/logo.jpg",
      banner: "https://res.cloudinary.com/demo/image/upload/banner.jpg",
      tradeLicense: "https://res.cloudinary.com/demo/image/upload/tl.pdf",
      aadhaarCard: "https://res.cloudinary.com/demo/image/upload/aadhar.pdf",
      panCard: "https://res.cloudinary.com/demo/image/upload/pan.pdf",
    },
    VendorLoginBody: {
      email: "rahul@shop.com",
      password: "pass1234",
    },
    VendorLoginResponse: {
      success: true,
      msg: "Login successful",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      vendor: {
        vendorId: "VEND-20241A2B3C",
        name: "Rahul Sharma",
        shopName: "Rahul Handicrafts",
        email: "rahul@shop.com",
        isVerified: true,
      },
    },
    Vendor: {
      vendorId: "VEND-20241A2B3C",
      name: "Rahul Sharma",
      shopName: "Rahul Handicrafts",
      email: "rahul@shop.com",
      phone: "9123456789",
      address: "12 MG Road, Mumbai",
      description: "Handmade products from Maharashtra",
      logo: "https://res.cloudinary.com/demo/image/upload/logo.jpg",
      banner: "https://res.cloudinary.com/demo/image/upload/banner.jpg",
      isVerified: true,
      documents: {
        tradeLicense: "https://example.com/tl.pdf",
        aadhaarCard: "https://example.com/aadhar.pdf",
        panCard: "https://example.com/pan.pdf",
      },
      createdAt: "2024-01-15T10:30:00.000Z",
    },
    VendorAnalytics: {
      success: true,
      analytics: {
        totalVendors: 42,
        verified: 35,
        pending: 7,
        totalProducts: 210,
      },
    },

    // ── PRODUCT ───────────────────────────────────────────
    ProductBody: {
      name: "Handwoven Silk Saree",
      description: "Traditional Banarasi silk saree with golden zari work",
      price: 4500,
      originalPrice: 5500,
      stock: 20,
      district: "Varanasi",
      category: "64f1a2b3c4d5e6f7a8b9c0d2",
      vendor: "64f1a2b3c4d5e6f7a8b9c0d3",
      images: [
        "https://res.cloudinary.com/demo/image/upload/saree1.jpg",
        "https://res.cloudinary.com/demo/image/upload/saree2.jpg",
      ],
    },
    Product: {
      _id: "64f1a2b3c4d5e6f7a8b9c0d4",
      name: "Handwoven Silk Saree",
      description: "Traditional Banarasi silk saree",
      price: 4500,
      orginalPrice: 5500,
      stock: 20,
      district: "Varanasi",
      images: ["https://res.cloudinary.com/demo/image/upload/saree1.jpg"],
      category: { _id: "64f1a2b3c4d5e6f7a8b9c0d2", name: "Sarees" },
      vendor: { _id: "64f1a2b3c4d5e6f7a8b9c0d3", shopName: "Rahul Handicrafts" },
      isActive: true,
      createdAt: "2024-01-15T10:30:00.000Z",
    },
    BulkStockBody: {
      productIds: ["64f1a2b3c4d5e6f7a8b9c0d4", "64f1a2b3c4d5e6f7a8b9c0d5"],
      stock: 50,
    },

    // ── CATEGORY ──────────────────────────────────────────
    Category: {
      _id: "64f1a2b3c4d5e6f7a8b9c0d2",
      name: "Sarees",
      slug: "sarees",
      image: "https://res.cloudinary.com/demo/image/upload/sarees.jpg",
      parent: null,
      isActive: true,
    },

    // ── ORDER ─────────────────────────────────────────────
    CreateOrderBody: {
      user_id: "64f1a2b3c4d5e6f7a8b9c0d1",
      addressId: "64f1a2b3c4d5e6f7a8b9c0e1",
      PaymentMethod: "Online",
    },
    Order: {
      _id: "64f1a2b3c4d5e6f7a8b9c0f1",
      user: "64f1a2b3c4d5e6f7a8b9c0d1",
      items: [
        {
          product: { _id: "64f1a2b3c4d5e6f7a8b9c0d4", name: "Handwoven Silk Saree", price: 4500 },
          vendor: { _id: "64f1a2b3c4d5e6f7a8b9c0d3", shopName: "Rahul Handicrafts" },
          quantity: 1,
          price: 4500,
        },
      ],
      totalAmount: 4725,
      address: "64f1a2b3c4d5e6f7a8b9c0e1",
      paymentMethod: "Online",
      paymentStatus: "Pending",
      status: "Pending",
      createdAt: "2024-01-15T10:30:00.000Z",
    },
    UpdateStatusBody: {
      status: "Shipped",
    },
    UpdatePaymentStatusBody: {
      paymentStatus: "Paid",
    },

    // ── CART ──────────────────────────────────────────────
    AddToCartBody: {
      productId: "64f1a2b3c4d5e6f7a8b9c0d4",
      quantity: 2,
      user: { id: "64f1a2b3c4d5e6f7a8b9c0d1" },
    },
    Cart: {
      _id: "64f1a2b3c4d5e6f7a8b9c0a1",
      customer: "64f1a2b3c4d5e6f7a8b9c0d1",
      items: [
        {
          product: "64f1a2b3c4d5e6f7a8b9c0d4",
          vendorId: "64f1a2b3c4d5e6f7a8b9c0d3",
          quantity: 2,
          price: 4500,
        },
      ],
      totalAmount: 9000,
    },

    // ── ADDRESS ───────────────────────────────────────────
    AddressBody: {
      customer: "64f1a2b3c4d5e6f7a8b9c0d1",
      fullName: "Jane Doe",
      phone: "9876543210",
      pincode: "110001",
      state: "Delhi",
      city: "New Delhi",
      area: "Connaught Place",
      houseNo: "Flat 101, Block A",
      landmark: "Near Metro Station",
    },
    Address: {
      _id: "64f1a2b3c4d5e6f7a8b9c0e1",
      customer: "64f1a2b3c4d5e6f7a8b9c0d1",
      fullName: "Jane Doe",
      phone: "9876543210",
      pincode: "110001",
      state: "Delhi",
      city: "New Delhi",
      area: "Connaught Place",
      houseNo: "Flat 101, Block A",
      landmark: "Near Metro Station",
    },

    // ── PAYMENT ───────────────────────────────────────────
    PaymentOrderResponse: {
      success: true,
      key: "rzp_live_xxxxxxxxxxxx",
      razorOrder: {
        id: "order_Mxxxxxxxxxx",
        entity: "order",
        amount: 472500,
        currency: "INR",
        status: "created",
      },
    },
    VerifyPaymentBody: {
      razorpay_order_id: "order_Mxxxxxxxxxx",
      razorpay_payment_id: "pay_Nxxxxxxxxxx",
      razorpay_signature: "abc123signature",
      orderId: "64f1a2b3c4d5e6f7a8b9c0f1",
    },
    RefundBody: {
      amount: 4500,
    },

    // ── GENERIC ───────────────────────────────────────────
    SuccessMessage: {
      success: true,
      msg: "Operation successful",
    },
    ErrorResponse: {
      success: false,
      error: "Error description",
    },
    PaginatedVendors: {
      success: true,
      vendors: [],
      pagination: {
        total: 42,
        page: 1,
        limit: 10,
        pages: 5,
      },
    },
  },
};

const outputFile = path.join(__dirname, "swagger-output.json");
const endpointsFiles = [path.join(__dirname, "server.js")];

swaggerAutogen(outputFile, endpointsFiles, doc);
