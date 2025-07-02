const mongoose = require('mongoose');
const { CONSTANTS } = require('../config');

// Subdocumento ShipmentItem
const shipmentItemSchema = new mongoose.Schema({
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
  }
}, { _id: true });

const shipmentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'El ID de la orden es requerido']
  },
  carrier: {
    type: String,
    required: [true, 'El transportista es requerido'],
    trim: true,
    maxlength: [100, 'El transportista no puede exceder 100 caracteres']
  },
  trackingNumber: {
    type: String,
    trim: true,
    maxlength: [100, 'El número de tracking no puede exceder 100 caracteres']
  },
  status: {
    type: String,
    enum: Object.values(CONSTANTS.SHIPMENT_STATUS),
    default: CONSTANTS.SHIPMENT_STATUS.PENDING
  },
  items: [shipmentItemSchema],
  shippedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices
shipmentSchema.index({ orderId: 1 });
shipmentSchema.index({ status: 1 });
shipmentSchema.index({ trackingNumber: 1 });

// Método para verificar si está entregado
shipmentSchema.methods.isDelivered = function() {
  return this.status === CONSTANTS.SHIPMENT_STATUS.DELIVERED && this.deliveredAt;
};

// Método para marcar como enviado
shipmentSchema.methods.markAsShipped = function() {
  this.status = CONSTANTS.SHIPMENT_STATUS.SHIPPED;
  this.shippedAt = new Date();
  return this.save();
};

// Método para marcar como entregado
shipmentSchema.methods.markAsDelivered = function() {
  this.status = CONSTANTS.SHIPMENT_STATUS.DELIVERED;
  this.deliveredAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Shipment', shipmentSchema); 