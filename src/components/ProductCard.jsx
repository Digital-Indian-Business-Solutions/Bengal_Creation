import { memo } from "react";

const ProductCard = memo(function ProductCard({ p, inCart, inWish, onAddCart, onToggleWish, onShowProduct }) {
  const disc = p.original > 0
    ? Math.round((1 - p.price / p.original) * 100)
    : 0;

  return (
    <div className="product-card">
      <div className="product-img" onClick={() => onShowProduct(p.id)}>
        {p.thumb ? (
          <img src={p.thumb} alt={p.name} loading="lazy" />
        ) : (
          <span style={{ fontSize: 64 }}>{p.emoji}</span>
        )}
        {disc > 0 && <div className="product-badge">{disc}% OFF</div>}
        <button
          className="wishlist-btn"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWish(p.id);
          }}
        >
          {inWish ? "❤️" : "🤍"}
        </button>
      </div>
      <div className="product-body">
        <div className="product-name">{p.name}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span className="product-price">₹{p.price.toLocaleString()}</span>
          {p.original > p.price && (
            <span className="product-price-original">
              ₹{p.original.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
