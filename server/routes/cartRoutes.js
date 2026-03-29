const express = require("express");
const router = express.Router();
const { addToCart, getCart, clearCart, removeFromCart, getAllCarts } = require("../controllers/cartController");
const auth = require("../middleware/customerAuth");

router.post("/add", addToCart);
/*
  #swagger.tags = ['Cart']
  #swagger.summary = 'Add a product to the cart'
  #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: { $ref: '#/definitions/AddToCartBody' }
  }
  #swagger.responses[200] = { description: 'Cart updated', schema: { msg: 'Cart updated', cart: { $ref: '#/definitions/Cart' } } }
  #swagger.responses[404] = { description: 'Product not found' }
*/

router.get("/", getAllCarts);
/*
  #swagger.tags = ['Cart']
  #swagger.summary = 'Get all carts (admin — includes customer and product details)'
  #swagger.responses[200] = { description: 'All carts', schema: [{ $ref: '#/definitions/Cart' }] }
*/

router.get("/:id", getCart);
/*
  #swagger.tags = ['Cart']
  #swagger.summary = 'Get cart for a specific customer'
  #swagger.parameters['id'] = { in: 'path', required: true, type: 'string', description: 'Customer ObjectId' }
  #swagger.responses[200] = { description: 'Customer cart', schema: { $ref: '#/definitions/Cart' } }
*/

router.delete("/clear", auth, clearCart);
/*
  #swagger.tags = ['Cart']
  #swagger.summary = 'Clear the authenticated customer cart'
  #swagger.security = [{ BearerAuth: [] }]
  #swagger.responses[200] = { description: 'Cart cleared', schema: { msg: 'Cart cleared' } }
  #swagger.responses[401] = { description: 'Unauthorized' }
*/

router.patch("/remove/:productId", removeFromCart);
/*
  #swagger.tags = ['Cart']
  #swagger.summary = 'Remove a product from the cart'
  #swagger.parameters['productId'] = { in: 'path', required: true, type: 'string' }
  #swagger.parameters['body'] = { in: 'body', required: true, schema: { user: { id: '64f1a2b3c4d5e6f7a8b9c0d1' } } }
  #swagger.responses[200] = { description: 'Item removed', schema: { msg: 'Item removed', cart: { $ref: '#/definitions/Cart' } } }
  #swagger.responses[404] = { description: 'Cart or product not found' }
*/

module.exports = router;
