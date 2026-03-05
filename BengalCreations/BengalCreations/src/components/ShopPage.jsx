import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProductCard from "./ProductCard";

function ShopPage({
  cart,
  wishlist,
  onAddCart,
  onToggleWish,
  allProducts,
  WB_DISTRICTS,
  catOptions,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state || {};

  const [filters, setFilters] = useState({
    category: "",
    district: "",
    priceMin: "",
    priceMax: "",
    search: locationState.searchQuery || "",
  });
  const [ratingFilter, setRatingFilter] = useState(0);
  console.log(catOptions)
  // Update filters if location state changes (e.g. navigating to /shop from different category)
  useEffect(() => {
    setFilters((f) => ({
      ...f,
      category: locationState.category || f.category,
      search: locationState.searchQuery || f.search,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  const filtered = allProducts.filter((p) => {
    // console.log(p);
    if (filters.category && p.category !== filters.category) return false;
    if (filters.district && p.district !== filters.district) return false;
    if (filters.priceMin && p.price < parseInt(filters.priceMin)) return false;
    if (filters.priceMax && p.price > parseInt(filters.priceMax)) return false;
    if (ratingFilter > 0 && p.rating < ratingFilter) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !p.name.toLowerCase().includes(q) &&
        !p.vendor.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const clearFilters = () => {
    setFilters({
      category: "",
      district: "",
      priceMin: "",
      priceMax: "",
      search: "",
    });
    setRatingFilter(0);
  };

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
              onChange={(e) =>
                setFilters((f) => ({ ...f, category: e.target.value }))
              }
            >
              <option value="">All Categories</option>
              { console.log("test : ",catOptions)}
              {
               
              catOptions.map((c) => (
                <option key={c._id} value={c.name}> 
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
              onChange={(e) =>
                setFilters((f) => ({ ...f, district: e.target.value }))
              }
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
                onChange={(e) =>
                  setFilters((f) => ({ ...f, priceMin: e.target.value }))
                }
              />
              <input
                className="filter-input"
                type="number"
                placeholder="Max"
                value={filters.priceMax}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, priceMax: e.target.value }))
                }
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
          <h2>{
          (
            <>
            {console.log(filters)}
            {filters.category || "All Products"}
            </>
          )
          }</h2>
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
