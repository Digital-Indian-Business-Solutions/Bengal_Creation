/**
 * Returns a Cloudinary auto-optimised URL for a given width.
 * Falls back to empty string if no URL is provided.
 */
export const cloudinaryResize = (url, width = 400) => {
  if (!url) return "";
  return url;
};

/**
 * Lazily loads the Razorpay checkout script.
 * Resolves true when loaded, false on error.
 */
export const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
