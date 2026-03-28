import { useState } from "react";

function ContactPage({ onShowToast }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
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
    <div className="bgabout">
      {/* Header */}
      <div
        style={{
          background:
            "linear-gradient(135deg,var(--maroon-dark),var(--maroon))",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 40, color: "var(--gold-light)" }}>
          📬 Contact Us
        </h1>
        <p style={{ color: "rgba(245,228,184,0.7)", marginTop: 8 }}>
          We'd love to hear from you
        </p>
      </div>

      {/* Main Section */}
      <div
        style={{
          maxWidth: 1100,
          margin: "40px auto",
          padding: "0 20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: 30,
        }}
      >
        {/* Contact Form */}
        <div>
          {sent ? (
            <div className="success-banner">
              <h3>✅ Message Sent!</h3>
              <p>Our team will get back to you within 24 hours.</p>
            </div>
          ) : (
            <div className="form-card">
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
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [k]: e.target.value }))
                    }
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
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subject: e.target.value }))
                  }
                >
                  <option value="">Select subject</option>
                  {[
                    "Order Issue",
                    "Product Query",
                    "Vendor Support",
                    "Partnership",
                    "Other",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
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
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                />
              </div>

              <button className="btn-gold" onClick={submit}>
                Send Message →
              </button>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div>
          <div className="contact-card">
            <h3>📍 Our Office</h3>
            <p>
             Digital Indian EN-9, Sector V, Salt Lake <br />
              Kolkata, West Bengal <br />
              India - 700001
            </p>
          </div>

          <div className="contact-card">
            <h3>📞 Call Us</h3>
            <p>9830640814 | 7908735132</p>
            <p>Mon - Sun | 10:00 AM - 7:00 PM</p>
          </div>

          <div className="contact-card">
            <h3>📧 Email</h3>
            <p>info@digitalindian.co.in</p>
          </div>

          {/* Google Map */}
          
          <iframe
            title="location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3511.4536461005605!2d88.42989087509011!3d22.573559979491023!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0275afb2b1cef1%3A0x181dda8377acf1d9!2sEn-9%20Roys%20It%20Park%2C%20EN%20Block%2C%20Sector%20V%2C%20Bidhannagar%2C%20Kolkata%2C%20West%20Bengal%20700091!5e1!3m2!1sen!2sin!4v1774697366021!5m2!1sen!2sin"
            width="100%"
            height="200"
            style={{ border: 0, borderRadius: 12, marginTop: 15 }}
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;