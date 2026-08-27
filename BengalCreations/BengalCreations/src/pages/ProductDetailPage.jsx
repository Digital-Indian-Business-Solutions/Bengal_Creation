import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchAllVendors,
  fetchVendorProducts,
  getProductById,
} from "../api/api";

function ProductDetailPage({
  cart,
  wishlist,
  onAddCart,
  onToggleWish,
  openCart,
  setFilterCategory,
  allProducts,
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [imgIdx, setImgIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [p, setP] = useState(null);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [showSizeChart, setShowSizeChart] = useState(false);
  console.log("ID:", id);
  useEffect(() => {
    if (p?.vendorId) {
      fetchVendorProducts(p.vendorId)
        .then(setVendorProducts)
        .catch(console.error);
    }
  }, [p?.vendorId]);
  useEffect(() => {
    setLoading(true);
    console.log("Fetching product details for ID:", id);
    fetchAllVendors().then(setVendors).catch(console.error);

    getProductById(id)
      .then((product) => {
        console.log("Fetched product:", product);
        setP(product);
        // Auto-select XL if available, otherwise first available variant
        if (Array.isArray(product.variants) && product.variants.length > 0) {
          const xlVariant = product.variants.find((v) => v.size?.toUpperCase() === "XL" && v.stock > 0);
          const firstAvailable = product.variants.find((v) => v.stock > 0);
          setSelectedSize(xlVariant?.size || firstAvailable?.size || product.variants[0]?.size || null);
        }
      })
      .catch((err) => {
        console.error("Error fetching product:", err);
        console.log("Product ID was:", id);
        alert("Failed to load product details. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, [id]);
  // Scroll to top when navigating between products
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setImgIdx(0);
  }, [id]);

  // Hooks FIRST
  const imgs = p?.images?.length
    ? p.images
    : [{ url: p?.thumb || "", label: "Product View" }];
  const changeImg = useCallback(
    (dir) => setImgIdx((i) => (i + dir + imgs.length) % imgs.length),
    [imgs.length],
  );

  const shareProduct = useCallback(() => {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: p?.name,
          text: `Check out this product: ${p?.name}`,
          url,
        })
        .catch((err) => console.error("Share failed:", err));
    } else {
      navigator.clipboard
        .writeText(url)
        .then(() => alert("Product URL copied to clipboard!"))
        .catch((err) => console.error("Copy failed:", err));
    }
  }, [p]);

  // ✅ THEN condition
  if (loading) {
    const shimmer = {
      position: "relative",
      overflow: "hidden",
      background: "#eee",
      borderRadius: 8,
    };

    const shimmerAfter = {
      content: '""',
      position: "absolute",
      top: 0,
      left: "-150px",
      height: "100%",
      width: "150px",
      background:
        "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
      animation: "shimmer 1.2s infinite",
    };

    return (
      <div style={{ padding: 32, maxWidth: 1200, margin: "0 auto" }}>
        {/* Keyframes inside style tag */}
        <style>
          {`
          @keyframes shimmer {
            100% {
              transform: translateX(300px);
            }
          }
        `}
        </style>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}
        >
          {/* LEFT: Image */}
          <div>
            <div style={{ ...shimmer, height: 320 }}>
              <div style={shimmerAfter}></div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ ...shimmer, width: 60, height: 60 }}>
                  <div style={shimmerAfter}></div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Content */}
          <div>
            <div
              style={{ ...shimmer, height: 12, width: "40%", marginBottom: 10 }}
            >
              <div style={shimmerAfter}></div>
            </div>

            <div
              style={{ ...shimmer, height: 28, width: "70%", marginBottom: 12 }}
            >
              <div style={shimmerAfter}></div>
            </div>

            <div style={{ ...shimmer, height: 14, marginBottom: 10 }}>
              <div style={shimmerAfter}></div>
            </div>

            <div style={{ ...shimmer, height: 14, marginBottom: 10 }}>
              <div style={shimmerAfter}></div>
            </div>

            <div
              style={{ ...shimmer, height: 24, width: 120, margin: "16px 0" }}
            >
              <div style={shimmerAfter}></div>
            </div>

            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ ...shimmer, height: 12, marginBottom: 8 }}>
                <div style={shimmerAfter}></div>
              </div>
            ))}

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ ...shimmer, height: 40, width: 120 }}>
                  <div style={shimmerAfter}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!p) {
    return <div style={{ padding: 40 }}>Product not found</div>;
  }
  console.log("Product detail loading state:", { loading, p });

  const disc = p.original ? Math.round((1 - p.price / p.original) * 100) : 0;
  const v = vendors?.find((x) => x.id === p.vendorId);
  const otherVendorProducts = vendorProducts.filter((x) => x.id !== p.id);

  return (
    <div className="">
      <button className="pd-back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <div className="pd-grid">
        {/* Gallery */}
        <div className="pd-gallery">
          <div className="pd-thumbnails">
            {imgs.map((img, i) => (
              <div
                key={i}
                className={`pd-thumb${i === imgIdx ? " active" : ""}`}
                onClick={() => setImgIdx(i)}
              >
                <img src={img.url} alt={img.label} loading="lazy" />
              </div>
            ))}
          </div>
          <div className="pd-main-img">
            <img src={imgs[imgIdx]?.url} alt={imgs[imgIdx]?.label} />
          </div>
        </div>

        {/* hover Imgae */}

        {/* <div
          className="pd-hover-img"
          onMouseMove={(e) => {
            const { left, top, width, height } =
              e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - left) / width) * 100;
            const y = ((e.clientY - top) / height) * 100;

            e.currentTarget.querySelector("img").style.transformOrigin =
              `${x}% ${y}%`;
          }}
        >
          <img src={imgs[imgIdx]?.url} alt={imgs[imgIdx]?.label} />
        </div> */}

        {/* Info */}

        <div className="pd-info">
          <div className="pd-cat-label">{p.category}</div>
          <h1 className="pd-title">{p.name}</h1>
          <div className="pd-vendor">
            Sold by{" "}
            <strong style={{ color: "var(--maroon)", cursor: "pointer" }}>
              {p.vendor ?? "Unknown Vendor"}
            </strong>{" "}
            · 📍 {p.district}
          </div>
          <div className="pd-rating">
            {"★".repeat(Math.floor(p.rating))}
            {"☆".repeat(5 - Math.floor(p.rating))}☆ {p.rating} — {p.reviews}{" "}
            reviews
          </div>
          <div className="pd-price">
            ₹{p.price.toLocaleString()}
            {p.original > p.price && (
              <span
                style={{
                  fontSize: 16,
                  color: "var(--text-muted)",
                  textDecoration: "line-through",
                  marginLeft: 8,
                }}
              >
                ₹{p.original.toLocaleString()}
              </span>
            )}
            {disc > 0 && (
              <span
                style={{ fontSize: 14, color: "var(--maroon)", marginLeft: 8 }}
              >
                {disc}% OFF
              </span>
            )}
          </div>
          {/* Description with bullet points */}
          <div className="pd-desc-section">
            {p.desc && p.desc.trim() && (
              <ul className="pd-desc-bullets">
                {p.desc
                  .split(/\n|\. /)
                  .map((s) => s.trim())
                  .filter((s) => s.length > 0)
                  .map((sentence, idx) => (
                    <li key={idx}>{sentence.replace(/\.$/, "")}</li>
                  ))}
              </ul>
            )}
          </div>

          {Array.isArray(p.variants) && p.variants.length > 0 && (
            <div className="pd-variants-section">
              <div className="pd-variants-label">
                Size: <strong>{selectedSize || "—"}</strong>
              </div>
              <div className="pd-variants-grid">
                {p.variants.map((v) => {
                  const isSelected = selectedSize === v.size;
                  const outOfStock = v.stock === 0;
                  const variantPrice = v.price || p.price;
                  const variantOriginal = v.orginalPrice || v.originalPrice || p.original;
                  return (
                    <button
                      key={v.size}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => setSelectedSize(v.size)}
                      className={`pd-variant-card${isSelected ? " selected" : ""}${outOfStock ? " out-of-stock" : ""}`}
                    >
                      <span className="pd-variant-size">{v.size}</span>
                      <span className="pd-variant-price">₹{variantPrice?.toLocaleString()}</span>
                      {variantOriginal > variantPrice && (
                        <span className="pd-variant-original">₹{variantOriginal?.toLocaleString()}</span>
                      )}
                      {outOfStock && <span className="pd-variant-oos">Out of stock</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="pd-meta">
            {[
              ["Category", p.category],
              ["Origin", `${p.district}, West Bengal`],
              ["In Stock", `${p.stock} units`, "var(--green)"],
              ["Delivery", "3–7 business days"],
              ["Photos", `${imgs.length} views`],
            ].map(([k, val, c]) => (
              <div className="pd-meta-row" key={k}>
                <span className="pd-meta-key">{k}</span>
                <span className="pd-meta-val" style={c ? { color: c } : {}}>
                  {val}
                </span>
              </div>
            ))}
          </div>
          <div className="pd-actions">
            <button
              className="btn-gold"
              style={{ flex: 1 }}
              onClick={() => {
                onAddCart(p.id, selectedSize || "");
                openCart();
              }}
            >
              🛒 Add to Cart
            </button>
            <button className="btn-outline" onClick={() => onToggleWish(p.id)}>
              {wishlist?.includes(p.id) ? "❤️ Wishlisted" : "♡ Wishlist"}
            </button>
            <button className="btn-outline" onClick={shareProduct}>
              📤 Share
            </button>
          </div>
        </div>
      </div>

      {/* Vendor Showcase */}
      {v && (
        <div
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px 40px" }}
        >
          <div
            style={{
              background: "white",
              border: "1px solid var(--border)",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "var(--shadow)",
              marginBottom: 40,
            }}
          >
            <div
              style={{
                background:
                  "linear-gradient(135deg,var(--maroon-dark),var(--maroon))",
                padding: "24px 32px",
                display: "flex",
                alignItems: "center",
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg,var(--gold),var(--gold-light))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  border: "3px solid rgba(200,146,42,0.4)",
                  flexShrink: 0,
                }}
              >
                {v.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: 3,
                    color: "rgba(245,228,184,0.55)",
                    textTransform: "uppercase",
                    marginBottom: 3,
                  }}
                >
                  About the Seller
                </div>
                <div
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: 20,
                    color: "var(--gold-light)",
                    fontWeight: 700,
                  }}
                >
                  {v.name}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(245,228,184,0.7)",
                    marginTop: 2,
                  }}
                >
                  {v.owner} · 📍 {v.district}
                </div>
              </div>
              <div style={{ display: "flex", gap: 24 }}>
                {[
                  ["Rating", `${v.rating}★`],
                  [
                    "Reviews",
                    allProducts
                      .filter((x) => x.vendorId === v.id)
                      .reduce((s, x) => s + x.reviews, 0)
                      .toLocaleString(),
                  ],
                  ["Products", `${v.products}+`],
                ].map(([l, val]) => (
                  <div key={l} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: 20,
                        fontFamily: "'Playfair Display',serif",
                        color: "var(--gold-light)",
                        fontWeight: 700,
                      }}
                    >
                      {val}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "rgba(245,228,184,0.55)",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      {l}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {otherVendorProducts.length > 0 && (
              <div style={{ padding: "24px 32px" }}>
                <div
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: 17,
                    color: "var(--maroon)",
                    marginBottom: 16,
                    fontStyle: "italic",
                  }}
                >
                  More from{" "}
                  <strong style={{ fontStyle: "normal" }}>{v.owner}</strong>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))",
                    gap: 14,
                  }}
                >
                  {otherVendorProducts.map((op) => {
                    if (!op) return null;
                    const d = op.original
                      ? Math.round((1 - op.price / op.original) * 100)
                      : 0;
                    return (
                      <div
                        key={op.id}
                        onClick={() => {
                          window.scrollTo(0, 0);
                          navigate(`/product/${op.id}`);
                        }}
                        style={{
                          background: "var(--cream)",
                          border: "1px solid var(--border)",
                          borderRadius: 12,
                          overflow: "hidden",
                          cursor: "pointer",
                          transition: "all 0.22s",
                        }}
                      >
                        <div
                          style={{
                            height: 220,
                            overflow: "hidden",
                            background: "#f8f4ef",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {op.thumb ? (
                            <img
                              src={op.thumb}
                              alt={op.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                objectPosition: "center",
                              }}
                              loading="lazy"
                            />
                          ) : (
                            <div
                              style={{
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 40,
                              }}
                            >
                              {op.emoji}
                            </div>
                          )}
                        </div>
                        <div style={{ padding: "10px 12px" }}>
                          <div
                            style={{
                              fontFamily: "'Playfair Display',serif",
                              fontSize: 12,
                              color: "var(--maroon)",
                              fontWeight: 600,
                              lineHeight: 1.3,
                              marginBottom: 5,
                            }}
                          >
                            {op.name}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: "var(--green)",
                              }}
                            >
                              ₹{op.price.toLocaleString()}
                            </span>
                            {d > 0 && (
                              <span
                                style={{
                                  fontSize: 9,
                                  background: "var(--maroon)",
                                  color: "white",
                                  padding: "1px 5px",
                                  borderRadius: 3,
                                }}
                              >
                                {d}% OFF
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetailPage;
