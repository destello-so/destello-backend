const authController = require('./authController'); 
const userController = require('./userController');
const productController = require('./productController');
const categoryController = require('./categoryController');
const cartController = require('./cartController');
const orderController = require('./orderController');
const postController = require('./postController');
const wishlistController = require('./wishlistController');
const followController = require('./followController');
const reactionController = require('./reactionController');
const commentController = require('./commentController');

module.exports = {
  authController,
  userController,
  productController,
  categoryController,
  cartController,
  orderController,
  postController,
  wishlistController,
  followController,
  reactionController,
  commentController
};