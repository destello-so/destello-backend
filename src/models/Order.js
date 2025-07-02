const mongoose = require('mongoose');
const { CONSTANTS } = require('../config');

// Subdocumento OrderItem (snapshot histórico)
const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  productSku: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'La cantidad debe ser al menos 1']
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'El precio unitario no puede ser negativo']
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'El precio total no puede ser negativo']
  }
}, { _id: true });

// Subdocumento Address (snapshot histórico)
const orderAddressSchema = new mongoose.Schema({
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  zipCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El ID del usuario es requerido']
  },
  items: [orderItemSchema],
  address: {
    type: orderAddressSchema,
    required: [true, 'La dirección de envío es requerida']
  },
  totalAmount: {
    type: Number,
    required: [true, 'El monto total es requerido'],
    min: [0, 'El monto total no puede ser negativo']
  },
  status: {
    type: String,
    enum: Object.values(CONSTANTS.ORDER_STATUS),
    default: CONSTANTS.ORDER_STATUS.PENDING
  },
  shipments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipment'
  }]
}, {
  timestamps: true
});

// Índices
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Método para verificar si la orden está completada
orderSchema.methods.isCompleted = function() {
  return this.status === CONSTANTS.ORDER_STATUS.DELIVERED;
};

// Método para verificar si se puede cancelar
orderSchema.methods.canBeCancelled = function() {
  return [
    CONSTANTS.ORDER_STATUS.PENDING,
    CONSTANTS.ORDER_STATUS.CONFIRMED
  ].includes(this.status);
};

module.exports = mongoose.model('Order', orderSchema); 