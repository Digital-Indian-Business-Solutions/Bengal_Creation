export const cloudinaryResize = (url, width = 400) => {
  if (!url) return "";
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
};