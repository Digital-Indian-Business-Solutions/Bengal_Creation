import { API } from "../api/api";

const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME || "dfikzvebd";
const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET || "ml_default";

export const uploadImage = async (file) => {
  if (!file) return null;
  if (typeof file === "string") return file;

  let backendErrDetail = "";

  // 1. Primary: Upload via authenticated backend endpoint
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API}/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data && (data.url || data.secure_url)) {
      return data.url || data.secure_url;
    }

    backendErrDetail = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    console.warn("Backend upload failed:", backendErrDetail, "attempting direct Cloudinary upload fallback...");
  } catch (err) {
    backendErrDetail = err.message;
    console.warn("Backend upload network error, attempting direct Cloudinary upload:", err);
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

    const data = await res.json().catch(() => null);

    if (res.ok && data && (data.secure_url || data.url)) {
      return data.secure_url || data.url;
    }

    const directErrDetail = (data && data.error && data.error.message) || (data && data.message) || `HTTP ${res.status}`;
    throw new Error(`Upload failed. Backend: ${backendErrDetail}; Direct Cloudinary: ${directErrDetail}`);
  } catch (err) {
    console.error("Direct Cloudinary upload error:", err);
    throw err;
  }
};

