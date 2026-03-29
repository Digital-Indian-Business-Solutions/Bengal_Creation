const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /jpg|png|jpeg|pdf|doc|docx|txt|gif|webp/;
  const ext = allowed.test(file.originalname.split(".").pop().toLowerCase());
  const mimeType = allowed.test(file.mimetype);

  if (ext || mimeType) {
    cb(null, true);
  } else {
    cb(new Error("Only images, PDFs, and documents are allowed"), false);
  }
};

const upload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const uploadToCloudinary = (buffer, originalname, folder = "uploads") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        public_id: `${Date.now()}_${originalname.split(".")[0].replace(/[^a-zA-Z0-9]/g, "_")}`,
      },
      (error, result) => {
        if (error) reject(error);
        else
          resolve({
            fileId: result.public_id,
            url: result.secure_url,
            secureUrl: result.secure_url,
            format: result.format,
            size: result.bytes,
            resourceType: result.resource_type,
            createdAt: result.created_at,
          });
      }
    );
    uploadStream.end(buffer);
  });
};

const cloudinaryUpload = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return next();

    try {
      const result = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname,
        req.body.folder || "uploads"
      );
      req.cloudinaryFile = result;
      req.file.cloudinaryUrl = result.url;
      next();
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      res.status(500).json({ error: "Failed to upload to Cloudinary" });
    }
  });
};

const cloudinaryUploadFields = (fields) => (req, res, next) => {
  upload.fields(fields)(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.files) return next();

    try {
      req.cloudinaryFiles = {};
      for (const [fieldName, fileArray] of Object.entries(req.files)) {
        req.cloudinaryFiles[fieldName] = [];
        for (const file of fileArray) {
          const result = await uploadToCloudinary(
            file.buffer,
            file.originalname,
            req.body.folder || fieldName
          );
          req.cloudinaryFiles[fieldName].push({ ...result, fieldName, originalname: file.originalname });
        }
      }
      next();
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      res.status(500).json({ error: "Failed to upload files to Cloudinary" });
    }
  });
};

const cloudinaryUploadArray = (fieldName, maxCount) => (req, res, next) => {
  upload.array(fieldName, maxCount)(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.files) return next();

    try {
      req.cloudinaryFiles = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(
          file.buffer,
          file.originalname,
          req.body.folder || fieldName
        );
        req.cloudinaryFiles.push(result);
      }
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

const cloudinarySingle = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return next();

    try {
      const result = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname,
        req.body.folder || fieldName
      );
      req.cloudinaryFile = result;
      req.file.cloudinaryUrl = result.url;
      next();
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      res.status(500).json({ error: "Failed to upload to Cloudinary" });
    }
  });
};

module.exports = {
  upload,
  cloudinaryUpload,
  cloudinaryUploadFields,
  uploadToCloudinary,
  cloudinaryUploadArray,
  cloudinarySingle,
};
