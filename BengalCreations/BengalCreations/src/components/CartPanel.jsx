import { useNavigate } from "react-router-dom";

function CartPanel({ cart, isOpen, onClose, removeFromCart, onCheckout }) {
  // Use item.price (populated from backend) for total; fallback to product price
  const total = cart.reduce(
    (sum, item) => sum + (item.price ?? item.product?.price ?? 0) * item.quantity,
    0
  );
    const navigate = useNavigate();
  return (
    <div
      className={`cart-overlay${isOpen ? " open" : ""}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="cart-panel">
        <div className="cart-header">
          <h3>🛒 Your Cart</h3>
          <button className="cart-close" onClick={onClose}>✕</button>
        </div>
        <div  className="cart-items">
          {!cart.length ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛍️</div>
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map((item) => {
              const p = item?.product;
              if (!p) return null;
              const imgUrl = p.thumb || (Array.isArray(p.images) && p.images.length > 0 ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.url) : null);
              return (
                <div className="cart-item" onClick={()=> navigate(`/product/${p._id}`)} key={item._id || p._id}>
                  <div className="cart-item-img">
                    {imgUrl ? (
                      <img src={imgUrl} alt={p.name || ""}/>
                    ) : (
                      p.emoji || "🛍️"
                    )}
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-name">{p.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {p.vendor}
                    </div>
                    <div className="cart-item-price">
                      ₹{((p.price || 0) * (item.quantity || 1)).toLocaleString()}
                      {item.quantity > 1 && (
                        <span
                          style={{
                            fontSize: 11,
                            color: "var(--text-muted)",
                            marginLeft: 4,
                          }}
                        >
                          ×{item.quantity}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="cart-item-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromCart(p._id);
                    }}
                  >
                    ✕
                  </button>
                </div>
              );
            })
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <button
              className="btn-gold"
              style={{ width: "100%" }}
              onClick={onCheckout}
            >
              Proceed to Checkout →
            </button>
            <button
              className="btn-outline"
              style={{ width: "100%", marginTop: 8 }}
              onClick={onClose}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPanel;
