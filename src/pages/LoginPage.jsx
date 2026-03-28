import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadImage } from "../utils/cloudinary";
import {
  loginCustomer as apiLoginCustomer,
  loginVendor as apiLoginVendor,
  registerCustomer as apiRegisterCustomer,
  registerVendor as apiRegisterVendor,
} from "../api/api";

function LoginPage({ onLogin, showToast }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("customer");
  const [authMode, setAuthMode] = useState("signin");
  const [si, setSi] = useState({ email: "", password: "" });
  const [reg, setReg] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    store: "",
    description: "",
    address: "",
    logo: null,
    banner: null,
    tradeLicense: null,
    aadhaarCard: null,
    panCard: null,
    otherDoc: null,
  });
  const [showPwd, setShowPwd] = useState({ si: false, reg: false });

  const setFile = (name, file) => setReg((r) => ({ ...r, [name]: file }));

  // ── Sign In ──────────────────────────────────────────────────────────────────
  const doSignIn = async () => {
    if (!si.email || !si.password) {
      showToast("⚠️ Please enter your email and password");
      return;
    }
    try {
      setLoading(true);
      setError("");
      if (role === "customer") {
        const data = await apiLoginCustomer(si);
        data.user.role = "customer";
        showToast("User Successfully Login");
        onLogin(data.user);
        navigate("/");
      } else {
        const data = await apiLoginVendor(si);
        data.vendor.role = "vendor";
        showToast("Vendor Successfully Login");
        onLogin(data.vendor);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Register ─────────────────────────────────────────────────────────────────
  const doRegister = async () => {
    if (!reg.name || !reg.email || !reg.password) {
      showToast("⚠️ Please fill all required fields");
      return;
    }
    if (reg.password.length < 6) {
      showToast("⚠️ Password must be at least 6 characters");
      return;
    }
    try {
      setLoading(true);
      setError("");
      if (role === "customer") {
        await apiRegisterCustomer({
          name: reg.name,
          email: reg.email,
          phone: reg.phone,
          password: reg.password,
        });
        showToast("Customer Registered!");
        setAuthMode("signin");
      } else {
        const vendorData = {
          name: reg.name,
          shopName: reg.store,
          email: reg.email,
          phone: reg.phone,
          password: reg.password,
          description: reg.description,
          address: reg.address,
          logo: await uploadImage(reg.logo),
          banner: await uploadImage(reg.banner),
          tradeLicense: await uploadImage(reg.tradeLicense),
          aadhaarCard: await uploadImage(reg.aadhaarCard),
          panCard: await uploadImage(reg.panCard),
          otherDoc: reg.otherDoc ? await uploadImage(reg.otherDoc) : null,
        };
        await apiRegisterVendor(vendorData);
        showToast("Vendor Registered! Waiting for approval.");
        setAuthMode("signin");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <h2>Bengal Creations</h2>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 3,
              color: "rgba(245,228,184,0.5)",
              textTransform: "uppercase",
              marginTop: 2,
            }}
          >
            Heritage Handcrafted
          </div>
        </div>

        {/* Role Tabs */}
        <div className="role-tabs">
          {[["customer", "👤 Customer"], ["vendor", "🏪 Vendor"]].map(([r, label]) => (
            <button
              key={r}
              className="role-tab"
              style={{
                background: role === r ? "white" : "transparent",
                color: role === r ? "#7a1c2e" : "rgba(245,228,184,0.6)",
              }}
              onClick={() => setRole(r)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Auth Mode Tabs */}
        <div className="auth-tabs">
          {[["signin", "Sign In"], ["register", "Create Account"]].map(([m, label]) => (
            <button
              key={m}
              className="auth-tab"
              style={{
                borderBottomColor: authMode === m ? "#c8922a" : "transparent",
                color: authMode === m ? "#e5b84a" : "rgba(245,228,184,0.45)",
              }}
              onClick={() => setAuthMode(m)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="login-card">
          {authMode === "signin" ? (
            <div>
              <h3>Welcome back</h3>
              <p>Sign in to your {role} account</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6b5744", display: "block", marginBottom: 6 }}>
                    Email
                  </label>
                  <input
                    className="form-control"
                    type="email"
                    placeholder="you@email.com"
                    value={si.email}
                    onChange={(e) => setSi((s) => ({ ...s, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6b5744", display: "block", marginBottom: 6 }}>
                    Password
                  </label>
                  <div className="login-input-wrap">
                    <input
                      className="form-control"
                      type={showPwd.si ? "text" : "password"}
                      placeholder="Your password"
                      style={{ paddingRight: 48 }}
                      value={si.password}
                      onChange={(e) => setSi((s) => ({ ...s, password: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && doSignIn()}
                    />
                    <button
                      type="button"
                      className="toggle-pwd"
                      onClick={() => setShowPwd((s) => ({ ...s, si: !s.si }))}
                    >
                      👁
                    </button>
                  </div>
                </div>
                <button className="login-submit-btn" onClick={doSignIn} disabled={loading}>
                  {loading ? "Signing in…" : "Sign In →"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3>Create account</h3>
              <p>Join Bengal Creations as a {role}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                {role === "vendor" && (
                  <>
                    {[
                      ["store", "Store Name", "text", "e.g. Bishnupur Crafts House"],
                      ["description", "Store Description", "textarea", "Briefly describe your store"],
                      ["address", "Store Address", "textarea", "Enter your store's physical address"],
                    ].map(([key, label, type, ph]) => (
                      <div key={key}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#6b5744", display: "block", marginBottom: 6 }}>
                          {label} <span className="req">*</span>
                        </label>
                        {type === "textarea" ? (
                          <textarea
                            className="form-control"
                            placeholder={ph}
                            value={reg[key]}
                            onChange={(e) => setReg((r) => ({ ...r, [key]: e.target.value }))}
                            rows={3}
                          />
                        ) : (
                          <input
                            className="form-control"
                            placeholder={ph}
                            value={reg[key]}
                            onChange={(e) => setReg((r) => ({ ...r, [key]: e.target.value }))}
                          />
                        )}
                      </div>
                    ))}
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#6b5744", display: "block", marginBottom: 6 }}>
                        Upload Store Logo
                      </label>
                      <input className="form-control" type="file" accept="image/*" onChange={(e) => setFile("logo", e.target.files[0])} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#6b5744", display: "block", marginBottom: 6 }}>
                        Upload Store Banner
                      </label>
                      <input className="form-control" type="file" accept="image/*" onChange={(e) => setFile("banner", e.target.files[0])} />
                    </div>
                  </>
                )}

                {[
                  ["name", "Full Name", "text", "Your full name"],
                  ["email", "Email", "email", "you@email.com"],
                  ["phone", "Mobile", "tel", "10-digit number"],
                ].map(([key, label, type, ph]) => (
                  <div key={key}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#6b5744", display: "block", marginBottom: 6 }}>
                      {label} <span className="req">*</span>
                    </label>
                    <input
                      className="form-control"
                      type={type}
                      placeholder={ph}
                      value={reg[key]}
                      onChange={(e) => setReg((r) => ({ ...r, [key]: e.target.value }))}
                    />
                  </div>
                ))}

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#6b5744", display: "block", marginBottom: 6 }}>
                    Password <span className="req">*</span>
                  </label>
                  <div className="login-input-wrap">
                    <input
                      className="form-control"
                      type={showPwd.reg ? "text" : "password"}
                      placeholder="Minimum 6 characters"
                      style={{ paddingRight: 48 }}
                      value={reg.password}
                      onChange={(e) => setReg((r) => ({ ...r, password: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="toggle-pwd"
                      onClick={() => setShowPwd((s) => ({ ...s, reg: !s.reg }))}
                    >
                      👁
                    </button>
                  </div>
                </div>

                {role === "vendor" && (
                  <>
                    {[
                      ["tradeLicense", "Trade License Doc (only PDF)", "application/pdf"],
                      ["aadhaarCard", "Aadhaar Card (only PDF)", "application/pdf"],
                      ["panCard", "PAN Card (only PDF)", "application/pdf"],
                      ["otherDoc", "Other Document (optional)", "application/pdf,image/*"],
                    ].map(([key, label, accept]) => (
                      <div key={key}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#6b5744", display: "block", marginBottom: 6 }}>
                          {label}{key !== "otherDoc" && <span className="req"> *</span>}
                        </label>
                        <input className="form-control" type="file" accept={accept} onChange={(e) => setFile(key, e.target.files[0])} />
                      </div>
                    ))}
                    <div style={{ fontSize: 11, color: "#6b5744", background: "#f5e4b8", padding: 10, borderRadius: 4 }}>
                      <strong>Vendor Registration Notice:</strong>
                      <br />
                      By creating a vendor account, you agree to provide authentic products and accurate information. Your account will be reviewed and approved by our team before you can start selling.
                    </div>
                  </>
                )}

                <button className="login-submit-btn" onClick={doRegister} disabled={loading}>
                  {loading ? "Creating…" : "Create Account →"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button
            style={{ background: "transparent", border: "none", color: "rgba(245,228,184,0.5)", fontSize: 13, cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
