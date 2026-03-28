import axios from 'axios';

const BASE_URL =  process.env.REACT_APP_API_URL|| 'https://api.bengalcreations.in/api';

const api = axios.create({ baseURL: BASE_URL });

// Fetch all cart entries
export const fetchCarts = async () => {
  const { data } = await api.get('/cart');
  return data;
};

// Fetch all orders (if endpoint exists)
export const fetchOrders = async () => {
  try {
    const { data } = await api.get('/orders');
    return data;
  } catch {
    return [];
  }
};

// Normalise a cart document into a unified "lead" shape used by the dashboard
export const normaliseCart = (cart) => {
  const customer = cart.customer || {};
  return {
    _id: cart._id,
    type: 'cart',
    orderId: cart._id,
    customer: {
      name: customer.name || 'Unknown',
      phone: customer.phone || '',
      email: customer.email || '',
    },
    items: (cart.items || []).map((i) => {
      const p = i.product || {};
      const v = p.vendor || {};
      return {
        productName: p.name || 'Product',
        price: i.price || p.price || 0,
        quantity: i.quantity || 1,
        vendorName: v.shopName || v.name || 'Vendor',
        vendorId: i.vendorId || v._id || '',
        district: p.district || '',
        images: p.images || [],
        description: p.description || '',
      };
    }),
    totalAmount: cart.totalAmount || 0,
    createdAt: cart.updatedAt,
    district: (() => {
      // Pick district from first item's product
      const first = cart.items?.[0]?.product;
      return first?.district || '';
    })(),
  };
};

// Normalise an order document into the same shape
export const normaliseOrder = (order) => {
  const customer = order.user || {};

  return {
    _id: order._id,
    type: "order",
    orderId: order._id,
    customer: {
      name: customer.name || "Unknown",
      phone: customer.phone || "",
      email: customer.email || "",
    },
    items: (order.items || []).map((i) => {
      const p = i.product || {};
      const v = i.vendor || {};

      return {
        productName: p.name || "Product",
        price: i.price || p.price || 0,
        quantity: i.quantity || 1,
        vendorName: v.shopName || "Vendor",
        vendorId: v._id || "",
        district: p.district || "",
        images: p.images || [],
        description: p.description || "",
      };
    }),
    totalAmount: order.totalAmount || 0,
    createdAt: order.createdAt,
    district: `${order?.address?.fullName},${order?.address?.area},${order?.address?.city},${order?.address?.pincode}` ||'',
  };
};
