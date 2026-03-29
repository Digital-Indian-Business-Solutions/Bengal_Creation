const express = require("express");
const router = express.Router();
const { addAddress, getAddressesByCustomer, deleteAddress } = require("../controllers/addressController");

router.post("/", addAddress);
/*
  #swagger.tags = ['Addresses']
  #swagger.summary = 'Add a new address'
  #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: { $ref: '#/definitions/AddressBody' }
  }
  #swagger.responses[200] = { description: 'Address saved', schema: { $ref: '#/definitions/Address' } }
  #swagger.responses[500] = { description: 'Server error' }
*/

router.get("/my/:customerId", getAddressesByCustomer);
/*
  #swagger.tags = ['Addresses']
  #swagger.summary = 'Get all addresses for a customer'
  #swagger.parameters['customerId'] = { in: 'path', required: true, type: 'string' }
  #swagger.responses[200] = { description: 'Customer addresses', schema: [{ $ref: '#/definitions/Address' }] }
*/

router.delete("/:id", deleteAddress);
/*
  #swagger.tags = ['Addresses']
  #swagger.summary = 'Delete an address'
  #swagger.parameters['id'] = { in: 'path', required: true, type: 'string' }
  #swagger.responses[200] = { description: 'Address deleted', schema: { msg: 'Deleted' } }
*/

module.exports = router;
