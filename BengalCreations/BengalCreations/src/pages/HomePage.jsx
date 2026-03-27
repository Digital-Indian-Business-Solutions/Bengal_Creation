import { useNavigate } from "react-router-dom";
import { useMemo, useCallback } from "react";
import Carousel from "../components/Carousel";
import FaceBook from "../assets/facebook.png";
import InstaGram from "../assets/instagram.png";
import TwitTer from "../assets/x.png";
import YouTube from "../assets/youtube.png";
import Logo from "../assets/logo.png";
import digitalndian from "../assets/digitalindian logo.JPG";

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

  const goToShop = useCallback((category) => {
    setFilterCategory(category);
    navigate("/shop", { state: { category } });
  }, [setFilterCategory, navigate]);

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
      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "12px 2px",
              }}
            >
              <img src={Logo} alt="" width={60} />
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                <h2>Bengal Creations</h2>
                <span>Heritage Handcrafted</span>
              </div>
            </div>
            <div>
              <img src={digitalndian} alt="" width={60} />
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 2 }}> 
                <h6>A Unit of Digital Indian Business Solutions Pvt. Ltd</h6>
              </div>
            </div>
            
            <div className="social-icons">
              <div className="social-icon">
                <img src={FaceBook} alt="Facebook" width={20} />
              </div>
              <div className="social-icon">
                <img src={InstaGram} alt="Instagram" width={20} />
              </div>
              <div className="social-icon">
                <img src={TwitTer} alt="Twitter" width={20} />
              </div>
              <div className="social-icon">
                <img src={YouTube} alt="YouTube" width={20} />
              </div>
            </div>
          </div>

          <div className="footer-col">
            <h4>Explore</h4>
            <div className="footer-dis">
              {[
                "Handloom Sarees",
                "Terracotta Crafts",
                "Dokra Art",
                "Bengal Sweets",
                "Jute Products",
              ].map((c) => (
                <a key={c} style={{ cursor: "pointer" }} onClick={() => goToShop(c)}>
                  {c}
                </a>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <div className="footer-dis">
              <a style={{ cursor: "pointer" }} onClick={() => navigate("/about")}>
                About Us
              </a>
              <a style={{ cursor: "pointer" }} onClick={() => navigate("/contact")}>
                Contact
              </a>
              <a>Press</a>
              <a style={{ cursor: "pointer" }} onClick={() => navigate("/vendor")}>
                Sell With Us
              </a>
              <a>Careers</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Help</h4>
            <div className="footer-dis">
              <a>Privacy Policy</a>
              <a>Terms of Service</a>
              <a>Shipping Policy</a>
              <a>Returns</a>
              <a>FAQ</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2025 Digital Indian. All rights reserved. | Made with ❤️ in Bengal</span>
          <span>🇮🇳 West Bengal, India</span>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
