import { useNavigate } from "react-router-dom";
import { useCallback, useState, useEffect, useMemo } from "react";
import Carousel from "../components/Carousel";
import PopupBanner from "../components/PopupBanner";
import { fetchProductsPageByCategory, fetchProductsPage } from "../api/api";
import Banner from "./Banner";

// Fisher-Yates shuffle — returns a new shuffled array
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Categories
const CATEGORY_CAROUSELS = [
  "Handloom Sarees",
  "Dokra Art",
  "Jute Products",
  "Terracotta Crafts",
  "Wooden Handicrafts",
  "Bengal Sweets",
];

function HomePage({
  setFilterCategory,
  cart,
  wishlist,
  onAddCart,
  onToggleWish,
  categoryTiles,
  allProducts,
  loading,
}) {
  const navigate = useNavigate();

  // Shuffled products for Trending (diverse mix across categories)
  const trendingProducts = useMemo(
    () => (loading ? [] : shuffleArray(allProducts)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allProducts.length, loading]
  );

  // ── All-vendor products for Best Sellers ──────────────────────────────────
  const [allVendorProducts, setAllVendorProducts] = useState([]);
  const [bestSellersLoading, setBestSellersLoading] = useState(true);

  useEffect(() => {
    // Fetch a large page to cover all vendors' products
    fetchProductsPage({ page: 1, limit: 500 })
      .then(({ products }) => {
        setAllVendorProducts(products);
        setBestSellersLoading(false);
      })
      .catch(() => setBestSellersLoading(false));
  }, []);

  // One best product per vendor — shows a featured product from every vendor
  const bestSellers = useMemo(() => {
    if (!allVendorProducts.length) return [];
    // Sort by rating descending so each vendor's best product rises to top
    const sorted = [...allVendorProducts].sort(
      (a, b) => (b.rating || 0) - (a.rating || 0)
    );
    // Keep only 1 product per unique vendor
    const seenVendors = new Set();
    const onePerVendor = [];
    for (const product of sorted) {
      const vendorKey = product.vendorId || product.vendor || "unknown";
      if (!seenVendors.has(vendorKey)) {
        seenVendors.add(vendorKey);
        onePerVendor.push(product);
      }
    }
    return onePerVendor;
  }, [allVendorProducts]);

  // State for category products
  const [categoryProducts, setCategoryProducts] = useState(() =>
    Object.fromEntries(CATEGORY_CAROUSELS.map((cat) => [cat, null]))
  );

  // Navigate to shop with category
  const goToShop = useCallback(
    (category) => {
      setFilterCategory(category);
      navigate("/shop", { state: { category } });
    },
    [setFilterCategory, navigate]
  );

  // Fetch category products
  useEffect(() => {
    CATEGORY_CAROUSELS.forEach((cat) => {
      fetchProductsPageByCategory({ category: cat, limit: 20 })
        .then((data) => {
          setCategoryProducts((prev) => ({
            ...prev,
            [cat]: data.products,
          }));
        })
        .catch((err) => {
          console.error(`Error fetching ${cat}:`, err);
          setCategoryProducts((prev) => ({
            ...prev,
            [cat]: [],
          }));
        });
    });
  }, []);

  return (
    <div>
      <Banner/>
      {/* ✅ POPUP BANNER */}
      <PopupBanner
        delay={2000}
        onClick={() => navigate("/shop")}
      />

      {/* ✅ Gallery Tiles */}
      <div className="section alpona-bg">
        {/* <img className="tiffinHubBanner" src="https://res.cloudinary.com/dnplp91xz/image/upload/q_auto/f_auto/v1775738230/BannerOfSH_pwmgym.jpg" alt="" /> */}
        <div className="gallery">
          {categoryTiles.map((tile) => (
            <span
              className="tile"
              key={tile.name}
              onClick={() => goToShop(tile.name)}
            >
              <img src={tile.img} alt={tile.name} />
              <div className="tile-content">
                <span className="tile-label">{tile.name}</span>
              </div>
            </span>
          ))}
        </div>
      </div>

      {/* ✅ Trending Products — shuffled for variety */}
      <Carousel
        title="Trending Products"
        products={trendingProducts}
        onShowProduct={(id) => navigate(`/product/${id}`)}
        loading={loading}
        visibleCount={10}
      />

      {/* ✅ Best Sellers — one featured product per vendor */}
      <Carousel
        title="Best Sellers"
        products={bestSellers}
        onShowProduct={(id) => navigate(`/product/${id}`)}
        loading={bestSellersLoading}
        visibleCount={10}
      />

      {/* ✅ Category Carousels */}
      {CATEGORY_CAROUSELS.map((cat) => {
        const prods = categoryProducts[cat];

        if (prods !== null && prods.length === 0) return null;

        return (
          <Carousel
            key={cat}
            title={cat}
            products={prods || []}
            onShowProduct={(id) => navigate(`/product/${id}`)}
            loading={prods === null}
            visibleCount={10}
          />
        );
      })}
    </div>
  );
}

export default HomePage;