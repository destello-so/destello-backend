const mongoose = require('mongoose');

// Subdocumento WishlistItem
const wishlistItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El ID del usuario es requerido'],
    unique: true // Una wishlist por usuario
  },
  items: [wishlistItemSchema]
}, {
  timestamps: true
});

// Índices
wishlistSchema.index({ userId: 1 });

// Método para verificar si un producto está en la wishlist
wishlistSchema.methods.hasProduct = function(productId) {
  return this.items.some(item => item.productId.toString() === productId.toString());
};

module.exports = mongoose.model('Wishlist', wishlistSchema); 