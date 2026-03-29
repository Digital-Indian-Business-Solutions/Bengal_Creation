const express = require("express");
const router = express.Router();
const { razorpayWebhook } = require("../controllers/webhookController");

router.post("/razorpay", express.json({ type: "*/*" }), razorpayWebhook);
/*
  #swagger.tags = ['Webhooks']
  #swagger.summary = 'Razorpay webhook — payment.captured event'
  #swagger.description = 'Called by Razorpay when a payment is captured. Verifies HMAC signature and updates order payment status.'
  #swagger.parameters['x-razorpay-signature'] = { in: 'header', required: true, type: 'string' }
  #swagger.responses[200] = { description: 'Webhook processed', schema: { status: 'ok' } }
  #swagger.responses[400] = { description: 'Invalid webhook signature' }
*/

module.exports = router;
