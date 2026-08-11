import { useRef, useState, useEffect, useCallback } from "react";
import { cloudinaryResize } from "../utils/helpers";

const CARD_WIDTH = 136; // px per card
const CARD_GAP = 6;
const AUTO_MS = 3500; // auto-advance interval

function SkeletonCard() {
  return (
    <div className="carousel-card skeleton-card">
      <div className="skeleton-img" />
      <div className="carousel-card-body">
        <div className="skeleton-line title" />
        <div className="skeleton-line price" />
        <div className="skeleton-line rating" />
      </div>
    </div>
  );
}

function Carousel({
  title,
  products,
  onShowProduct,
  loading,
  visibleCount = 6,
}) {
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackOuterRef = useRef(null);
  const startX = useRef(0);
  const timerRef = useRef(null);

  const safeProducts = products || [];
  const totalPages = Math.max(1, Math.ceil(safeProducts.length / visibleCount));
  const stepPx = visibleCount * (CARD_WIDTH + CARD_GAP);

  // Scroll the outer container to the correct position
  const scrollToPage = useCallback(
    (p) => {
      const el = trackOuterRef.current;
      if (!el) return;
      el.scrollTo({ left: p * stepPx, behavior: "smooth" });
    },
    [stepPx],
  );

  const goTo = useCallback(
    (p) => {
      const el = trackOuterRef.current;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      const targetLeft = (p / (totalPages - 1 || 1)) * maxScroll;
      el.scrollTo({ left: targetLeft, behavior: "smooth" });
      setPage(p);
    },
    [totalPages],
  );

  const move = useCallback(
    (dir) => {
      const el = trackOuterRef.current;
      if (!el) return;
      const scrollAmount = Math.max(260, el.clientWidth * 0.75);
      el.scrollBy({ left: dir * scrollAmount, behavior: "smooth" });
    },
    [],
  );

  // Reset on product change
  useEffect(() => {
    setPage(0);
    if (trackOuterRef.current) {
      trackOuterRef.current.scrollLeft = 0;
    }
  }, [products]);

  // Auto-advance
  // useEffect(() => {
  //   if (paused || loading || safeProducts.length <= visibleCount) return;
  //   timerRef.current = setInterval(() => move(1), AUTO_MS);
  //   return () => clearInterval(timerRef.current);
  // }, [paused, loading, safeProducts.length, visibleCount, move]);

  // Sync page dot when user manually scrolls
  const handleScroll = useCallback(() => {
    const el = trackOuterRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      setPage(0);
      return;
    }
    const pageRatio = el.scrollLeft / maxScroll;
    const computedPage = Math.round(pageRatio * (totalPages - 1));
    setPage(Math.min(Math.max(0, computedPage), totalPages - 1));
  }, [totalPages]);

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
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          className="carousel-nav prev"
          onClick={() => move(-1)}
          aria-label="Previous"
        >
          ‹
        </button>

        {/* Outer: overflow hidden, we drive scrollLeft programmatically */}
        <div
          className="carousel-track-outer"
          ref={trackOuterRef}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="carousel-track" style={{ gap: `${CARD_GAP}px` }}>
            {loading
              ? Array.from({ length: visibleCount }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : safeProducts.map((p) => {
                  if (!p) return null;
                  const rawImg = p?.thumb || (Array.isArray(p?.images) && p.images.length > 0 ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.url) : null);


                  const disc =
                    p.original > p.price
                      ? Math.round((1 - p.price / p.original) * 100)
                      : 0;

                  return (
                    <div
                      key={p.id}
                      className="carousel-card"
                      style={{ flex: `0 0 ${CARD_WIDTH}px` }}
                      onClick={() => onShowProduct(p.id)}
                    >
                      <div
                        className="carousel-card-img"
                        style={{ height: 160 }}
                      >
                        {rawImg ? (
                          <img
                            src={rawImg}
                            alt={p.name}
                            loading="lazy"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}
                        <div
                          style={{
                            display: rawImg ? "none" : "flex",
                            height: "100%",
                            width: "100%",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 52,
                            background: "var(--cream2)",
                          }}
                        >
                          {p.emoji}
                        </div>
                        {disc > 0 && (
                          <div className="product-badge">{disc}% OFF</div>
                        )}
                      </div>

                      <div
                        className="carousel-card-body"
                        style={{ padding: "10px 12px" }}
                      >
                        <div
                          style={{
                            fontFamily: "'Playfair Display',serif",
                            fontSize: 12,
                            color: "var(--maroon)",
                            fontWeight: 700,
                            lineHeight: 1.3,
                            marginBottom: 4,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {p.name}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: 4,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: "var(--green)",
                            }}
                          >
                            ₹{p.price?.toLocaleString()}
                          </span>
                          {p.original > p.price && (
                            <span
                              style={{
                                fontSize: 10,
                                color: "var(--text-muted)",
                                textDecoration: "line-through",
                              }}
                            >
                              ₹{p.original?.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {p.rating > 0 && (
                          <div
                            style={{
                              fontSize: 10,
                              color: "var(--gold)",
                              marginTop: 2,
                            }}
                          >
                            {"★".repeat(Math.min(5, Math.floor(p.rating)))}{" "}
                            {p.rating}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>

        <button
          className="carousel-nav next"
          onClick={() => move(1)}
          aria-label="Next"
        >
          ›
        </button>
      </div>

      {/* Dots */}
      {totalPages > 1 && !loading && (
        <div className="carousel-dots" style={{ marginTop: 14 }}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Page ${i + 1}`}
              style={{
                height: 7,
                width: i === page ? 22 : 7,
                borderRadius: 4,
                background: i === page ? "var(--gold)" : "var(--border)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Carousel;
