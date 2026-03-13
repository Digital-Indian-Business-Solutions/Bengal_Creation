import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function OrdersPage({ userId }) {
  const API = import.meta.env.VITE_API || "http://localhost:5000/api";
  const [orders, setOrders] = useState([]);
  const nev=useNavigate()
  const statusColors = {
    Pending: "#999",
    Processing: "#ff9800",
    Shipped: "#1565c0",
    Delivered: "var(--green)",
    Cancelled: "var(--maroon)",
  };

  const statusIcons = {
    Pending: "⏳",
    Processing: "⚙️",
    Shipped: "🚚",
    Delivered: "📦",
    Cancelled: "❌",
  };
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API}/user/${userId}`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Order fetch error", err);
    }
  };
  if(!userId){
    nev("/")
  }

  return (
    <div>
      <div className="orders-header">
        <h2>📦 My Orders</h2>
        <p
          style={{ color: "rgba(245,228,184,0.7)", marginTop: 4, fontSize: 14 }}
        >
          Track your Bengal Creations orders
        </p>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px" }}>
        {!orders.length ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
            <h3 style={{ color: "var(--maroon)", marginBottom: 8 }}>
              No orders yet
            </h3>
            <p style={{ color: "var(--text-muted)" }}>
              Start shopping to see your orders here!
            </p>
          </div>
        ) : (
          orders.map((o) => (
            <div
              key={o._id}
              style={{
                background: "white",
                border: "1px solid var(--border)",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "var(--shadow)",
                marginBottom: 20,
              }}
            >
              {/* Order Header */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg,var(--maroon-dark),var(--maroon))",
                  padding: "16px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: 2,
                      color: "rgba(245,228,184,0.6)",
                      textTransform: "uppercase",
                    }}
                  >
                    Order ID
                  </div>
                  <div
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: 18,
                      color: "var(--gold-light)",
                      fontWeight: 700,
                    }}
                  >
                    {o._id}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "rgba(245,228,184,0.6)" }}>
                    {new Date(o.createdAt).toLocaleDateString()}
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "var(--gold-light)",
                    }}
                  >
                    ₹{o.totalAmount}
                  </div>
                </div>
              </div>
              <div style={{ padding: "20px 24px" }}>
                {/* Status Bar */}
                <div
                  style={{
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      background: statusColors[o.status],
                      color: "white",
                      fontSize: 13,
                    }}
                  >
                    {statusIcons[o.paymentStatus]} {o.status}
                  </div>

                  <div style={{ fontSize: 12 }}>
                    Payment: {o.paymentMethod} ({o.paymentStatus})
                  </div>
                </div>

                {/* Items */}
                {o.items.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: 10,
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>
                        {item.product?.name}
                      </div>

                      <div style={{ fontSize: 12, color: "#777" }}>
                        Qty: {item.quantity} · ₹{item.price}
                      </div>
                    </div>

                    <div style={{ fontWeight: 700 }}>
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    color: "var(--text-muted)",
                    borderTop: "1px solid var(--border)",
                    paddingTop: 12,
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  📍{" "}
                  {`${o.address?.fullName},${o.address?.city},${o.address?.area},${o.address?.pincode},${o.address?.phone}` ||
                    "Address"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
export default OrdersPage;
