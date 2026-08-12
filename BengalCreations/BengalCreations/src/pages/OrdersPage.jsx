import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  CreditCard,
  Package,
  Truck,
  Check,
  Calendar,
  Headphones,
  MapPin,
  Phone,
  ShieldCheck,
  RotateCcw,
  PackageCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  AlertCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { fetchUserOrders, requestRefund } from "../api/api";

const STATUS_BADGES = {
  Pending:    { bg: "#fff7ed", color: "#c2410c", border: "#ffedd5", label: "Pending" },
  Processing: { bg: "#f0f9ff", color: "#0369a1", border: "#e0f2fe", label: "Processing" },
  Shipped:    { bg: "#f5f3ff", color: "#6d28d9", border: "#ede9fe", label: "Shipped" },
  Delivered:  { bg: "#f0fdf4", color: "#15803d", border: "#dcfce7", label: "Delivered" },
  Cancelled:  { bg: "#fef2f2", color: "#b91c1c", border: "#fee2e2", label: "Cancelled" },
};

const REFUND_BADGE = {
  Requested: { bg: "#fff3cd", color: "#856404", label: "Refund Requested" },
  Approved:  { bg: "#d1e7dd", color: "#0a3622", label: "Refund Approved"  },
  Rejected:  { bg: "#f8d7da", color: "#58151c", label: "Refund Rejected"  },
  Processed: { bg: "#cff4fc", color: "#055160", label: "Refund Processed" },
};

export default function OrdersPage({ userId }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState("");

  // Navigation mode: "list" (shows list of all orders) or "detail" (shows selected order details)
  const [viewMode, setViewMode] = useState("list"); // "list" | "detail"
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Accordion details toggle in detail view
  const [showAllItems, setShowAllItems] = useState(false);

  // Refund Modal
  const [refundModal, setRefundModal] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }
    setLoadingOrders(true);
    fetchUserOrders(userId)
      .then((data) => {
        setOrders(data || []);
        setLoadingOrders(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load your orders. Please try again.");
        setLoadingOrders(false);
      });
  }, [userId, navigate]);

  const handleRefundRequest = async () => {
    if (!refundReason.trim()) {
      alert("Please enter a reason for the refund.");
      return;
    }
    setRefundLoading(true);
    try {
      await requestRefund({ orderId: refundModal, reason: refundReason });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === refundModal
            ? { ...o, refundStatus: "Requested", refundReason, status: "Cancelled" }
            : o
        )
      );
      setRefundModal(null);
      setRefundReason("");
      alert("✅ Refund request submitted! Our team will process it within 3-5 business days.");
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setRefundLoading(false);
    }
  };

  const openOrderDetails = (orderId) => {
    setSelectedOrderId(orderId);
    setViewMode("detail");
    setShowAllItems(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const backToList = () => {
    setViewMode("list");
    setSelectedOrderId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatShortId = (id) => {
    if (!id) return "";
    return `BC${id.slice(-8).toUpperCase()}`;
  };

  const formatDate = (dateStr, options = {}) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const defaultOptions = { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" };
    return date.toLocaleDateString("en-IN", { ...defaultOptions, ...options });
  };

  const getStepDates = (orderDateStr) => {
    const baseDate = orderDateStr ? new Date(orderDateStr) : new Date();
    
    const d1 = new Date(baseDate);
    const d2 = new Date(baseDate.getTime() + 2 * 60 * 1000); // + 2 mins
    const d3 = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000); // + 1 day
    const d4 = new Date(baseDate.getTime() + 4 * 24 * 60 * 60 * 1000); // + 4 days
    const d5 = new Date(baseDate.getTime() + 6 * 24 * 60 * 60 * 1000); // + 6 days

    const fmtShort = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    const fmtDayOnly = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

    return {
      placed: fmtShort(d1),
      paid: fmtShort(d2),
      processing: fmtShort(d3),
      shipped: `Expected by ${fmtDayOnly(d4)}`,
      delivered: `Expected by ${fmtDayOnly(d5)}`,
    };
  };

  const getActiveStepIndex = (status, paymentStatus) => {
    if (status === "Cancelled") return -1;
    if (status === "Delivered") return 4;
    if (status === "Shipped") return 3;
    if (status === "Processing") return 2;
    if (paymentStatus === "Paid" || status === "Confirmed") return 1;
    return 0; // Order Placed
  };

  if (loadingOrders) {
    return (
      <div className="od-page-bg">
        <div style={{ textAlign: "center", padding: "100px 20px", color: "var(--text-muted)" }}>
          <Clock className="spin" size={48} style={{ color: "var(--maroon)", marginBottom: 16 }} />
          <p style={{ fontSize: 16, fontWeight: 500 }}>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="od-page-bg">
        <div style={{ textAlign: "center", padding: "100px 20px", color: "var(--maroon)" }}>
          <AlertCircle size={52} style={{ marginBottom: 16 }} />
          <h3>Unable to fetch orders</h3>
          <p style={{ color: "#666", marginTop: 8 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="od-page-bg">
        <div className="od-container" style={{ textAlign: "center", padding: "100px 20px" }}>
          <ShoppingBag size={64} style={{ color: "var(--maroon)", marginBottom: 16 }} />
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "var(--maroon-dark)", marginBottom: 8 }}>No orders placed yet</h2>
          <p style={{ color: "#777", marginBottom: 24 }}>Discover exquisite handcrafted sarees, terracotta art, and artisanal products.</p>
          <Link to="/shop" className="btn-gold" style={{ textDecoration: "none", padding: "12px 28px", borderRadius: 8, fontWeight: 600 }}>
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Selected Order for Detail View
  const selectedOrder = orders.find((o) => o._id === selectedOrderId) || orders[0];

  // ════════════════════════════════════════════════════════════════════════════
  // 1. ORDERS LIST VIEW (Shows all orders one by one)
  // ════════════════════════════════════════════════════════════════════════════
  if (viewMode === "list") {
    return (
      <div className="od-page-bg">
        <div className="od-container">
          
          {/* Breadcrumbs */}
          <div className="od-breadcrumbs">
            <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <span>&gt;</span>
            <span className="active">My Orders</span>
          </div>

          {/* Page Top Header */}
          <div className="od-header-bar">
            <div className="od-title-area">
              <h1>My Orders ({orders.length})</h1>
              <div className="od-placed-date">
                Click on any order to view tracking timeline & full order details
              </div>
            </div>

            {/* Need Help Box */}
            <div className="od-need-help-card">
              <div className="od-need-help-icon">
                <Headphones size={20} />
              </div>
              <div className="od-need-help-text">
                <label>Need Help?</label>
                <p>Contact us &nbsp;|&nbsp; <a href="tel:+919876543210">+91 98765 43210</a></p>
              </div>
            </div>
          </div>

          {/* List of Order Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {orders.map((o) => {
              const stBadge = STATUS_BADGES[o.status] || STATUS_BADGES.Pending;

              return (
                <div
                  key={o._id}
                  onClick={() => openOrderDetails(o._id)}
                  style={{
                    background: "#ffffff",
                    borderRadius: 16,
                    border: "1px solid #eae5dc",
                    padding: "24px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  className="od-order-list-card"
                >
                  {/* Order Header Row */}
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    paddingBottom: 16, borderBottom: "1px solid #f3eeea", flexWrap: "wrap", gap: 12
                  }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "var(--maroon-dark)", margin: 0 }}>
                          Order #{formatShortId(o._id)}
                        </h3>
                        <span style={{
                          fontSize: 12, padding: "3px 10px", borderRadius: 12, fontWeight: 700,
                          background: stBadge.bg, color: stBadge.color, border: `1px solid ${stBadge.border}`
                        }}>
                          {stBadge.label}
                        </span>
                      </div>
                      <div style={{ fontSize: 12.5, color: "#666", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                        <Calendar size={13} style={{ color: "var(--maroon)" }} />
                        Placed on {formatDate(o.createdAt)}
                      </div>
                    </div>

                    <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--maroon-dark)" }}>
                          ₹{o.totalAmount?.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 11.5, color: "#777" }}>
                          Payment: {o.paymentMethod || "COD"} ({o.paymentStatus || "Paid"})
                        </div>
                      </div>
                      <div style={{
                        width: 34, height: 34, borderRadius: "50%", background: "#fbf5f6", color: "var(--maroon)",
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div style={{ paddingTop: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--maroon-dark)", marginBottom: 12, letterSpacing: 0.5 }}>
                      ORDER ITEMS ({o.items?.length || 0})
                    </div>

                    <div className="od-items-list">
                      {o.items?.slice(0, 3).map((item, idx) => {
                        const prod = item.product || {};
                        const imgUrl = prod.images?.[0] || prod.thumb || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&q=80";
                        const sizeText = item.variant || (prod.variants?.[0]?.size ? `Size: ${prod.variants[0].size}` : null);

                        return (
                          <div key={idx} className="od-item-row" style={{ padding: "10px 0" }}>
                            <img src={imgUrl} alt={prod.name || "Product"} className="od-item-img" style={{ width: 60, height: 60 }} />
                            <div className="od-item-info">
                              <h4 style={{ fontSize: 14 }}>{prod.name || "Handcrafted Product"}</h4>
                              <div className="od-item-specs">
                                {sizeText && <span>{sizeText}</span>}
                                {sizeText && item.color ? " | " : ""}
                                {item.color && <span>Color: {item.color}</span>}
                                {!sizeText && !item.color && <span style={{ color: "#888" }}>Artisanal Handcraft</span>}
                              </div>
                            </div>
                            <div className="od-item-price">₹{item.price?.toLocaleString()}</div>
                            <div className="od-item-qty">Qty: {item.quantity}</div>
                            <div className="od-item-total">₹{((item.price || 0) * item.quantity).toLocaleString()}</div>
                          </div>
                        );
                      })}
                    </div>

                    {o.items?.length > 3 && (
                      <div style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
                        + {o.items.length - 3} more items in this order
                      </div>
                    )}
                  </div>

                  {/* Card Footer Action */}
                  <div style={{
                    marginTop: 16, paddingTop: 12, borderTop: "1px dashed #f0eae1",
                    display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13
                  }}>
                    <span style={{ color: "#666" }}>
                      📍 Deliver to: <strong>{o.address?.fullName || "Customer"}</strong> ({o.address?.city || "Kolkata"})
                    </span>
                    <span style={{ color: "var(--maroon)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                      Track Order & Details <ChevronRight size={16} />
                    </span>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 2. ORDER DETAIL VIEW (Shows full tracking & details for selected order)
  // ════════════════════════════════════════════════════════════════════════════
  const order = selectedOrder;
  const dates = getStepDates(order.createdAt);
  const activeStepIdx = getActiveStepIndex(order.status, order.paymentStatus);
  const canRefund = order.paymentStatus === "Paid" && (!order.refundStatus || order.refundStatus === "None") && order.status !== "Cancelled";
  const refundBadge = order.refundStatus && order.refundStatus !== "None" ? REFUND_BADGE[order.refundStatus] : null;

  const stepperSteps = [
    { title: "Order Placed", date: dates.placed, icon: ClipboardList },
    { title: "Payment Confirmed", date: dates.paid, icon: CreditCard },
    { title: "Processing", date: dates.processing, icon: Package },
    { title: "Shipped", date: dates.shipped, icon: Truck },
    { title: "Delivered", date: dates.delivered, icon: Check },
  ];

  return (
    <div className="od-page-bg">
      <div className="od-container">
        
        {/* Back Button & Breadcrumb Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <button
            onClick={backToList}
            style={{
              background: "white", border: "1px solid #eae5dc", padding: "6px 14px",
              borderRadius: 8, fontSize: 13, fontWeight: 600, color: "var(--maroon)",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
            }}
          >
            <ArrowLeft size={16} /> Back to All Orders
          </button>

          <div className="od-breadcrumbs" style={{ margin: 0 }}>
            <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <span>&gt;</span>
            <span style={{ cursor: "pointer" }} onClick={backToList}>My Orders</span>
            <span>&gt;</span>
            <span className="active">Order #{formatShortId(order._id)}</span>
          </div>
        </div>

        {/* Detail Header Bar */}
        <div className="od-header-bar">
          <div className="od-title-area">
            <h1>Order #{formatShortId(order._id)}</h1>
            <div className="od-placed-date">
              <Calendar size={16} style={{ color: "var(--maroon)" }} />
              Placed on {formatDate(order.createdAt)}
            </div>
          </div>

          {/* Need Help Box */}
          <div className="od-need-help-card">
            <div className="od-need-help-icon">
              <Headphones size={20} />
            </div>
            <div className="od-need-help-text">
              <label>Need Help?</label>
              <p>Contact us &nbsp;|&nbsp; <a href="tel:+919876543210">+91 98765 43210</a></p>
            </div>
          </div>
        </div>

        {/* Main Two-Column Layout */}
        <div className="od-main-grid">
          
          {/* LEFT COLUMN: Order Status Tracker & Items */}
          <div>
            
            {/* Card 1: Order Status Stepper */}
            <div className="od-card">
              <div className="od-card-title">
                <span>Order Status</span>
                {refundBadge && (
                  <span style={{
                    fontSize: 12, padding: "4px 10px", borderRadius: 6,
                    background: refundBadge.bg, color: refundBadge.color, fontWeight: 600,
                  }}>
                    {refundBadge.label}
                  </span>
                )}
              </div>

              {order.status === "Cancelled" ? (
                <div className="od-status-banner cancelled">
                  <XCircle size={20} />
                  <div>
                    <strong>This order has been cancelled.</strong>
                    {order.refundReason && <span> Reason: {order.refundReason}</span>}
                  </div>
                </div>
              ) : (
                <>
                  <div className="od-stepper-container">
                    <div className="od-stepper">
                      {stepperSteps.map((step, idx) => {
                        const IconComp = step.icon;
                        const isCompleted = idx < activeStepIdx;
                        const isCurrent = idx === activeStepIdx;

                        let itemClass = "od-step-item pending";
                        if (isCompleted) itemClass = "od-step-item completed";
                        if (isCurrent) itemClass = "od-step-item active-current";

                        return (
                          <div key={idx} className={itemClass}>
                            <div className="od-step-circle">
                              <IconComp size={20} />
                            </div>
                            <div className="od-step-label">{step.title}</div>
                            <div className="od-step-date">{step.date}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contextual Status Alert Banner */}
                  <div className="od-status-banner">
                    <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                    <span>
                      {order.status === "Delivered"
                        ? "Order delivered! We hope you love your handcrafted items from Bengal Creations."
                        : order.status === "Shipped"
                        ? "Your package is on its way! You'll receive a delivery update shortly."
                        : "We are carefully preparing your order. You'll receive an update once it's shipped."}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Card 2: Order Items List */}
            <div className="od-card">
              <div className="od-card-title">
                Order Items
              </div>

              <div className="od-items-list">
                {(showAllItems ? order.items : order.items?.slice(0, 4)).map((item, idx) => {
                  const prod = item.product || {};
                  const imgUrl = prod.images?.[0] || prod.thumb || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&q=80";
                  const sizeText = item.variant || (prod.variants?.[0]?.size ? `Size: ${prod.variants[0].size}` : null);

                  return (
                    <div key={idx} className="od-item-row">
                      <img src={imgUrl} alt={prod.name || "Product"} className="od-item-img" />
                      <div className="od-item-info">
                        <h4>{prod.name || "Handcrafted Kantha / Silk Item"}</h4>
                        <div className="od-item-specs">
                          {sizeText && <span>{sizeText}</span>}
                          {sizeText && item.color ? " | " : ""}
                          {item.color && <span>Color: {item.color}</span>}
                          {!sizeText && !item.color && <span style={{ color: "#888" }}>Handmade Artisanal Craft</span>}
                        </div>
                      </div>
                      <div className="od-item-price">₹{item.price?.toLocaleString()}</div>
                      <div className="od-item-qty">Qty: {item.quantity}</div>
                      <div className="od-item-total">₹{((item.price || 0) * item.quantity).toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>

              {/* View More / Less Toggle */}
              {order.items?.length > 4 && (
                <button className="od-toggle-btn" onClick={() => setShowAllItems(!showAllItems)}>
                  {showAllItems ? (
                    <>Show Less Items <ChevronUp size={16} /></>
                  ) : (
                    <>View More Details ({order.items.length - 4} more) <ChevronDown size={16} /></>
                  )}
                </button>
              )}

              {/* Refund Request Button if Eligible */}
              {canRefund && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f0eae1", display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => { setRefundModal(order._id); setRefundReason(""); }}
                    style={{
                      padding: "8px 16px", borderRadius: 8, border: "1.5px solid #dc3545",
                      background: "white", color: "#dc3545", fontWeight: 700,
                      cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6,
                    }}
                  >
                    <RefreshCw size={15} /> Request Refund
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Delivery Address & Summary Sidebar */}
          <div>
            
            {/* Sidebar Card 1: Delivery Address */}
            <div className="od-card">
              <div className="od-card-title">
                Delivery Address
              </div>
              <div className="od-address-box">
                <div className="od-address-name">
                  <MapPin size={18} style={{ color: "var(--maroon)" }} />
                  {order.address?.fullName || "Recipient Name"}
                </div>
                <div style={{ paddingLeft: 26, color: "#555" }}>
                  <div>{order.address?.area || order.address?.street || "123, Lake Road, Kalighat"}</div>
                  <div>{order.address?.city || "Kolkata"}, {order.address?.state || "West Bengal"} - {order.address?.pincode || "700026"}</div>
                  <div>India</div>
                  <div className="od-address-phone">
                    <Phone size={14} style={{ color: "#777" }} />
                    {order.address?.phone || "+91 98765 43210"}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Card 2: Order Summary */}
            <div className="od-card">
              <div className="od-card-title">
                Order Summary
              </div>

              <table className="od-summary-table">
                <tbody>
                  <tr>
                    <td>Order ID</td>
                    <td className="value">{formatShortId(order._id)}</td>
                  </tr>
                  <tr>
                    <td>Order Date</td>
                    <td className="value">{formatDate(order.createdAt)}</td>
                  </tr>
                  <tr>
                    <td>Payment Method</td>
                    <td className="value">{order.paymentMethod === "UPI" ? "Razorpay (UPI)" : order.paymentMethod || "COD"}</td>
                  </tr>
                  <tr>
                    <td>Payment Status</td>
                    <td className="value">
                      <span className={order.paymentStatus === "Paid" ? "od-payment-paid-badge" : "od-payment-pending-badge"}>
                        {order.paymentStatus || "Paid"}
                      </span>
                    </td>
                  </tr>

                  {/* Amount Breakdown */}
                  <tr style={{ borderTop: "1px dashed #e0d8cc" }}>
                    <td style={{ paddingTop: 10 }}>Subtotal</td>
                    <td className="value" style={{ paddingTop: 10 }}>
                      ₹{(order.subtotal || order.items?.reduce((acc, i) => acc + (i.price || 0) * i.quantity, 0) || order.totalAmount)?.toLocaleString()}
                    </td>
                  </tr>

                  {order.discountAmount > 0 && (
                    <tr>
                      <td style={{ color: "#16a34a" }}>
                        Discount {order.couponCode ? `(${order.couponCode})` : ""}
                      </td>
                      <td className="value" style={{ color: "#16a34a" }}>
                        -₹{order.discountAmount.toLocaleString()}
                      </td>
                    </tr>
                  )}

                  {(order.gstAmount > 0 || order.gstRate > 0) && (
                    <tr>
                      <td>GST {order.gstRate ? `(${order.gstRate}%)` : ""}</td>
                      <td className="value">+₹{(order.gstAmount || 0).toLocaleString()}</td>
                    </tr>
                  )}

                  {order.platformFeeAmount > 0 && (
                    <tr>
                      <td>Platform Fee</td>
                      <td className="value">+₹{order.platformFeeAmount.toLocaleString()}</td>
                    </tr>
                  )}

                  <tr>
                    <td>Delivery Charge</td>
                    <td className="value">
                      {order.deliveryCharge > 0 ? (
                        `+₹${order.deliveryCharge.toLocaleString()}`
                      ) : (
                        <span style={{ color: "#16a34a", fontWeight: "bold" }}>FREE</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="od-summary-divider"></div>

              <div className="od-total-row" style={{ marginBottom: 0 }}>
                <span className="od-total-label">Total Amount</span>
                <span className="od-total-amount">₹{order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            {/* Sidebar Card 3: Trust & Service Badges */}
            <div className="od-card">
              <div className="od-trust-list">
                <div className="od-trust-item">
                  <div className="od-trust-icon">
                    <PackageCheck size={20} />
                  </div>
                  <div className="od-trust-info">
                    <h5>Secure Packaging</h5>
                    <p>Your products are packed with care</p>
                  </div>
                </div>

                <div className="od-trust-item">
                  <div className="od-trust-icon">
                    <RotateCcw size={20} />
                  </div>
                  <div className="od-trust-info">
                    <h5>Easy Returns</h5>
                    <p>Hassle-free return within 7 days</p>
                  </div>
                </div>

                <div className="od-trust-item">
                  <div className="od-trust-icon">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="od-trust-info">
                    <h5>100% Authentic</h5>
                    <p>Quality products from Bengal Creations</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Refund Request Modal */}
      {refundModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20,
        }}>
          <div style={{
            background: "white", borderRadius: 16, padding: 32,
            maxWidth: 440, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <h3 style={{ color: "var(--maroon)", marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>🔄 Request Refund</h3>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
              Please tell us why you'd like a refund. Our support team will review and process it within 3–5 business days.
            </p>
            <textarea
              className="form-control"
              rows={4}
              placeholder="e.g. Received damaged item, product not as expected..."
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              style={{ marginBottom: 16, width: "100%", padding: 10, borderRadius: 8, border: "1.5px solid #ccc" }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleRefundRequest}
                disabled={refundLoading}
                style={{
                  flex: 1, padding: "12px 0", background: "var(--maroon)", color: "white",
                  border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer",
                }}
              >
                {refundLoading ? "Submitting…" : "Submit Request"}
              </button>
              <button
                onClick={() => { setRefundModal(null); setRefundReason(""); }}
                style={{
                  flex: 1, padding: "12px 0", background: "#f5f5f5", color: "#333",
                  border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
