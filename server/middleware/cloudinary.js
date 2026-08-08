
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

// MULTER CONFIG (Memory)
//////////////////////////////
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit
//////////////////////////////


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