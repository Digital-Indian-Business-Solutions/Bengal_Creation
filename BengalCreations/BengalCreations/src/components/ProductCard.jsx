

function ProductCard({ p, inCart, inWish, onAddCart, onToggleWish, onShowProduct }) {
  const disc = Math.round((1 - p.price / p.original) * 100);
  return (
    <div className="product-card">
      <div className="product-img" onClick={() => onShowProduct(p.id)}>
        {p.thumb ? <img src={p.thumb} alt={p.name} loading="lazy" /> : <span style={{ fontSize: 64 }}>{p.emoji}</span>}
        {disc > 0 && <div className="product-badge">{disc}% OFF</div>}
        <button className="wishlist-btn" onClick={e => { e.stopPropagation(); onToggleWish(p.id); }}>
          {inWish ? "❤️" : "🤍"}
        </button>
      </div>
      <div className="product-body">
        <div className="product-name">{p.name}</div>
        <div className="product-vendor">by {p.vendor} · {p.district}</div>
        <div className="product-rating">{"★".repeat(Math.floor(p.rating))} {p.rating} ({p.reviews})</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span className="product-price">₹{p.price.toLocaleString()}</span>
          {p.original > p.price && <span className="product-price-original">₹{p.original.toLocaleString()}</span>}
        </div>
        <button className={`add-cart-btn${inCart ? " added" : ""}`} onClick={() => onAddCart(p.id)}>
          {inCart ? "✓ Added to Cart" : "🛒 Add to Cart"}
        </button>
      </div>
    </div>
  );
}
export default ProductCard;