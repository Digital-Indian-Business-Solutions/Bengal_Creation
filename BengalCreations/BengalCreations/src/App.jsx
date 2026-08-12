import { useState, useEffect, useCallback } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/NavBar";
import CartPanel from "./components/CartPanel";
import Toast from "./components/Toast";
import ProtectedRoute from "./components/ProtectedRoute";
import Chatbot from "./components/Chatbot";

import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import WishlistPage from "./pages/WishlistPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import LoginPage from "./pages/LoginPage";
import VendorPage from "./pages/VendorPage";
import DashboardPage from "./pages/DashboardPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";

import { useAuth } from "./context/AuthContext";
import { useToast } from "./hooks/useToast";
import { useCart } from "./hooks/useCart";
import { useLocalStorage } from "./hooks/useLocalStorage";

import { WB_DISTRICTS, CATEGORY_TILES, EMOJI_OPTIONS } from "./constants/data";
import { fetchAllProducts, fetchAllCategories } from "./api/api";
import Footer from "./components/Footer";
import SuperAdminPage from "./pages/SuperAdminPage";
import DeliveryPolicy from "./pages/DeliveryPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";

// Helper wrapper to redirect logged-in vendors away from customer storefront pages
function NonVendorRoute({ children, currentUser }) {
  if (currentUser?.role === "vendor") {
    return <Navigate to="/vendor" replace />;
  }
  return children;
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, login, logout } = useAuth();

  const { toast, showToast } = useToast();
  const { cart, loadCart, addToCart, removeFromCart, clearCart } = useCart(showToast, navigate, currentUser);
  const [cartOpen, setCartOpen] = useState(false);

  const [wishlist, setWishlist] = useLocalStorage("sm_wishlist", []);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [catOptions, setCatOptions] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");

  // ── Initial data load ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchAllCategories().then(setCatOptions).catch(console.error);
    fetchAllProducts()
      .then((data) => {
        setAllProducts(data);
        setLoading(false);
        // Small delay so splash animates out smoothly
        setTimeout(() => setAppReady(true), 600);
      })
      .catch(() => {
        setLoading(false);
        setAppReady(true);
      });
    if (currentUser?._id) loadCart(currentUser._id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Wishlist ───────────────────────────────────────────────────────────────
  const toggleWishlist = useCallback(
    (id) => {
      setWishlist((prev) => {
        const has = prev.includes(id);
        showToast(has ? "💔 Removed from wishlist" : "❤️ Added to wishlist!");
        return has ? prev.filter((w) => w !== id) : [...prev, id];
      });
    },
    [setWishlist, showToast]
  );

  // ── Auth ───────────────────────────────────────────────────────────────────
  const handleLogin = useCallback(
    (user) => {
      login(user);
      showToast(`Welcome back, ${user.name}!`);
      navigate(user.role === "vendor" ? "/vendor" : "/");
    },
    [login, showToast, navigate]
  );

  const doLogout = useCallback(() => {
    logout();
    clearCart();
    navigate("/");
    showToast("Signed out. See you soon!");
  }, [logout, clearCart, navigate, showToast]);

  // ── Search / Checkout ──────────────────────────────────────────────────────
  const handleSearch = useCallback(
    (q) => navigate("/shop", { state: { searchQuery: q } }),
    [navigate]
  );

  const handleCheckout = useCallback(() => {
    if (!cart.length) { showToast("⚠️ Cart is empty!"); return; }
    setCartOpen(false);
    navigate("/checkout");
  }, [cart.length, showToast, navigate]);

  const handlePlaceOrder = useCallback(() => {
    clearCart();
    showToast('🎉 Order placed! Check "My Orders" for tracking.');
  }, [clearCart, showToast]);

  const isLoginPage = location.pathname === "/login";
  const isResetPage = location.pathname.startsWith("/reset-password");
  const isSuperAdmin = location.pathname.startsWith("/super-admin");
  const isVendorPage = location.pathname === "/vendor";
  const isDashboard  = location.pathname.startsWith("/dashboard");

  return (
    <div className="bc-app">
      {!isLoginPage && !isResetPage && !isSuperAdmin && !isVendorPage && !isDashboard && (
        <Navbar
          cart={cart}
          wishlist={wishlist}
          currentUser={currentUser}
          openCart={() => setCartOpen(true)}
          onSearch={handleSearch}
          openLogin={() => navigate("/login")}
          doLogout={doLogout}
          onProfile={() => navigate("/profile")}
        />
      )}

      <CartPanel
        cart={cart}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        removeFromCart={removeFromCart}
        onCheckout={handleCheckout}
      />

      <Toast message={toast.msg} visible={toast.visible} />

      <Routes>
        {/* Public / Customer Storefront Routes */}
        <Route path="/" element={
          <NonVendorRoute currentUser={currentUser}>
            <HomePage
              setFilterCategory={setFilterCategory}
              cart={cart} wishlist={wishlist}
              onAddCart={addToCart} onToggleWish={toggleWishlist}
              categoryTiles={CATEGORY_TILES} allProducts={allProducts} loading={loading}
            />
          </NonVendorRoute>
        } />
        <Route path="/shop" element={
          <NonVendorRoute currentUser={currentUser}>
            <ShopPage
              cart={cart} wishlist={wishlist}
              onAddCart={addToCart} onToggleWish={toggleWishlist}
              WB_DISTRICTS={WB_DISTRICTS}
            />
          </NonVendorRoute>
        } />
        <Route path="/product/:id" element={
          <NonVendorRoute currentUser={currentUser}>
            <ProductDetailPage
              cart={cart} wishlist={wishlist}
              onAddCart={addToCart} onToggleWish={toggleWishlist}
              openCart={() => setCartOpen(true)}
              setFilterCategory={setFilterCategory}
              allProducts={allProducts}
            />
          </NonVendorRoute>
        } />
        <Route path="/about" element={<NonVendorRoute currentUser={currentUser}><AboutPage /></NonVendorRoute>} />
        <Route path="/delivery-policy" element={<NonVendorRoute currentUser={currentUser}><DeliveryPolicy /></NonVendorRoute>} />
        <Route path="/privacy-policy" element={<NonVendorRoute currentUser={currentUser}><PrivacyPolicy /></NonVendorRoute>} />
        <Route path="/refund-policy" element={<NonVendorRoute currentUser={currentUser}><RefundPolicy /></NonVendorRoute>} />
        <Route path="/contact" element={<NonVendorRoute currentUser={currentUser}><ContactPage onShowToast={showToast} /></NonVendorRoute>} />
        <Route path="/login" element={
          currentUser?.role === "vendor" ? <Navigate to="/vendor" replace /> : <LoginPage onLogin={handleLogin} showToast={showToast} />
        } />
        <Route path="/reset-password/:customerId/:token" element={<ResetPasswordPage showToast={showToast} />} />
        <Route path="/vendor/*" element={
          <VendorPage currentUser={currentUser} onShowToast={showToast} catOptions={catOptions} WB_DISTRICTS={WB_DISTRICTS} doLogout={doLogout} />
        } />
        {/* Customer-only */}
        <Route path="/wishlist" element={
          <ProtectedRoute role="customer">
            <WishlistPage
              wishlist={wishlist} cart={cart}
              onAddCart={addToCart} onToggleWish={toggleWishlist}
              onClearWishlist={() => { setWishlist([]); showToast("Wishlist cleared"); }}
              allProducts={allProducts}
            />
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute role="customer">
            <CheckoutPage cart={cart} onPlaceOrder={handlePlaceOrder} />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute role="customer">
            <OrdersPage userId={currentUser?._id ?? null} />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute role="customer">
            <ProfilePage currentUser={currentUser} showToast={showToast} />
          </ProtectedRoute>
        } />

        {/* Vendor-only */}
        <Route path="/dashboard" element={
          <ProtectedRoute role="vendor">
            <DashboardPage
              currentUser={currentUser} onShowToast={showToast}
              emojiOptions={EMOJI_OPTIONS} WB_DISTRICTS={WB_DISTRICTS}
            />
          </ProtectedRoute>
        } />

        <Route path="/super-admin" element={<SuperAdminPage />} />
        <Route path="*" element={<Navigate to={currentUser?.role === "vendor" ? "/vendor" : "/"} replace />} />
      </Routes>

      {!isLoginPage && !isResetPage && !isSuperAdmin && !isVendorPage && !isDashboard && <Footer navigate={navigate} />}

      {/* Chatbot - only shown to non-vendor users */}
      {currentUser?.role !== "vendor" && !isSuperAdmin && <Chatbot />}
    </div>
  );
}
