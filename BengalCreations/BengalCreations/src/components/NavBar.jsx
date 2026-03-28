import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import MobileSideNav from "./MobileSideNav";

function Navbar({
  cart,
  wishlist,
  currentUser,
  openCart,
  onSearch,
  openLogin,
  doLogout,
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const cartCount = cart.length;

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const handleSearch = useCallback(() => {
    if (search.trim()) {
      onSearch(search);
      navigate("/shop", { state: { searchQuery: search } });
    }
  }, [search, onSearch, navigate]);

  return (
    <nav className="navbar">
      <div className="nav-top">
        <div
          className="nav-logo"
          onClick={() => {
            if (currentUser?.role === "vendor") navigate("/dashboard");
            else navigate("/");
          }}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexDirection: "row",
          }}
        >
          <img src={Logo} alt="Bengal Creations Logo" width={60} />
          <div
            style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}
          >
            <div className="nav-logo-main">Bengal Creations</div>
            <div className="nav-logo-sub">Heritage Handcrafted</div>
          </div>
        </div>

        <div className="nav-actions">
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <button
              className="nav-btn"
              onClick={() => {
                if (currentUser) setShowDropdown((v) => !v);
                else openLogin("customer");
              }}
            >
              {currentUser
                ? `${currentUser.role === "vendor" ? "🏪" : "👤"} ${currentUser.name.split(" ")[0]}`
                : "👤 Sign In"}
            </button>
            {showDropdown && currentUser && (
              <div className="user-dropdown">
                {currentUser.role === "vendor" && (
                  <div
                    className="user-dropdown-item"
                    onClick={() => {
                      navigate("/dashboard");
                      setShowDropdown(false);
                    }}
                  >
                    📊 Dashboard
                  </div>
                )}
                {currentUser.role === "customer" && (
                  <div
                    className="user-dropdown-item"
                    onClick={() => {
                      navigate("/wishlist");
                      setShowDropdown(false);
                    }}
                  >
                    ❤️ Wishlist
                  </div>
                )}
                {currentUser.role === "customer" && (
                  <div
                    className="user-dropdown-item"
                    onClick={() => {
                      navigate("/orders");
                      setShowDropdown(false);
                    }}
                  >
                    📦 My Orders
                  </div>
                )}
                <div
                  className="user-dropdown-item"
                  onClick={() => {
                    doLogout();
                    setShowDropdown(false);
                  }}
                >
                  🚪 Sign Out
                </div>
              </div>
            )}
          </div>

          {currentUser?.role !== "vendor" && (
            <button className="nav-btn" onClick={() => navigate("/")}>
              🏠 Home
            </button>
          )}
          {currentUser?.role === "vendor" && (
            <button className="nav-btn" onClick={() => navigate("/dashboard")}>
              📊 Dashboard
            </button>
          )}
          
           
          
          <button className="nav-btn" onClick={() => navigate("/about")}>
            ℹ️ About
          </button>
          <button className="nav-btn" onClick={() => navigate("/contact")}>
            📞 Contact
          </button>
        </div>

        <button className="hamburger" onClick={() => setMobileOpen(true)}>
          ☰
        </button>

        <div className="nav-search">
          <input
            type="text"
            value={search}
            placeholder="Search products, shops, crafts..."
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch}>🔍 Search</button>
        </div>
        <div className="nav-btn cartbtn">
           <img src="https://cdn-icons-png.flaticon.com/512/1413/1413908.png"/>
           <p>{cartCount}</p>
           <button onClick={openCart}>
              <span className="cart-badge">Cart</span>
            </button>
        </div>
      </div>

      <MobileSideNav
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        cart={cart}
        wishlist={wishlist}
        currentUser={currentUser}
        openCart={openCart}
        openLogin={openLogin}
        doLogout={doLogout}
      />
    </nav>
  );
}

export default Navbar;
