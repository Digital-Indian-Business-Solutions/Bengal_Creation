// middleware/upload.js
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Memory storage for serverless
const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowed = /jpg|png|jpeg|pdf|doc|docx|txt|gif|webp/;
    const ext = allowed.test(file.originalname.split('.').pop().toLowerCase());
    const mimeType = allowed.test(file.mimetype);
    
    if (ext || mimeType) {
        cb(null, true);
    } else {
        cb(new Error("Only images, PDFs, and documents are allowed"), false);
    }
};

// Create multer instance with memory storage
const upload = multer({ 
    storage: memoryStorage, 
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload buffer to Cloudinary
const uploadToCloudinary = (buffer, originalname, folder = "uploads") => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: "auto",
                public_id: `${Date.now()}_${originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_')}`,
            },
            (error, result) => {
                if (error) reject(error);
                else resolve({
                    fileId: result.public_id,
                    url: result.secure_url,
                    secureUrl: result.secure_url,
                    format: result.format,
                    size: result.bytes,
                    resourceType: result.resource_type,
                    createdAt: result.created_at
                });
            }
        );
        uploadStream.end(buffer);
    });
};

// Middleware for single file upload
const cloudinaryUpload = (fieldName) => {
    return (req, res, next) => {
        const singleUpload = upload.single(fieldName);
        
        singleUpload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            
            if (!req.file) {
                return next();
            }
            
            try {
                // Upload to Cloudinary
                const result = await uploadToCloudinary(
                    req.file.buffer,
                    req.file.originalname,
                    req.body.folder || "uploads"
                );
                
                // Attach Cloudinary result to request
                req.cloudinaryFile = result;
                req.file.cloudinaryUrl = result.url;
                
                next();
            } catch (error) {
                console.error("Cloudinary upload error:", error);
                return res.status(500).json({ error: "Failed to upload to Cloudinary" });
            }
        });
    };
};

// Middleware for multiple file uploads
const cloudinaryUploadFields = (fields) => {
    return (req, res, next) => {
        const fieldsUpload = upload.fields(fields);
        
        fieldsUpload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            
            if (!req.files) {
                return next();
            }
            
            try {
                req.cloudinaryFiles = {};
                
                // Process each field
                for (const [fieldName, fileArray] of Object.entries(req.files)) {
                    req.cloudinaryFiles[fieldName] = [];
                    
                    for (const file of fileArray) {
                        const result = await uploadToCloudinary(
                            file.buffer,
                            file.originalname,
                            req.body.folder || fieldName
                        );
                        
                        req.cloudinaryFiles[fieldName].push({
                            ...result,
                            fieldName,
                            originalname: file.originalname
                        });
                    }
                }
                
                next();
            } catch (error) {
                console.error("Cloudinary upload error:", error);
                return res.status(500).json({ error: "Failed to upload files to Cloudinary" });
            }
        });
    };
};

const cloudinaryUploadArray = (fieldName, maxCount) => {
  return (req, res, next) => {
    const arrayUpload = upload.array(fieldName, maxCount);
    
    arrayUpload(req, res, async (err) => {
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
};
const cloudinarySingle = (fieldName) => {
    return async (req, res, next) => {
        const singleUpload = upload.single(fieldName);
        
        singleUpload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            
            if (!req.file) {
                return next();
            }
            
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
                return res.status(500).json({ error: "Failed to upload to Cloudinary" });
            }
        });
    };
};

module.exports = {
    upload,
    cloudinaryUpload,
    cloudinaryUploadFields,
    uploadToCloudinary,
    cloudinaryUploadArray,
    cloudinarySingle
};