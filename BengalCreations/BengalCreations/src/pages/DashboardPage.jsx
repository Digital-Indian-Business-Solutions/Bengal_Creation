import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { uploadImage } from "../utils/cloudinary";
import { fetchPlatformSettings } from "../api/api";
import {
  fetchVendorProducts,
  fetchVendorOrders,
  fetchAllCategories,
  createProduct,
  updateProduct,
  deleteProduct as deleteProductAPI,
  fetchRefundRequests,
  processRefund,
  fetchOrderReport,
} from "../api/api";

/* ─── Helper to safely resolve product image URL ────── */
const getProductImg = (p) => {
  if (!p) return null;
  if (typeof p.thumb === "string" && p.thumb.length > 0) return p.thumb;
  if (Array.isArray(p.images) && p.images.length > 0) {
    const first = p.images[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && first.url) return first.url;
  }
  if (typeof p.images === "string") return p.images;
  return null;
};

/* ─── Sidebar navigation items ──────────────────────── */
const NAV_ITEMS = [
  { id: "dashboard",  icon: "▪",  label: "Dashboard"   },
  { id: "myproducts", icon: "📦", label: "Products"     },
  { id: "addproduct", icon: "➕", label: "Add Product"  },
  { id: "orders",     icon: "🛒", label: "Orders"       },
  { id: "reports",    icon: "📊", label: "Reports"      },
  { id: "refunds",    icon: "🔄", label: "Refunds"      },
  { id: "messages",   icon: "💬", label: "Messages"     },
  { id: "settings",   icon: "⚙️", label: "Settings"     },
];

/* ─── Status badge colours ───────────────────────────── */
const STATUS_COLOR = {
  delivered:  { bg: "#dcfce7", color: "#16a34a" },
  Delivered:  { bg: "#dcfce7", color: "#16a34a" },
  shipped:    { bg: "#dbeafe", color: "#2563eb" },
  Shipped:    { bg: "#dbeafe", color: "#2563eb" },
  pending:    { bg: "#fef9c3", color: "#ca8a04" },
  Pending:    { bg: "#fef9c3", color: "#ca8a04" },
  cancelled:  { bg: "#fee2e2", color: "#dc2626" },
  Cancelled:  { bg: "#fee2e2", color: "#dc2626" },
  processing: { bg: "#ede9fe", color: "#7c3aed" },
  Processing: { bg: "#ede9fe", color: "#7c3aed" },
  Requested:  { bg: "#fef9c3", color: "#ca8a04" },
  Processed:  { bg: "#dcfce7", color: "#16a34a" },
  Rejected:   { bg: "#fee2e2", color: "#dc2626" },
  Paid:       { bg: "#dcfce7", color: "#16a34a" },
};

function StatusBadge({ status }) {
  const s = STATUS_COLOR[status] || { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════
   DASHBOARD PAGE — Vendor Management Hub
   ═══════════════════════════════════════════════════════ */
function DashboardPage({ currentUser, onShowToast, WB_DISTRICTS }) {
  const navigate = useNavigate();

  /* ─── State ─────────────────────────────────────────── */
  const [activeTab, setActiveTab]     = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [dashProducts, setDashProducts] = useState([]);
  const [catOptions, setCatOptions]     = useState([]);
  const [orders, setOrders]             = useState([]);
  const [rawOrders, setRawOrders]       = useState([]);
  const [refunds, setRefunds]           = useState([]);
  const [adminNote, setAdminNote]       = useState("");

  /* Images state: images[0] = Main Cover Photo, images[1..4] = Side Photos */
  const [images, setImages]         = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [hoverImg, setHoverImg]     = useState(null);
  const [selectedEmoji, setSelectedEmoji] = useState("🥻");
  const [selectedCat, setSelectedCat]     = useState(null);
  const [editIdx, setEditIdx]             = useState(null);
  const [form, setForm] = useState({ name: "", price: "", originPrice: "", stock: "", district: "", desc: "" });
  const [bulletPoints, setBulletPoints] = useState([""]);

  const [reportData, setReportData]       = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportRange, setReportRange]     = useState({ startDate: "", endDate: "" });

  const totalRevenue = orders.reduce((sum, o) => sum + (o?.amount || 0), 0);

  /* ─── Fetch data ────────────────────────────────────── */
  useEffect(() => {
    if (!currentUser?._id) return;

    fetchVendorProducts(currentUser._id).then(setDashProducts).catch(console.error);

    fetchAllCategories().then((data) => {
      setCatOptions(data);
      if (data.length > 0) setSelectedCat(data[0]);
    }).catch(console.error);

    fetchVendorOrders(currentUser._id).then((data) => {
      setRawOrders(data);
      setOrders(data.map((order) => {
        const prod = order.items?.[0]?.product;
        return {
          id:         order._id,
          product:    prod?.name || "Product",
          productImg: getProductImg(prod),
          itemCount:  order.items?.length || 1,
          customer:   order.user?.name || "Customer",
          amount:     order.totalAmount,
          date:       new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
          status:     order.status,
        };
      }));
    }).catch(console.error);

    fetchPlatformSettings().then(s => setAdminNote(s.adminNote || "")).catch(() => {});
    fetchRefundRequests(currentUser._id).then((d) => setRefunds(d.refunds || [])).catch(console.error);
  }, [currentUser]);

  /* Calculate order stats for a specific product */
  const getProductOrderStats = useCallback((p) => {
    const pId = p._id || p.id;
    if (!rawOrders || !rawOrders.length) return { ordersCount: 0, itemsSold: 0 };
    let ordersCount = 0;
    let itemsSold = 0;
    rawOrders.forEach((order) => {
      let countInThisOrder = 0;
      (order.items || []).forEach((item) => {
        const itemProdId = item.product?._id || item.product?.id || item.product;
        if (itemProdId === pId) {
          countInThisOrder += (item.quantity || 1);
        }
      });
      if (countInThisOrder > 0) {
        ordersCount += 1;
        itemsSold += countInThisOrder;
      }
    });
    return { ordersCount, itemsSold };
  }, [rawOrders]);

  /* ─── Helpers ───────────────────────────────────────── */
  const navTo = (tab) => { setActiveTab(tab); setSidebarOpen(false); };

  const handleBulletChange = (idx, val) => {
    setBulletPoints((prev) => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  const addBulletPoint = () => {
    if (bulletPoints.length < 4) {
      setBulletPoints((prev) => [...prev, ""]);
    }
  };

  const removeBulletPoint = (idx) => {
    setBulletPoints((prev) => prev.filter((_, i) => i !== idx));
  };

  const resetForm = useCallback(() => {
    setForm({ name: "", price: "", originPrice: "", stock: "", district: "", desc: "" });
    setBulletPoints([""]);
    setSelectedEmoji("🥻");
    if (catOptions.length > 0) setSelectedCat(catOptions[0]);
    setEditIdx(null); setImages([]); setImageFiles([]);
  }, [catOptions]);

  /* Set main photo */
  const setMainPhoto = (idx) => {
    if (idx === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(idx, 1);
      return [selected, ...copy];
    });
    setImageFiles((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(idx, 1);
      return [selected, ...copy];
    });
  };

  /* Remove photo */
  const removePhoto = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  /* Add main cover photo */
  const handleMainPhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImages((prev) => [url, ...prev.slice(1)]);
    setImageFiles((prev) => [file, ...prev.slice(1)]);
  };

  /* Add side photos */
  const handleSidePhotosSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const availableSlots = 5 - images.length;
    const newFiles = files.slice(0, availableSlots);
    const newUrls = newFiles.map((f) => URL.createObjectURL(f));

    if (images.length === 0) {
      setImages(newUrls);
      setImageFiles(newFiles);
    } else {
      setImages((prev) => [...prev, ...newUrls]);
      setImageFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const saveProduct = async () => {
    if (!form.name)     { onShowToast("⚠️ Enter product name"); return; }
    if (!form.price)    { onShowToast("⚠️ Enter price"); return; }
    if (!form.stock)    { onShowToast("⚠️ Enter stock"); return; }
    if (!form.district) { onShowToast("⚠️ Select district"); return; }
    if (images.length < 1 || !images[0]) { onShowToast("⚠️ Upload at least 1 Main Cover Photo."); return; }
    if (images.length > 5) { onShowToast("⚠️ Max 5 images allowed (1 Main + 4 Side photos)."); return; }

    try {
      const imageUrls = [];
      for (let i = 0; i < imageFiles.length; i++) {
        const item = imageFiles[i];
        if (item instanceof File) {
          const uploadedUrl = await uploadImage(item);
          imageUrls.push(uploadedUrl);
        } else if (typeof item === "string" && item.length > 0) {
          imageUrls.push(item);
        } else if (typeof images[i] === "string" && images[i].length > 0) {
          imageUrls.push(images[i]);
        }
      }

      const validBullets = bulletPoints.map((b) => b.trim()).filter(Boolean);
      let finalDesc = form.desc.trim();
      if (validBullets.length > 0) {
        const bulletText = validBullets.map((b) => `• ${b}`).join("\n");
        finalDesc = finalDesc ? `${finalDesc}\n\nKey Highlights:\n${bulletText}` : bulletText;
      }

      const productPayload = {
        name: form.name,
        price: form.price,
        originalPrice: form.originPrice,
        stock: form.stock,
        category: selectedCat?._id || selectedCat,
        district: form.district,
        description: finalDesc,
        vendor: currentUser._id,
        images: imageUrls,
      };

      if (editIdx !== null && dashProducts[editIdx]) {
        const pId = dashProducts[editIdx]._id || dashProducts[editIdx].id;
        await updateProduct(pId, productPayload);
        onShowToast("✅ Product updated successfully!");
      } else {
        await createProduct(productPayload);
        onShowToast("✅ Product published successfully!");
      }

      fetchVendorProducts(currentUser._id).then(setDashProducts).catch(console.error);
    } catch (err) {
      console.error("Error saving product:", err);
      onShowToast("⚠️ Something went wrong. Please try again.");
    } finally { resetForm(); navTo("myproducts"); }
  };

  const deleteProduct = useCallback(async (i) => {
    const targetProduct = dashProducts[i];
    if (!targetProduct) return;
    const pId = targetProduct._id || targetProduct.id;
    if (window.confirm("Remove this product?")) {
      try {
        if (pId) {
          await deleteProductAPI(pId);
        }
        setDashProducts((prev) => prev.filter((_, idx) => idx !== i));
        onShowToast("🗑️ Product removed.");
      } catch (err) {
        console.error(err);
        onShowToast("⚠️ Failed to delete product from database.");
      }
    }
  }, [dashProducts, onShowToast]);

  const editProduct = useCallback((i) => {
    const p = dashProducts[i];
    const fullDesc = p.description || p.desc || "";
    const lines = fullDesc.split("\n");
    const parsedBullets = [];
    const mainDescLines = [];

    lines.forEach((l) => {
      const trimmed = l.trim();
      if (trimmed.startsWith("• ")) {
        parsedBullets.push(trimmed.slice(2));
      } else if (trimmed.startsWith("•")) {
        parsedBullets.push(trimmed.slice(1).trim());
      } else {
        mainDescLines.push(l);
      }
    });

    setForm({ name: p.name, price: p.price, originPrice: p.original || "", stock: p.stock, district: p.district || "", desc: mainDescLines.join("\n").trim() });
    setBulletPoints(parsedBullets.length > 0 ? parsedBullets.slice(0, 4) : [""]);
    setSelectedEmoji(p.emoji);
    setSelectedCat(p.category);
    setEditIdx(i);

    const existingImgs = (p.images || []).map((img) => typeof img === "string" ? img : img.url).filter(Boolean);
    if (p.thumb && !existingImgs.includes(p.thumb)) existingImgs.unshift(p.thumb);
    setImages(existingImgs);
    setImageFiles(existingImgs);

    navTo("addproduct");
  }, [dashProducts]);

  const loadReport = useCallback(async () => {
    if (!currentUser?._id) return;
    setReportLoading(true);
    try {
      const data = await fetchOrderReport({ vendorId: currentUser._id, startDate: reportRange.startDate, endDate: reportRange.endDate });
      setReportData(data);
    } catch (err) { console.error(err); }
    finally { setReportLoading(false); }
  }, [currentUser, reportRange]);

  const handleRefundAction = async (orderId, action) => {
    try {
      await processRefund({ orderId, action });
      setRefunds((prev) => prev.map((r) => r._id === orderId ? { ...r, refundStatus: action === "approve" ? "Processed" : "Rejected" } : r));
    } catch (err) { alert("Failed: " + err.message); }
  };

  /* ═══════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════ */
  return (
    <div className="dp-layout">

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className={`dp-sidebar ${sidebarOpen ? "dp-sidebar--open" : ""}`}>
        <div className="dp-sidebar-logo" onClick={() => navigate("/")}>
          <div className="dp-sidebar-logo-icon">🪷</div>
          <div>
            <div className="dp-sidebar-logo-title">Bengal Creations</div>
            <div className="dp-sidebar-logo-sub">HERITAGE HANDCRAFTED</div>
          </div>
        </div>

        <nav className="dp-sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`dp-nav-item ${activeTab === item.id ? "dp-nav-item--active" : ""}`}
              onClick={() => navTo(item.id)}
            >
              <span className="dp-nav-icon">{item.icon}</span>
              <span className="dp-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="dp-upgrade-box">
          <div className="dp-upgrade-title">Grow Your Business</div>
          <p className="dp-upgrade-desc">Upgrade to premium and unlock more features.</p>
          <button className="dp-upgrade-btn">⭐ Upgrade Now</button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────── */}
      <div className="dp-main">

        {/* Hero Banner / Navbar */}
        <div className="dp-hero">
          <button className="dp-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <div className="dp-hero-text">
            <div className="dp-hero-welcome">Welcome back,</div>
            <h1 className="dp-hero-title">
              {currentUser?.shopName || "My Store"} <span className="dp-hero-verified">✓</span>
            </h1>
            <p className="dp-hero-sub">📍 {currentUser?.address || "West Bengal, India"}</p>
          </div>
          <button className="dp-hero-cta" onClick={() => { resetForm(); navTo("addproduct"); }}>
            + Add New Product
          </button>
        </div>

        {/* Admin Note */}
        {adminNote && (
          <div className="dp-admin-note">
            <span style={{ fontSize: 18 }}>📣</span>
            <div>
              <div className="dp-admin-note-title">Admin Notice</div>
              <div className="dp-admin-note-body">{adminNote}</div>
            </div>
          </div>
        )}

        {/* ══════════════ DASHBOARD OVERVIEW ══════════════ */}
        {activeTab === "dashboard" && (
          <>
            {/* ── Stat Cards ───────────────────────────────── */}
            <div className="dp-stats-grid">
              {[
                { icon: "₹",  label: "Total Revenue",  value: `₹${totalRevenue.toLocaleString()}`, sub: "-- this month",        color: "#e85d7a" },
                { icon: "📦", label: "Total Products", value: dashProducts.length,                 sub: `${dashProducts.length} Active`, color: "#f5a623" },
                { icon: "🛒", label: "Total Orders",   value: orders.length,                       sub: "-- this month",        color: "#27ae60" },
                { icon: "⭐", label: "Shop Rating",    value: "4.8",                               sub: "Based on 24 reviews",  color: "#9b59b6" },
              ].map((s) => (
                <div className="dp-stat-card" key={s.label}>
                  <div className="dp-stat-icon-wrap" style={{ background: s.color + "22", border: `1.5px solid ${s.color}55` }}>
                    <span className="dp-stat-icon">{s.icon}</span>
                  </div>
                  <div>
                    <div className="dp-stat-label">{s.label}</div>
                    <div className="dp-stat-value">{s.value}</div>
                    <div className="dp-stat-sub">{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="dp-content-grid">
              {/* Products preview */}
              <div className="dp-card">
                <div className="dp-card-header">
                  <h2 className="dp-card-title">My Products</h2>
                  <button className="dp-card-link" onClick={() => navTo("myproducts")}>View All →</button>
                </div>
                {!dashProducts.length ? (
                  <div className="dp-empty">
                    <div style={{ fontSize: 40 }}>📦</div>
                    <p>No products yet. <button className="dp-card-link" onClick={() => navTo("addproduct")}>Add one!</button></p>
                  </div>
                ) : (
                  <div className="dp-products-mini">
                    {dashProducts.slice(0, 4).map((p, i) => {
                      const imgUrl = getProductImg(p);
                      const { ordersCount } = getProductOrderStats(p);
                      return (
                        <div className="dp-product-mini-card" key={p._id || p.id || i}>
                          <div className="dp-product-mini-img">
                            {imgUrl ? <img src={imgUrl} alt={p.name} /> : <span style={{ fontSize: 36 }}>{p.emoji || "📦"}</span>}
                            <span className={`dp-stock-badge ${p.stock < 5 ? "dp-stock-badge--low" : ""}`}>
                              {p.stock < 5 ? "⚠ Low" : "✓ In Stock"}
                            </span>
                          </div>
                          <div className="dp-product-mini-body">
                            <div className="dp-product-mini-name">{p.name}</div>
                            <div className="dp-product-mini-desc">{(p.description || p.desc || "").slice(0, 50)}…</div>
                            <div className="dp-product-mini-footer">
                              <span className="dp-product-mini-price">₹{Number(p.price).toLocaleString()}</span>
                              <span className="dp-product-mini-stock" style={{ fontWeight: 600, color: "#7a1c2e" }}>
                                📦 Stock: {p.stock} · 🛒 Orders: {ordersCount}
                              </span>
                            </div>
                            <div className="dp-product-mini-actions">
                              <button className="dp-btn-edit" onClick={() => editProduct(i)}>✏ Edit</button>
                              <button className="dp-btn-delete" onClick={() => deleteProduct(i)}>🗑</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recent Orders preview */}
              <div className="dp-card">
                <div className="dp-card-header">
                  <h2 className="dp-card-title">Recent Orders</h2>
                  <button className="dp-card-link" onClick={() => navTo("orders")}>View All →</button>
                </div>
                {!orders.length ? (
                  <div className="dp-empty"><div style={{ fontSize: 40 }}>🛒</div><p>No orders yet.</p></div>
                ) : (
                  <div className="dp-orders-mini">
                    {orders.slice(0, 5).map((o) => (
                      <div className="dp-order-mini-row" key={o.id}>
                        <div className="dp-order-mini-img">
                          {o.productImg ? <img src={o.productImg} alt="" /> : <span>🛍</span>}
                        </div>
                        <div className="dp-order-mini-id">#{o.id?.slice(-8).toUpperCase()}</div>
                        <div className="dp-order-mini-customer">{o.customer}</div>
                        <div className="dp-order-mini-items">{o.itemCount} {o.itemCount === 1 ? "Item" : "Items"}</div>
                        <div className="dp-order-mini-amount">₹{o.amount?.toLocaleString()}</div>
                        <StatusBadge status={o.status} />
                        <div className="dp-order-mini-date">{o.date}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ══════════════ MY PRODUCTS (ROW LIST) ══════════════ */}
        {activeTab === "myproducts" && (
          <div className="dp-tab-wrap">
            <div className="dp-card">
              <div className="dp-card-header">
                <div>
                  <h2 className="dp-card-title">My Products</h2>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                    Manage product inventory, prices, and view order analytics
                  </div>
                </div>
                <button className="dp-hero-cta" style={{ fontSize: 13, padding: "10px 18px" }} onClick={() => { resetForm(); navTo("addproduct"); }}>
                  + Add New Product
                </button>
              </div>
              {!dashProducts.length ? (
                <div className="dp-empty"><div style={{ fontSize: 60 }}>📦</div><p>No products yet. Click "Add Product" to start!</p></div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="dp-table">
                    <thead>
                      <tr>
                        <th style={{ width: "36%" }}>Product Details</th>
                        <th style={{ width: "18%" }}>Category & Location</th>
                        <th style={{ width: "10%" }}>Price</th>
                        <th style={{ width: "12%" }}>Stock Level</th>
                        <th style={{ width: "12%" }}>Total Orders</th>
                        <th style={{ width: "8%" }}>Status</th>
                        <th style={{ width: "14%", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashProducts.map((p, i) => {
                        const imgUrl = getProductImg(p);
                        const { ordersCount, itemsSold } = getProductOrderStats(p);
                        const pId = p._id || p.id;
                        return (
                          <tr key={pId || i} style={{ background: i % 2 === 0 ? "white" : "#fafbff" }}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 56, height: 56, borderRadius: 10, overflow: "hidden", background: "#f8fafd", border: "1px solid #e2e6f0", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  {imgUrl ? (
                                    <img src={imgUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 2 }} />
                                  ) : (
                                    <span style={{ fontSize: 24 }}>{p.emoji || "📦"}</span>
                                  )}
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b", lineHeight: 1.35 }} title={p.name}>
                                    {p.name}
                                  </div>
                                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>ID: #{pId?.slice(-6).toUpperCase()}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>{p.category?.name || p.category || "General"}</div>
                              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>📍 {p.district || "West Bengal"}</div>
                            </td>
                            <td>
                              <div style={{ fontSize: 14, fontWeight: 700, color: "#16a34a" }}>₹{Number(p.price).toLocaleString()}</div>
                              {p.originalPrice && <div style={{ fontSize: 11, color: "#94a3b8", textDecoration: "line-through" }}>₹{Number(p.originalPrice).toLocaleString()}</div>}
                            </td>
                            <td>
                              <div style={{ fontSize: 13, fontWeight: 700, color: p.stock < 5 ? "#dc2626" : "#1e293b" }}>{p.stock} units</div>
                              <div style={{ fontSize: 11, fontWeight: 600, color: p.stock < 5 ? "#dc2626" : "#16a34a" }}>
                                {p.stock < 5 ? "⚠️ Low Stock" : "In Stock"}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#7a1c2e" }}>{ordersCount} {ordersCount === 1 ? "Order" : "Orders"}</div>
                              <div style={{ fontSize: 11, color: "#64748b" }}>({itemsSold} items sold)</div>
                            </td>
                            <td>
                              <span className={`dp-stock-badge ${p.stock < 5 ? "dp-stock-badge--low" : ""}`}>
                                {p.stock < 5 ? "⚠️ Low" : "✓ Active"}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                <button className="dp-btn-edit" onClick={() => editProduct(i)}>✏ Edit</button>
                                <button className="dp-btn-delete" onClick={() => deleteProduct(i)}>🗑</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════ ADD / EDIT PRODUCT ══════════════ */}
        {activeTab === "addproduct" && (
          <div className="dp-tab-wrap">
            <div className="dp-card">
              <div className="dp-card-header">
                <h2 className="dp-card-title">{editIdx !== null ? "✏️ Edit Product" : "➕ Add New Product"}</h2>
                <button className="dp-card-link" onClick={() => navTo("myproducts")}>← Back to Products</button>
              </div>
              <div className="dp-add-grid">
                {/* Left side */}
                <div className="dp-add-left">
                  {/* Photo Uploader Section */}
                  <div className="dp-form-section">
                    <div className="dp-form-section-title">📸 Product Photos (1 Main + Side Views)</div>
                    
                    {/* Main Cover Photo Uploader */}
                    <div style={{ marginBottom: 16 }}>
                      <div className="dp-label" style={{ fontWeight: 700, color: "#7a1c2e" }}>
                        ⭐ Main Cover Photo (Required)
                      </div>
                      {images[0] ? (
                        <div style={{ position: "relative", width: 140, height: 140, borderRadius: 12, overflow: "hidden", border: "2.5px solid #c8922a", boxShadow: "0 3px 10px rgba(200,146,42,0.3)" }}>
                          <img src={images[0]} alt="Main cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <span style={{ position: "absolute", top: 6, left: 6, background: "#c8922a", color: "#2a1a12", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 6 }}>
                            ⭐ MAIN PHOTO
                          </span>
                          <button
                            onClick={() => removePhoto(0)}
                            style={{ position: "absolute", top: 6, right: 6, background: "rgba(122,28,46,0.9)", color: "white", border: "none", borderRadius: 6, width: 22, height: 22, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            title="Remove main photo"
                          >✕</button>
                        </div>
                      ) : (
                        <label className="dp-upload-area" style={{ padding: 20, textAlign: "center", cursor: "pointer" }}>
                          <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleMainPhotoSelect} />
                          <div style={{ fontSize: 32, marginBottom: 4 }}>📷</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#7a1c2e" }}>Click to Upload Main Cover Photo</div>
                          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>This will be displayed as the primary thumbnail</div>
                        </label>
                      )}
                    </div>

                    {/* Side / Angle Photos Uploader */}
                    <div>
                      <div className="dp-label" style={{ fontWeight: 700, color: "#475569" }}>
                        🖼️ Side / Angle Photos (Optional - Max 4)
                      </div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
                        {images.slice(1).map((img, i) => {
                          const realIdx = i + 1;
                          return (
                            <div key={realIdx} style={{ position: "relative", width: 90, height: 90, borderRadius: 10, overflow: "hidden", border: "1.5px solid #e2e6f0" }} onMouseEnter={() => setHoverImg(img)} onMouseLeave={() => setHoverImg(null)}>
                              <img src={img} alt={`Side ${realIdx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              <span style={{ position: "absolute", top: 4, left: 4, background: "rgba(0,0,0,0.6)", color: "white", fontSize: 9, padding: "1px 5px", borderRadius: 4 }}>
                                Side {realIdx}
                              </span>
                              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "space-between", padding: "2px 4px" }}>
                                <button onClick={() => setMainPhoto(realIdx)} style={{ background: "none", border: "none", color: "#e5b84a", fontSize: 10, cursor: "pointer", fontWeight: 700 }} title="Set as Main Cover">⭐ Main</button>
                                <button onClick={() => removePhoto(realIdx)} style={{ background: "none", border: "none", color: "#ff6b6b", fontSize: 11, cursor: "pointer" }} title="Remove photo">✕</button>
                              </div>
                            </div>
                          );
                        })}

                        {images.length < 5 && (
                          <label style={{ width: 90, height: 90, borderRadius: 10, border: "2px dashed #cbd5e1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#f8fafd", transition: "border-color 0.2s" }}>
                            <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={handleSidePhotosSelect} />
                            <span style={{ fontSize: 22, color: "#64748b" }}>+</span>
                            <span style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>Add Side</span>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="dp-form-section">
                    <div className="dp-form-section-title">Product Name *</div>
                    <input className="dp-input" placeholder="e.g. Handmade Terracotta Horse" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>

                  <div className="dp-form-section">
                    <div className="dp-form-section-title">Price & Stock *</div>
                    <div className="dp-form-row3">
                      {[["price","💰 Selling Price (₹)","e.g. 1200"],["originPrice","💰 Original Price (₹)","e.g. 1500"],["stock","📦 Units in Stock","e.g. 10"]].map(([key,label,ph]) => (
                        <div key={key}>
                          <label className="dp-label">{label}</label>
                          <input className="dp-input" type="number" placeholder={ph} value={form[key]} onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="dp-form-section">
                    <div className="dp-form-section-title">District *</div>
                    <select className="dp-input" value={form.district} onChange={(e) => setForm(f => ({ ...f, district: e.target.value }))}>
                      <option value="">Select your district</option>
                      {Array.isArray(WB_DISTRICTS) && WB_DISTRICTS.map((d) => <option key={d}>📍 {d}</option>)}
                    </select>
                  </div>

                  <div className="dp-form-section">
                    <div className="dp-form-section-title">Description</div>
                    <textarea className="dp-input dp-textarea" rows={3} placeholder="Describe your product…" value={form.desc} onChange={(e) => setForm(f => ({ ...f, desc: e.target.value }))} />
                  </div>

                  <div className="dp-form-section">
                    <div className="dp-form-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>📌 Product Highlights / Bullet Points (Max 4)</span>
                      <span style={{ fontSize: 11, color: "#64748b", fontWeight: "normal" }}>
                        {bulletPoints.length}/4 Points
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                      {bulletPoints.map((pt, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 16, color: "#7a1c2e", fontWeight: "bold" }}>•</span>
                          <input
                            className="dp-input"
                            style={{ flex: 1 }}
                            placeholder={`Bullet point ${idx + 1} (e.g. Premium Handwoven Fabric)`}
                            value={pt}
                            onChange={(e) => handleBulletChange(idx, e.target.value)}
                          />
                          {bulletPoints.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBulletPoint(idx)}
                              style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, width: 34, height: 36, cursor: "pointer", fontSize: 14, fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }}
                              title="Remove bullet point"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {bulletPoints.length < 4 && (
                      <button
                        type="button"
                        onClick={addBulletPoint}
                        style={{
                          marginTop: 10,
                          background: "#f1f5f9",
                          color: "#334155",
                          border: "1px dashed #cbd5e1",
                          padding: "8px 14px",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        ➕ Add Extra Point ({4 - bulletPoints.length} remaining)
                      </button>
                    )}
                  </div>

                  <button className="dp-submit-btn" onClick={saveProduct}>
                    {editIdx !== null ? "💾 Save Changes" : "🚀 Publish Product"}
                  </button>
                </div>

                {/* Right – Category + Live Preview */}
                <div className="dp-add-right">
                  <div className="dp-form-section">
                    <div className="dp-form-section-title">Category *</div>
                    <div className="dp-cat-grid">
                      {Array.isArray(catOptions) && catOptions.map((c) => (
                        <div key={c._id} className={`dp-cat-tile ${selectedCat?._id === c._id ? "dp-cat-tile--active" : ""}`} onClick={() => setSelectedCat(c)}>
                          <div style={{ fontSize: 22, marginBottom: 4 }}>{c.emoji}</div>
                          <div style={{ fontSize: 11, fontWeight: 600 }}>{c.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="dp-form-section" style={{ position: "sticky", top: 16 }}>
                    <div className="dp-form-section-title">Live Preview</div>
                    <div className="dp-preview-card">
                      <div className="dp-preview-img">
                        {images.length ? <img src={hoverImg || images[0]} alt="preview" /> : <span style={{ fontSize: 72 }}>{selectedEmoji}</span>}
                      </div>
                      <div className="dp-preview-body">
                        <div className="dp-preview-cat">{selectedCat?.name}</div>
                        <div className="dp-preview-name">{form.name || "Your product name…"}</div>
                        <div className="dp-preview-price">{form.price ? `₹${parseInt(form.price).toLocaleString()}` : "₹ —"}</div>
                        {form.stock && <div className="dp-preview-stock">📦 {form.stock} in stock</div>}
                        {form.district && <div className="dp-preview-stock">📍 {form.district}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ ORDERS ══════════════ */}
        {activeTab === "orders" && (
          <div className="dp-tab-wrap">
            <div className="dp-card">
              <div className="dp-card-header">
                <h2 className="dp-card-title">All Orders</h2>
                <span className="dp-badge-count">{orders.length} orders</span>
              </div>
              {!orders.length ? (
                <div className="dp-empty"><div style={{ fontSize: 60 }}>🛒</div><p>No orders yet.</p></div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="dp-table">
                    <thead>
                      <tr>{["Order ID","Product","Customer","Amount","Date","Status"].map(h => <th key={h}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {orders.map((o, i) => (
                        <tr key={o.id} style={{ background: i % 2 === 0 ? "white" : "#fafbff" }}>
                          <td className="dp-td-id">#{o.id?.slice(-8).toUpperCase()}</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div className="dp-order-img-sm">{o.productImg ? <img src={o.productImg} alt="" /> : "🛍"}</div>
                              <span style={{ fontSize: 13 }}>{o.product}</span>
                            </div>
                          </td>
                          <td style={{ fontSize: 13 }}>{o.customer}</td>
                          <td style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}>₹{o.amount?.toLocaleString()}</td>
                          <td style={{ fontSize: 12, color: "#94a3b8" }}>{o.date}</td>
                          <td><StatusBadge status={o.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════ REPORTS ══════════════ */}
        {activeTab === "reports" && (
          <div className="dp-tab-wrap">
            <div className="dp-card">
              <div className="dp-card-header">
                <h2 className="dp-card-title">📊 Order Reports</h2>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24, alignItems: "flex-end" }}>
                {[["From","startDate"],["To","endDate"]].map(([label,key]) => (
                  <div key={key}>
                    <label className="dp-label">{label}</label>
                    <input type="date" className="dp-input" style={{ width: "auto" }} value={reportRange[key]} onChange={(e) => setReportRange(r => ({ ...r, [key]: e.target.value }))} />
                  </div>
                ))}
                <button className="dp-submit-btn" style={{ padding: "11px 24px" }} onClick={loadReport} disabled={reportLoading}>
                  {reportLoading ? "Loading…" : "Generate Report"}
                </button>
              </div>
              {reportData ? (
                <>
                  <div className="dp-stats-grid" style={{ marginBottom: 24 }}>
                    {[
                      { icon: "📋", label: "Total Orders",   value: reportData.totalOrders },
                      { icon: "💰", label: "Total Revenue",  value: `₹${reportData.totalRevenue?.toLocaleString()}` },
                      { icon: "🔄", label: "Refunds Issued", value: `₹${reportData.refundTotal?.toLocaleString()}` },
                      { icon: "📈", label: "Net Revenue",    value: `₹${(reportData.totalRevenue - reportData.refundTotal)?.toLocaleString()}` },
                    ].map((s) => (
                      <div className="dp-stat-card" key={s.label}>
                        <div className="dp-stat-icon-wrap" style={{ background: "#f0f2f8" }}><span style={{ fontSize: 22 }}>{s.icon}</span></div>
                        <div>
                          <div className="dp-stat-label">{s.label}</div>
                          <div className="dp-stat-value" style={{ fontSize: 20 }}>{s.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                    {[["Order Status", reportData.statusBreakdown],["Payment Methods", reportData.paymentBreakdown]].map(([title, data]) => (
                      <div key={title} className="dp-card" style={{ border: "1px solid #e8ecf4" }}>
                        <h4 style={{ color: "#7a1c2e", marginBottom: 12 }}>{title}</h4>
                        {Object.entries(data || {}).map(([k, v]) => (
                          <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#475569", marginBottom: 6 }}>
                            <span>{k}</span><span style={{ fontWeight: 700 }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table className="dp-table">
                      <thead><tr>{["Order ID","Customer","Amount","Method","Payment","Status","Date"].map(h => <th key={h}>{h}</th>)}</tr></thead>
                      <tbody>
                        {reportData.orders?.map((o) => (
                          <tr key={o._id}>
                            <td className="dp-td-id">{o._id?.slice(-8)}</td>
                            <td style={{ fontSize: 13 }}>{o.user?.name || "—"}</td>
                            <td style={{ fontWeight: 700, color: "#16a34a" }}>₹{o.totalAmount?.toLocaleString()}</td>
                            <td style={{ fontSize: 13 }}>{o.paymentMethod}</td>
                            <td><StatusBadge status={o.paymentStatus} /></td>
                            <td><StatusBadge status={o.status} /></td>
                            <td style={{ fontSize: 12, color: "#94a3b8" }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="dp-empty"><div style={{ fontSize: 60 }}>📊</div><p>Select a date range and click Generate Report</p></div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════ REFUNDS ══════════════ */}
        {activeTab === "refunds" && (
          <div className="dp-tab-wrap">
            <div className="dp-card">
              <div className="dp-card-header">
                <h2 className="dp-card-title">🔄 Refund Requests</h2>
                <span className="dp-badge-count">{refunds.filter(r => r.refundStatus === "Requested").length} pending</span>
              </div>
              {refunds.length === 0 ? (
                <div className="dp-empty"><div style={{ fontSize: 60 }}>✅</div><p>No pending refund requests</p></div>
              ) : refunds.map((r) => (
                <div key={r._id} className="dp-refund-card">
                  <div className="dp-refund-header">
                    <div><div className="dp-label">Order ID</div><div style={{ fontWeight: 700, color: "#7a1c2e" }}>#{r._id?.slice(-12)}</div></div>
                    <div><div className="dp-label">Customer</div><div>{r.user?.name || "—"}</div><div style={{ fontSize: 11, color: "#94a3b8" }}>{r.user?.email}</div></div>
                    <div><div className="dp-label">Refund Amount</div><div style={{ fontSize: 20, fontWeight: 700, color: "#c8922a" }}>₹{r.refundAmount?.toLocaleString()}</div></div>
                    <div><div className="dp-label">Status</div><StatusBadge status={r.refundStatus} /></div>
                  </div>
                  {r.refundReason && <div className="dp-refund-reason"><b>Reason:</b> {r.refundReason}</div>}
                  {r.refundStatus === "Requested" && (
                    <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                      <button className="dp-btn-approve" onClick={() => handleRefundAction(r._id, "approve")}>✅ Approve Refund</button>
                      <button className="dp-btn-reject" onClick={() => handleRefundAction(r._id, "reject")}>❌ Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════ MESSAGES ══════════════ */}
        {activeTab === "messages" && (
          <div className="dp-tab-wrap">
            <div className="dp-card">
              <div className="dp-card-header"><h2 className="dp-card-title">💬 Messages</h2></div>
              <div className="dp-empty"><div style={{ fontSize: 60 }}>💬</div><p>Customer inquiries will appear here.</p></div>
            </div>
          </div>
        )}

        {/* ══════════════ SETTINGS ══════════════ */}
        {activeTab === "settings" && (
          <div className="dp-tab-wrap">
            <div className="dp-card">
              <div className="dp-card-header"><h2 className="dp-card-title">⚙️ Settings</h2></div>
              <div className="dp-empty"><div style={{ fontSize: 60 }}>⚙️</div><p>Shop settings and profile management coming soon.</p></div>
            </div>
          </div>
        )}

      </div>{/* /dp-main */}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="dp-overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}

export default DashboardPage;
