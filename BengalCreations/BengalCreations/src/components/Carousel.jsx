import { useRef, useState } from "react";

function Carousel({ title, products, onShowProduct, loading }) {
  const [idx, setIdx] = useState(0);
  const startX = useRef(0);
  const CAR_VISIBLE = 5;
  const pages = Math.ceil(products.length / CAR_VISIBLE);

  const move = (dir) => setIdx((i) => (i + dir + pages) % pages);
  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = startX.current - e.changedTouches[0].clientX;

    if (diff > 50) move(1); // swipe left
    if (diff < -50) move(-1); // swipe right
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
                  const disc = Math.round((1 - p.price / p.original) * 100);
                  return (
                    <div
                      className="carousel-card"
                      key={p.id}
                      onClick={() => onShowProduct(p.id)}
                    >
                      <div className="carousel-card-img">
                        {p.thumb ? (
                          <img
                            src={p.thumb.replace(
                              "/upload/",
                              "/upload/w_400,q_auto,f_auto/",
                            )}
                            srcSet={`
                              ${p.images[0].replace("/upload/", "/upload/w_200,q_auto,f_auto/")} 200w,
                              ${p.images[0].replace("/upload/", "/upload/w_400,q_auto,f_auto/")} 400w,
                              ${p.images[0].replace("/upload/", "/upload/w_800,q_auto,f_auto/")} 800w,
                              ${p.images[0].replace("/upload/", "/upload/w_1200,q_auto,f_auto/")} 1200w
                              `}
                            sizes="(max-width: 480px) 200px,
                                   (max-width: 768px) 400px,
                                   (max-width: 1200px) 800px,
                                  1200px"
                            alt={p.name}
                            loading="lazy"
                          />
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
                        {/* <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>{p.vendor}</div> */}
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
      {/* <div className="carousel-dots">
        {Array.from({ length: pages }, (_, i) => (
          <div key={i} className="carousel-dot" style={{ width: i === idx ? 24 : 8, background: i === idx ? "var(--gold)" : "var(--border)" }} onClick={() => setIdx(i)} />
        ))}
      </div> */}
    </div>
  );
}
export default Carousel;
