// ─── Base URL ─────────────────────────────────────────────────────────────────
export const API = import.meta.env.VITE_API || "http://localhost:5000/api";

// ─── Product helper: transform raw server product to app shape ────────────────
export const transformProduct = (item) => ({
  id: item._id,
  name: item.name,
  vendor: item.vendor?.shopName || "Unknown Store",
  vendorId: item.vendor?._id,
  category: item.category?.name || "Uncategorized",
  price: item.price,
  original: item.orginalPrice,
  district: item.district?.replace("📍 ", "") || "",
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
});

// ─── Vendor helper ────────────────────────────────────────────────────────────
export const transformVendor = (v) => ({
  id: v._id,
  name: v.shopName,
  owner: v.name,
  district: v.address,
  rating: v.rating || 4.5,
  products: v.products?.length || 0,
  avatar: "🛍️",
  category: "Handmade",
});

// ─── Products ─────────────────────────────────────────────────────────────────
export const fetchAllProducts = async () => {
  const res = await fetch(`${API}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = await res.json();
  return data.map(transformProduct);
};

export const fetchVendorProducts = async (vendorId) => {
  const res = await fetch(`${API}/products/vendor/${vendorId}`);
  if (!res.ok) throw new Error("Failed to fetch vendor products");
  const data = await res.json();
  return data.map(transformProduct);
};

export const createProduct = async (formData) => {
  const res = await fetch(`${API}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create product");
  return data;
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const fetchAllCategories = async () => {
  const res = await fetch(`${API}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
};

// ─── Vendors ──────────────────────────────────────────────────────────────────
export const fetchAllVendors = async () => {
  const res = await fetch(`${API}/vendors`);
  if (!res.ok) throw new Error("Failed to fetch vendors");
  const data = await res.json();
  return data.vendors.map(transformVendor);
};

export const loginVendor = async (credentials) => {
  const res = await fetch(`${API}/vendors/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data;
};

export const registerVendor = async (vendorData) => {
  const res = await fetch(`${API}/vendors/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vendorData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Registration failed");
  return data;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const loginCustomer = async (credentials) => {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data;
};

export const registerCustomer = async (customerData) => {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customerData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Registration failed");
  return data;
};

// ─── Cart ─────────────────────────────────────────────────────────────────────
export const fetchCart = async (userId) => {
  const res = await fetch(`${API}/cart/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch cart");
  return res.json();
};

export const addToCartAPI = async (productId, userId) => {
  const res = await fetch(`${API}/cart/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity: 1, user: { id: userId } }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to add to cart");
  return data;
};

export const removeFromCartAPI = async (productId, userId) => {
  const res = await fetch(`${API}/cart/remove/${productId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: { id: userId } }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || "Failed to remove item");
  return data;
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const fetchUserOrders = async (userId) => {
  const res = await fetch(`${API}/orders/user/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
};

export const fetchVendorOrders = async (vendorId) => {
  const res = await fetch(`${API}/orders/vendor/${vendorId}`);
  if (!res.ok) throw new Error("Failed to fetch vendor orders");
  return res.json();
};

export const createOrder = async (orderData) => {
  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create order");
  return data;
};

// ─── Addresses ────────────────────────────────────────────────────────────────
export const fetchAddresses = async (userId) => {
  const res = await fetch(`${API}/addresses/my/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch addresses");
  return res.json();
};

export const createAddress = async (addressData) => {
  const res = await fetch(`${API}/addresses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(addressData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to add address");
  return data;
};

// ─── Payment ──────────────────────────────────────────────────────────────────
export const createPaymentOrder = async (orderId) => {
  const res = await fetch(`${API}/payment/create/${orderId}`, {
    method: "POST",
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to create payment");
  return data;
};

export const verifyPayment = async (paymentData) => {
  const res = await fetch(`${API}/payment/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paymentData),
  });
  return res.json();
};

export const failPayment = async (orderId) => {
  await fetch(`${API}/payment/failed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });
};
