import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function MobileSideNav({
  isOpen,
  onClose,
  cart,
  wishlist,
  currentUser,
  openCart,
  openLogin,
  doLogout,
}) {
  const navigate = useNavigate();
  const cartCount = cart.length;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  const goTo = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`mobile-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
      />

      {/* Side Drawer */}
      <div className={`mobile-sidenav ${isOpen ? "open" : ""}`}>
        <div className="mobile-header">
          <h3>Bengal Creations</h3>
          <button onClick={onClose}>✖</button>
        </div>

        {/* User Section */}
        <div className="mobile-user">
          {currentUser ? (
            <>
              <p>
                {currentUser.role === "vendor" ? "🏪" : "👤"}{" "}
                {currentUser.name}
              </p>

              {currentUser.role === "vendor" && (
                <button onClick={() => goTo("/dashboard")}>
                  📊 Dashboard
                </button>
              )}

              {currentUser.role === "customer" && (
                <>
                  <button onClick={() => goTo("/wishlist")}>
                    ❤️ Wishlist ({wishlist.length})
                  </button>
                  <button onClick={() => goTo("/orders")}>
                    📦 My Orders
                  </button>
                  <button onClick={() => { openCart(); onClose(); }}>
                    🛒 Cart ({cartCount})
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  doLogout();
                  onClose();
                }}
              >
                🚪 Sign Out
              </button>
            </>
          ) : (
            <button onClick={() => { openLogin("customer"); onClose(); }}>
              👤 Sign In
            </button>
          )}
        </div>

        <hr />

        {/* Navigation Links */}
        <div className="mobile-links">
          {currentUser?.role !== "vendor" && (
            <button onClick={() => goTo("/")}>🏠 Home</button>
          )}

          <button onClick={() => goTo("/about")}>ℹ️ About</button>
          <button onClick={() => goTo("/contact")}>📞 Contact</button>
        </div>
      </div>
    </>
  );
}

export default MobileSideNav;