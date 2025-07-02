const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'El ID del producto es requerido']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El ID del usuario es requerido']
  },
  rating: {
    type: Number,
    required: [true, 'La calificación es requerida'],
    min: [1, 'La calificación mínima es 1'],
    max: [5, 'La calificación máxima es 5']
  },
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },
  body: {
    type: String,
    required: [true, 'El contenido de la reseña es requerido'],
    trim: true,
    maxlength: [2000, 'El contenido no puede exceder 2000 caracteres']
  },
  helpfulCount: {
    type: Number,
    default: 0,
    min: [0, 'El contador no puede ser negativo']
  }
}, {
  timestamps: true
});

// Índices
reviewSchema.index({ productId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

// Índice compuesto para evitar reviews duplicadas del mismo usuario al mismo producto
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

// Método para incrementar helpfulCount
reviewSchema.methods.incrementHelpful = function() {
  this.helpfulCount++;
  return this.save();
};

module.exports = mongoose.model('Review', reviewSchema); 