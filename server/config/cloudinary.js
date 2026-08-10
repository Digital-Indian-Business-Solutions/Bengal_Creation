const cloudinary = require("cloudinary").v2;

const getCloudinaryConfig = () => {
  if (process.env.CLOUDINARY_URL) {
    return { cloudinary_url: process.env.CLOUDINARY_URL };
  }

  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    return {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    };
  }

  return {
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  };
};

cloudinary.config(getCloudinaryConfig());

module.exports = cloudinary;


