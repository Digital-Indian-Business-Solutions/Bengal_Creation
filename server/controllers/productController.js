const Product = require("../models/product");
const Vendor = require("../models/vendor");
const Category = require("../models/category");
const mongoose = require("mongoose");
require("dotenv").config();
const createProduct = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    if (!req.body) {
      return res.status(400).json({ msg: "Request body missing" });
    }

    const price = parseFloat(req.body.price);
    const stock = parseInt(req.body.stock);
    const originalPrice = req.body.originalPrice
      ? parseFloat(req.body.originalPrice)
      : null;

    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price,
      district: req.body.district,
      orginalPrice: originalPrice,
      stock,
      category: req.body.category,
      vendor: req.body.vendor,
      images: req.body.images || [],
      variants: req.body.variants || [],
    });

    await product.save();
    await Vendor.findByIdAndUpdate(req.body.vendor, {
      $push: { products: product._id },
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    console.error("Product creation error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Helper to escape regex special characters
const escapeRegex = (str = "") => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Advanced Fuzzy & Phonetic Pattern Builder
const makeFuzzyTokenPattern = (token) => {
  const escaped = escapeRegex(token);
  if (/^men'?s?$/i.test(token) || /^man$/i.test(token)) {
    return "\\b(men|mens|man|gents|male)\\b";
  }
  if (/^women'?s?$/i.test(token) || /^woman$/i.test(token)) {
    return "\\b(women|womens|woman|ladies|female)\\b";
  }

  let phoneticPattern = token
    .replace(/(.)\1+/g, "$1")
    .replace(/ch/gi, "(ch|c)")
    .replace(/c(?!h)/gi, "(c|ch)")
    .replace(/sh/gi, "(sh|s)")
    .replace(/s(?!h)/gi, "(s|sh)")
    .replace(/kh/gi, "(kh|k)")
    .replace(/k(?!h)/gi, "(k|kh)")
    .replace(/th/gi, "(th|t)")
    .replace(/t(?!h)/gi, "(t|th)")
    .replace(/dh/gi, "(dh|d)")
    .replace(/d(?!h)/gi, "(d|dh)")
    .replace(/bh/gi, "(bh|b)")
    .replace(/b(?!h)/gi, "(b|bh)")
    .replace(/gh/gi, "(gh|g)")
    .replace(/g(?!h)/gi, "(g|gh)")
    .replace(/ee/gi, "(ee|i)")
    .replace(/oo/gi, "(oo|u)");

  let flexLetters = token
    .split("")
    .map(ch => /[a-z]/i.test(ch) ? `${ch}+` : escapeRegex(ch))
    .join("");

  let patterns = [escaped, phoneticPattern, flexLetters];

  if (token.length >= 4) {
    const baseStem = escapeRegex(token.replace(/(.)\1+$/, "$1").slice(0, -1));
    patterns.push(`${baseStem}[a-z]{0,2}`);
  }

  return `(${patterns.join("|")})`;
};

// MongoDB Atlas Search implementation
const tryAtlasSearch = async ({ search, categoryId, district, priceMin, priceMax, gender, sort, skip, limit }) => {
  const lowerSearch = search.toLowerCase();
  const hasMaleIntent = /\b(men|mens|man|gents|male|boys|boy)\b/i.test(lowerSearch);
  const hasFemaleIntent = /\b(women|womens|woman|ladies|female|girls|girl)\b/i.test(lowerSearch);

  const compoundQuery = {
    must: [
      { equals: { path: "isActive", value: true } }
    ],
    should: [
      {
        text: {
          query: search,
          path: "name",
          score: { boost: { value: 5 } },
          fuzzy: { maxEdits: 1, prefixLength: 0 }
        }
      },
      {
        text: {
          query: search,
          path: ["tags", "district"],
          score: { boost: { value: 3 } },
          fuzzy: { maxEdits: 1, prefixLength: 0 }
        }
      },
      {
        text: {
          query: search,
          path: "description",
          score: { boost: { value: 1 } },
          fuzzy: { maxEdits: 1, prefixLength: 1 }
        }
      }
    ],
    mustNot: []
  };

  if (hasMaleIntent && !hasFemaleIntent) {
    compoundQuery.mustNot.push({
      text: {
        query: "women womens woman ladies female girls",
        path: ["name", "description", "tags", "gender"]
      }
    });
  } else if (hasFemaleIntent && !hasMaleIntent) {
    compoundQuery.mustNot.push({
      text: {
        query: "men mens man gents male boys",
        path: ["name", "description", "tags", "gender"]
      }
    });
  }

  const pipeline = [
    {
      $search: {
        index: "products_search_index",
        compound: compoundQuery
      }
    }
  ];

  const matchStage = { isActive: true };
  if (categoryId) matchStage.category = categoryId;
  if (district) matchStage.district = { $regex: new RegExp(`^${escapeRegex(district)}$`, "i") };
  if (gender) matchStage.gender = { $regex: new RegExp(`^${escapeRegex(gender)}$`, "i") };
  if (priceMin !== null || priceMax !== null) {
    matchStage.price = {};
    if (priceMin !== null && !isNaN(priceMin)) matchStage.price.$gte = priceMin;
    if (priceMax !== null && !isNaN(priceMax)) matchStage.price.$lte = priceMax;
  }
  pipeline.push({ $match: matchStage });
  pipeline.push({ $addFields: { relevanceScore: { $meta: "searchScore" } } });

  let sortStage = { relevanceScore: -1, createdAt: -1 };
  if (sort === "price_asc") sortStage = { price: 1, _id: 1 };
  else if (sort === "price_desc") sortStage = { price: -1, _id: 1 };
  else if (sort === "newest") sortStage = { createdAt: -1, _id: 1 };
  pipeline.push({ $sort: sortStage });

  pipeline.push({
    $facet: {
      metadata: [{ $count: "total" }],
      data: [
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "vendors",
            localField: "vendor",
            foreignField: "_id",
            as: "vendor"
          }
        },
        { $unwind: { path: "$vendor", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category"
          }
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            "vendor.password": 0,
            "vendor.documents": 0
          }
        }
      ]
    }
  });

  const aggregateResult = await Product.aggregate(pipeline);
  const total = aggregateResult[0]?.metadata[0]?.total || 0;
  const products = aggregateResult[0]?.data || [];

  return { products, total };
};

// Advanced Mongo Aggregation Search Engine (Fallback)
const fallbackMongoSearch = async ({ search, categoryId, district, priceMin, priceMax, gender, sort, skip, limit }) => {
  const matchStage = { isActive: true };

  if (categoryId) {
    matchStage.category = categoryId;
  }

  if (district) {
    matchStage.district = { $regex: new RegExp(`^${escapeRegex(district)}$`, "i") };
  }

  if (gender) {
    matchStage.gender = { $regex: new RegExp(`^${escapeRegex(gender)}$`, "i") };
  }

  if (priceMin !== null || priceMax !== null) {
    matchStage.price = {};
    if (priceMin !== null && !isNaN(priceMin)) matchStage.price.$gte = priceMin;
    if (priceMax !== null && !isNaN(priceMax)) matchStage.price.$lte = priceMax;
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryData"
      }
    },
    {
      $lookup: {
        from: "vendors",
        localField: "vendor",
        foreignField: "_id",
        as: "vendorData"
      }
    }
  ];

  if (search) {
    const rawTokens = search.trim().split(/\s+/).filter(Boolean);
    const lowerSearch = search.toLowerCase();

    const hasMaleIntent = /\b(men|mens|man|gents|male|boys|boy)\b/i.test(lowerSearch);
    const hasFemaleIntent = /\b(women|womens|woman|ladies|female|girls|girl)\b/i.test(lowerSearch);

    const tokenRegexes = rawTokens.map(token => new RegExp(makeFuzzyTokenPattern(token), "i"));

    const categoryDocs = await Category.find({
      $or: tokenRegexes.map(rgx => ({ name: { $regex: rgx } }))
    }).select("_id");
    const matchedCatIds = categoryDocs.map(c => c._id);

    pipeline.push({
      $addFields: {
        categoryObj: { $arrayElemAt: ["$categoryData", 0] },
        vendorObj: { $arrayElemAt: ["$vendorData", 0] }
      }
    });

    pipeline.push({
      $addFields: {
        searchableText: {
          $concat: [
            "$name",
            " ",
            { $ifNull: ["$description", ""] },
            " ",
            { $ifNull: ["$district", ""] },
            " ",
            { $ifNull: ["$gender", ""] },
            " ",
            { $ifNull: ["$categoryObj.name", ""] },
            " ",
            {
              $reduce: {
                input: { $ifNull: ["$tags", []] },
                initialValue: "",
                in: { $concat: ["$$value", " ", "$$this"] }
              }
            }
          ]
        }
      }
    });

    const scoreConditions = [];

    // Exact full search match in name: +100
    scoreConditions.push({
      $cond: [
        { $regexMatch: { input: "$name", regex: new RegExp(`^${escapeRegex(search)}$`, "i") } },
        100,
        0
      ]
    });

    // Exact phrase in name: +60
    scoreConditions.push({
      $cond: [
        { $regexMatch: { input: "$name", regex: new RegExp(escapeRegex(search), "i") } },
        60,
        0
      ]
    });

    // Category match: +40
    if (matchedCatIds.length > 0) {
      scoreConditions.push({
        $cond: [{ $in: ["$category", matchedCatIds] }, 40, 0]
      });
    }

    // Individual token matches
    tokenRegexes.forEach(rgx => {
      scoreConditions.push({
        $cond: [{ $regexMatch: { input: "$name", regex: rgx } }, 25, 0]
      });
      scoreConditions.push({
        $cond: [{ $regexMatch: { input: { $ifNull: ["$categoryObj.name", ""] }, regex: rgx } }, 20, 0]
      });
      scoreConditions.push({
        $cond: [{ $regexMatch: { input: "$searchableText", regex: rgx } }, 10, 0]
      });
    });

    // Gender intent alignment & penalty
    if (hasMaleIntent && !hasFemaleIntent) {
      scoreConditions.push({
        $cond: [
          { $regexMatch: { input: "$searchableText", regex: /\b(men|mens|man|gents|male)\b/i } },
          30,
          0
        ]
      });
      scoreConditions.push({
        $cond: [
          {
            $and: [
              { $regexMatch: { input: "$searchableText", regex: /\b(women|womens|woman|ladies|female)\b/i } },
              { $not: [{ $regexMatch: { input: "$searchableText", regex: /\b(men|mens|man|gents|male)\b/i } }] }
            ]
          },
          -150,
          0
        ]
      });
    } else if (hasFemaleIntent && !hasMaleIntent) {
      scoreConditions.push({
        $cond: [
          { $regexMatch: { input: "$searchableText", regex: /\b(women|womens|woman|ladies|female)\b/i } },
          30,
          0
        ]
      });
      scoreConditions.push({
        $cond: [
          {
            $and: [
              { $regexMatch: { input: "$searchableText", regex: /\b(men|mens|man|gents|male)\b/i } },
              { $not: [{ $regexMatch: { input: "$searchableText", regex: /\b(women|womens|woman|ladies|female)\b/i } }] }
            ]
          },
          -150,
          0
        ]
      });
    }

    pipeline.push({
      $addFields: {
        relevanceScore: { $add: scoreConditions }
      }
    });

    pipeline.push({
      $match: { relevanceScore: { $gt: 0 } }
    });
  } else {
    pipeline.push({
      $addFields: {
        relevanceScore: 0,
        categoryObj: { $arrayElemAt: ["$categoryData", 0] },
        vendorObj: { $arrayElemAt: ["$vendorData", 0] }
      }
    });
  }

  let sortStage = search ? { relevanceScore: -1, createdAt: -1 } : { createdAt: -1 };
  if (sort === "price_asc") sortStage = { price: 1, _id: 1 };
  else if (sort === "price_desc") sortStage = { price: -1, _id: 1 };
  else if (sort === "newest") sortStage = { createdAt: -1, _id: 1 };
  pipeline.push({ $sort: sortStage });

  pipeline.push({
    $facet: {
      metadata: [{ $count: "total" }],
      data: [
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            name: 1,
            description: 1,
            price: 1,
            orginalPrice: 1,
            stock: 1,
            images: 1,
            variants: 1,
            district: 1,
            gender: 1,
            tags: 1,
            isActive: 1,
            createdAt: 1,
            updatedAt: 1,
            relevanceScore: 1,
            category: {
              _id: "$categoryObj._id",
              name: "$categoryObj.name"
            },
            vendor: {
              _id: "$vendorObj._id",
              shopName: "$vendorObj.shopName"
            }
          }
        }
      ]
    }
  });

  const aggregateResult = await Product.aggregate(pipeline);
  const total = aggregateResult[0]?.metadata[0]?.total || 0;
  const products = aggregateResult[0]?.data || [];

  return { products, total };
};

// Search Suggestion Endpoint
const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) return res.json([]);
    const queryStr = q.trim();
    const rawTokens = queryStr.split(/\s+/).filter(Boolean);

    const tokenRegexes = rawTokens.map(token => new RegExp(makeFuzzyTokenPattern(token), "i"));

    const categoryDocs = await Category.find({
      $or: tokenRegexes.map(rgx => ({ name: { $regex: rgx } }))
    }).select("_id name").limit(5);

    const categoryIds = categoryDocs.map((c) => c._id);

    const productDocs = await Product.find({
      isActive: true,
      $or: [
        ...tokenRegexes.map(rgx => ({ name: { $regex: rgx } })),
        ...tokenRegexes.map(rgx => ({ district: { $regex: rgx } })),
        { category: { $in: categoryIds } }
      ]
    })
      .limit(8)
      .select("name district");

    const suggestions = [
      ...productDocs.map((p) => ({
        type: "product",
        text: p.name,
      })),
      ...categoryDocs.map((c) => ({
        type: "category",
        text: c.name,
      })),
    ];

    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = (req.query.category || "").trim();
    const search = (req.query.search || "").trim();
    const district = (req.query.district || "").trim();
    const gender = (req.query.gender || "").trim();
    const sort = (req.query.sort || "").trim();
    const priceMin = req.query.priceMin ? parseFloat(req.query.priceMin) : null;
    const priceMax = req.query.priceMax ? parseFloat(req.query.priceMax) : null;
    const skip = (page - 1) * limit;

    let categoryId = null;
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryId = new mongoose.Types.ObjectId(category);
      } else {
        const catDoc = await Category.findOne({
          name: { $regex: `^${escapeRegex(category)}$`, $options: "i" },
        });
        if (catDoc) {
          categoryId = catDoc._id;
        } else {
          return res.json({
            products: [],
            pagination: {
              total: 0,
              page,
              limit,
              totalPages: 0,
              hasMore: false,
            },
          });
        }
      }
    }

    let results = null;
    if (search) {
      try {
        results = await tryAtlasSearch({
          search,
          categoryId,
          district,
          priceMin,
          priceMax,
          gender,
          sort,
          skip,
          limit,
        });
      } catch (atlasErr) {
        console.log("Atlas Search unavailable/unconfigured, fallback to Mongo Aggregation Engine:", atlasErr.message);
        results = null;
      }
    }

    if (!results || !results.products || results.products.length === 0) {
      results = await fallbackMongoSearch({
        search,
        categoryId,
        district,
        priceMin,
        priceMax,
        gender,
        sort,
        skip,
        limit,
      });
    }

    res.json({
      products: results.products,
      pagination: {
        total: results.total,
        page,
        limit,
        totalPages: Math.ceil(results.total / limit),
        hasMore: page * limit < results.total,
      },
    });
  } catch (err) {
    console.error("Error in getAllProducts:", err);
    res.status(500).json({ error: err.message });
  }
};
const getProducs = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("vendor", "shopName")
      .populate("category", "name")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("vendor")
    .populate("category");
  if (!product) return res.status(404).json({ msg: "Product not found" });
  res.json(product);
};

const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: "after",
  });
  res.json(product);
};

const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (product && product.vendor) {
    await Vendor.findByIdAndUpdate(product.vendor, {
      $pull: { products: product._id },
    });
  }
  res.json({ msg: "Product deleted" });
};

const getLowStockProducts = async (req, res) => {
  const products = await Product.find({ stock: { $lte: 5 } });
  res.json(products);
};

const bulkUpdateStock = async (req, res) => {
  const { productIds, stock } = req.body;
  await Product.updateMany({ _id: { $in: productIds } }, { $set: { stock } });
  res.json({ message: "Stock updated successfully" });
};

const getProductsByVendor = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.params.vendorId })
      .populate("category", "name")
      .populate("vendor", "shopName");
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getProductByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "Product not found" });
    product.isActive = !product.isActive;
    await product.save();
    res.json({
      success: true,
      isActive: product.isActive,
      message: `Product is now ${product.isActive ? "Active" : "Inactive"}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  bulkUpdateStock,
  getProductsByVendor,
  getProductByCategory,
  getProducs,
  getSearchSuggestions,
  toggleProductStatus,
};

