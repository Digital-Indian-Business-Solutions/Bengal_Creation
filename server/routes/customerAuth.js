const express = require("express");
const router = express.Router();
const { registerCustomer, loginCustomer } = require("../controllers/customerAuthController");

router.post("/register", registerCustomer);
/*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Register a new customer'
  #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: { $ref: '#/definitions/CustomerRegisterBody' }
  }
  #swagger.responses[200] = { description: 'Customer registered successfully', schema: { msg: 'Customer Registered' } }
  #swagger.responses[400] = { description: 'Email already exists' }
  #swagger.responses[500] = { description: 'Server error' }
*/

router.post("/login", loginCustomer);
/*
  #swagger.tags = ['Auth']
  #swagger.summary = 'Customer login'
  #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: { $ref: '#/definitions/CustomerLoginBody' }
  }
  #swagger.responses[200] = { description: 'Login successful', schema: { $ref: '#/definitions/CustomerLoginResponse' } }
  #swagger.responses[400] = { description: 'Invalid credentials' }
*/

module.exports = router;
