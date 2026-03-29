const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  bulkUpdateStock,
  getProductsByVendor,
} = require("../controllers/productController");

router.post("/", createProduct);
/*
  #swagger.tags = ['Products']
  #swagger.summary = 'Create a new product'
  #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: { $ref: '#/definitions/ProductBody' }
  }
  #swagger.responses[201] = { description: 'Product created', schema: { $ref: '#/definitions/Product' } }
  #swagger.responses[400] = { description: 'Request body missing' }
*/

router.get("/low-stock", getLowStockProducts);
/*
  #swagger.tags = ['Products']
  #swagger.summary = 'Get products with stock <= 5'
  #swagger.responses[200] = { description: 'Low stock products', schema: [{ $ref: '#/definitions/Product' }] }
*/

router.put("/bulk-stock", bulkUpdateStock);
/*
  #swagger.tags = ['Products']
  #swagger.summary = 'Bulk update stock for multiple products'
  #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: { $ref: '#/definitions/BulkStockBody' }
  }
  #swagger.responses[200] = { description: 'Stock updated', schema: { message: 'Stock updated successfully' } }
*/

router.get("/vendor/:vendorId", getProductsByVendor);
/*
  #swagger.tags = ['Products']
  #swagger.summary = 'Get all products by vendor MongoDB ObjectId'
  #swagger.parameters['vendorId'] = { in: 'path', required: true, type: 'string' }
  #swagger.responses[200] = { description: 'Products list', schema: [{ $ref: '#/definitions/Product' }] }
*/

router.get("/", getAllProducts);
/*
  #swagger.tags = ['Products']
  #swagger.summary = 'Get all products'
  #swagger.responses[200] = { description: 'All products', schema: [{ $ref: '#/definitions/Product' }] }
*/

router.get("/:id", getProductById);
/*
  #swagger.tags = ['Products']
  #swagger.summary = 'Get a product by ID'
  #swagger.parameters['id'] = { in: 'path', required: true, type: 'string' }
  #swagger.responses[200] = { description: 'Product found', schema: { $ref: '#/definitions/Product' } }
  #swagger.responses[404] = { description: 'Product not found' }
*/

router.put("/:id", updateProduct);
/*
  #swagger.tags = ['Products']
  #swagger.summary = 'Update a product'
  #swagger.parameters['id'] = { in: 'path', required: true, type: 'string' }
  #swagger.parameters['body'] = { in: 'body', schema: { $ref: '#/definitions/ProductBody' } }
  #swagger.responses[200] = { description: 'Updated product', schema: { $ref: '#/definitions/Product' } }
*/

router.delete("/:id", deleteProduct);
/*
  #swagger.tags = ['Products']
  #swagger.summary = 'Delete a product'
  #swagger.parameters['id'] = { in: 'path', required: true, type: 'string' }
  #swagger.responses[200] = { description: 'Product deleted', schema: { msg: 'Product deleted' } }
*/

module.exports = router;
