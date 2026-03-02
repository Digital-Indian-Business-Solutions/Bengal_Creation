import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CheckoutPage({ cart, onPlaceOrder }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", pin: "" });
  const [payment, setPayment] = useState("upi");
  const [ordered, setOrdered] = useState(false);
  const [orderId, setOrderId] = useState("");

  const subtotal = cart.reduce((s, p) => s + p.price * (p.qty || 1), 0);
  const tax = Math.round(subtotal * 0.05);

  const handlePlace = () => {
    if (!form.name || !form.phone || !form.address || !form.city || !form.pin) { alert("Please fill all required fields"); return; }
    if (!/^\d{6}$/.test(form.pin)) { alert("Please enter a valid 6-digit PIN code"); return; }
    const oid = "ORD-" + Date.now().toString().slice(-6);
    onPlaceOrder({ id: oid, items: [...cart], total: subtotal + tax, address: `${form.name}, ${form.address}, ${form.city} – ${form.pin}`, payment, status: "confirmed", date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) });
    setOrderId(oid);
    setOrdered(true);
  };

  if (ordered) return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ fontSize: 80, marginBottom: 16 }}>🎉</div>
      <h2 style={{ color: "var(--maroon)", fontSize: 32, marginBottom: 12 }}>Order Placed!</h2>
      <p style={{ color: "var(--text-muted)", fontSize: 16, marginBottom: 8 }}>Order ID: {orderId} · Payment: {payment.toUpperCase()}</p>
      <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>Thank you for shopping from Bengal's finest artisans!</p>
      <button className="btn-gold" onClick={() => navigate("/orders")}>📦 Track My Order</button>
    </div>
  );

  return (
    <div>
      <div className="orders-header">
        <h2>🛍️ Checkout</h2>
      </div>
      <div className="checkout-layout">
        <div>
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, padding: 32, marginBottom: 24 }}>
            <h3 style={{ color: "var(--maroon)", marginBottom: 24 }}>Delivery Information</h3>
            <div className="form-grid">
              {[["name", "Full Name", "text"], ["phone", "Phone", "tel"], ["address", "Full Address", "text"], ["city", "City", "text"], ["pin", "PIN Code", "text"]].map(([key, label, type]) => (
                <div key={key} className={`form-group${key === "address" ? " full" : ""}`}>
                  <label>{label} <span className="req">*</span></label>
                  <input className="form-control" type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, padding: 32 }}>
            <h3 style={{ color: "var(--maroon)", marginBottom: 20 }}>Payment Method</h3>
            {[["upi", "📱 UPI / GPay / PhonePe"], ["card", "💳 Debit / Credit Card"], ["cod", "💵 Cash on Delivery"], ["netbanking", "🏦 Net Banking"]].map(([val, label]) => (
              <div key={val} className={`payment-option${payment === val ? " selected" : ""}`} onClick={() => setPayment(val)}>
                <input type="radio" readOnly checked={payment === val} style={{ accentColor: "var(--gold)" }} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="order-summary">
          <h3 style={{ color: "var(--maroon)", marginBottom: 20 }}>Order Summary</h3>
          {cart.map(p => (
            <div key={p.id} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ width: 50, height: 50, borderRadius: 8, overflow: "hidden", background: "var(--cream2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                {p.thumb ? <img src={p.thumb} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : p.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--maroon)", lineHeight: 1.3 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Qty: {p.qty || 1}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "var(--green)" }}>₹{(p.price * (p.qty || 1)).toLocaleString()}</div>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 14, color: "var(--text-muted)" }}><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 14, color: "var(--text-muted)" }}><span>GST (5%)</span><span>₹{tax.toLocaleString()}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "2px solid var(--border)", fontWeight: 700, fontSize: 18 }}><span>Total</span><span style={{ color: "var(--green)" }}>₹{(subtotal + tax).toLocaleString()}</span></div>
          <button className="btn-gold" style={{ width: "100%", marginTop: 20 }} onClick={handlePlace}>Place Order →</button>
          <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>🔒 Secure & encrypted checkout</p>
        </div>
      </div>
    </div>
  );
}
export default CheckoutPage;