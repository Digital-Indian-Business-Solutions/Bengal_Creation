// middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"uploads/");
    },
    filename:(req,file,cb)=>{
        cb(null, Date.now()+path.extname(file.originalname));
    }
});

const fileFilter=(req,file,cb)=>{
    const allowed = /jpg|png|jpeg|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if(ext) cb(null,true);
    else cb("Only pdf allowed");
};

module.exports = multer({storage,fileFilter});