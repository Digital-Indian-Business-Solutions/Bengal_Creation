const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getProductsByCategory,
} = require("../controllers/categoryController");
const { cloudinarySingle } = require("../middleware/upload");

router.post("/", cloudinarySingle("image"), createCategory);
/*
  #swagger.tags = ['Categories']
  #swagger.summary = 'Create a new category (with optional image upload)'
  #swagger.consumes = ['multipart/form-data']
  #swagger.parameters['name'] = { in: 'formData', required: true, type: 'string' }
  #swagger.parameters['parent'] = { in: 'formData', type: 'string', description: 'Parent category ObjectId' }
  #swagger.parameters['image'] = { in: 'formData', type: 'file', description: 'Category image' }
  #swagger.responses[201] = { description: 'Category created', schema: { $ref: '#/definitions/Category' } }
*/

router.get("/category/:categoryId", getProductsByCategory);
/*
  #swagger.tags = ['Categories']
  #swagger.summary = 'Get all products in a category'
  #swagger.parameters['categoryId'] = { in: 'path', required: true, type: 'string' }
  #swagger.responses[200] = { description: 'Products in category', schema: [{ $ref: '#/definitions/Product' }] }
  #swagger.responses[404] = { description: 'Category not found' }
*/

router.get("/", getAllCategories);
/*
  #swagger.tags = ['Categories']
  #swagger.summary = 'Get all categories'
  #swagger.responses[200] = { description: 'All categories', schema: [{ $ref: '#/definitions/Category' }] }
*/

router.get("/:id", getCategoryById);
/*
  #swagger.tags = ['Categories']
  #swagger.summary = 'Get a category by ID'
  #swagger.parameters['id'] = { in: 'path', required: true, type: 'string' }
  #swagger.responses[200] = { description: 'Category found', schema: { $ref: '#/definitions/Category' } }
  #swagger.responses[404] = { description: 'Category not found' }
*/

router.put("/:id", cloudinarySingle("image"), updateCategory);
/*
  #swagger.tags = ['Categories']
  #swagger.summary = 'Update a category'
  #swagger.consumes = ['multipart/form-data']
  #swagger.parameters['id'] = { in: 'path', required: true, type: 'string' }
  #swagger.parameters['name'] = { in: 'formData', type: 'string' }
  #swagger.parameters['image'] = { in: 'formData', type: 'file' }
  #swagger.responses[200] = { description: 'Updated category', schema: { $ref: '#/definitions/Category' } }
*/

router.delete("/:id", deleteCategory);
/*
  #swagger.tags = ['Categories']
  #swagger.summary = 'Delete a category'
  #swagger.parameters['id'] = { in: 'path', required: true, type: 'string' }
  #swagger.responses[200] = { description: 'Category deleted', schema: { msg: 'Category deleted' } }
*/

module.exports = router;
