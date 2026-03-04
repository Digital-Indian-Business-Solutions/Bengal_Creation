const express = require("express");
const router = express.Router();
const Category = require("../models/category");
const Vendor = require("../models/vendor");
const Product = require("../models/product");
const cloudinarySingle=require("../middleware/upload")

// CREATE CATEGORY

router.post("/",cloudinarySingle("image"), async (req, res) => {
    try {

        let imageUrl = null;

        if (req.file) {
            const result = await uploadImage(req.file.path);
            imageUrl = result.secure_url;
        }

        const category = new Category({
            name: req.body.name,
            slug: req.body.name.toLowerCase().replace(/ /g, "-"),
            parent: req.body.parent || null,
            image: imageUrl
        });

        await category.save();

        res.status(201).json(category);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// GET ALL CATEGORIES


router.get("/", async (req, res) => {
    console.log(req)
    const categories = await Category.find().populate("parent", "name");
    res.json(categories);
});


// GET CATEGORY BY ID


router.get("/:id", async (req, res) => {
    const category = await Category.findById(req.params.id)
        .populate("parent", "name");

    if (!category)
        return res.status(404).json({ msg: "Category not found" });

    res.json(category);
});



// UPDATE CATEGORY


router.put("/:id", upload.single("image"), async (req, res) => {
    try {

        let updateData = req.body;

        if (req.file) {
            const result = await uploadImage(req.file.path);
            updateData.image = result.secure_url;
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.json(category);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// DELETE CATEGORY


router.delete("/:id", async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ msg: "Category deleted" });
});

// GET PRODUCTS BY CATEGORY

router.get("/category/:categoryId", async (req, res) => {
    try {
        const category = await Category.findById(req.params.categoryId);
        if (!category) return res.status(404).json({ msg: "Category not found" });
        const products = await Product.find({ category: req.params.categoryId })
            .populate("vendor", "shopName")
            .populate("category", "name");
        
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;