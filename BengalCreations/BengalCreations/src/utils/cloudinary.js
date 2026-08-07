import { API } from "../api/api";

const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME || "dfikzvebd";
const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET || "ml_default";

export const uploadImage = async (file) => {
  if (!file) return null;

  // 1. Primary: Upload via authenticated backend endpoint
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API}/upload`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.url || data.secure_url) {
        return data.url || data.secure_url;
      }
    }
  } catch (err) {
    console.warn("Backend upload failed, attempting direct Cloudinary upload:", err);
  }

  // 2. Fallback: Direct Cloudinary upload
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    const data = await res.json();
    return data.secure_url || data.url;
  } catch (err) {
    console.error("Direct Cloudinary upload error:", err);
    throw err;
  }
};
