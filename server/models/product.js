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

    variants: [
        {
            size: String,
            chest: String,
            waist: String,
            sleeve: String,
            shoulder: String,
            length: String,
            stock: { type: Number, default: 0 }
        }
    ],

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
    gender: {
        type: String,
        enum: ["Men", "Women", "Unisex", "Kids", ""],
        default: ""
    },
    tags: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
