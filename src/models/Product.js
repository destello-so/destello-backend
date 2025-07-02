const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true,
    maxlength: [200, 'El nombre no puede exceder 200 caracteres']
  },
  sku: {
    type: String,
    required: [true, 'El SKU es requerido'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    maxlength: [2000, 'La descripción no puede exceder 2000 caracteres']
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  weight: {
    type: Number,
    default: 0,
    min: [0, 'El peso no puede ser negativo']
  },
  dimensions: {
    type: String,
    trim: true,
    default: ''
  },
  stockQty: {
    type: Number,
    required: [true, 'La cantidad en stock es requerida'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  imageUrl: {
    type: String,
    trim: true,
    default: ''
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para performance
productSchema.index({ name: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ categories: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ price: 1 });

// Método para verificar si está en stock
productSchema.methods.isInStock = function() {
  return this.stockQty > 0;
};

module.exports = mongoose.model('Product', productSchema); 