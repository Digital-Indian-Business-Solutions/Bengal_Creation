import { useRef, useState, useEffect } from "react";
import { cloudinaryResize } from "../utils/helpers";

const CAR_VISIBLE = 5;

function Carousel({ title, products, onShowProduct, loading }) {
  const [idx, setIdx] = useState(0);
  const startX = useRef(0);
  const pages = Math.max(1, Math.ceil(products.length / CAR_VISIBLE));

  // Reset to first page whenever the product list changes
  useEffect(() => { setIdx(0); }, [products]);

  const move = (dir) => {
    if (pages <= 1) return;
    setIdx((i) => (i + dir + pages) % pages);
  };

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = startX.current - e.changedTouches[0].clientX;
    if (diff > 50) move(1);
    if (diff < -50) move(-1);
  };

  return (
    <div className="section alpona-bg">
      <h2 className="section-title">{title}</h2>
      <div
        className="carousel-wrapper"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button className="carousel-nav prev" onClick={() => move(-1)}>
          ‹
        </button>
        <div className="carousel-track-outer">
          <div
            className="carousel-track"
            style={{ transform: `translateX(-${idx * CAR_VISIBLE * 240}px)` }}
          >
            {loading
              ? Array.from({ length: CAR_VISIBLE }).map((_, i) => (
                  <div className="carousel-card skeleton-card" key={i}>
                    <div className="skeleton-img"></div>
                    <div className="carousel-card-body">
                      <div className="skeleton-line title"></div>
                      <div className="skeleton-line price"></div>
                      <div className="skeleton-line rating"></div>
                    </div>
                  </div>
                ))
              : products.map((p) => {
                  const img = p?.images?.[0]?.url;
                  const disc = Math.round((1 - p.price / p.original) * 100);
                  return (
                    <div
                      className="carousel-card"
                      key={p.id}
                      onClick={() => onShowProduct(p.id)}
                    >
                      <div className="carousel-card-img">
                        {p.thumb ? (
                          img ? (
                            <img
                              src={cloudinaryResize(img, 400)}
                              srcSet={`
                                ${cloudinaryResize(p.images?.[0]?.url, 200)} 200w,
                                ${cloudinaryResize(p.images?.[0]?.url, 400)} 400w,
                                ${cloudinaryResize(p.images?.[0]?.url, 800)} 800w
                              `}
                              sizes="(max-width:480px) 200px, (max-width:768px) 400px, 800px"
                              alt={p.name}
                              loading="lazy"
                            />
                          ) : (
                            <img src={p.thumb} alt={p.name} loading="lazy" />
                          )
                        ) : (
                          <div
                            style={{
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 64,
                              background: "var(--cream2)",
                            }}
                          >
                            {p.emoji}
                          </div>
                        )}
                        {disc > 0 && (
                          <div className="product-badge">{disc}% OFF</div>
                        )}
                      </div>
                      <div className="carousel-card-body">
                        <div
                          style={{
                            alignSelf: "center",
                            fontFamily: "'Playfair Display',serif",
                            fontSize: 13,
                            color: "var(--maroon)",
                            fontWeight: 700,
                            lineHeight: 1.3,
                            marginBottom: 0,
                            height: 20,
                            overflow: "hidden",
                          }}
                        >
                          {p.name}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 16,
                              fontWeight: 700,
                              color: "var(--green)",
                            }}
                          >
                            ₹{p.price.toLocaleString()}
                          </span>
                          {p.original > p.price && (
                            <span
                              style={{
                                fontSize: 11,
                                color: "var(--text-muted)",
                                textDecoration: "line-through",
                              }}
                            >
                              ₹{p.original.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--gold)",
                            marginTop: 3,
                          }}
                        >
                          {"★".repeat(Math.floor(p.rating))}{" "}
                          {p.rating > 0 && p.rating}
                        </div>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
        <button className="carousel-nav next" onClick={() => move(1)}>
          ›
        </button>
      </div>
    </div>
  );
}

export default Carousel;
