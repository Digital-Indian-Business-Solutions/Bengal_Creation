import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { fetchAllCategories } from "../api/api";

function ShopPage({ cart, wishlist, onAddCart, onToggleWish, allProducts, WB_DISTRICTS }) {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state || {};

  const [catOptions, setCatOptions] = useState([
    { name: "Handloom Sarees", emoji: "🥻" },
    { name: "Terracotta Crafts", emoji: "🏺" },
    { name: "Dokra Art", emoji: "🔔" },
    { name: "Wooden Handicrafts", emoji: "🪵" },
    { name: "Jute Products", emoji: "🧺" },
    { name: "Bengal Sweets", emoji: "🍬" },
  ]);

  const [filters, setFilters] = useState({
    category: "",
    district: "",
    priceMin: "",
    priceMax: "",
    search: locationState.searchQuery || "",
  });
  const [ratingFilter, setRatingFilter] = useState(0);

  useEffect(() => {
    fetchAllCategories()
      .then(setCatOptions)
      .catch(console.error);

    if (location.state?.searchQuery !== undefined) {
      setFilters((f) => ({
        ...f,
        search: location.state.searchQuery,
        category: location.state.category || f.category,
      }));
    }
  }, [location.key]);

  const filtered = useMemo(() => allProducts.filter((p) => {
    if (filters.category && p.category !== filters.category) return false;
    if (filters.district && p.district !== filters.district) return false;
    if (filters.priceMin && p.price < parseInt(filters.priceMin)) return false;
    if (filters.priceMax && p.price > parseInt(filters.priceMax)) return false;
    if (ratingFilter > 0 && p.rating < ratingFilter) return false;

    if (filters.search) {
      const query = filters.search.toLowerCase().trim();
      const inName = p.name?.toLowerCase().includes(query);
      const inVendor = p.vendor?.toLowerCase().includes(query);
      const inCategory = p.category?.toLowerCase().includes(query);
      const inDistrict = p.district?.toLowerCase().includes(query);
      if (!inName && !inVendor && !inCategory && !inDistrict) return false;
    }

    return true;
  }), [allProducts, filters, ratingFilter]);

  const clearFilters = useCallback(() => {
    setFilters({ category: "", district: "", priceMin: "", priceMax: "", search: "" });
    setRatingFilter(0);
  }, []);

  return (
    <div>
      <div className="shop-layout">
        <aside className="sidebar">
          <h3>🔍 Filter Products</h3>

          <div className="filter-section">
            <label>Category</label>
            <select
              className="filter-select"
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            >
              <option value="">All Categories</option>
              {catOptions.map((c) => (
                <option key={c._id ?? c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-section">
            <label>District</label>
            <select
              className="filter-select"
              value={filters.district}
              onChange={(e) => setFilters((f) => ({ ...f, district: e.target.value }))}
            >
              <option value="">All Districts</option>
              {WB_DISTRICTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="filter-section">
            <label>Price Range (₹)</label>
            <div className="price-range">
              <input
                className="filter-input"
                type="number"
                placeholder="Min"
                value={filters.priceMin}
                onChange={(e) => setFilters((f) => ({ ...f, priceMin: e.target.value }))}
              />
              <input
                className="filter-input"
                type="number"
                placeholder="Max"
                value={filters.priceMax}
                onChange={(e) => setFilters((f) => ({ ...f, priceMax: e.target.value }))}
              />
            </div>
          </div>

          <div className="filter-section">
            <label>Rating</label>
            <div className="chips">
              {[0, 3, 4, 4.5].map((r) => (
                <button
                  key={r}
                  className={`chip${ratingFilter === r ? " active" : ""}`}
                  onClick={() => setRatingFilter(r)}
                >
                  {r === 0 ? "All" : `${r}★+`}
                </button>
              ))}
            </div>
          </div>

          <button className="clear-filters-btn" onClick={clearFilters}>
            ✕ Clear Filters
          </button>
        </aside>

        <div className="shop-main">
          <h2>{filters.category || "All Products"}</h2>
          <div className="shop-count">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
          </div>
          <div className="products-grid">
            {filtered.length ? (
              filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  p={p}
                  inCart={!!cart.find((c) => c.id === p.id)}
                  inWish={wishlist.includes(p.id)}
                  onAddCart={onAddCart}
                  onToggleWish={onToggleWish}
                  onShowProduct={(id) => navigate(`/product/${id}`)}
                />
              ))
            ) : (
              <div
                style={{
                  gridColumn: "1/-1",
                  textAlign: "center",
                  padding: "60px",
                  color: "var(--text-muted)",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                <p>No products found matching your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopPage;
