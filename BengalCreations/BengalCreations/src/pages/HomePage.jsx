import { useNavigate } from "react-router-dom";
import { useMemo, useCallback } from "react";
import Carousel from "../components/Carousel";
import FaceBook from "../assets/facebook.png";
import InstaGram from "../assets/instagram.png";
import TwitTer from "../assets/x.png";
import YouTube from "../assets/youtube.png";
import Logo from "../assets/logo.png";
import Digitalndian from "../assets/digitalindan-logo.png";
import Razorpay from "../assets/payment-method/razorpay.png";
import UPI from "../assets/payment-method/upi.png";
import Visa from "../assets/payment-method/visa.png";
import MasterCard from "../assets/payment-method/mastercard.png";
import RuPay from "../assets/payment-method/rupay.png";
import GPay from "../assets/payment-method/gpay.png";
import Paytm from "../assets/payment-method/paytm.png";
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

  const goToShop = useCallback(
    (category) => {
      setFilterCategory(category);
      navigate("/shop", { state: { category } });
    },
    [setFilterCategory, navigate],
  );

  const CATEGORY_CAROUSELS = [
    "Handloom Sarees",
    "Dokra Art",
    "Jute Products",
    "Terracotta Crafts",
    "Wooden Handicrafts",
    "Bengal Sweets",
  ];

  // Memoize per-category slices so carousel children don't get new array refs
  const productsByCategory = useMemo(() => {
    const map = {};
    CATEGORY_CAROUSELS.forEach((cat) => {
      map[cat] = allProducts.filter((p) => p.category === cat);
    });
    return map;
  }, [allProducts]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {/* Gallery Tiles */}
      <div className="section alpona-bg">
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

      {/* Trending Products */}
      <Carousel
        title="Trending Products"
        products={allProducts}
        onShowProduct={(id) => navigate(`/product/${id}`)}
        loading={loading}
      />

      {/* Best Sellers */}
      <Carousel
        title="Best Sellers"
        products={[...allProducts].reverse()}
        onShowProduct={(id) => navigate(`/product/${id}`)}
        loading={loading}
      />

      {/* Per-Category Carousels */}
      {CATEGORY_CAROUSELS.map((cat) => (
        <Carousel
          key={cat}
          title={cat}
          products={productsByCategory[cat] || []}
          onShowProduct={(id) => navigate(`/product/${id}`)}
          loading={loading}
        />
      ))}

      {/* Footer */}
      
    </div>
  );
}

export default HomePage;
