// Importar todos los servicios
const authService = require('./authService');
const userService = require('./userService');
const productService = require('./productService');
const categoryService = require('./categoryService');
const cartService = require('./cartService');
const orderService = require('./orderService');
const postService = require('./postService');
const followService = require('./followService');
const commentService = require('./commentService');
const reactionService = require('./reactionService');
const wishlistService = require('./wishlistService');
const reviewService = require('./reviewService');

// Exportar todos los servicios
module.exports = {
  authService,
  userService,
  productService,
  categoryService,
  cartService,
  orderService,
  postService,
  followService,
  commentService,
  reactionService,
  wishlistService,
  reviewService
}; 