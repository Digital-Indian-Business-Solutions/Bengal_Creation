import { useState, useCallback } from "react";
import { fetchCart, addToCartAPI, removeFromCartAPI } from "../api/api";

/**
 * Manages cart state and exposes cart operations.
 *
 * @param {function} showToast   - toast notification callback
 * @param {function} navigate    - react-router navigate function
 * @param {object}   currentUser - user object from AuthContext (or null)
 */
export function useCart(showToast, navigate, currentUser) {
  const [cart, setCart] = useState([]);

  const loadCart = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const data = await fetchCart(userId);
      console.log(data)
      setCart(data.items || []);
    } catch (err) {
      console.error("Failed to load cart:", err);
    }
  }, []);

  const addToCart = useCallback(
    async (productId) => {
      if (!currentUser?._id) {
        showToast("Please login to add items to your cart");
        navigate("/login");
        return;
      }
      try {
        const data = await addToCartAPI(productId, currentUser._id);
        if (data.cart?.items) setCart(data.cart.items);
        showToast("Product added to cart! 🛒");
      } catch (err) {
        console.error("Cart error:", err);
        showToast(err.message || "Something went wrong");
      }
    },
    [currentUser, showToast, navigate]
  );

  const removeFromCart = useCallback(
    async (productId) => {
      if (!currentUser?._id) return;
      try {
        await removeFromCartAPI(productId, currentUser._id);
        await loadCart(currentUser._id);
        showToast("Item removed from cart");
      } catch (err) {
        console.error("Remove from cart error:", err);
        showToast("Something went wrong");
      }
    },
    [currentUser, showToast, loadCart]
  );

  const clearCart = useCallback(() => setCart([]), []);

  return { cart, setCart, loadCart, addToCart, removeFromCart, clearCart };
}
