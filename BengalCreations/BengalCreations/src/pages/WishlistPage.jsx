import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";

function WishlistPage({ wishlist, cart, onAddCart, onToggleWish, onClearWishlist, allProducts }) {
  const navigate = useNavigate();
  const items = allProducts.filter((p) => wishlist.includes(p.id));

  return (
    <div className="bgabout">
      <div className="wishlist-header">
        <div>
          <h2>❤️ My Wishlist</h2>
          <div className="wishlist-count">
            {items.length} item{items.length !== 1 ? "s" : ""} saved
          </div>
        </div>
        {items.length > 0 && (
          <button
            className="btn-outline"
            style={{ color: "white", borderColor: "rgba(245,228,184,0.5)" }}
            onClick={onClearWishlist}
          >
            🗑️ Clear Wishlist
          </button>
        )}
      </div>
      <div style={{ padding: "32px", maxWidth: 1300, margin: "0 auto" }}>
        {!items.length ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>💔</div>
            <h3 style={{ color: "var(--maroon)", marginBottom: 8 }}>
              Your wishlist is empty
            </h3>
            <p style={{ color: "var(--text-muted)" }}>
              Save items you love to find them later.
            </p>
          </div>
        ) : (
          <div className="products-grid">
            {items.map((p) => (
              <ProductCard
                key={p.id}
                p={p}
                inCart={!!cart.find((c) => c.id === p.id)}
                inWish={true}
                onAddCart={onAddCart}
                onToggleWish={onToggleWish}
                onShowProduct={(id) => navigate(`/product/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WishlistPage;
