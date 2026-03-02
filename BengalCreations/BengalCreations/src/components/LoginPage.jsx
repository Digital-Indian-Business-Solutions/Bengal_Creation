
import { useState } from "react";
import { useNavigate } from "react-router-dom";
const API = import.meta.env.VITE_API || "http://localhost:5000/api";
function LoginPage({ onLogin,showToast }) {
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
  const navigate = useNavigate();
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
  // ---------------- CUSTOMER LOGIN ----------------
  const loginCustomer = async() => {
     try {
      setLoading(true);

      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(si),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showToast("User Sucessfully Login")
      data.user.role="customer"
      onLogin(data.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
      showToast(err.message)
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- VENDOR LOGIN ----------------
  const loginVendor = async() => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/vendors/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(si),
      });
      // console.log(res)
      const data = await res.json();
      data.vendor.role="vendor"
      // console.log(data)
      if (!res.ok) throw new Error(data.message);
      showToast("Vendor Sucessfully Login")
      onLogin(data.vendor);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };
  // ---------------- CUSTOMER REGISTER ----------------
  const registerCustomer = async() => {
   try {
      setLoading(true);
     const customerData = {
        name: reg.name,
        email: reg.email,
        phone: reg.phone,
        password: reg.password,
      };
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Customer Registered!");
      showToast("Customer Registered!")
      setAuthMode("signin");
    } catch (err) {
      setError(err.message);
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };
  // VENDOR REGISTER (MULTIPART)
const registerVendor = async () => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name",reg.name)
      formData.append("shopName",reg.store)
      formData.append("password",reg.password)
      formData.append("phone",reg.phone)
      formData.append("description",reg.description)
      formData.append("logo",reg.logo)
      formData.append("banner",reg.banner)
      formData.append("address",reg.address)
      formData.append("tradeLicense",reg.tradeLicense)
      formData.append("aadhaarCard",reg.aadhaarCard)
      formData.append("panCard",reg.panCard)
      formData.append("otherDoc",reg.otherDoc)
      formData.append("email",reg.email)


      const res = await fetch(`${API}/vendors/register`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Vendor Registered! Waiting for approval.");

      showToast("Vendor Registered! Waiting for approval.")
      setAuthMode("signin");
    } catch (err) {
      setError(err.message);
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };
  // FILE HANDLER
  const setFile = (name, file) =>
    setReg((r) => ({ ...r, [name]: file }));

 

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
          {[
            ["customer", "👤 Customer"],
            ["vendor", "🏪 Vendor"],
          ].map(([r, label]) => (
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
          {[
            ["signin", "Sign In"],
            ["register", "Create Account"],
          ].map(([m, label]) => (
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
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#6b5744",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Email
                  </label>
                  <input
                    className="form-control"
                    type="email"
                    placeholder="you@email.com"
                    value={si.email}
                    onChange={(e) =>
                      setSi((s) => ({ ...s, email: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#6b5744",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Password
                  </label>
                  <div className="login-input-wrap">
                    <input
                      className="form-control"
                      type={showPwd.si ? "text" : "password"}
                      placeholder="Your password"
                      style={{ paddingRight: 48 }}
                      value={si.password}
                      onChange={(e) =>
                        setSi((s) => ({ ...s, password: e.target.value }))
                      }
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
                {role === "vendor" && (
                  <button className="login-submit-btn" onClick={loginVendor}>
                    Sign In →
                  </button>
                )}
                {role === "customer" && (
                  <button className="login-submit-btn" onClick={loginCustomer}>
                    Sign In →
                  </button>
                )}
              </div>
              <div className="demo-hint">
                <div className="demo-hint-label">DEMO ACCOUNTS</div>
                <div>
                  {role === "customer"
                    ? "👤 customer@demo.com / demo123"
                    : "🏪 vendor@demo.com / demo123"}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h3>Create account</h3>
              <p>Join Bengal Creations as a {role}</p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 13 }}
              >
                {role === "vendor" && (
                  <>
                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#6b5744",
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        Store Name <span className="req">*</span>
                      </label>
                      <input
                        className="form-control"
                        placeholder="e.g. Bishnupur Crafts House"
                        value={reg.store}
                        onChange={(e) =>
                          setReg((r) => ({ ...r, store: e.target.value }))
                        }
                      />
                    </div>
                    {/* <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#6b5744", display: "block", marginBottom: 6 }}>Craft Category</label>
                      <select className="form-control" value={reg.category} onChange={e => setReg(r => ({ ...r, category: e.target.value }))}>
                        {catOptions.map(c => <option key={c.name}>{c.name}</option>)}
                      </select>
                    </div> */}
                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#6b5744",
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        Store Description <span className="req">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        placeholder="Briefly describe your store and products"
                        value={reg.description}
                        onChange={(e) =>
                          setReg((r) => ({ ...r, description: e.target.value }))
                        }
                        rows={3}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#6b5744",
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        Store Address <span className="req">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        placeholder="Enter your store's physical address"
                        value={reg.address}
                        onChange={(e) =>
                          setReg((r) => ({ ...r, address: e.target.value }))
                        }
                        rows={2}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#6b5744",
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        Upload Store Logo
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>setFile("logo", e.target.files[0])}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#6b5744",
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        Upload Store Banner
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>setFile("banner", e.target.files[0])}
                      />
                    </div>
                  </>
                )}
                {[
                  ["name", "Full Name", "text", "Your full name"],
                  ["email", "Email", "email", "you@email.com"],
                  ["phone", "Mobile", "tel", "10-digit number"],
                ].map(([key, label, type, ph]) => (
                  <div key={key}>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#6b5744",
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      {label} <span className="req">*</span>
                    </label>
                    <input
                      className="form-control"
                      type={type}
                      placeholder={ph}
                      value={reg[key]}
                      onChange={(e) =>
                        setReg((r) => ({ ...r, [key]: e.target.value }))
                      }
                    />
                  </div>
                ))}
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#6b5744",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Password <span className="req">*</span>
                  </label>
                  <div className="login-input-wrap">
                    <input
                      className="form-control"
                      type={showPwd.reg ? "text" : "password"}
                      placeholder="Minimum 6 characters"
                      style={{ paddingRight: 48 }}
                      value={reg.password}
                      onChange={(e) =>
                        setReg((r) => ({ ...r, password: e.target.value }))
                      }
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
                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#6b5744",
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        Trade License Doc (only PDF){" "}
                        <span className="req">*</span>
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        accept="application/pdf"
                        onChange={(e) =>setFile("tradeLicense", e.target.files[0])}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#6b5744",
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        Aadhaar Card (only PDF) <span className="req">*</span>
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        accept="application/pdf"
                        onChange={(e) =>setFile("aadhaarCard", e.target.files[0])}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#6b5744",
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        PAN Card (only PDF) <span className="req">*</span>
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        accept="application/pdf"
                        onChange={(e) =>setFile("panCard", e.target.files[0])}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#6b5744",
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        Other Document (optional, PDF or image)
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={(e) =>setFile("otherDoc", e.target.files[0])}
                      />
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        color: "#6b5744",
                        background: "#f5e4b8",
                        padding: 10,
                        borderRadius: 4,
                      }}
                    >
                      <strong>Vendor Registration Notice:</strong>
                      <br />
                      By creating a vendor account, you agree to provide
                      authentic products and accurate information. Your account
                      will be reviewed and approved by our team before you can
                      start selling. Please ensure all details are correct to
                      avoid delays in approval.
                    </div>
                  </>
                )}
                {role === "vendor" && (
                  <button
                    className="login-submit-btn"
                    onClick={registerVendor}
                    
                    
                  >
                    Create Account →
                  </button>
                )}
                {role === "customer" && (
                  <button className="login-submit-btn" onClick={registerCustomer}>
                    Create Account →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(245,228,184,0.5)",
              fontSize: 13,
              cursor: "pointer",
            }}
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
