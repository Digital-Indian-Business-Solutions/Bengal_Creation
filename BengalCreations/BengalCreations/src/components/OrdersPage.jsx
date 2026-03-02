

function OrdersPage({ orders }) {
  const statusColors = { confirmed: "var(--gold)", shipped: "#1565c0", delivered: "var(--green)", cancelled: "var(--maroon)" };
  const statusIcons = { confirmed: "✅", shipped: "🚚", delivered: "📦", cancelled: "❌" };
  return (
    <div>
      <div className="orders-header">
        <h2>📦 My Orders</h2>
        <p style={{ color: "rgba(245,228,184,0.7)", marginTop: 4, fontSize: 14 }}>Track your Bengal Creations orders</p>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px" }}>
        {!orders.length ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
            <h3 style={{ color: "var(--maroon)", marginBottom: 8 }}>No orders yet</h3>
            <p style={{ color: "var(--text-muted)" }}>Start shopping to see your orders here!</p>
          </div>
        ) : orders.map(o => (
          <div key={o.id} style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow)", marginBottom: 20 }}>
            <div style={{ background: "linear-gradient(135deg,var(--maroon-dark),var(--maroon))", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: 2, color: "rgba(245,228,184,0.6)", textTransform: "uppercase" }}>Order ID</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: "var(--gold-light)", fontWeight: 700 }}>{o.id}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "rgba(245,228,184,0.6)" }}>{o.date}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--gold-light)" }}>₹{o.total.toLocaleString()}</div>
              </div>
            </div>
            <div style={{ padding: "20px 24px" }}>
              {/* Status Bar */}
              <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
                {["confirmed","shipped","delivered"].map((s, i) => {
                  const done = ["confirmed","shipped","delivered"].indexOf(o.status) >= i;
                  return (
                    <div key={s} style={{ display: "contents" }}>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: done ? statusColors[s] : "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "white", marginBottom: 4 }}>{done ? statusIcons[s] : "○"}</div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: done ? "var(--text)" : "var(--text-muted)", fontWeight: done ? 600 : 400 }}>{s}</div>
                      </div>
                      {i < 2 && <div style={{ flex: 0.5, height: 2, background: done ? "var(--gold)" : "var(--border)", marginBottom: 20 }} />}
                    </div>
                  );
                })}
              </div>
              {/* Items */}
              {o.items.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: 8, background: "var(--cream)", borderRadius: 8, marginBottom: 8 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 6, overflow: "hidden", background: "var(--cream2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                    {p.thumb ? <img src={p.thumb} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : p.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--maroon)" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Qty: {p.qty || 1} · ₹{p.price.toLocaleString()} each</div>
                  </div>
                  <div style={{ fontWeight: 700, color: "var(--green)" }}>₹{(p.price * (p.qty || 1)).toLocaleString()}</div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", borderTop: "1px solid var(--border)", paddingTop: 12, flexWrap: "wrap", gap: 8 }}>
                <span>📍 {o.address}</span>
                <span>💳 {(o.payment || "UPI").toUpperCase()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default OrdersPage;