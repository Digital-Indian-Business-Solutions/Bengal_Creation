const express = require("express");
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  markPaymentFailed,
  refundPayment,
  retryPayment,
} = require("../controllers/paymentController");

router.post("/create/:orderId", createPaymentOrder);
/*
  #swagger.tags = ['Payment']
  #swagger.summary = 'Create a Razorpay payment order'
  #swagger.parameters['orderId'] = { in: 'path', required: true, type: 'string', description: 'MongoDB Order ID' }
  #swagger.responses[200] = { description: 'Razorpay order created', schema: { $ref: '#/definitions/PaymentOrderResponse' } }
  #swagger.responses[404] = { description: 'Order not found' }
*/

router.post("/verify", verifyPayment);
/*
  #swagger.tags = ['Payment']
  #swagger.summary = 'Verify a Razorpay payment signature'
  #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: { $ref: '#/definitions/VerifyPaymentBody' }
  }
  #swagger.responses[200] = { description: 'Payment verified, order confirmed', schema: { $ref: '#/definitions/Order' } }
  #swagger.responses[400] = { description: 'Signature mismatch — verification failed' }
*/

router.post("/failed", markPaymentFailed);
/*
  #swagger.tags = ['Payment']
  #swagger.summary = 'Mark a payment as failed'
  #swagger.parameters['body'] = { in: 'body', required: true, schema: { orderId: '64f1a2b3c4d5e6f7a8b9c0f1' } }
  #swagger.responses[200] = { description: 'Payment marked failed', schema: { $ref: '#/definitions/SuccessMessage' } }
*/

router.post("/refund/:paymentId", refundPayment);
/*
  #swagger.tags = ['Payment']
  #swagger.summary = 'Initiate a refund for a Razorpay payment'
  #swagger.parameters['paymentId'] = { in: 'path', required: true, type: 'string', description: 'Razorpay payment ID' }
  #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/RefundBody' } }
  #swagger.responses[200] = { description: 'Refund initiated', schema: { success: true, refund: {} } }
  #swagger.responses[500] = { description: 'Refund failed' }
*/

router.post("/retry/:orderId", retryPayment);
/*
  #swagger.tags = ['Payment']
  #swagger.summary = 'Retry payment for an existing order'
  #swagger.parameters['orderId'] = { in: 'path', required: true, type: 'string' }
  #swagger.responses[200] = { description: 'New Razorpay order for retry', schema: { $ref: '#/definitions/PaymentOrderResponse' } }
  #swagger.responses[404] = { description: 'Order not found' }
*/

module.exports = router;
