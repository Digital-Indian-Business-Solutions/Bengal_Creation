import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
function CheckoutPage({ cart, onPlaceOrder }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pin: "",
  });
  const [payment, setPayment] = useState("upi");
  const [ordered, setOrdered] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [address_Id, setAddress_Id] = useState(null);
  const [address, setAddress] = useState([]);
  const subtotal = cart.reduce(
    (s, p) => s + p.product.price * (p.quantity || 1),
    0,
  );
  const tax = Math.round(subtotal * 0.05);
  //  console.log(cart)
  const API = import.meta.env.VITE_API || "http://localhost:5000/api";
  const handlePlace = async () => {
    try {
      if (
        !form.name ||
        !form.phone ||
        !form.address ||
        !form.city ||
        !form.pin
      ) {
        alert("Please fill all required fields");
        return;
      }

      if (!/^\d{6}$/.test(form.pin)) {
        alert("Please enter a valid 6-digit PIN code");
        return;
      }

      const totalAmount = subtotal + tax;
      const user = JSON.parse(localStorage.getItem("sm_user") || "null");

      // 1️⃣ Create order in backend database
      const orderRes = await axios.post(`${API}/orders`, {
        addressId: address_Id,
        user_id: user._id,
        items: cart,
      });

      const orderId = orderRes.data._id;

      // 2️⃣ Create Razorpay payment order
      const paymentRes = await axios.post(`${API}/payment/create/${orderId}`);

      const { razorOrder, key } = paymentRes.data;

      await loadRazorpay();

      const options = {
        key: key,
        amount: razorOrder.amount,
        currency: "INR",
        name: "Bengal Creations",
        description: "Artisan Product Purchase",
        order_id: razorOrder.id,

        handler: async function (response) {
          await axios.post(`${API}/payment/verify`, {
            ...response,
            orderId,
          });

          setOrderId(orderId);
          setOrdered(true);
        },

        prefill: {
          name: form.name,
          contact: form.phone,
        },

        theme: {
          color: "#800000",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", async function () {
        await axios.post(`${API}/payment/failed`, { orderId });

        alert("Payment failed. Please retry.");
      });

      rzp.open();
    } catch (error) {
      console.error(error);
      alert("Payment initialization failed");
    }
  };
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      document.body.appendChild(script);
    });
  };
  if (ordered)
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ fontSize: 80, marginBottom: 16 }}>🎉</div>
        <h2 style={{ color: "var(--maroon)", fontSize: 32, marginBottom: 12 }}>
          Order Placed!
        </h2>
        <p
          style={{ color: "var(--text-muted)", fontSize: 16, marginBottom: 8 }}
        >
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
  useEffect(() => {
    const loadAddresses = async () => {
      const user = JSON.parse(localStorage.getItem("sm_user"));

      const res = await axios.get(`${API}/address/my/${user._id}`);

      setAddress(res.data);
    };

    loadAddresses();
  }, []);
  const addAddress = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("sm_user"));

      const res = await axios.post(`${API}/address`, {
        customer: user._id,
        fullName: form.name,
        phone: form.phone,
        pincode: form.pin,
        city: form.city,
        area: form.address,
      });

      setAddress([...address, res.data]);

      setAddress_Id(res.data._id);

      alert("Address Added");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="orders-header">
        <h2>🛍️ Checkout</h2>
      </div>
      <div className="checkout-layout">
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
            {address.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h4>Select Address</h4>

                {address.map((a) => (
                  <div
                    key={a._id}
                    onClick={() => setAddress_Id(a._id)}
                    style={{
                      border: "1px solid #ddd",
                      padding: 12,
                      marginBottom: 10,
                      cursor: "pointer",
                      background: address_Id === a._id ? "#fff5e6" : "white",
                    }}
                  >
                    <b>{a.fullName}</b> ({a.phone})
                    <br />
                    {a.area}, {a.city} - {a.pincode}
                  </div>
                ))}
              </div>
            )}
            <div className="form-grid">
              {[
                ["name", "Full Name", "text"],
                ["phone", "Phone", "tel"],
                ["address", "Full Address", "text"],
                ["city", "City", "text"],
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
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
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
              }}
            >
              Save Address
            </button>
          </div>
          <div
            style={{
              background: "white",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 32,
            }}
          >
            <h3 style={{ color: "var(--maroon)", marginBottom: 20 }}>
              Payment Method
            </h3>
            {[
              ["upi", "📱 UPI / GPay / PhonePe"],
              ["card", "💳 Debit / Credit Card"],
              ["cod", "💵 Cash on Delivery"],
              ["netbanking", "🏦 Net Banking"],
            ].map(([val, label]) => (
              <div
                key={val}
                className={`payment-option${payment === val ? " selected" : ""}`}
                onClick={() => setPayment(val)}
              >
                <input
                  type="radio"
                  readOnly
                  checked={payment === val}
                  style={{ accentColor: "var(--gold)" }}
                />
                <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="order-summary">
          <h3 style={{ color: "var(--maroon)", marginBottom: 20 }}>
            Order Summary
          </h3>
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
                {p.product.images[0] ? (
                  <img
                    src={p.product.images[0]}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
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
              <div
                style={{ fontWeight: 700, fontSize: 13, color: "var(--green)" }}
              >
                ₹{(p.product.price * (p.quantity || 1)).toLocaleString()}
              </div>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 12,
              fontSize: 14,
              color: "var(--text-muted)",
            }}
          >
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 8,
              fontSize: 14,
              color: "var(--text-muted)",
            }}
          >
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
          <p
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              textAlign: "center",
              marginTop: 12,
            }}
          >
            🔒 Secure & encrypted checkout
          </p>
        </div>
      </div>
    </div>
  );
}
export default CheckoutPage;
