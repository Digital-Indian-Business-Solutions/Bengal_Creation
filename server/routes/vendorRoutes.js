const express = require("express");
const router = express.Router();
const {
  registerVendor,
  loginVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  verifyVendor,
  deleteVendor,
  getVendorProducts,
  getPendingVendors,
  searchVendors,
  getVendorAnalytics,
} = require("../controllers/vendorController");

router.post("/register", registerVendor);
/*
  #swagger.tags = ['Vendors']
  #swagger.summary = 'Register a new vendor'
  #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: { $ref: '#/definitions/VendorRegisterBody' }
  }
  #swagger.responses[201] = { description: 'Vendor registered', schema: { $ref: '#/definitions/Vendor' } }
  #swagger.responses[500] = { description: 'Registration failed' }
*/

router.post("/login", loginVendor);
/*
  #swagger.tags = ['Vendors']
  #swagger.summary = 'Vendor login'
  #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: { $ref: '#/definitions/VendorLoginBody' }
  }
  #swagger.responses[200] = { description: 'Login successful', schema: { $ref: '#/definitions/VendorLoginResponse' } }
  #swagger.responses[400] = { description: 'Invalid credentials' }
  #swagger.responses[403] = { description: 'Vendor not yet verified' }
*/

router.get("/pending/all", getPendingVendors);
/*
  #swagger.tags = ['Vendors']
  #swagger.summary = 'Get all unverified (pending) vendors'
  #swagger.responses[200] = { description: 'List of pending vendors', schema: { success: true, vendors: [] } }
*/

router.get("/search/query", searchVendors);
/*
  #swagger.tags = ['Vendors']
  #swagger.summary = 'Search vendors by name, shop name, or email'
  #swagger.parameters['q'] = { in: 'query', description: 'Search query string', required: true, type: 'string' }
  #swagger.responses[200] = { description: 'Matching vendors', schema: { success: true, vendors: [] } }
*/

router.get("/analytics/summary", getVendorAnalytics);
/*
  #swagger.tags = ['Vendors']
  #swagger.summary = 'Get vendor analytics summary'
  #swagger.responses[200] = { description: 'Analytics data', schema: { $ref: '#/definitions/VendorAnalytics' } }
*/

router.get("/", getAllVendors);
/*
  #swagger.tags = ['Vendors']
  #swagger.summary = 'Get all vendors with pagination'
  #swagger.parameters['page'] = { in: 'query', description: 'Page number', type: 'integer', default: 1 }
  #swagger.parameters['limit'] = { in: 'query', description: 'Items per page', type: 'integer', default: 10 }
  #swagger.parameters['verified'] = { in: 'query', description: 'Filter by verification status', type: 'boolean' }
  #swagger.responses[200] = { description: 'Paginated vendor list', schema: { $ref: '#/definitions/PaginatedVendors' } }
*/

router.get("/:id", getVendorById);
/*
  #swagger.tags = ['Vendors']
  #swagger.summary = 'Get a vendor by vendorId'
  #swagger.parameters['id'] = { in: 'path', description: 'Vendor ID (e.g. VEND-20241A2B3C)', required: true, type: 'string' }
  #swagger.responses[200] = { description: 'Vendor found', schema: { $ref: '#/definitions/Vendor' } }
  #swagger.responses[404] = { description: 'Vendor not found' }
*/

router.put("/:id", updateVendor);
/*
  #swagger.tags = ['Vendors']
  #swagger.summary = 'Update vendor details'
  #swagger.parameters['id'] = { in: 'path', required: true, type: 'string' }
  #swagger.parameters['body'] = { in: 'body', schema: { $ref: '#/definitions/VendorRegisterBody' } }
  #swagger.responses[200] = { description: 'Vendor updated', schema: { $ref: '#/definitions/Vendor' } }
  #swagger.responses[404] = { description: 'Vendor not found' }
*/

router.patch("/verify/:id", verifyVendor);
/*
  #swagger.tags = ['Vendors']
  #swagger.summary = 'Verify a vendor (admin only)'
  #swagger.parameters['id'] = { in: 'path', required: true, type: 'string' }
  #swagger.responses[200] = { description: 'Vendor verified', schema: { $ref: '#/definitions/Vendor' } }
  #swagger.responses[404] = { description: 'Vendor not found' }
*/

router.delete("/:id", deleteVendor);
/*
  #swagger.tags = ['Vendors']
  #swagger.summary = 'Delete a vendor and their products'
  #swagger.parameters['id'] = { in: 'path', required: true, type: 'string' }
  #swagger.responses[200] = { description: 'Vendor deleted', schema: { $ref: '#/definitions/SuccessMessage' } }
  #swagger.responses[404] = { description: 'Vendor not found' }
*/

router.get("/:vendorId/products", getVendorProducts);
/*
  #swagger.tags = ['Vendors']
  #swagger.summary = 'Get all products for a specific vendor'
  #swagger.parameters['vendorId'] = { in: 'path', required: true, type: 'string' }
  #swagger.responses[200] = { description: 'Vendor with products list' }
  #swagger.responses[404] = { description: 'Vendor not found' }
*/

module.exports = router;
