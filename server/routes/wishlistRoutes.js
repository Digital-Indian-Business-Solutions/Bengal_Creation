const express = require("express");
const router = express.Router();
const { addToWishlist, getWishlist, removeFromWishlist } = require("../controllers/wishlistController");

router.post("/add/:productId", addToWishlist);
/*
  #swagger.tags = ['Wishlist']
  #swagger.summary = 'Add a product to the wishlist'
  #swagger.security = [{ BearerAuth: [] }]
  #swagger.parameters['productId'] = { in: 'path', required: true, type: 'string' }
  #swagger.responses[200] = { description: 'Added to wishlist' }
  #swagger.responses[404] = { description: 'Product not found' }
  #swagger.responses[401] = { description: 'Unauthorized' }
*/

router.get("/", getWishlist);
/*
  #swagger.tags = ['Wishlist']
  #swagger.summary = 'Get the authenticated customer wishlist'
  #swagger.security = [{ BearerAuth: [] }]
  #swagger.responses[200] = { description: 'Wishlist with populated products' }
  #swagger.responses[401] = { description: 'Unauthorized' }
*/

router.delete("/remove/:productId", removeFromWishlist);
/*
  #swagger.tags = ['Wishlist']
  #swagger.summary = 'Remove a product from the wishlist'
  #swagger.security = [{ BearerAuth: [] }]
  #swagger.parameters['productId'] = { in: 'path', required: true, type: 'string' }
  #swagger.responses[200] = { description: 'Removed from wishlist', schema: { msg: 'Removed from wishlist' } }
  #swagger.responses[404] = { description: 'Wishlist empty' }
*/

module.exports = router;
