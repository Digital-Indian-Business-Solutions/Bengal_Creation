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
      <footer className="footer">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="brand-top">
              <img src={Logo} alt="Logo" className="brand-logo" />
              <div className="brand-text">
                <h2>Bengal Creations</h2>
                <span>Heritage Handcrafted</span>
              </div>
            </div>
            <a
              href="https://digitalindian.co.in/"
              target="_blank"
              rel="noopener noreferrer"
              
            >
              <img
                src={Digitalndian}
                alt="Digital Indian"
                className="company-logo"
              />

              <p className="company-desc">
                A Unit of Digital Indian Business Solutions Pvt. Ltd
              </p>
            </a>
            <div className="social-icons">
              <a href="#">
                <img src={FaceBook} alt="Facebook" />
              </a>
              <a href="#">
                <img src={InstaGram} alt="Instagram" />
              </a>
              <a href="#">
                <img src={TwitTer} alt="Twitter" />
              </a>
              <a href="#">
                <img src={YouTube} alt="YouTube" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div className="footer-col">
            <h4>Explore</h4>
            {[
              "Handloom Sarees",
              "Terracotta Crafts",
              "Dokra Art",
              "Bengal Sweets",
              "Jute Products",
            ].map((c) => (
              <p key={c} onClick={() => goToShop(c)}>
                {c}
              </p>
            ))}
          </div>

          {/* Company */}
          <div className="footer-col">
            <h4>Company</h4>
            <p onClick={() => navigate("/about")}>About Us</p>
            <p onClick={() => navigate("/contact")}>Contact</p>
            <p>Press</p>
            <p onClick={() => navigate("/vendor")}>Sell With Us</p>
            <p>Careers</p>
          </div>

          {/* Help */}
          <div className="footer-col">
            <h4>Help</h4>
            <p>Privacy Policy</p>
            <p>Terms of Service</p>
            <p>Shipping Policy</p>
            <p>Returns</p>
            <p>FAQ</p>
          </div>
        </div>
        <div className="payment-section">
          <span className="payment-title">100% Secure Payments</span>

          <div
            className="payment-icons"
            style={{ overflow: "hidden", borderRadius: "16px" }}
          >
            <img src={Razorpay} alt="Razorpay" />
            <img src={UPI} alt="UPI" />
            <img src={GPay} alt="Google Pay" />
            <img src={Paytm} alt="Paytm" />
            <img src={Visa} alt="Visa" />
            <img src={MasterCard} alt="MasterCard" />
            <img src={RuPay} alt="RuPay" />
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2025 Digital Indian. All rights reserved.</span>
          <span>Made with ❤️ in Bengal 🇮🇳</span>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
