import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  createOrder, fetchAddresses, createAddress,
  getUpiDetails, confirmUpiPayment, failPayment,
  applyCoupon, fetchChargePreview,
} from "../api/api";
import { useAuth } from "../context/AuthContext";

const PAYMENT_METHODS = [
  { id: "COD",           icon: "💵", label: "Cash on Delivery", sub: "Pay when your order arrives"   },
  { id: "BANK_TRANSFER", icon: "🏦", label: "Bank Transfer",    sub: "NEFT / IMPS to our account"    },
  { id: "UPI",           icon: "📲", label: "UPI / QR Code",    sub: "Scan & pay via any UPI app"     },
];

const BANK_DETAILS = {
  accountName: "Bengal Creations", accountNumber: "XXXX XXXX XXXX",
  ifsc: "XXXX0000000", bank: "State Bank of India",
};

function UpiQrCode({ upiId, amount, merchantName }) {
  if (!upiId) return <p>Loading QR...</p>;
  const upiLink = `upi://pay?pa=${upiId}&pn=${merchantName || "Bengal Creations"}&am=${amount}&cu=INR`;
  const qrUrl   = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiLink)}`;
  return (
    <div style={{ textAlign: "center" }}>
      <img src={qrUrl} alt="UPI QR Code" style={{ width: 200, height: 200, borderRadius: 8, marginBottom: 10 }} />
      <div style={{ fontFamily: "monospace", fontSize: 14, color: "#333", background: "#f5f5f5", padding: "6px 14px", borderRadius: 6, display: "inline-block", marginBottom: 10 }}>{upiId}</div>
      <br />
      <button onClick={() => { window.location.href = upiLink; }}
        style={{ marginTop: 6, padding: "10px 20px", background: "#22c55e", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
        📱 Open UPI App
      </button>
      <p style={{ fontSize: 12, color: "#888", marginTop: 8 }}>Scan with GPay, PhonePe, Paytm or any UPI app</p>
    </div>
  );
}

function CheckoutPage({ cart, onPlaceOrder }) {
  const navigate        = useNavigate();
  const { currentUser } = useAuth();

  const [form, setForm] = useState({
    name: "", phone: "", address: "", city: "",
    pin: "", state: "", houseNo: "", landmark: "",
  });
  const [payment,      setPayment]      = useState("COD");
  const [ordered,      setOrdered]      = useState(false);
  const [orderId,      setOrderId]      = useState("");
  const [addressId,    setAddressId]    = useState(null);
  const [addresses,    setAddresses]    = useState([]);
  const [loading,      setLoading]      = useState(false);

  // UPI
  const [upiDetails,   setUpiDetails]   = useState(null);
  const [upiTxnId,     setUpiTxnId]     = useState("");
  const [upiConfirmed, setUpiConfirmed] = useState(false);
  const [upiLoading,   setUpiLoading]   = useState(false);

  // Coupon
  const [couponCode,    setCouponCode]    = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError,   setCouponError]   = useState("");

  // Charge breakdown (from server)
  const [charges, setCharges] = useState(null);

  const subtotal       = cart.reduce((s, p) => s + p.product.price * (p.quantity || 1), 0);
  const discountAmount = couponApplied?.discountAmount || 0;

  // Load addresses
  useEffect(() => {
    if (!currentUser?._id) return;
    fetchAddresses(currentUser._id).then(setAddresses).catch(console.error);
  }, [currentUser]);

  // Live charge preview whenever subtotal or discount changes
  const refreshCharges = useCallback(async () => {
    try {
      const data = await fetchChargePreview({ subtotal, discountAmount });
      setCharges(data);
    } catch {
      // fallback: compute 5% GST client-side if server unreachable
      const disc = discountAmount;
      const tax  = Math.round((subtotal - disc) * 0.05);
      setCharges({ subtotal, discountAmount: disc, gstRate: 5, gstAmount: tax, platformFeeAmount: 0, platformFeeLabel: "Platform Fee", deliveryCharge: 0, total: subtotal - disc + tax });
    }
  }, [subtotal, discountAmount]);

  useEffect(() => { refreshCharges(); }, [refreshCharges]);

  const total = charges?.total ?? (subtotal - discountAmount + Math.round((subtotal - discountAmount) * 0.05));

  // Coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true); setCouponError("");
    try {
      const token = localStorage.getItem("bc_token") || sessionStorage.getItem("bc_token") || "";
      const result = await applyCoupon({ code: couponCode.trim(), cartTotal: subtotal, customerId: currentUser?._id, token });
      setCouponApplied(result);
    } catch (err) { setCouponError(err.message); setCouponApplied(null); }
    finally { setCouponLoading(false); }
  };

  const handleRemoveCoupon = () => { setCouponApplied(null); setCouponCode(""); setCouponError(""); };

  // Address
  const addAddress = async () => {
    try {
      if (!currentUser?._id) return;
      const saved = await createAddress({
        customer: currentUser._id, fullName: form.name, phone: form.phone,
        pincode: form.pin, city: form.city, area: form.address,
        state: form.state, houseNo: form.houseNo, landmark: form.landmark,
      });
      setAddresses((prev) => [...prev, saved]);
      setAddressId(saved._id);
      alert("Address saved!");
    } catch (err) { console.error(err); }
  };

  // Place order
  const handlePlace = async () => {
    if (!addressId)        { alert("Please select or add a delivery address"); return; }
    if (!currentUser?._id) { alert("Please log in first"); return; }
    setLoading(true);
    try {
      const orderData = await createOrder({
        addressId, user_id: currentUser._id, items: cart,
        PaymentMethod: payment,
        couponCode:     couponApplied?.coupon?.code || undefined,
        discountAmount: discountAmount || undefined,
      });
      const newOrderId = orderData._id;
      setOrderId(newOrderId);
      if (payment === "UPI") {
        const upi = await getUpiDetails(newOrderId);
        setUpiDetails(upi);
      } else {
        setOrdered(true);
        if (onPlaceOrder) onPlaceOrder();
      }
    } catch (err) { console.error(err); alert("Could not place order. Please try again."); }
    finally { setLoading(false); }
  };

  const handleUpiConfirm = async () => {
    setUpiLoading(true);
    try {
      await confirmUpiPayment({ orderId, upiTransactionId: upiTxnId || "UPI_PENDING" });
      setUpiConfirmed(true); setOrdered(true);
      if (onPlaceOrder) onPlaceOrder();
    } catch { alert("Could not confirm payment. Please try again."); }
    finally { setUpiLoading(false); }
  };

  const handleUpiFail = async () => {
    await failPayment(orderId);
    alert("Payment cancelled."); navigate("/");
  };

  // UPI Payment Screen
  if (upiDetails && !upiConfirmed) {
    return (
      <div style={{ maxWidth: 480, margin: "60px auto", padding: "0 16px" }}>
        <div style={card}>
          <h2 style={{ color: "var(--maroon)", marginBottom: 4 }}>📲 Pay via UPI</h2>
          <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>Scan the QR or open your UPI app to pay</p>
          <div style={{ background: "#f0fff4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 18px", marginBottom: 20, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#16a34a" }}>₹{upiDetails.amount?.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Order ID: {orderId}</div>
          </div>
          <UpiQrCode upiId={upiDetails.upiId} amount={upiDetails.amount} merchantName={upiDetails.merchantName} />
          <div style={{ marginTop: 24 }}>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>After paying, enter your UPI transaction ID (optional):</p>
            <input className="form-control" placeholder="e.g. 412345678901" value={upiTxnId} onChange={(e) => setUpiTxnId(e.target.value)} style={{ marginBottom: 12 }} />
            <button className="btn-gold" style={{ width: "100%", padding: "14px 0", fontSize: 16, fontWeight: 700 }} onClick={handleUpiConfirm} disabled={upiLoading}>
              {upiLoading ? "Confirming…" : "✅ I've Paid — Confirm Order"}
            </button>
            <button onClick={handleUpiFail} style={{ width: "100%", marginTop: 10, padding: "10px 0", background: "none", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer", color: "#888", fontSize: 14 }}>
              Cancel Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Order Confirmation
  if (ordered) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>🎉</div>
        <h2 style={{ color: "var(--maroon)", fontSize: 32, marginBottom: 12 }}>Order Placed!</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 16, marginBottom: 8 }}>Order ID: {orderId} · Payment: {payment}</p>
        {couponApplied && (
          <p style={{ color: "#16a34a", fontWeight: 600, marginBottom: 4 }}>🎟️ Coupon <b>{couponApplied.coupon?.code}</b> saved you ₹{discountAmount.toLocaleString()}!</p>
        )}
        {payment === "BANK_TRANSFER" && (
          <div style={{ ...instructionBox, maxWidth: 400, margin: "20px auto" }}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Bank Transfer Details</p>
            <p>Account Name: <b>{BANK_DETAILS.accountName}</b></p>
            <p>Account No: <b>{BANK_DETAILS.accountNumber}</b></p>
            <p>IFSC: <b>{BANK_DETAILS.ifsc}</b></p>
            <p>Bank: <b>{BANK_DETAILS.bank}</b></p>
            <p style={{ marginTop: 8, fontSize: 13, color: "var(--text-muted)" }}>Use Order ID <b>{orderId}</b> as the reference.</p>
          </div>
        )}
        {payment === "UPI" && <p style={{ color: "#16a34a", fontWeight: 600 }}>✅ UPI Payment recorded</p>}
        {payment === "COD" && <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>Pay ₹{total.toLocaleString()} in cash when your order arrives. 🛵</p>}
        <button className="btn-gold" onClick={() => navigate("/orders")} style={{ marginTop: 20 }}>📦 Track My Order</button>
      </div>
    );
  }

  return (
    <div className="bgabout">
      <div className="orders-header"><h2>🛍️ Checkout</h2></div>
      <div className="checkout-layout">

        {/* Left column */}
        <div>
          <div style={card}>
            <h3 style={{ color: "var(--maroon)", marginBottom: 24 }}>Delivery Information</h3>
            {addresses.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h4>Select Address</h4>
                {addresses.map((a) => (
                  <div key={a._id} onClick={() => setAddressId(a._id)} style={{
                    border: addressId === a._id ? "2px solid #800000" : "1px solid #ddd",
                    padding: 16, marginBottom: 12, cursor: "pointer",
                    borderRadius: 12, transition: "0.2s all ease",
                    background: addressId === a._id ? "#fff5e6" : "white", position: "relative",
                  }}>
                    <div style={{ position: "absolute", right: 16, top: 16, width: 18, height: 18, borderRadius: "50%", border: "2px solid #800000", background: addressId === a._id ? "#800000" : "transparent" }} />
                    <b style={{ fontSize: 15, color: "#333" }}>{a.fullName}</b>
                    <span style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: 8 }}>{a.phone}</span>
                    <div style={{ fontSize: 13, color: "#555", marginTop: 6, lineHeight: 1.5 }}>
                      {a.houseNo && <span>{a.houseNo}, </span>}{a.area}
                      {a.landmark && <div style={{ fontStyle: "italic", fontSize: 12 }}>Landmark: {a.landmark}</div>}
                      <div>{a.city}, {a.state} - <b>{a.pincode}</b></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="form-grid">
              {[
                ["name","Full Name","text"],["phone","Phone","tel"],
                ["houseNo","House / Flat / Office No.","text"],["address","Street Address / Colony","text"],
                ["landmark","Landmark (Optional)","text"],["city","City","text"],
                ["state","State","text"],["pin","PIN Code","text"],
              ].map(([key, label, type]) => (
                <div key={key} className={`form-group${key === "address" ? " full" : ""}`}>
                  {key === "landmark" ? <label>{label}</label> : <label>{label} <span className="req">*</span></label>}
                  <input className="form-control" type={type} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <button onClick={addAddress} style={saveBtn}>Save Address</button>
          </div>

          <div style={card}>
            <h3 style={{ color: "var(--maroon)", marginBottom: 20 }}>Payment Method</h3>
            {PAYMENT_METHODS.map((m) => (
              <div key={m.id} onClick={() => setPayment(m.id)} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px", marginBottom: 10, borderRadius: 12,
                cursor: "pointer", transition: "0.15s all ease",
                border: payment === m.id ? "2px solid #800000" : "1px solid #ddd",
                background: payment === m.id ? "#fff5e6" : "white",
              }}>
                <span style={{ fontSize: 22, width: 30, textAlign: "center" }}>{m.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "#333" }}>{m.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{m.sub}</div>
                </div>
                <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #800000", flexShrink: 0, background: payment === m.id ? "#800000" : "transparent" }} />
              </div>
            ))}
            {payment === "BANK_TRANSFER" && (
              <div style={instructionBox}>
                <p style={{ fontWeight: 600, marginBottom: 6 }}>Bank Transfer Details</p>
                <p>Account Name: <b>{BANK_DETAILS.accountName}</b></p>
                <p>Account No: <b>{BANK_DETAILS.accountNumber}</b></p>
                <p>IFSC: <b>{BANK_DETAILS.ifsc}</b></p>
                <p>Bank: <b>{BANK_DETAILS.bank}</b></p>
              </div>
            )}
            {payment === "UPI" && (
              <div style={{ ...instructionBox, textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "#555" }}>A QR code will be generated after you click Place Order.</p>
                <p style={{ fontSize: 12, color: "#888" }}>Works with GPay, PhonePe, Paytm, BHIM & all UPI apps 📱</p>
              </div>
            )}
            {payment === "COD" && (
              <div style={{ ...instructionBox, color: "#555" }}>💵 Pay in cash when your order is delivered. No advance payment needed.</div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3 style={{ color: "var(--maroon)", marginBottom: 20 }}>Order Summary</h3>
          {cart.map((p) => {
            const prod = p?.product;
            if (!prod) return null;
            const imgUrl = prod.thumb || (Array.isArray(prod.images) && prod.images.length > 0 ? (typeof prod.images[0] === 'string' ? prod.images[0] : prod.images[0]?.url) : null);
            return (
              <div key={prod._id || p._id} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: 50, height: 50, borderRadius: 8, overflow: "hidden", background: "var(--cream2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                  {imgUrl ? <img src={imgUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : (prod.emoji || p.emoji || "🛍️")}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--maroon)", lineHeight: 1.3 }}>{prod.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Qty: {p.quantity || 1}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--green)" }}>₹{((prod.price || 0) * (p.quantity || 1)).toLocaleString()}</div>
              </div>
            );
          })}

          {/* Charge rows */}
          <div style={{ marginTop: 12 }}>
            <div style={row}><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>

            {/* Coupon input */}
            <div style={{ margin: "14px 0 6px", padding: "12px 0", borderTop: "1px solid var(--border)" }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#555" }}>🎟️ Have a coupon?</div>
              {couponApplied ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0fff4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 14px" }}>
                  <div>
                    <span style={{ fontWeight: 700, color: "#16a34a", fontSize: 14 }}>{couponApplied.coupon?.code}</span>
                    <span style={{ fontSize: 13, color: "#555", marginLeft: 8 }}>−₹{discountAmount.toLocaleString()} saved!</span>
                  </div>
                  <button onClick={handleRemoveCoupon} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 18 }}>×</button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="form-control" placeholder="Coupon code" value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                    style={{ flex: 1, textTransform: "uppercase", letterSpacing: 1 }}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()} />
                  <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}
                    style={{ padding: "0 16px", background: "#800000", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, opacity: (!couponCode.trim() || couponLoading) ? 0.6 : 1 }}>
                    {couponLoading ? "…" : "Apply"}
                  </button>
                </div>
              )}
              {couponError && <p style={{ color: "#dc2626", fontSize: 12, marginTop: 6 }}>{couponError}</p>}
            </div>

            {/* Dynamic charge lines from server */}
            {charges ? (
              <>
                {discountAmount > 0 && (
                  <div style={{ ...row, color: "#16a34a", fontWeight: 600 }}>
                    <span>🎟️ Coupon Discount</span><span>−₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                {charges.gstAmount > 0 && (
                  <div style={row}>
                    <span>GST ({charges.gstRate}%)</span><span>₹{charges.gstAmount.toLocaleString()}</span>
                  </div>
                )}
                {charges.platformFeeAmount > 0 && (
                  <div style={row}>
                    <span>{charges.platformFeeLabel} ({charges.platformFeeRate}%)</span>
                    <span>₹{charges.platformFeeAmount.toLocaleString()}</span>
                  </div>
                )}
                {charges.deliveryCharge > 0 && (
                  <div style={row}><span>🚚 Delivery</span><span>₹{charges.deliveryCharge.toLocaleString()}</span></div>
                )}
                {charges.deliveryCharge === 0 && charges.deliveryChargeEnabled && (
                  <div style={{ ...row, color: "#16a34a" }}><span>🚚 Delivery</span><span>FREE</span></div>
                )}
              </>
            ) : (
              <div style={row}><span>Loading charges…</span><span></span></div>
            )}

            <div style={{ ...row, marginTop: 12, paddingTop: 12, borderTop: "2px solid var(--border)", fontWeight: 700, fontSize: 18 }}>
              <span>Total</span>
              <span style={{ color: "var(--green)" }}>₹{total.toLocaleString()}</span>
            </div>
          </div>

          <button className="btn-gold" style={{ width: "100%", marginTop: 20 }} onClick={handlePlace} disabled={loading}>
            {loading ? "Placing Order…" : payment === "UPI" ? "Place Order & Pay via UPI →" : "Place Order →"}
          </button>
          <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>🔒 Secure checkout</p>
        </div>
      </div>
    </div>
  );
}

const card           = { background: "white", border: "1px solid var(--border)", borderRadius: 16, padding: 32, marginBottom: 24 };
const saveBtn        = { marginTop: 10, padding: "10px 16px", background: "#800000", color: "white", border: "none", borderRadius: 6, cursor: "pointer" };
const instructionBox = { marginTop: 12, padding: "14px 16px", background: "#f9f5f0", borderRadius: 10, border: "1px solid #e8ddd0", fontSize: 14, lineHeight: 1.8 };
const row            = { display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 14, color: "var(--text-muted)" };

export default CheckoutPage;
