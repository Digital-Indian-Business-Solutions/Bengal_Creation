import { memo } from "react";

const ProductCard = memo(function ProductCard({
  p,
  inCart,
  inWish,
  onAddCart,
  onToggleWish,
  onShowProduct,
}) {
  if (!p) return null;
  const disc =
    p.original > 0 ? Math.round((1 - p.price / p.original) * 100) : 0;
  const getShortName = (name) => {
    if (!name) return "";
    const words = name.trim().split(/\s+/);
    return words.length > 5
      ? words.slice(0, 5).join(" ") + "..."
      : name;
  };
  const imgUrl = p.thumb || (Array.isArray(p.images) && p.images.length > 0 ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.url) : null);
  return (
    <div onClick={() => onShowProduct(p.id)} className="product-card">
      <div className="product-img" >
        {imgUrl ? (
          <img src={imgUrl} alt={p.name || ""} loading="lazy" />
        ) : (
          <span style={{ fontSize: 64 }}>{p.emoji || "🛍️"}</span>
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
        <div className="product-name">
          {/* {console.log(p.name.split(/\s+/).length)} */}
        {getShortName(p.name)}
        </div>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span className="product-price">₹{(p.price || 0).toLocaleString()}</span>
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
