import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  createOrder,
  createPaymentOrder,
  verifyPayment,
  failPayment,
  fetchAddresses,
  createAddress,
} from "../api/api";
import { loadRazorpay } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";

function CheckoutPage({ cart, onPlaceOrder }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pin: "",
    state: "",
    houseNo: "",
    landmark: "",
  });
  const [payment, setPayment] = useState("upi");
  const [ordered, setOrdered] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [addressId, setAddressId] = useState(null);
  const [addresses, setAddresses] = useState([]);

  const subtotal = cart.reduce(
    (s, p) => s + p.product.price * (p.quantity || 1),
    0
  );
  const tax = Math.round(subtotal * 0.05);

  // ── Load saved addresses ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?._id) return;
    fetchAddresses(currentUser._id)
      .then(setAddresses)
      .catch(console.error);
  }, [currentUser]);

  const addAddress = async () => {
    try {
      if (!currentUser?._id) return;
      const saved = await createAddress({
        customer: currentUser._id,
        fullName: form.name,
        phone: form.phone,
        pincode: form.pin,
        city: form.city,
        area: form.address,
        state: form.state,
        houseNo: form.houseNo,
        landmark: form.landmark,
      });
      setAddresses((prev) => [...prev, saved]);
      setAddressId(saved._id);
      alert("Address Added");
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlace = async () => {
    try {
      if (!addressId) { alert("Please select or add a delivery address"); return; }
      if (!currentUser?._id) { alert("Please log in first"); return; }

      const orderData = await createOrder({
        addressId,
        user_id: currentUser._id,
        items: cart,
        PaymentMethod: "Online",
      });
      const newOrderId = orderData._id;

      // 2. Create Razorpay order
      const { razorOrder, key } = await createPaymentOrder(newOrderId);

      await loadRazorpay();

      const options = {
        key,
        amount: razorOrder.amount,
        currency: "INR",
        name: "Bengal Creations",
        description: "Artisan Product Purchase",
        order_id: razorOrder.id,
        handler: async (response) => {
          await verifyPayment({ ...response, orderId: newOrderId });
          setOrderId(newOrderId);
          setOrdered(true);
        },
        prefill: { name: currentUser?.name || form.name, contact: form.phone },
        theme: { color: "#800000" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async () => {
        await failPayment(newOrderId);
        alert("Payment failed. Please retry.");
      });
      rzp.open();
    } catch (error) {
      console.error(error);
      alert("Payment initialization failed");
    }
  };

  // ── Order Confirmation Screen ────────────────────────────────────────────────
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
        <p style={{ color: "var(--text-muted)", marginBottom: 32 }}>
          Thank you for shopping from Bengal's finest artisans!
        </p>
        <button className="btn-gold" onClick={() => navigate("/orders")}>
          📦 Track My Order
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="orders-header">
        <h2>🛍️ Checkout</h2>
      </div>
      <div className="checkout-layout">
        {/* Delivery Info */}
        <div>
          <div
            style={{
              background: "white",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 32,
              marginBottom: 24,
            }}
          >
            <h3 style={{ color: "var(--maroon)", marginBottom: 24 }}>
              Delivery Information
            </h3>

            {/* Saved Addresses */}
            {addresses.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h4>Select Address</h4>
                {addresses.map((a) => (
                  <div
                    key={a._id}
                    onClick={() => setAddressId(a._id)}
                    style={{
                      border: addressId === a._id ? "2px solid #800000" : "1px solid #ddd",
                      padding: 16,
                      marginBottom: 12,
                      cursor: "pointer",
                      borderRadius: 12,
                      background: addressId === a._id ? "#fff5e6" : "white",
                      transition: "0.2s all ease",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        right: 16,
                        top: 16,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: "2px solid #800000",
                        background: addressId === a._id ? "#800000" : "transparent",
                      }}
                    />
                    <b style={{ fontSize: 15, color: "#333" }}>{a.fullName}</b>
                    <span style={{ fontSize: 13, color: "var(--text-muted)", marginLeft: 8 }}>
                      {a.phone}
                    </span>
                    <div style={{ fontSize: 13, color: "#555", marginTop: 6, lineHeight: 1.5 }}>
                      {a.houseNo && <span>{a.houseNo}, </span>}
                      {a.area}
                      {a.landmark && (
                        <div style={{ fontStyle: "italic", fontSize: 12 }}>
                          Landmark: {a.landmark}
                        </div>
                      )}
                      <div>
                        {a.city}, {a.state || ""} - <b>{a.pincode}</b>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* New Address Form */}
            <div className="form-grid">
              {[
                ["name", "Full Name", "text"],
                ["phone", "Phone", "tel"],
                ["houseNo", "House / Flat / Office No.", "text"],
                ["address", "Street Address / Colony", "text"],
                ["landmark", "Landmark (Optional)", "text"],
                ["city", "City", "text"],
                ["state", "State", "text"],
                ["pin", "PIN Code", "text"],
              ].map(([key, label, type]) => (
                <div
                  key={key}
                  className={`form-group${key === "address" ? " full" : ""}`}
                >
                  <label>
                    {label} <span className="req">*</span>
                  </label>
                  <input
                    className="form-control"
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={addAddress}
              style={{
                marginTop: 10,
                padding: "10px 16px",
                background: "#800000",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Save Address
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3 style={{ color: "var(--maroon)", marginBottom: 20 }}>Order Summary</h3>
          {cart.map((p) => (
            <div
              key={p.product._id}
              style={{
                display: "flex",
                gap: 10,
                padding: "8px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 8,
                  overflow: "hidden",
                  background: "var(--cream2)",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                }}
              >
                {p.product.images?.[0] ? (
                  <img
                    src={p.product.images[0]}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    alt=""
                  />
                ) : (
                  p.emoji
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--maroon)",
                    lineHeight: 1.3,
                  }}
                >
                  {p.product.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Qty: {p.quantity || 1}
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "var(--green)" }}>
                ₹{(p.product.price * (p.quantity || 1)).toLocaleString()}
              </div>
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 14, color: "var(--text-muted)" }}>
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 14, color: "var(--text-muted)" }}>
            <span>GST (5%)</span>
            <span>₹{tax.toLocaleString()}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 12,
              paddingTop: 12,
              borderTop: "2px solid var(--border)",
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            <span>Total</span>
            <span style={{ color: "var(--green)" }}>
              ₹{(subtotal + tax).toLocaleString()}
            </span>
          </div>

          <button
            className="btn-gold"
            style={{ width: "100%", marginTop: 20 }}
            onClick={handlePlace}
          >
            Place Order →
          </button>
          <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>
            🔒 Secure & encrypted checkout
          </p>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
