import { useState } from "react";

function VendorPage({ onShowToast, catOptions, WB_DISTRICTS }) {
  const [form, setForm] = useState({
    store: "",
    owner: "",
    category: "Handloom Sarees",
    district: "",
    email: "",
    phone: "",
    address: "",
    desc: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (
      !form.store || !form.owner || !form.district ||
      !form.email || !form.phone || !form.address
    ) {
      onShowToast("⚠️ Please fill all required fields");
      return;
    }
    setSubmitted(true);
    onShowToast("🎉 Registration submitted successfully!");
  };

  return (
    <div className="bgabout">
      <div
        style={{
          background: "linear-gradient(135deg,var(--maroon-dark),var(--maroon))",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 40, color: "var(--gold-light)", marginBottom: 12 }}>
          🏪 Sell on Bengal Creations
        </h1>
        <p style={{ color: "rgba(245,228,184,0.7)", fontSize: 16 }}>
          Join 500+ artisans reaching customers across India
        </p>
      </div>

      <div className="vendor-page">
        {submitted ? (
          <div className="success-banner">
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>🎉 Registration Submitted!</h3>
            <p>
              Our team will review your application and reach out within 2–3 business days.
            </p>
          </div>
        ) : (
          <div
            style={{
              background: "white",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: 32,
              boxShadow: "var(--shadow)",
            }}
          >
            <h3 style={{ color: "var(--maroon)", marginBottom: 24 }}>
              Vendor Registration
            </h3>
            <div className="form-grid">
              {[
                ["store", "Store / Shop Name", "text", "e.g. Bishnupur Crafts House", false],
                ["owner", "Owner Full Name", "text", "Your full name", false],
                ["email", "Email", "email", "business@email.com", false],
                ["phone", "Phone", "tel", "10-digit mobile", false],
                ["address", "Business Address", "text", "Your full address", true],
              ].map(([key, label, type, ph, full]) => (
                <div key={key} className={`form-group${full ? " full" : ""}`}>
                  <label>
                    {label} <span className="req">*</span>
                  </label>
                  <input
                    className="form-control"
                    type={type}
                    placeholder={ph}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}

              <div className="form-group">
                <label>Category</label>
                <select
                  className="form-control"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                >
                  {catOptions.map((c) => (
                    <option key={c._id ?? c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  District <span className="req">*</span>
                </label>
                <select
                  className="form-control"
                  value={form.district}
                  onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                >
                  <option value="">Select District</option>
                  {WB_DISTRICTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-group full">
                <label>About Your Craft</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Tell us about your craft and heritage..."
                  value={form.desc}
                  onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                />
              </div>
            </div>
            <button
              className="btn-gold"
              style={{ width: "100%", padding: 16, fontSize: 16, marginTop: 8 }}
              onClick={submit}
            >
              Submit Application →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorPage;
