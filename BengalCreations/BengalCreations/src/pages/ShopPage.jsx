import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { ChevronDown } from "lucide-react";
import {
  fetchAllCategories,
  fetchProductsPage,
  fetchProductsPageByCategory,
} from "../api/api";

// const priceMax=newFilters.priceMin+1;
const PAGE_SIZE = 10;
function ShopPage({ cart, wishlist, onAddCart, onToggleWish, WB_DISTRICTS }) {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state || {};

  const [catOptions, setCatOptions] = useState([]);
  const [filters, setFilters] = useState({
    category: locationState.category || "",
    district: "",
    priceMin: "",
    priceMax: "",
    search: locationState.searchQuery || "",
  });
  const [ratingFilter, setRatingFilter] = useState(0);

  // Pagination state
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initLoaded, setInitLoaded] = useState(false);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [hasError, setHasError] = useState(false);
  const [bgc, setBgc] = useState("");

  const loaderRef = useRef(null);

  // Shared fetch logic — passes all filters to server-side search engine
  const doFetch = useCallback(async (pageNum, currentFilters) => {
    return fetchProductsPage({
      page: pageNum,
      limit: PAGE_SIZE,
      search: currentFilters.search,
      category: currentFilters.category,
      district: currentFilters.district,
      priceMin: currentFilters.priceMin,
      priceMax: currentFilters.priceMax,
    });
  }, []);

  // Client-side filter for rating (client-side property)
  const clientFilter = useCallback((prods, f, rating) => {
    return prods.filter((p) => {
      if (rating > 0 && p.rating < rating) return false;
      return true;
    });
  }, []);

  // Reset + reload when filters change

  const resetAndLoad = useCallback(
    async (newFilters, rating) => {
      setLoading(true);
      setProducts([]);
      setHasError(false);
      setProducts([]);
      setPage(1);
      setHasMore(true);
      setInitLoaded(false);
      try {
        const res = await doFetch(1, newFilters);
        const filtered = clientFilter(res.products, newFilters, rating);
        setProducts(filtered);
        setTotal(res.pagination.total);
        setHasMore(res.pagination.hasMore);
        setPage(2);
      } catch (err) {
        console.error(err);
        setHasError(true);
      } finally {
        setLoading(false);
        setInitLoaded(true);
      }
    },
    [doFetch, clientFilter],
  );

  // Load next page (append)
  const loadMore = useCallback(async () => {
    if (loading || !hasMore || hasError) return;
    setLoading(true);
    try {
      const res = await doFetch(page, filters);
      const filtered = clientFilter(res.products, filters, ratingFilter);
      setProducts((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        return [...prev, ...filtered.filter((p) => !ids.has(p.id))];
      });
      setHasMore(res.pagination.hasMore);
      setPage((p) => p + 1);
    } catch (err) {
      console.error(err);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, hasError, page, filters, ratingFilter, doFetch, clientFilter]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!initLoaded) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) loadMore();
      },
      { threshold: 0.1 },
    );

    const el = loaderRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [initLoaded, hasMore, loading, loadMore]);

  const applyFiltersWith = (newFilters) => {
    const min = Number(newFilters.priceMin);
    const max = Number(newFilters.priceMax);

    if (newFilters.priceMin && newFilters.priceMax && max < min) {
      setError("Max price must be greater than Min price");
      setBgc("red");
      return;
    }

    setError("");
    setBgc("none");

    resetAndLoad(newFilters, ratingFilter);
  };
  // Initial load + reload on location change
  useEffect(() => {
    fetchAllCategories().then(setCatOptions).catch(console.error);
    const newFilters = {
      category: location.state?.category || "",
      district: "",
      priceMin: "",
      priceMax: "",
      search: location.state?.searchQuery || "",
    };
    setFilters(newFilters);
    resetAndLoad(newFilters, 0);
    setRatingFilter(0);
  }, [location.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyFilters = () => resetAndLoad(filters, ratingFilter);

  const clearFilters = useCallback(() => {
    const f = {
      category: "",
      district: "",
      priceMin: "",
      priceMax: "",
      search: "",
    };
    setFilters(f);
    setRatingFilter(0);
    resetAndLoad(f, 0);
  }, [resetAndLoad]);


  // Skeleton grid
  const SkeletonGrid = () => (
    <div className="products-grid">
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <div
          key={i}
          className="product-card skeleton-card"
          style={{ minHeight: 260 }}
        >
          <div className="skeleton-img" style={{ height: 180 }} />
          <div style={{ padding: 12 }}>
            <div className="skeleton-line title" style={{ marginBottom: 8 }} />
            <div className="skeleton-line price" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div className="shop-layout">
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className="sidebar">
          <h3>🔍 Filter Products</h3>

          <div className="filter-section">
            <label>Search</label>
            <input
              className="filter-input"
              type="text"
              placeholder="Name, category..."
              value={filters.search}
              onChange={(e) => {
                const value=e.target.value

                setFilters((f) => { 
                  const updated={...f,search:value};
                  // console.log(updated.category)
                  applyFiltersWith(updated);
                  return updated;
                 });
              }}
              // onChange={(e) =>
              //   setFilters((f) => ({ ...f, search: e.target.value }))
              // }
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            />
          </div>

          <div className="filter-section">
            <label>Category</label>
            <select
              className="filter-select"
              value={filters.category}
              onChange={(e) => {
                const value = e.target.value;

                setFilters((f) => {
                  const updated = { ...f, category: value };
                  // console.log(updated.category)
                  applyFiltersWith(updated);
                  return updated;
                });
              }}
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
              onChange={(e) => {
                const value = e.target.value;

                setFilters((f) => {
                  const updated = { ...f, district: value };
                  // console.log(updated.category)
                  applyFiltersWith(updated);
                  return updated;
                });
              }}
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
                onChange={(e) => {
                  const value = e.target.value;

                  setFilters((f) => {
                    const updated = { ...f, priceMin: value };
                    // console.log(updated.category)
                    applyFiltersWith(updated);
                    return updated;
                  });
                }}
                // onChange={(e) =>
                //   setFilters((f) => ({ ...f, priceMin: e.target.value }))
                // }
              />
              <input
                className="filter-input"
                type="number"
                placeholder="Max"
                value={filters.priceMax}
                style={{backgroundColor: `{bgc}`}}
                onChange={(e) => {
                  const value = e.target.value;

                  setFilters((f) => {
                    const updated = { ...f, priceMax: value };
                    // console.log(updated.category)
                    applyFiltersWith(updated);
                    return updated;
                  });
                }}
                // onChange={(e) =>
                //   setFilters((f) => ({ ...f, priceMax: e.target.value }))
                // }
              />
            </div>
            {/* 🔥 ERROR MESSAGE ON TOP */}

            {error && (
              <p style={{color: "red", marginBottom: "8px", fontSize: "14px", letterSpacing: "-1px" }}>
                {error}
              </p>
            )}
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

          <button
            className="btn-gold"
            style={{ width: "100%", marginBottom: 8 }}
            onClick={applyFilters}
          >
            Apply Filters
          </button>
          <button className="clear-filters-btn" onClick={clearFilters}>
            ✕ Clear Filters
          </button>
        </aside>

        {/* ── Product Grid ─────────────────────────────────────────────────── */}
        <div className="shop-main">
          <h2>{filters.category || "All Products"}</h2>
          <div className="shop-count">
            {loading && products.length === 0
              ? "Loading…"
              : `${products.length} product${total !== 1 ? "s" : ""} Loaded`}
          </div>

          {/* Initial skeleton */}
          {!initLoaded && <SkeletonGrid />}

          {/* Products */}
          {initLoaded && (
            <>
              {products.length > 0 ? (
                <div className="products-grid">
                  {products.map((p) => (
                    <ProductCard
                      key={p.id}
                      p={p}
                      inCart={!!cart.find((c) => c.id === p.id)}
                      inWish={wishlist.includes(p.id)}
                      onAddCart={onAddCart}
                      onToggleWish={onToggleWish}
                      onShowProduct={(id) => navigate(`/product/${id}`)}
                    />
                  ))}
                </div>
              ) : !loading ? (
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
              ) : null}

              {/* Scroll loader — invisible sentinel */}
              <div ref={loaderRef} style={{ height: 1 }} />

              {/* Loading more indicator */}
              {loading && products.length > 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "24px 0",
                    color: "var(--text-muted)",
                  }}
                >
                  <div style={{ display: "inline-flex", gap: 6 }}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "var(--gold)",
                          animation: `bounce 1s ${i * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* End message */}
              {/* {!hasMore && products.length > 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px 0",
                    color: "var(--text-muted)",
                    fontSize: 13,
                  }}
                >
                  ✅ All {products.length} products loaded
                </div>
              )} */}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShopPage;
