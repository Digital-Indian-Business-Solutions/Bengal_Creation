const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrdersByUser,
  getOrdersByStatus,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  getOrdersByVendor,
  deleteOrder,
} = require("../controllers/orderController");

router.post("/", createOrder);
/*
  #swagger.tags = ['Orders']
  #swagger.summary = 'Create an order from the customer cart'
  #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: { $ref: '#/definitions/CreateOrderBody' }
  }
  #swagger.responses[200] = { description: 'Order created', schema: { $ref: '#/definitions/Order' } }
  #swagger.responses[400] = { description: 'Cart empty or item out of stock' }
  #swagger.responses[404] = { description: 'Address or product not found' }
*/

router.get("/user/:userId", getOrdersByUser);
/*
  #swagger.tags = ['Orders']
  #swagger.summary = 'Get all orders for a customer'
  #swagger.parameters['userId'] = { in: 'path', required: true, type: 'string' }
  #swagger.responses[200] = { description: 'Customer orders', schema: [{ $ref: '#/definitions/Order' }] }
*/

router.get("/status/:status", getOrdersByStatus);
/*
  #swagger.tags = ['Orders']
  #swagger.summary = 'Get orders by status'
  #swagger.parameters['status'] = {
    in: 'path',
    required: true,
    type: 'string',
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
  }
  #swagger.responses[200] = { description: 'Orders with given status', schema: [{ $ref: '#/definitions/Order' }] }
*/

router.get("/vendor/:vendorId", getOrdersByVendor);
/*
  #swagger.tags = ['Orders']
  #swagger.summary = 'Get orders containing items from a specific vendor'
  #swagger.parameters['vendorId'] = { in: 'path', required: true, type: 'string' }
  #swagger.responses[200] = { description: 'Vendor orders', schema: [{ $ref: '#/definitions/Order' }] }
*/

router.get("/", getAllOrders);
/*
  #swagger.tags = ['Orders']
  #swagger.summary = 'Get all orders'
  #swagger.responses[200] = { description: 'All orders', schema: [{ $ref: '#/definitions/Order' }] }
*/

router.get("/:id", getOrderById);
/*
  #swagger.tags = ['Orders']
  #swagger.summary = 'Get an order by ID'
  #swagger.parameters['id'] = { in: 'path', required: true, type: 'string' }
  #swagger.responses[200] = { description: 'Order found', schema: { $ref: '#/definitions/Order' } }
  #swagger.responses[404] = { description: 'Order not found' }
*/

router.patch("/status/:id", updateOrderStatus);
/*
  #swagger.tags = ['Orders']
  #swagger.summary = 'Update order status'
  #swagger.parameters['id'] = { in: 'path', required: true, type: 'string' }
  #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: { $ref: '#/definitions/UpdateStatusBody' }
  }
  #swagger.responses[200] = { description: 'Order status updated', schema: { $ref: '#/definitions/Order' } }
*/

router.patch("/payment-status/:id", updatePaymentStatus);
/*
  #swagger.tags = ['Orders']
  #swagger.summary = 'Update payment status of an order'
  #swagger.parameters['id'] = { in: 'path', required: true, type: 'string' }
  #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: { $ref: '#/definitions/UpdatePaymentStatusBody' }
  }
  #swagger.responses[200] = { description: 'Payment status updated', schema: { $ref: '#/definitions/Order' } }
*/

router.delete("/:id", deleteOrder);
/*
  #swagger.tags = ['Orders']
  #swagger.summary = 'Delete an order'
  #swagger.parameters['id'] = { in: 'path', required: true, type: 'string' }
  #swagger.responses[200] = { description: 'Order deleted', schema: { msg: 'Order deleted' } }
*/

module.exports = router;
