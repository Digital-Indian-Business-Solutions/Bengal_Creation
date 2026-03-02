function CartPanel({ cart, isOpen, onClose, removeFromCart, onCheckout }) {
  const total = cart.reduce((s, p) => s + p.price * (p.qty || 1), 0);
  return (
    <div className={`cart-overlay${isOpen ? " open" : ""}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cart-panel">
        <div className="cart-header">
          <h3>🛒 Your Cart</h3>
          <button className="cart-close" onClick={onClose}>✕</button>
        </div>
        <div className="cart-items">
          {!cart.length ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛍️</div>
              <p>Your cart is empty</p>
            </div>
          ) : cart.map(p => (
            <div className="cart-item" key={p.id}>
              <div className="cart-item-img">
                {p.thumb ? <img src={p.thumb} alt={p.name} /> : p.emoji}
              </div>
              <div className="cart-item-info">
                <div className="cart-item-name">{p.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.vendor}</div>
                <div className="cart-item-price">
                  ₹{(p.price * (p.qty || 1)).toLocaleString()}
                  {p.qty > 1 && <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>×{p.qty}</span>}
                </div>
              </div>
              <button className="cart-item-remove" onClick={() => removeFromCart(p.id)}>✕</button>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
            <button className="btn-gold" style={{ width: "100%" }} onClick={onCheckout}>Proceed to Checkout →</button>
            <button className="btn-outline" style={{ width: "100%", marginTop: 8 }} onClick={onClose}>Continue Shopping</button>
          </div>
        )}
      </div>
    </div>
  );
}
export default CartPanel;
