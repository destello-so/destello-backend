// Importar todos los modelos
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const InventoryTx = require('./InventoryTx');
const Cart = require('./Cart');
const Wishlist = require('./Wishlist');
const Order = require('./Order');
const Shipment = require('./Shipment');
const Review = require('./Review');
const Comment = require('./Comment');
const Reaction = require('./Reaction');
const Post = require('./Post');
const Follow = require('./Follow');

// Exportar todos los modelos
module.exports = {
  User,
  Category,
  Product,
  InventoryTx,
  Cart,
  Wishlist,
  Order,
  Shipment,
  Review,
  Comment,
  Reaction,
  Post,
  Follow
}; 