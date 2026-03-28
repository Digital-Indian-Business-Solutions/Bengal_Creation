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

import { useAuth } from "./context/AuthContext";
import { useToast } from "./hooks/useToast";
import { useCart } from "./hooks/useCart";
import { useLocalStorage } from "./hooks/useLocalStorage";

import { WB_DISTRICTS, CATEGORY_TILES, EMOJI_OPTIONS } from "./constants/data";
import { fetchAllProducts, fetchAllCategories } from "./api/api";

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
  const [catOptions, setCatOptions] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");

  // ── Initial data load ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchAllCategories().then(setCatOptions).catch(console.error);
    fetchAllProducts()
      .then((data) => { setAllProducts(data); setLoading(false); })
      .catch(console.error);
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
      navigate(user.role === "vendor" ? "/dashboard" : "/");
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

  return (
    <div className="bc-app">
      {!isLoginPage && (
        <Navbar
          cart={cart}
          wishlist={wishlist}
          currentUser={currentUser}
          openCart={() => setCartOpen(true)}
          onSearch={handleSearch}
          openLogin={() => navigate("/login")}
          doLogout={doLogout}
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
        {/* Public */}
        <Route path="/" element={
          <HomePage
            setFilterCategory={setFilterCategory}
            cart={cart} wishlist={wishlist}
            onAddCart={addToCart} onToggleWish={toggleWishlist}
            categoryTiles={CATEGORY_TILES} allProducts={allProducts} loading={loading}
          />
        } />
        <Route path="/shop" element={
          <ShopPage
            cart={cart} wishlist={wishlist}
            onAddCart={addToCart} onToggleWish={toggleWishlist}
            allProducts={allProducts} WB_DISTRICTS={WB_DISTRICTS}
          />
        } />
        <Route path="/product/:id" element={
          <ProductDetailPage
            cart={cart} wishlist={wishlist}
            onAddCart={addToCart} onToggleWish={toggleWishlist}
            openCart={() => setCartOpen(true)}
            setFilterCategory={setFilterCategory}
            allProducts={allProducts}
          />
        } />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage onShowToast={showToast} />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} showToast={showToast} />} />
        <Route path="/vendor" element={
          <VendorPage onShowToast={showToast} catOptions={catOptions} WB_DISTRICTS={WB_DISTRICTS} />
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

        {/* Vendor-only */}
        <Route path="/dashboard" element={
          <ProtectedRoute role="vendor">
            <DashboardPage
              currentUser={currentUser} onShowToast={showToast}
              emojiOptions={EMOJI_OPTIONS} WB_DISTRICTS={WB_DISTRICTS}
            />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
