import { useState } from "react";

function ContactPage({ onShowToast }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (!form.name || !form.email || !form.subject || !form.message) {
      onShowToast("⚠️ Please fill all required fields");
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailOk) {
      onShowToast("⚠️ Please enter a valid email address");
      return;
    }
    setSent(true);
    onShowToast("✅ Message sent! We'll reply within 24 hours.");
  };

  return (
    <div>
      <div
        style={{
          background: "linear-gradient(135deg,var(--maroon-dark),var(--maroon))",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 40, color: "var(--gold-light)" }}>📬 Contact Us</h1>
        <p style={{ color: "rgba(245,228,184,0.7)", marginTop: 8 }}>
          We'd love to hear from you
        </p>
      </div>
      <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 32px" }}>
        {sent ? (
          <div className="success-banner">
            <h3>✅ Message Sent!</h3>
            <p>Our team will get back to you within 24 hours.</p>
          </div>
        ) : (
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: 32,
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow)",
            }}
          >
            {[
              ["name", "Full Name", "text"],
              ["email", "Email", "email"],
            ].map(([k, l, t]) => (
              <div className="form-group" key={k}>
                <label>
                  {l} <span className="req">*</span>
                </label>
                <input
                  className="form-control"
                  type={t}
                  value={form[k]}
                  onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                />
              </div>
            ))}
            <div className="form-group">
              <label>
                Subject <span className="req">*</span>
              </label>
              <select
                className="form-control"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              >
                <option value="">Select subject</option>
                {["Order Issue", "Product Query", "Vendor Support", "Partnership", "Other"].map(
                  (s) => <option key={s}>{s}</option>
                )}
              </select>
            </div>
            <div className="form-group">
              <label>
                Message <span className="req">*</span>
              </label>
              <textarea
                className="form-control"
                rows={5}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              />
            </div>
            <button
              className="btn-gold"
              style={{ width: "100%", padding: 16 }}
              onClick={submit}
            >
              Send Message →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContactPage;
