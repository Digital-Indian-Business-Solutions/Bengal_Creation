import { useState, useEffect, useCallback } from "react";
import {
  saSendOtp, saVerifyOtp,
  saGetDashboard, saGetVendors, saApproveVendor, saRejectVendor,
  saGetCustomers, saDeleteCustomer,
  saGetOrders, saUpdateOrder, saBulkUpdateOrders, saManualCharge,
  saGetRefunds, saProcessRefund,
  saGetCoupons, saCreateCoupon, saUpdateCoupon, saDeleteCoupon,
  saGetRevenue, saGetSettings, saUpdateSettings,
} from "../api/api";

const SA_TOKEN_KEY = "sa_token";
const getToken  = () => localStorage.getItem(SA_TOKEN_KEY) || "";
const saveToken = (t) => localStorage.setItem(SA_TOKEN_KEY, t);
const clearToken = () => localStorage.removeItem(SA_TOKEN_KEY);

const badge = (label, color) => (
  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 700, background: `${color}22`, color }}>{label}</span>
);
const statusColor = { Pending:"#f59e0b", Processing:"#3b82f6", Shipped:"#8b5cf6", Delivered:"#22c55e", Cancelled:"#ef4444" };
const payColor    = { Paid:"#22c55e", Pending:"#f59e0b", Failed:"#ef4444" };

function Stat({ icon, label, value, color="#800000" }) {
  return (
    <div style={{ background:"white", border:"1px solid #f0e6d6", borderRadius:14, padding:"20px 24px", flex:"1 1 160px", minWidth:150 }}>
      <div style={{ fontSize:28, marginBottom:6 }}>{icon}</div>
      <div style={{ fontSize:26, fontWeight:800, color }}>{value}</div>
      <div style={{ fontSize:13, color:"#888", marginTop:2 }}>{label}</div>
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background:"white", borderRadius:16, padding:28, maxWidth: wide ? 720 : 560, width:"100%", maxHeight:"85vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,.2)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h3 style={{ color:"#800000", margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#888" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email,setEmail]=useState(""); const [otp,setOtp]=useState("");
  const [step,setStep]=useState(1); const [loading,setLoading]=useState(false); const [err,setErr]=useState("");

  const handleSend = async () => {
    if (!email) return; setLoading(true); setErr("");
    try { await saSendOtp(email); setStep(2); } catch(e){ setErr(e.message); } finally{ setLoading(false); }
  };
  const handleVerify = async () => {
    if (!otp) return; setLoading(true); setErr("");
    try { const d = await saVerifyOtp(email,otp); saveToken(d.token); onLogin(d.token); } catch(e){ setErr(e.message); } finally{ setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#fdf8f2" }}>
      <div style={{ background:"white", border:"1px solid #f0e6d6", borderRadius:20, padding:"40px 36px", width:"100%", maxWidth:400, boxShadow:"0 8px 32px rgba(128,0,0,.08)" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>👑</div>
          <h2 style={{ color:"#800000", margin:0, fontSize:22 }}>Super Admin</h2>
          <p style={{ color:"#888", fontSize:14, marginTop:4 }}>Bengal Creations Control Panel</p>
        </div>
        {step===1 ? (<>
          <label style={lbl}>Admin Email</label>
          <input className="form-control" type="email" placeholder="admin@bengalcreations.in" value={email} onChange={(e)=>setEmail(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&handleSend()} style={{ marginBottom:16 }} />
          <button className="btn-gold" style={{ width:"100%" }} onClick={handleSend} disabled={loading||!email}>{loading?"Sending…":"Send OTP →"}</button>
        </>) : (<>
          <p style={{ color:"#555", fontSize:14, marginBottom:16 }}>OTP sent to <b>{email}</b>. Valid 10 min.</p>
          <label style={lbl}>6-digit OTP</label>
          <input className="form-control" type="text" placeholder="______" value={otp} onChange={(e)=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} onKeyDown={(e)=>e.key==="Enter"&&handleVerify()} style={{ marginBottom:16, letterSpacing:8, fontSize:20, textAlign:"center" }} />
          <button className="btn-gold" style={{ width:"100%" }} onClick={handleVerify} disabled={loading||otp.length<6}>{loading?"Verifying…":"Login →"}</button>
          <button onClick={()=>{setStep(1);setErr("");}} style={{ width:"100%", marginTop:10, background:"none", border:"none", color:"#888", cursor:"pointer", fontSize:13 }}>← Change email</button>
        </>)}
        {err && <p style={{ color:"#dc2626", fontSize:13, marginTop:12, textAlign:"center" }}>{err}</p>}
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function DashboardTab({ token }) {
  const [data,setData]=useState(null);
  useEffect(()=>{ saGetDashboard(token).then(setData).catch(console.error); },[token]);
  if (!data) return <p style={{ color:"#888", padding:24 }}>Loading…</p>;
  const s = data.stats;
  return (
    <div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:16, marginBottom:28 }}>
        <Stat icon="🏪" label="Total Vendors"    value={s.totalVendors}    />
        <Stat icon="⏳" label="Pending Vendors"  value={s.pendingVendors}  color="#f59e0b" />
        <Stat icon="👥" label="Customers"        value={s.totalCustomers}  />
        <Stat icon="📦" label="Total Orders"     value={s.totalOrders}     />
        <Stat icon="🛍️" label="Products"         value={s.totalProducts}   />
        <Stat icon="💰" label="Revenue"          value={`₹${(s.totalRevenue||0).toLocaleString()}`} color="#16a34a" />
        <Stat icon="💸" label="Pending Refunds"  value={s.pendingRefunds}  color="#ef4444" />
      </div>
      <h3 style={{ color:"#800000", marginBottom:14 }}>Recent Orders</h3>
      <div style={tableWrap}>
        <table style={tbl}><thead><tr style={thRow}><th style={th}>Order ID</th><th style={th}>Customer</th><th style={th}>Amount</th><th style={th}>Status</th><th style={th}>Payment</th></tr></thead>
          <tbody>{data.recentOrders?.map((o)=>(
            <tr key={o._id} style={tdRow}>
              <td style={td}><code style={{ fontSize:11 }}>{o._id?.slice(-8)}</code></td>
              <td style={td}>{o.user?.name||"—"}</td>
              <td style={td}>₹{o.totalAmount?.toLocaleString()}</td>
              <td style={td}>{badge(o.status,statusColor[o.status]||"#888")}</td>
              <td style={td}>{badge(o.paymentStatus,payColor[o.paymentStatus]||"#888")}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

// ─── PLATFORM SETTINGS / CHARGES ─────────────────────────────────────────────
function SettingsTab({ token, showToast }) {
  const [s, setS]     = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async()=>{
    const d = await saGetSettings(token); setS(d.settings);
  },[token]);
  useEffect(()=>{ load(); },[load]);

  const save = async() => {
    setSaving(true);
    try {
      const d = await saUpdateSettings(token, s);
      setS(d.settings);
      showToast("✅ Settings saved");
    } catch(e){ showToast("❌ "+e.message); }
    finally{ setSaving(false); }
  };

  const field=(key,label,type="number",hint="")=>(
    <div key={key} style={{ marginBottom:18 }}>
      <label style={{ ...lbl, fontSize:13, marginBottom:5 }}>{label}</label>
      {type==="checkbox" ? (
        <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
          <input type="checkbox" checked={!!s[key]} onChange={(e)=>setS(f=>({...f,[key]:e.target.checked}))}
            style={{ width:18, height:18, cursor:"pointer" }} />
          <span style={{ fontSize:13, color:s[key]?"#16a34a":"#888", fontWeight:600 }}>{s[key]?"Enabled":"Disabled"}</span>
        </label>
      ) : (
        <input className="form-control" type={type} value={s[key]??""} onChange={(e)=>setS(f=>({...f,[key]:type==="number"?Number(e.target.value):e.target.value}))} />
      )}
      {hint && <p style={{ fontSize:11, color:"#888", marginTop:4 }}>{hint}</p>}
    </div>
  );

  if (!s) return <p style={{ color:"#888" }}>Loading settings…</p>;

  return (
    <div style={{ maxWidth:780 }}>
      <p style={{ color:"#888", fontSize:14, marginBottom:24 }}>
        Configure GST, platform commission, delivery charges, and coupon limits. Changes take effect on the next order.
      </p>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:28 }}>

        {/* GST */}
        <div style={settingCard}>
          <div style={settingCardHead}>🧾 GST / Tax</div>
          {field("gstEnabled","Enable GST","checkbox")}
          {s.gstEnabled && field("gstRate","GST Rate (%)","number","Applied on (subtotal − coupon discount)")}
          <div style={previewBox}>
            Example: ₹1,000 order → GST = ₹{s.gstEnabled ? Math.round(1000*s.gstRate/100) : 0}
          </div>
        </div>

        {/* Platform Fee */}
        <div style={settingCard}>
          <div style={settingCardHead}>🏦 Platform Fee / Flat Charge</div>
          {field("platformFeeEnabled","Enable Platform Fee","checkbox")}
          {s.platformFeeEnabled && (<>
            {field("platformFeeLabel","Fee Label","text","e.g. 'Platform Fee', 'Service Charge'")}
            {field("platformFeeRate","Flat Platform Fee (₹)","number","Flat charge per order (e.g. 10 or 20)")}
          </>)}
          <div style={previewBox}>
            Example: Order → Flat Platform Fee = ₹{s.platformFeeEnabled ? (s.platformFeeRate || 0) : 0}
          </div>
        </div>

        {/* Delivery */}
        <div style={settingCard}>
          <div style={settingCardHead}>🚚 Delivery Charge</div>
          {field("deliveryChargeEnabled","Enable Delivery Charge","checkbox")}
          {s.deliveryChargeEnabled && (<>
            {field("deliveryCharge","Flat Delivery Charge (₹)","number")}
            {field("freeDeliveryAbove","Free Delivery Above (₹)","number","Set 0 to disable free threshold")}
          </>)}
          <div style={previewBox}>
            {s.deliveryChargeEnabled
              ? s.freeDeliveryAbove > 0
                ? `Orders above ₹${s.freeDeliveryAbove.toLocaleString()} get free delivery`
                : `Flat ₹${s.deliveryCharge} on every order`
              : "No delivery charge currently"}
          </div>
        </div>

        {/* Coupons */}
        <div style={settingCard}>
          <div style={settingCardHead}>🎟️ Coupon / Discount Limits</div>
          {field("maxCouponDiscountPct","Max Coupon Discount (%)","number","Global cap — individual coupons can be lower")}
          <div style={previewBox}>
            No coupon can give more than {s.maxCouponDiscountPct}% off
          </div>
        </div>
      </div>

      {/* Order total preview */}
      <div style={{ background:"#f9f5f0", border:"1px solid #e8ddd0", borderRadius:12, padding:20, marginTop:20, marginBottom:24 }}>
        <div style={{ fontWeight:700, color:"#800000", marginBottom:12 }}>📊 Simulated Order Breakdown (₹1,000 subtotal, ₹100 coupon)</div>
        {(() => {
          const sub = 1000, disc = Math.min(100, 1000);
          const taxBase = sub - disc;
          const gst = s.gstEnabled ? Math.round(taxBase * s.gstRate / 100) : 0;
          const fee = s.platformFeeEnabled ? Number(s.platformFeeRate || 0) : 0;
          const del = s.deliveryChargeEnabled && s.deliveryCharge > 0 && !(s.freeDeliveryAbove > 0 && sub >= s.freeDeliveryAbove) ? s.deliveryCharge : 0;
          const total = taxBase + gst + fee + del;
          const rows = [
            ["Subtotal",           `₹${sub.toLocaleString()}`],
            ["Coupon Discount",    `−₹${disc.toLocaleString()}`, "#16a34a"],
            s.gstEnabled && [`GST (${s.gstRate}%)`, `₹${gst.toLocaleString()}`],
            s.platformFeeEnabled && [`${s.platformFeeLabel || "Platform Fee"}`, `₹${fee.toLocaleString()}`],
            s.deliveryChargeEnabled && ["Delivery", del > 0 ? `₹${del}` : "FREE"],
            ["Total", `₹${total.toLocaleString()}`, "#800000"],
          ].filter(Boolean);
          return rows.map(([k,v,c],i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderTop: i>0?"1px solid #f0e6d6":"none", fontSize:14, color: c||"#555", fontWeight: i===rows.length-1?"700":"400" }}>
              <span>{k}</span><span>{v}</span>
            </div>
          ));
        })()}
      </div>

      {/* Admin Note */}
      <div style={settingCard}>
        <div style={settingCardHead}>📣 Admin Note / Announcement</div>
        <textarea className="form-control" rows={3} value={s.adminNote||""} onChange={(e)=>setS(f=>({...f,adminNote:e.target.value}))} placeholder="Optional note visible to vendors in their dashboard" />
      </div>

      <button className="btn-gold" style={{ marginTop:20, padding:"14px 32px", fontSize:15 }} onClick={save} disabled={saving}>
        {saving ? "Saving…" : "💾 Save All Settings"}
      </button>
    </div>
  );
}

// ─── VENDORS ─────────────────────────────────────────────────────────────────
function VendorsTab({ token, showToast }) {
  const [vendors,setVendors]=useState([]); const [total,setTotal]=useState(0);
  const [search,setSearch]=useState(""); const [filter,setFilter]=useState(""); const [loading,setLoading]=useState(false);

  const load=useCallback(async()=>{
    setLoading(true);
    const p={}; if(search) p.search=search; if(filter!=="") p.verified=filter;
    const d=await saGetVendors(token,p); setVendors(d.vendors||[]); setTotal(d.total||0); setLoading(false);
  },[token,search,filter]);
  useEffect(()=>{load();},[load]);

  const approve=async(id)=>{ await saApproveVendor(token,id); showToast("✅ Vendor approved"); load(); };
  const reject=async(id)=>{ if(!window.confirm("Reject and delete this vendor?")) return; await saRejectVendor(token,id); showToast("🗑️ Vendor rejected"); load(); };

  return (
    <div>
      <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
        <input className="form-control" placeholder="Search vendors…" value={search} onChange={(e)=>setSearch(e.target.value)} style={{ maxWidth:260 }} />
        <select className="form-control" value={filter} onChange={(e)=>setFilter(e.target.value)} style={{ maxWidth:160 }}>
          <option value="">All</option><option value="true">Verified</option><option value="false">Pending</option>
        </select>
        <button style={smBtn} onClick={load}>🔄</button>
      </div>
      <p style={{ color:"#888", fontSize:13, marginBottom:12 }}>{total} vendor(s)</p>
      {loading?<p style={{color:"#888"}}>Loading…</p>:(
        <div style={tableWrap}><table style={tbl}>
          <thead><tr style={thRow}><th style={th}>Shop</th><th style={th}>Owner</th><th style={th}>Email</th><th style={th}>Status</th><th style={th}>Actions</th></tr></thead>
          <tbody>{vendors.map((v)=>(
            <tr key={v._id} style={tdRow}>
              <td style={td}><b>{v.shopName}</b></td><td style={td}>{v.name}</td><td style={td}>{v.email}</td>
              <td style={td}>{v.isVerified?badge("Verified","#16a34a"):badge("Pending","#f59e0b")}</td>
              <td style={td}>
                {!v.isVerified&&<button onClick={()=>approve(v._id)} style={{...smBtn,background:"#16a34a",marginRight:6}}>Approve</button>}
                <button onClick={()=>reject(v._id)} style={{...smBtn,background:"#dc2626"}}>Reject</button>
              </td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
    </div>
  );
}

// ─── CUSTOMERS ───────────────────────────────────────────────────────────────
function CustomersTab({ token, showToast }) {
  const [customers,setCustomers]=useState([]); const [total,setTotal]=useState(0); const [search,setSearch]=useState("");
  const load=useCallback(async()=>{ const d=await saGetCustomers(token,search?{search}:{}); setCustomers(d.customers||[]); setTotal(d.total||0); },[token,search]);
  useEffect(()=>{load();},[load]);
  const del=async(id,name)=>{ if(!window.confirm(`Delete ${name}?`)) return; await saDeleteCustomer(token,id); showToast("🗑️ Deleted"); load(); };
  return (
    <div>
      <div style={{ display:"flex", gap:10, marginBottom:18 }}>
        <input className="form-control" placeholder="Search…" value={search} onChange={(e)=>setSearch(e.target.value)} style={{ maxWidth:280 }} />
        <button style={smBtn} onClick={load}>🔄</button>
      </div>
      <p style={{ color:"#888", fontSize:13, marginBottom:12 }}>{total} customer(s)</p>
      <div style={tableWrap}><table style={tbl}>
        <thead><tr style={thRow}><th style={th}>Name</th><th style={th}>Email</th><th style={th}>Phone</th><th style={th}>Joined</th><th style={th}></th></tr></thead>
        <tbody>{customers.map((c)=>(
          <tr key={c._id} style={tdRow}>
            <td style={td}>{c.name}</td><td style={td}>{c.email}</td><td style={td}>{c.phone||"—"}</td>
            <td style={td}>{new Date(c.createdAt).toLocaleDateString()}</td>
            <td style={td}><button onClick={()=>del(c._id,c.name)} style={{...smBtn,background:"#dc2626"}}>Delete</button></td>
          </tr>
        ))}</tbody>
      </table></div>
    </div>
  );
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────
function OrdersTab({ token, showToast }) {
  const [orders,setOrders]=useState([]); const [total,setTotal]=useState(0);
  const [selected,setSelected]=useState([]); const [modal,setModal]=useState(null);
  const [filters,setFilters]=useState({status:"",paymentStatus:"",search:""});
  const [chargeForm,setChargeForm]=useState({orderId:"",note:"",method:"UPI"});

  const load=useCallback(async()=>{
    const p={}; if(filters.status) p.status=filters.status; if(filters.paymentStatus) p.paymentStatus=filters.paymentStatus; if(filters.search) p.search=filters.search;
    const d=await saGetOrders(token,p); setOrders(d.orders||[]); setTotal(d.total||0); setSelected([]);
  },[token,filters]);
  useEffect(()=>{load();},[load]);

  const toggleAll=()=>setSelected(selected.length===orders.length?[]:orders.map(o=>o._id));
  const toggle=(id)=>setSelected(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const bulkUpdate=async(body)=>{ await saBulkUpdateOrders(token,{orderIds:selected,...body}); showToast("✅ Updated"); load(); };
  const updateSingle=async(id,body)=>{ await saUpdateOrder(token,id,body); load(); };
  const handleManualCharge=async()=>{ if(!chargeForm.orderId) return; await saManualCharge(token,chargeForm); showToast("💳 Payment recorded"); setModal(null); load(); };

  return (
    <div>
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <input className="form-control" placeholder="Search…" value={filters.search} onChange={(e)=>setFilters(f=>({...f,search:e.target.value}))} style={{ maxWidth:200 }} />
        <select className="form-control" value={filters.status} onChange={(e)=>setFilters(f=>({...f,status:e.target.value}))} style={{ maxWidth:160 }}>
          <option value="">All Statuses</option>
          {["Pending","Processing","Shipped","Delivered","Cancelled"].map(s=><option key={s}>{s}</option>)}
        </select>
        <select className="form-control" value={filters.paymentStatus} onChange={(e)=>setFilters(f=>({...f,paymentStatus:e.target.value}))} style={{ maxWidth:150 }}>
          <option value="">All Payments</option>
          {["Pending","Paid","Failed"].map(s=><option key={s}>{s}</option>)}
        </select>
        <button style={smBtn} onClick={load}>🔄</button>
        <button style={{...smBtn,background:"#800000"}} onClick={()=>setModal({type:"charge"})}>💳 Record Payment</button>
      </div>

      {selected.length>0&&(
        <div style={{ display:"flex", gap:10, alignItems:"center", background:"#fff5e6", border:"1px solid #f0c080", borderRadius:10, padding:"10px 16px", marginBottom:14 }}>
          <span style={{ fontSize:13, color:"#800000", fontWeight:600 }}>{selected.length} selected</span>
          <button style={{...smBtn,background:"#16a34a"}} onClick={()=>bulkUpdate({paymentStatus:"Paid"})}>✅ Mark Paid</button>
          <button style={{...smBtn,background:"#3b82f6"}} onClick={()=>bulkUpdate({status:"Shipped"})}>📦 Mark Shipped</button>
          <button style={{...smBtn,background:"#22c55e"}} onClick={()=>bulkUpdate({status:"Delivered"})}>✓ Mark Delivered</button>
          <button style={{...smBtn,background:"#888"}} onClick={()=>setSelected([])}>Clear</button>
        </div>
      )}

      <p style={{ color:"#888", fontSize:13, marginBottom:12 }}>{total} order(s)</p>
      <div style={tableWrap}><table style={tbl}>
        <thead><tr style={thRow}>
          <th style={th}><input type="checkbox" checked={selected.length===orders.length&&orders.length>0} onChange={toggleAll}/></th>
          <th style={th}>Order ID</th><th style={th}>Customer</th><th style={th}>Breakdown</th><th style={th}>Total</th>
          <th style={th}>Status</th><th style={th}>Payment</th><th style={th}>Date</th><th style={th}></th>
        </tr></thead>
        <tbody>{orders.map((o)=>(
          <tr key={o._id} style={tdRow}>
            <td style={td}><input type="checkbox" checked={selected.includes(o._id)} onChange={()=>toggle(o._id)}/></td>
            <td style={td}><code style={{fontSize:11}}>{o._id?.slice(-8)}</code></td>
            <td style={td}>{o.user?.name||"—"}<br/><span style={{fontSize:11,color:"#888"}}>{o.user?.email}</span></td>
            <td style={td}>
              <div style={{fontSize:11,color:"#555",lineHeight:1.6}}>
                <div>Subtotal: ₹{(o.subtotal||o.totalAmount)?.toLocaleString()}</div>
                {o.discountAmount>0&&<div style={{color:"#16a34a"}}>Discount: −₹{o.discountAmount?.toLocaleString()}</div>}
                {o.gstAmount>0&&<div>GST ({o.gstRate}%): ₹{o.gstAmount?.toLocaleString()}</div>}
                {o.platformFeeAmount>0&&<div>Platform Fee: ₹{o.platformFeeAmount?.toLocaleString()}</div>}
                {o.deliveryCharge>0&&<div>Delivery: ₹{o.deliveryCharge?.toLocaleString()}</div>}
                {o.couponCode&&<div style={{color:"#f59e0b"}}>🎟️ {o.couponCode}</div>}
              </div>
            </td>
            <td style={td}><b>₹{o.totalAmount?.toLocaleString()}</b></td>
            <td style={td}>
              <select value={o.status} onChange={(e)=>updateSingle(o._id,{status:e.target.value})}
                style={{border:"none",background:"transparent",fontSize:12,cursor:"pointer",color:statusColor[o.status]||"#333",fontWeight:700}}>
                {["Pending","Processing","Shipped","Delivered","Cancelled"].map(s=><option key={s}>{s}</option>)}
              </select>
            </td>
            <td style={td}>
              <select value={o.paymentStatus} onChange={(e)=>updateSingle(o._id,{paymentStatus:e.target.value})}
                style={{border:"none",background:"transparent",fontSize:12,cursor:"pointer",color:payColor[o.paymentStatus]||"#333",fontWeight:700}}>
                {["Pending","Paid","Failed"].map(s=><option key={s}>{s}</option>)}
              </select>
            </td>
            <td style={td}><span style={{fontSize:11,color:"#888"}}>{new Date(o.createdAt).toLocaleDateString()}</span></td>
            <td style={td}><button onClick={()=>{setChargeForm({orderId:o._id,note:"",method:"UPI"});setModal({type:"charge"});}} style={{...smBtn,background:"#800000",fontSize:10,padding:"3px 8px"}}>💳</button></td>
          </tr>
        ))}</tbody>
      </table></div>

      {modal?.type==="charge"&&(
        <Modal title="💳 Record Manual Payment" onClose={()=>setModal(null)}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div><label style={lbl}>Order ID</label><input className="form-control" value={chargeForm.orderId} onChange={(e)=>setChargeForm(f=>({...f,orderId:e.target.value}))} placeholder="MongoDB order _id"/></div>
            <div><label style={lbl}>Method</label>
              <select className="form-control" value={chargeForm.method} onChange={(e)=>setChargeForm(f=>({...f,method:e.target.value}))}>
                {["UPI","COD","BANK_TRANSFER","CASH"].map(m=><option key={m}>{m}</option>)}
              </select></div>
            <div><label style={lbl}>Reference / UTR (optional)</label><input className="form-control" value={chargeForm.note} onChange={(e)=>setChargeForm(f=>({...f,note:e.target.value}))} placeholder="e.g. UTR#98765432"/></div>
            <button className="btn-gold" style={{ width:"100%" }} onClick={handleManualCharge}>✅ Record Payment</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── REFUNDS ─────────────────────────────────────────────────────────────────
function RefundsTab({ token, showToast }) {
  const [refunds,setRefunds]=useState([]); const [modal,setModal]=useState(null);
  const [form,setForm]=useState({action:"approve",refundAmount:"",note:""});
  const load=useCallback(async()=>{ const d=await saGetRefunds(token); setRefunds(d.refunds||[]); },[token]);
  useEffect(()=>{load();},[load]);
  const process=async()=>{ await saProcessRefund(token,{orderId:modal.orderId,action:form.action,refundAmount:form.refundAmount||undefined,note:form.note}); showToast(form.action==="approve"?"✅ Refund approved":"❌ Rejected"); setModal(null); load(); };
  const refColor={Requested:"#f59e0b",Approved:"#3b82f6",Processed:"#22c55e",Rejected:"#ef4444"};
  return (
    <div>
      <button style={{...smBtn,marginBottom:14}} onClick={load}>🔄 Refresh</button>
      <div style={tableWrap}><table style={tbl}>
        <thead><tr style={thRow}><th style={th}>Order ID</th><th style={th}>Customer</th><th style={th}>Amount</th><th style={th}>Reason</th><th style={th}>Status</th><th style={th}>Actions</th></tr></thead>
        <tbody>{refunds.map((r)=>(
          <tr key={r._id} style={tdRow}>
            <td style={td}><code style={{fontSize:11}}>{r._id?.slice(-8)}</code></td>
            <td style={td}>{r.user?.name}<br/><span style={{fontSize:11,color:"#888"}}>{r.user?.email}</span></td>
            <td style={td}><b>₹{r.refundAmount?.toLocaleString()}</b></td>
            <td style={td}><span style={{fontSize:12,color:"#555"}}>{r.refundReason||"—"}</span></td>
            <td style={td}>{badge(r.refundStatus,refColor[r.refundStatus]||"#888")}</td>
            <td style={td}>{r.refundStatus==="Requested"&&<button onClick={()=>{setModal({orderId:r._id});setForm({action:"approve",refundAmount:r.refundAmount||"",note:""}); }} style={{...smBtn,background:"#800000"}}>Process</button>}</td>
          </tr>
        ))}</tbody>
      </table></div>
      {modal&&(
        <Modal title="Process Refund" onClose={()=>setModal(null)}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div><label style={lbl}>Action</label><select className="form-control" value={form.action} onChange={(e)=>setForm(f=>({...f,action:e.target.value}))}>
              <option value="approve">✅ Approve</option><option value="reject">❌ Reject</option>
            </select></div>
            {form.action==="approve"&&<div><label style={lbl}>Refund Amount (₹)</label><input className="form-control" type="number" value={form.refundAmount} onChange={(e)=>setForm(f=>({...f,refundAmount:e.target.value}))}/></div>}
            <div><label style={lbl}>Admin Note</label><input className="form-control" value={form.note} onChange={(e)=>setForm(f=>({...f,note:e.target.value}))} placeholder="e.g. Transferred via UPI"/></div>
            <button className="btn-gold" style={{width:"100%"}} onClick={process}>Confirm</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── COUPONS ─────────────────────────────────────────────────────────────────
function CouponsTab({ token, showToast }) {
  const [coupons,setCoupons]=useState([]); const [modal,setModal]=useState(null); const [err,setErr]=useState("");
  const blank={code:"",title:"",description:"",discount_type:"PERCENTAGE",discount_value:"",min_order_amount:"",max_discount_amount:"",usage_limit:"",usage_limit_per_customer:1,start_at:"",end_at:"",is_active:true,is_public:true,applicable_for:"ALL"};
  const [form,setForm]=useState(blank);
  const load=useCallback(async()=>{ const d=await saGetCoupons(token); setCoupons(d.coupons||[]); },[token]);
  useEffect(()=>{load();},[load]);
  const openCreate=()=>{ setForm(blank); setErr(""); setModal("create"); };
  const openEdit=(c)=>{ setForm({...c,start_at:c.start_at?.slice(0,10)||"",end_at:c.end_at?.slice(0,10)||""}); setErr(""); setModal({editing:c}); };
  const save=async()=>{
    setErr("");
    try {
      const body={...form,discount_value:Number(form.discount_value),min_order_amount:Number(form.min_order_amount)||0,max_discount_amount:form.max_discount_amount?Number(form.max_discount_amount):null,usage_limit:form.usage_limit?Number(form.usage_limit):null};
      if(modal==="create"){ await saCreateCoupon(token,body); showToast("🎟️ Created"); }
      else{ await saUpdateCoupon(token,modal.editing._id,body); showToast("✏️ Updated"); }
      setModal(null); load();
    } catch(e){ setErr(e.message); }
  };
  const del=async(id,code)=>{ if(!window.confirm(`Delete ${code}?`)) return; await saDeleteCoupon(token,id); showToast("🗑️ Deleted"); load(); };
  const toggle=async(c)=>{ await saUpdateCoupon(token,c._id,{is_active:!c.is_active}); load(); };

  const f=(key,label,type="text",opts=null)=>(
    <div key={key}>
      <label style={lbl}>{label}</label>
      {opts?<select className="form-control" value={form[key]} onChange={(e)=>setForm(f=>({...f,[key]:e.target.value}))}>{opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}</select>
      :type==="checkbox"?<label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}><input type="checkbox" checked={!!form[key]} onChange={(e)=>setForm(f=>({...f,[key]:e.target.checked}))}/><span style={{fontSize:13,color:"#555"}}>{label}</span></label>
      :<input className="form-control" type={type} value={form[key]??""} onChange={(e)=>setForm(f=>({...f,[key]:e.target.value}))}/>}
    </div>
  );

  return (
    <div>
      <button style={{...smBtn,background:"#800000",marginBottom:16}} onClick={openCreate}>+ Create Coupon</button>
      <div style={tableWrap}><table style={tbl}>
        <thead><tr style={thRow}><th style={th}>Code</th><th style={th}>Title</th><th style={th}>Discount</th><th style={th}>Min Order</th><th style={th}>Valid Until</th><th style={th}>Used</th><th style={th}>Status</th><th style={th}>Actions</th></tr></thead>
        <tbody>{coupons.map((c)=>(
          <tr key={c._id} style={tdRow}>
            <td style={td}><code style={{fontWeight:700,color:"#800000"}}>{c.code}</code></td>
            <td style={td}>{c.title}</td>
            <td style={td}>{c.discount_type==="PERCENTAGE"?`${c.discount_value}%`:`₹${c.discount_value}`}{c.max_discount_amount?` (max ₹${c.max_discount_amount})`:""}</td>
            <td style={td}>₹{c.min_order_amount||0}</td>
            <td style={td}><span style={{fontSize:11}}>{new Date(c.end_at).toLocaleDateString()}</span></td>
            <td style={td}>{c.used_count}{c.usage_limit?` / ${c.usage_limit}`:""}</td>
            <td style={td}>{badge(c.is_active?"Active":"Inactive",c.is_active?"#22c55e":"#888")}</td>
            <td style={td}>
              <button onClick={()=>toggle(c)} style={{...smBtn,background:c.is_active?"#888":"#22c55e",marginRight:4,fontSize:10,padding:"3px 7px"}}>{c.is_active?"Disable":"Enable"}</button>
              <button onClick={()=>openEdit(c)} style={{...smBtn,background:"#3b82f6",marginRight:4,fontSize:10,padding:"3px 7px"}}>Edit</button>
              <button onClick={()=>del(c._id,c.code)} style={{...smBtn,background:"#dc2626",fontSize:10,padding:"3px 7px"}}>Del</button>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
      {modal&&(
        <Modal title={modal==="create"?"Create Coupon":`Edit: ${modal.editing?.code}`} onClose={()=>setModal(null)}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {f("code","Code")}{f("title","Title")}
            {f("discount_type","Type","text",[{v:"PERCENTAGE",l:"Percentage %"},{v:"FLAT",l:"Flat ₹"}])}
            {f("discount_value","Value","number")}{f("min_order_amount","Min Order ₹","number")}
            {f("max_discount_amount","Max Discount ₹ (optional)","number")}
            {f("usage_limit","Total Limit (blank=unlimited)","number")}{f("usage_limit_per_customer","Per Customer","number")}
            {f("start_at","Start Date","date")}{f("end_at","End Date","date")}
            {f("applicable_for","For","text",[{v:"ALL",l:"All Orders"},{v:"FIRST_ORDER",l:"First Order"},{v:"STORE",l:"Store"},{v:"CATEGORY",l:"Category"}])}
          </div>
          <div style={{ display:"flex", gap:16, marginTop:10 }}>
            {f("is_active","Active","checkbox")}{f("is_public","Public","checkbox")}
          </div>
          {err&&<p style={{color:"#dc2626",fontSize:13,marginTop:8}}>{err}</p>}
          <button className="btn-gold" style={{width:"100%",marginTop:16}} onClick={save}>{modal==="create"?"Create":"Save Changes"}</button>
        </Modal>
      )}
    </div>
  );
}

// ─── REVENUE ─────────────────────────────────────────────────────────────────
function RevenueTab({ token }) {
  const [data,setData]=useState(null); const [range,setRange]=useState({startDate:"",endDate:""});
  const load=useCallback(async()=>{ const p={}; if(range.startDate) p.startDate=range.startDate; if(range.endDate) p.endDate=range.endDate; const d=await saGetRevenue(token,p); setData(d); },[token,range]);
  useEffect(()=>{load();},[load]);
  if(!data) return <p style={{color:"#888",padding:24}}>Loading…</p>;
  return (
    <div>
      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
        <div><label style={lbl}>From</label><input className="form-control" type="date" value={range.startDate} onChange={(e)=>setRange(r=>({...r,startDate:e.target.value}))}/></div>
        <div><label style={lbl}>To</label><input className="form-control" type="date" value={range.endDate} onChange={(e)=>setRange(r=>({...r,endDate:e.target.value}))}/></div>
        <div style={{display:"flex",alignItems:"flex-end"}}><button style={smBtn} onClick={load}>Apply</button></div>
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:16, marginBottom:28 }}>
        <Stat icon="💰" label="Total Revenue"  value={`₹${(data.totalRevenue||0).toLocaleString()}`} color="#16a34a"/>
        <Stat icon="💸" label="Total Refunds"  value={`₹${(data.totalRefunds||0).toLocaleString()}`} color="#ef4444"/>
        <Stat icon="📈" label="Net Revenue"    value={`₹${(data.netRevenue||0).toLocaleString()}`}   color="#800000"/>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
        <div>
          <h3 style={{color:"#800000",marginBottom:12}}>Monthly</h3>
          <div style={tableWrap}><table style={tbl}>
            <thead><tr style={thRow}><th style={th}>Month</th><th style={th}>Revenue</th><th style={th}>Orders</th></tr></thead>
            <tbody>{(data.monthlyRevenue||[]).map((m)=>(
              <tr key={`${m._id.year}-${m._id.month}`} style={tdRow}>
                <td style={td}>{new Date(m._id.year,m._id.month-1).toLocaleString("default",{month:"long",year:"numeric"})}</td>
                <td style={td}><b>₹{m.revenue?.toLocaleString()}</b></td><td style={td}>{m.count}</td>
              </tr>
            ))}</tbody>
          </table></div>
        </div>
        <div>
          <h3 style={{color:"#800000",marginBottom:12}}>Top Vendors</h3>
          <div style={tableWrap}><table style={tbl}>
            <thead><tr style={thRow}><th style={th}>Shop</th><th style={th}>Revenue</th><th style={th}>Orders</th></tr></thead>
            <tbody>{(data.topVendors||[]).map((v,i)=>(
              <tr key={i} style={tdRow}><td style={td}>{v.shopName||"—"}</td><td style={td}><b>₹{v.revenue?.toLocaleString()}</b></td><td style={td}>{v.orders}</td></tr>
            ))}</tbody>
          </table></div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id:"dashboard", icon:"📊", label:"Dashboard"   },
  { id:"settings",  icon:"⚙️",  label:"Charges & Settings" },
  { id:"vendors",   icon:"🏪", label:"Vendors"     },
  { id:"customers", icon:"👥", label:"Customers"   },
  { id:"orders",    icon:"📦", label:"Orders"      },
  { id:"refunds",   icon:"💸", label:"Refunds"     },
  { id:"coupons",   icon:"🎟️", label:"Coupons"     },
  { id:"revenue",   icon:"📈", label:"Revenue"     },
];

export default function SuperAdminPage() {
  const [token,setToken]=useState(getToken); const [tab,setTab]=useState("dashboard"); const [toast,setToast]=useState("");
  const showToast=(msg)=>{ setToast(msg); setTimeout(()=>setToast(""),3000); };
  const logout=()=>{ clearToken(); setToken(""); };
  if(!token) return <LoginScreen onLogin={(t)=>setToken(t)}/>;
  return (
    <div style={{ minHeight:"100vh", background:"#fdf8f2", fontFamily:"inherit" }}>
      <div style={{ background:"#800000", color:"white", padding:"0 28px", height:58, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:22 }}>👑</span>
          <span style={{ fontWeight:700, fontSize:16 }}>Super Admin — Bengal Creations</span>
        </div>
        <button onClick={logout} style={{ background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.3)", color:"white", padding:"6px 16px", borderRadius:8, cursor:"pointer", fontSize:13 }}>Sign Out</button>
      </div>
      {toast&&<div style={{ position:"fixed", bottom:24, right:24, background:"#1e293b", color:"white", padding:"12px 20px", borderRadius:10, zIndex:9999, fontSize:14, boxShadow:"0 4px 20px rgba(0,0,0,.3)" }}>{toast}</div>}
      <div style={{ display:"flex", minHeight:"calc(100vh - 58px)" }}>
        <nav style={{ width:220, background:"white", borderRight:"1px solid #f0e6d6", padding:"16px 0", flexShrink:0 }}>
          {TABS.map((t)=>(
            <div key={t.id} onClick={()=>setTab(t.id)} style={{
              display:"flex", alignItems:"center", gap:10, padding:"10px 20px",
              cursor:"pointer", fontSize:13, transition:"all .15s",
              background:tab===t.id?"#fff5e6":"transparent",
              color:tab===t.id?"#800000":"#555", fontWeight:tab===t.id?700:400,
              borderLeft:tab===t.id?"3px solid #800000":"3px solid transparent",
            }}><span>{t.icon}</span>{t.label}</div>
          ))}
        </nav>
        <main style={{ flex:1, padding:28, overflowX:"hidden" }}>
          <h2 style={{ color:"#800000", marginBottom:20, fontSize:20 }}>
            {TABS.find(t=>t.id===tab)?.icon} {TABS.find(t=>t.id===tab)?.label}
          </h2>
          {tab==="dashboard" && <DashboardTab token={token}/>}
          {tab==="settings"  && <SettingsTab  token={token} showToast={showToast}/>}
          {tab==="vendors"   && <VendorsTab   token={token} showToast={showToast}/>}
          {tab==="customers" && <CustomersTab token={token} showToast={showToast}/>}
          {tab==="orders"    && <OrdersTab    token={token} showToast={showToast}/>}
          {tab==="refunds"   && <RefundsTab   token={token} showToast={showToast}/>}
          {tab==="coupons"   && <CouponsTab   token={token} showToast={showToast}/>}
          {tab==="revenue"   && <RevenueTab   token={token}/>}
        </main>
      </div>
    </div>
  );
}

const lbl         = { display:"block", fontSize:12, fontWeight:600, color:"#555", marginBottom:4 };
const smBtn       = { padding:"6px 14px", background:"#800000", color:"white", border:"none", borderRadius:7, cursor:"pointer", fontSize:13, fontWeight:600 };
const tableWrap   = { overflowX:"auto", borderRadius:10, border:"1px solid #f0e6d6" };
const tbl         = { width:"100%", borderCollapse:"collapse", fontSize:13 };
const thRow       = { background:"#fdf8f2", borderBottom:"1px solid #f0e6d6" };
const th          = { padding:"10px 14px", textAlign:"left", fontWeight:700, color:"#800000", whiteSpace:"nowrap" };
const tdRow       = { borderBottom:"1px solid #fdf1e4" };
const td          = { padding:"10px 14px", verticalAlign:"middle" };
const settingCard = { background:"white", border:"1px solid #f0e6d6", borderRadius:12, padding:20 };
const settingCardHead = { fontWeight:700, fontSize:15, color:"#800000", marginBottom:16, paddingBottom:10, borderBottom:"1px solid #f0e6d6" };
const previewBox  = { background:"#fdf8f2", border:"1px solid #f0e6d6", borderRadius:8, padding:"10px 14px", fontSize:12, color:"#888", marginTop:10 };
