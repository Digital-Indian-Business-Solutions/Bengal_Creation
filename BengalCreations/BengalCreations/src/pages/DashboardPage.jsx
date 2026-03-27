import { useEffect, useState, useCallback } from "react";
import { uploadImage } from "../utils/cloudinary";
import {
  fetchVendorProducts,
  fetchVendorOrders,
  fetchAllCategories,
  createProduct,
} from "../api/api";

function DashboardPage({ currentUser, onShowToast, WB_DISTRICTS }) {
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [hoverImg, setHoverImg] = useState(null);
  const [activeTab, setActiveTab] = useState("myproducts");
  const [dashProducts, setDashProducts] = useState([]);
  const [selectedEmoji, setSelectedEmoji] = useState("🥻");
  const [selectedCat, setSelectedCat] = useState(null);
  const [catOptions, setCatOptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    originPrice: "",
    stock: "",
    district: "",
    desc: "",
  });

  const totalRevenue = orders.reduce((sum, order) => sum + (order?.amount || 0), 0);

  useEffect(() => {
    if (!currentUser?._id) return;

    fetchVendorProducts(currentUser._id)
      .then(setDashProducts)
      .catch(console.error);

    fetchAllCategories()
      .then((data) => {
        setCatOptions(data);
        if (data.length > 0) setSelectedCat(data[0]);
      })
      .catch(console.error);

    fetchVendorOrders(currentUser._id)
      .then((data) => {
        setOrders(
          data.map((order) => ({
            id: order._id,
            product: order.items?.[0]?.product?.name || "Product",
            customer: order.user?.name || "Customer",
            amount: order.totalAmount,
            date: new Date(order.createdAt).toLocaleDateString(),
            status: order.status,
          }))
        );
      })
      .catch(console.error);
  }, [currentUser]);

  const resetForm = useCallback(() => {
    setForm({ name: "", price: "", originPrice: "", stock: "", district: "", desc: "" });
    setSelectedEmoji("🥻");
    if (catOptions.length > 0) setSelectedCat(catOptions[0]);
    setEditIdx(null);
    setImages([]);
    setImageFiles([]);
  }, [catOptions]);

  const saveProduct = async () => {
    if (!form.name) { onShowToast("⚠️ Please enter product name"); return; }
    if (!form.price) { onShowToast("⚠️ Please enter price"); return; }
    if (!form.stock) { onShowToast("⚠️ Please enter stock"); return; }
    if (!form.district) { onShowToast("⚠️ Please select district"); return; }
    if (imageFiles.length < 1) { onShowToast("⚠️ Please upload at least 1 image."); return; }
    if (imageFiles.length > 5) { onShowToast("⚠️ You can upload maximum 5 images only."); return; }

    try {
      const localUser = currentUser;
      const imageUrls = [];
      for (const file of imageFiles) {
        imageUrls.push(await uploadImage(file));
      }

      await createProduct({
        name: form.name,
        price: form.price,
        originalPrice: form.originPrice,
        stock: form.stock,
        category: selectedCat._id,
        district: form.district,
        description: form.desc,
        vendor: localUser._id,
        images: imageUrls,
      });

      onShowToast("Product Added Successfully!!");
    } catch (err) {
      console.error("Error saving product:", err);
      onShowToast("⚠️ Something went wrong. Please try again.");
    } finally {
      resetForm();
      setActiveTab("myproducts");
    }
  };

  const deleteProduct = useCallback((i) => {
    if (window.confirm("Remove this product?")) {
      setDashProducts((prev) => prev.filter((_, idx) => idx !== i));
      onShowToast("🗑️ Product removed.");
    }
  }, [onShowToast]);

  const editProduct = useCallback((i) => {
    const p = dashProducts[i];
    setForm({
      name: p.name,
      price: p.price,
      originPrice: p.original || "",
      stock: p.stock,
      district: p.district || "",
      desc: p.desc || "",
    });
    setSelectedEmoji(p.emoji);
    setSelectedCat(p.category);
    setEditIdx(i);
    setActiveTab("addproduct");
  }, [dashProducts]);

  return (
    <div>
      <div className="dash-header">
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 3,
              color: "rgba(245,228,184,0.6)",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Vendor Dashboard
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 24,
              color: "var(--gold-light)",
            }}
          >
            🏪 {currentUser?.shopName || "My Store"}
          </h2>
          <p style={{ fontSize: 13, color: "rgba(245,228,184,0.7)", marginTop: 2 }}>
            📍 {currentUser?.address}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            ["myproducts", "📦 My Products"],
            ["addproduct", "➕ Add Product"],
            ["orders", "📋 Orders"],
          ].map(([tab, label]) => (
            <button
              key={tab}
              className="nav-btn"
              style={{
                background: activeTab === tab ? "rgba(200,146,42,0.2)" : "transparent",
              }}
              onClick={() => setActiveTab(tab)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="dash-stats">
        {[
          [`₹${totalRevenue.toLocaleString()}`, "Revenue"],
          [dashProducts.length, "Products"],
          [orders.length, "Orders"],
          ["4.8 ★", "Rating", true],
        ].map(([val, label, gold]) => (
          <div className="dash-stat" key={label}>
            <div className="dash-stat-num" style={gold ? { color: "var(--gold)" } : {}}>
              {val}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginTop: 2,
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* My Products Tab */}
      {activeTab === "myproducts" && (
        <div className="dash-tab-content">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 22,
                color: "var(--maroon)",
              }}
            >
              My Products
            </h3>
            <button
              className="btn-gold"
              onClick={() => { resetForm(); setActiveTab("addproduct"); }}
            >
              ➕ Add New Product
            </button>
          </div>
          {!dashProducts.length ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
              <p>No products yet. Click "Add Product" to start!</p>
            </div>
          ) : (
            <div className="products-grid">
              {dashProducts.map((p, i) => (
                <div className="dash-product-card" key={p.id}>
                  <div className="dash-product-img">
                    {p.thumb ? (
                      <img src={p.thumb} alt={p.name} loading="lazy" />
                    ) : (
                      <div
                        style={{
                          fontSize: 60,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                        }}
                      >
                        {p.emoji}
                      </div>
                    )}
                    <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 4 }}>
                      <button
                        onClick={() => editProduct(i)}
                        style={{
                          background: "rgba(200,146,42,0.9)",
                          border: "none",
                          borderRadius: 6,
                          padding: "5px 8px",
                          cursor: "pointer",
                          fontSize: 12,
                          color: "white",
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteProduct(i)}
                        style={{
                          background: "rgba(122,28,46,0.85)",
                          border: "none",
                          borderRadius: 6,
                          padding: "5px 8px",
                          cursor: "pointer",
                          fontSize: 12,
                          color: "white",
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        background: p.stock < 5 ? "var(--maroon)" : "var(--green)",
                        color: "white",
                        fontSize: 10,
                        padding: "3px 8px",
                        borderRadius: 12,
                        fontWeight: 700,
                      }}
                    >
                      {p.stock < 5 ? "⚠️ Low" : "✓ In Stock"}
                    </div>
                  </div>
                  <div style={{ padding: 14 }}>
                    <div
                      style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: 14,
                        color: "var(--maroon)",
                        fontWeight: 700,
                        marginBottom: 3,
                        lineHeight: 1.3,
                      }}
                    >
                      {p.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>
                      {p.category} · {p.district}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "var(--green)" }}>
                        ₹{p.price.toLocaleString()}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        Stock: {p.stock}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Product Tab */}
      {activeTab === "addproduct" && (
        <div className="dash-tab-content">
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🛍️</div>
              <h2
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 28,
                  color: "var(--maroon)",
                }}
              >
                {editIdx !== null ? "Edit Product" : "Add a New Product"}
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Upload Images */}
                <div style={{ background: "white", border: "2px solid var(--border)", borderRadius: 16, padding: 24 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 12 }}>
                    Upload Product Images
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setImageFiles(files);
                      setImages(files.map((f) => URL.createObjectURL(f)));
                    }}
                  />
                  <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                    {images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt=""
                        style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, cursor: "pointer" }}
                        onMouseEnter={() => setHoverImg(img)}
                        onMouseLeave={() => setHoverImg(null)}
                      />
                    ))}
                  </div>
                  <p>Max 5 and min 1</p>
                </div>

                {/* Name */}
                <div style={{ background: "white", border: "2px solid var(--border)", borderRadius: 16, padding: 24 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 12 }}>Product Name</div>
                  <input
                    className="form-control"
                    placeholder="e.g. Handmade Terracotta Horse"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    style={{ fontSize: 17, padding: "14px 16px" }}
                  />
                </div>

                {/* Category */}
                <div style={{ background: "white", border: "2px solid var(--border)", borderRadius: 16, padding: 24 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 12 }}>Category</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                    {Array.isArray(catOptions) &&
                      catOptions.map((c) => (
                        <div
                          key={c._id}
                          onClick={() => setSelectedCat(c)}
                          style={{
                            padding: "12px 8px",
                            borderRadius: 10,
                            cursor: "pointer",
                            border: selectedCat?._id === c._id ? "2px solid var(--gold)" : "2px solid var(--border)",
                            textAlign: "center",
                            background: selectedCat?._id === c._id ? "var(--gold-pale)" : "white",
                            transition: "all 0.2s",
                          }}
                        >
                          <div style={{ fontSize: 24, marginBottom: 4 }}>{c.emoji}</div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text)" }}>{c.name}</div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Price & Stock */}
                <div style={{ background: "white", border: "2px solid var(--border)", borderRadius: 16, padding: 24 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 12 }}>Price & Stock</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {[
                      ["price", "💰 Selling Price (₹)", "e.g. 1200"],
                      ["originPrice", "💰 Original Price (₹)", "e.g. 1500"],
                      ["stock", "📦 Units in Stock", "e.g. 10"],
                    ].map(([key, label, ph]) => (
                      <div key={key}>
                        <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                          {label}
                        </label>
                        <input
                          className="form-control"
                          type="number"
                          placeholder={ph}
                          value={form[key]}
                          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* District */}
                <div style={{ background: "white", border: "2px solid var(--border)", borderRadius: 16, padding: 24 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 12 }}>Your District</div>
                  <select
                    className="filter-select"
                    value={form.district}
                    onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                  >
                    <option value="">Select your district</option>
                    {Array.isArray(WB_DISTRICTS) &&
                      WB_DISTRICTS.map((d) => <option key={d}>📍 {d}</option>)}
                  </select>
                </div>

                {/* Description */}
                <div style={{ background: "white", border: "2px solid var(--border)", borderRadius: 16, padding: 24 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 12 }}>Description</div>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Describe your product..."
                    value={form.desc}
                    onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                  />
                </div>

                <button className="btn-gold" style={{ padding: 18, fontSize: 16 }} onClick={saveProduct}>
                  {editIdx !== null ? "💾 Save Changes" : "🚀 Publish Product"}
                </button>
              </div>

              {/* Live Preview */}
              <div style={{ position: "sticky", top: 90 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 12,
                  }}
                >
                  Live Preview
                </div>
                <div
                  style={{
                    background: "white",
                    border: "2px solid var(--gold)",
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "var(--shadow-gold)",
                  }}
                >
                  <div
                    style={{
                      height: 280,
                      background: "linear-gradient(135deg,var(--cream2),var(--gold-pale))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 80,
                    }}
                  >
                    {images.length ? (
                      <img
                        src={hoverImg || images[0]}
                        alt="preview"
                        style={{ height: "100%", width: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ fontSize: 80 }}>{selectedEmoji}</div>
                    )}
                  </div>
                  <div style={{ padding: 20 }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      {selectedCat?.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: 18,
                        color: form.name ? "var(--maroon)" : "var(--text-muted)",
                        marginBottom: 8,
                        fontStyle: form.name ? "normal" : "italic",
                      }}
                    >
                      {form.name || "Your product name..."}
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: form.price ? "var(--green)" : "var(--text-muted)",
                      }}
                    >
                      {form.price ? `₹${parseInt(form.price).toLocaleString()}` : "₹ —"}
                    </div>
                    {form.stock && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                        📦 {form.stock} in stock
                      </div>
                    )}
                    {form.district && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                        📍 {form.district}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="dash-tab-content">
          <h3
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 22,
              color: "var(--maroon)",
              marginBottom: 24,
            }}
          >
            Recent Orders
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "white",
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "var(--shadow)",
              }}
            >
              <thead>
                <tr style={{ background: "var(--maroon)", color: "var(--gold-pale)" }}>
                  {["Order ID", "Product", "Customer", "Amount", "Date", "Status"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "14px 16px",
                        fontFamily: "'Playfair Display',serif",
                        fontSize: 13,
                        fontWeight: 600,
                        textAlign: "left",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr
                    key={o.id}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      background: i % 2 === 0 ? "white" : "var(--cream)",
                    }}
                  >
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--maroon)", fontSize: 13 }}>
                      {o.id}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>{o.product}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)" }}>{o.customer}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "var(--green)" }}>
                      ₹{o.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)" }}>{o.date}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          background:
                            o.status === "delivered"
                              ? "var(--green)"
                              : o.status === "shipped"
                              ? "#1565c0"
                              : "var(--gold)",
                          color: "white",
                          padding: "3px 10px",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
