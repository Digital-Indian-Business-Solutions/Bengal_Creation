// models/Vendor.js
const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
    vendorId:{
        type:String,
        required:true,
        unique:true
    },
    name:{ type:String, required:true },
    shopName:{ type:String, required:true },
    email:{ type:String, required:true, unique:true },
    password:{ type:String, required:true },
    phone:{ type:String, required:true },
    description:String,
    logo:String,
    banner:String,
    address:{ type:String, required:true },
    isVerified:{ type:Boolean, default:false },
    googleId: { type: String, default: null },
    picture: { type: String, default: null },

    documents:{
        tradeLicense:{ type:String, default: null },
        aadhaarCard:{ type:String, required:true },
        panCard:{ type:String, required:true },
        otherDoc:{ type:String, default: null }
    },

    products:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    }]
},{timestamps:true});

module.exports =mongoose.models.Vendor || mongoose.model("Vendor",vendorSchema);