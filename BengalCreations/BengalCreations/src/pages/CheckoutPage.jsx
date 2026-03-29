import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  createOrder,
  fetchAddresses,
  createAddress,
} from "../api/api";
import { useAuth } from "../context/AuthContext";
import UPI_QR_URL from "../assets/upi_qr.png";
// ── Bank & UPI details — edit these ─────────────────────────────────────────
const BANK_DETAILS = {
  accountName: "Bengal Creations",
  accountNumber: "XXXX XXXX XXXX",
  ifsc: "XXXX0000000",
  bank: "State Bank of India",
};
const UPI_ID = "bengalcreations@upi";
const PAYMENT_METHODS = [
  { id: "COD",  icon: "💵", label: "Cash on Delivery", sub: "Pay when your order arrives" },
  { id: "BANK_TRANSFER", icon: "🏦", label: "Bank Transfer",    sub: "NEFT / IMPS to our account" },
  { id: "UPI",  icon: "📲", label: "UPI",              sub: "Scan QR or pay via UPI ID"  },
];

function CheckoutPage({ cart, onPlaceOrder }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [form, setForm] = useState({
    name: "", phone: "", address: "", city: "",
    pin: "", state: "", houseNo: "", landmark: "",
  });
  const [payment, setPayment]   = useState("cod");
  const [ordered, setOrdered]   = useState(false);
  const [orderId, setOrderId]   = useState("");
  const [addressId, setAddressId] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading]   = useState(false);

  const subtotal = cart.reduce((s, p) => s + p.product.price * (p.quantity || 1), 0);
  const tax      = Math.round(subtotal * 0.05);
  const total    = subtotal + tax;

  useEffect(() => {
    if (!currentUser?._id) return;
    fetchAddresses(currentUser._id).then(setAddresses).catch(console.error);
  }, [currentUser]);

  const addAddress = async () => {
    try {
      if (!currentUser?._id) return;
      const saved = await createAddress({
        customer:  currentUser._id,
        fullName:  form.name,
        phone:     form.phone,
        pincode:   form.pin,
        city:      form.city,
        area:      form.address,
        state:     form.state,
        houseNo:   form.houseNo,
        landmark:  form.landmark,
      });
      setAddresses((prev) => [...prev, saved]);
      setAddressId(saved._id);
      alert("Address saved!");
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlace = async () => {
    if (!addressId)        { alert("Please select or add a delivery address"); return; }
    if (!currentUser?._id) { alert("Please log in first"); return; }

    setLoading(true);
    try {
      const orderData = await createOrder({
        addressId,
        user_id:       currentUser._id,
        items:         cart,
        PaymentMethod: payment.toUpperCase(), // "COD" | "BANK_TRANSFER" | "UPI"
      });
      setOrderId(orderData._id);
      setOrdered(true);
      if (onPlaceOrder) onPlaceOrder();
    } catch (err) {
      console.error(err);
      alert("Could not place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Order Confirmation ───────────────────────────────────────────────────────
  if (ordered) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>🎉</div>
        <h2 style={{ color: "var(--maroon)", fontSize: 32, marginBottom: 12 }}>
          Order Placed!
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 16, marginBottom: 8 }}>
          Order ID: {orderId} · Payment: {payment.toUpperCase()}
        </p>

        {/* Post-order payment instructions */}
        {payment === "bank" && (
          <div style={instructionBox}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Bank Transfer Details</p>
            <p>Account Name: <b>{BANK_DETAILS.accountName}</b></p>
            <p>Account No: <b>{BANK_DETAILS.accountNumber}</b></p>
            <p>IFSC: <b>{BANK_DETAILS.ifsc}</b></p>
            <p>Bank: <b>{BANK_DETAILS.bank}</b></p>
            <p style={{ marginTop: 8, fontSize: 13, color: "var(--text-muted)" }}>
              Please use your Order ID <b>{orderId}</b> as the transfer reference.
            </p>
          </div>
        )}
        {payment === "upi" && (
          <div style={instructionBox}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Pay via UPI</p>
            {UPI_QR_URL && (
              <img src={UPI_QR_URL} alt="UPI QR" style={{ width: 160, marginBottom: 12 }} />
            )}
            <p>UPI ID: <b>{UPI_ID}</b></p>
            <p style={{ marginTop: 8, fontSize: 13, color: "var(--text-muted)" }}>
              Send ₹{total.toLocaleString()} and mention Order ID <b>{orderId}</b> in remarks.
            </p>
          </div>
        )}
        {payment === "cod" && (
          <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>
            Pay ₹{total.toLocaleString()} in cash when your order arrives. 🛵
          </p>
        )}

        <button className="btn-gold" onClick={() => navigate("/orders")}>
          📦 Track My Order
        </button>
      </div>
    );
  }

  return (
    <div className="bgabout">
      <div className="orders-header"><h2>🛍️ Checkout</h2></div>
      <div className="checkout-layout">

        {/* ── Left column ─────────────────────────────────────────────────── */}
        <div>
          {/* Delivery Info */}
          <div style={card}>
            <h3 style={{ color: "var(--maroon)", marginBottom: 24 }}>Delivery Information</h3>

            {addresses.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h4>Select Address</h4>
                {addresses.map((a) => (
                  <div
                    key={a._id}
                    onClick={() => setAddressId(a._id)}
                    style={{
                      border:     addressId === a._id ? "2px solid #800000" : "1px solid #ddd",
                      padding:    16, marginBottom: 12, cursor: "pointer",
                      borderRadius: 12, transition: "0.2s all ease",
                      background: addressId === a._id ? "#fff5e6" : "white",
                      position:   "relative",
                    }}
                  >
                    <div style={{
                      position: "absolute", right: 16, top: 16,
                      width: 18, height: 18, borderRadius: "50%",
                      border: "2px solid #800000",
                      background: addressId === a._id ? "#800000" : "transparent",
                    }} />
                    <b style={{ fontSize: 15, color: "#333" }}>{a.fullName}</b>
                    <span style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: 8 }}>{a.phone}</span>
                    <div style={{ fontSize: 13, color: "#555", marginTop: 6, lineHeight: 1.5 }}>
                      {a.houseNo && <span>{a.houseNo}, </span>}
                      {a.area}
                      {a.landmark && <div style={{ fontStyle: "italic", fontSize: 12 }}>Landmark: {a.landmark}</div>}
                      <div>{a.city}, {a.state} - <b>{a.pincode}</b></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="form-grid">
              {[
                ["name",     "Full Name",                   "text"],
                ["phone",    "Phone",                       "tel"],
                ["houseNo",  "House / Flat / Office No.",   "text"],
                ["address",  "Street Address / Colony",     "text"],
                ["landmark", "Landmark (Optional)",         "text"],
                ["city",     "City",                        "text"],
                ["state",    "State",                       "text"],
                ["pin",      "PIN Code",                    "text"],
              ].map(([key, label, type]) => (
                <div key={key} className={`form-group${key === "address" ? " full" : ""}`}>
                  <label>{label} <span className="req">*</span></label>
                  <input
                    className="form-control"
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <button onClick={addAddress} style={saveBtn}>Save Address</button>
          </div>

          {/* ── Payment Method ─────────────────────────────────────────────── */}
          <div style={card}>
            <h3 style={{ color: "var(--maroon)", marginBottom: 20 }}>Payment Method</h3>

            {PAYMENT_METHODS.map((m) => (
              <div
                key={m.id}
                onClick={() => setPayment(m.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 16px", marginBottom: 10,
                  borderRadius: 12, cursor: "pointer",
                  transition: "0.15s all ease",
                  border:     payment === m.id ? "2px solid #800000" : "1px solid #ddd",
                  background: payment === m.id ? "#fff5e6" : "white",
                }}
              >
                <span style={{ fontSize: 22, width: 30, textAlign: "center" }}>{m.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "#333" }}>{m.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{m.sub}</div>
                </div>
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  border: "2px solid #800000", flexShrink: 0,
                  background: payment === m.id ? "#800000" : "transparent",
                }} />
              </div>
            ))}

            {/* Inline detail panels */}
            {payment === "bank" && (
              <div style={instructionBox}>
                <p style={{ fontWeight: 600, marginBottom: 6 }}>Bank Transfer Details</p>
                <p>Account Name: <b>{BANK_DETAILS.accountName}</b></p>
                <p>Account No: <b>{BANK_DETAILS.accountNumber}</b></p>
                <p>IFSC: <b>{BANK_DETAILS.ifsc}</b></p>
                <p>Bank: <b>{BANK_DETAILS.bank}</b></p>
                <p style={{ marginTop: 6, fontSize: 12, color: "var(--text-muted)" }}>
                  Transfer the exact amount and use your Order ID as the payment reference.
                </p>
              </div>
            )}

            {payment === "upi" && (
              <div style={{ ...instructionBox, textAlign: "center" }}>
                {UPI_QR_URL
                  ? <img src={UPI_QR_URL} alt="UPI QR Code" style={{ width: 160, marginBottom: 10 }} />
                  : (
                    <div style={{
                      width: 140, height: 140, margin: "0 auto 12px",
                      border: "2px dashed #aaa", borderRadius: 8,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, color: "var(--text-muted)",
                    }}>
                      QR Code Here
                    </div>
                  )
                }
                <p style={{ fontWeight: 600 }}>UPI ID</p>
                <div style={{
                  display: "inline-block", padding: "6px 16px",
                  background: "#f5f5f5", borderRadius: 6,
                  fontFamily: "monospace", fontSize: 14, letterSpacing: 0.5,
                  color: "#333", marginTop: 4,
                }}>
                  {UPI_ID}
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
                  Send the exact amount and mention your Order ID in remarks.
                </p>
              </div>
            )}

            {payment === "cod" && (
              <div style={{ ...instructionBox, color: "#555" }}>
                💵 Pay in cash when your order is delivered. No advance payment needed.
              </div>
            )}
          </div>
        </div>

        {/* ── Order Summary ─────────────────────────────────────────────────── */}
        <div className="order-summary">
          <h3 style={{ color: "var(--maroon)", marginBottom: 20 }}>Order Summary</h3>
          {cart.map((p) => (
            <div key={p.product._id} style={{
              display: "flex", gap: 10, padding: "8px 0",
              borderBottom: "1px solid var(--border)",
            }}>
              <div style={{
                width: 50, height: 50, borderRadius: 8, overflow: "hidden",
                background: "var(--cream2)", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
              }}>
                {p.product.images?.[0]
                  ? <img src={p.product.images[0]} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                  : p.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--maroon)", lineHeight: 1.3 }}>
                  {p.product.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Qty: {p.quantity || 1}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "var(--green)" }}>
                ₹{(p.product.price * (p.quantity || 1)).toLocaleString()}
              </div>
            </div>
          ))}

          <div style={row}><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
          <div style={row}><span>GST (5%)</span><span>₹{tax.toLocaleString()}</span></div>
          <div style={{ ...row, marginTop: 12, paddingTop: 12, borderTop: "2px solid var(--border)", fontWeight: 700, fontSize: 18 }}>
            <span>Total</span>
            <span style={{ color: "var(--green)" }}>₹{total.toLocaleString()}</span>
          </div>

          <button className="btn-gold" style={{ width: "100%", marginTop: 20 }} onClick={handlePlace} disabled={loading}>
            {loading ? "Placing Order…" : "Place Order →"}
          </button>
          <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>
            🔒 Secure checkout
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Style constants ─────────────────────────────────────────────────────────
const card = {
  background: "white", border: "1px solid var(--border)",
  borderRadius: 16, padding: 32, marginBottom: 24,
};
const saveBtn = {
  marginTop: 10, padding: "10px 16px",
  background: "#800000", color: "white",
  border: "none", borderRadius: 6, cursor: "pointer",
};
const instructionBox = {
  marginTop: 12, padding: "14px 16px",
  background: "#f9f5f0", borderRadius: 10,
  border: "1px solid #e8ddd0", fontSize: 14, lineHeight: 1.8,
};
const row = {
  display: "flex", justifyContent: "space-between",
  marginTop: 8, fontSize: 14, color: "var(--text-muted)",
};

export default CheckoutPage;