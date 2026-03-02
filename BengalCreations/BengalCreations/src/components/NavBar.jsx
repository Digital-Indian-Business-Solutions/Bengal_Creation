import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/logo.png";

function Navbar({ cart, wishlist, currentUser, openCart, onSearch, openLogin, doLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const cartCount = cart.reduce((s, c) => s + (c.qty || 1), 0);

  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    }
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const handleSearch = () => {
    if (search.trim()) {
      onSearch(search);
      navigate("/shop", { state: { searchQuery: search } });
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-top">
      
           <div className="nav-logo" onClick={() => navigate("/")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4, flexDirection: "row" }}>
          <img src={Logo} alt="Bengal Creations Logo" width={60} />
         <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
           <div className="nav-logo-main">Bengal Creations</div>
          <div className="nav-logo-sub">Heritage Handcrafted</div>
         </div>
        </div>
        
       
        
        <div className="nav-actions">
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <button className="nav-btn" onClick={() => {
              if (currentUser) setShowDropdown(v => !v);
              else openLogin("customer");
            }}>
              {currentUser ? `${currentUser.role === "vendor" ? "🏪" : "👤"} ${currentUser.name.split(" ")[0]}` : "👤 Sign In"}
            </button>
            {showDropdown && currentUser && (
              <div className="user-dropdown">
                {currentUser.role === "vendor" && (
                  <div className="user-dropdown-item" onClick={() => { navigate("/dashboard"); setShowDropdown(false); }}>📊 Dashboard</div>
                )}
                {currentUser.role === "customer" && (
                  <div className="user-dropdown-item" onClick={() => { navigate("/wishlist"); setShowDropdown(false); }}>❤️ Wishlist</div>
                )}
                {currentUser.role === "customer" && (
                  <div className="user-dropdown-item" onClick={() => { navigate("/orders"); setShowDropdown(false); }}>📦 My Orders</div>
                )}

                <div className="user-dropdown-item" onClick={() => { doLogout(); setShowDropdown(false); }}>🚪 Sign Out</div>
              </div>
            )}
          </div>
          {currentUser?.role!=="vendor"&&(
            
          <button className="nav-btn" onClick={() => navigate("/")}>🏠 Home</button>
          )}
          {/* { currentUser?.role === "vendor" || currentUser?.role === "customer" ? (
          <button className="nav-btn" onClick={() => navigate("/shop")}>🛍️ Shop</button>
            ) : null
          } */}
          
          {currentUser?.role === "vendor" && (
            <button className="nav-btn" onClick={() => navigate("/dashboard")}>📊 Dashboard</button>
          )}
          {/* {currentUser?.role=== "customer" &&(
          <button className="nav-btn" onClick={() => navigate("/shop")}>🛍️ Shop</button>
            )} */}

          {/* {currentUser?.role === "customer" && (
            <button className="nav-btn" onClick={() => navigate("/orders")}>📦 My Orders</button>
          )} */}
          {/* {currentUser?.role === "customer" && (
            <button className="nav-btn" onClick={() => navigate("/wishlist")}>
              ❤️ Wishlist <span className="wish-badge">{wishlist.length}</span>
            </button>
          )} */}
          {currentUser?.role === "customer" && (
            <button className="nav-btn" onClick={openCart}>
              🛒 Cart <span className="cart-badge">{cartCount}</span>
            </button>
          )}
          <button className="nav-btn" onClick={() => navigate("/about")}>ℹ️ About</button>
          <button className="nav-btn" onClick={() => navigate("/contact")}>📞 Contact</button>
        </div>
        <div className="nav-search" style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", maxWidth: 400, justifyContent: "center", justifySelf: "center" }}>
          <input
            type="text" value={search}
            placeholder="Search products, shops, crafts..."
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch}>🔍 Search</button>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;