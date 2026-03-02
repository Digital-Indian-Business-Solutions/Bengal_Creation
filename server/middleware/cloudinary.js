
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// MULTER CONFIG (Memory)
//////////////////////////////
const storage = multer.memoryStorage();
const upload = multer({ storage,limits:{fileSize:5*1024*1024} }); // 5MB limit
//////////////////////////////
// CLOUDINARY CONFIG
//////////////////////////////


//////////////////////////////
// CLOUDINARY CONFIG
//////////////////////////////
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});


//////////////////////////////
// UPLOAD IMAGE FUNCTION
//////////////////////////////
const uploadImage = async (filePath) => {
  return await cloudinary.uploader.upload(filePath, {
    folder: "products",
    resource_type: "auto"
  });
};



module.exports = uploadImage;