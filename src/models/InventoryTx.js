const mongoose = require('mongoose');
const { CONSTANTS } = require('../config');

const inventoryTxSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'El ID del producto es requerido']
  },
  qtyChange: {
    type: Number,
    required: [true, 'El cambio de cantidad es requerido']
    // Positivo = entrada, Negativo = salida
  },
  type: {
    type: String,
    required: [true, 'El tipo de transacción es requerido'],
    enum: Object.values(CONSTANTS.INVENTORY_TYPES)
  },
  note: {
    type: String,
    trim: true,
    maxlength: [500, 'La nota no puede exceder 500 caracteres']
  },
  occurredAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices
inventoryTxSchema.index({ productId: 1 });
inventoryTxSchema.index({ type: 1 });
inventoryTxSchema.index({ occurredAt: -1 });

module.exports = mongoose.model('InventoryTx', inventoryTxSchema); 