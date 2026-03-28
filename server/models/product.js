const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    price: {
        type: Number,
        required: true
    },
    orginalPrice: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },

    images: [String],   // Cloudinary URLs

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },

    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true
    },
    district: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
