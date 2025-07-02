const mongoose = require('mongoose');
const { CONSTANTS } = require('../config');

const reactionSchema = new mongoose.Schema({
  targetType: {
    type: String,
    required: [true, 'El tipo de target es requerido'],
    enum: Object.values(CONSTANTS.REACTION_TARGET_TYPES)
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'El ID del target es requerido'],
    refPath: 'targetType' // Referencia dinámica basada en targetType
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El ID del usuario es requerido']
  },
  type: {
    type: String,
    required: [true, 'El tipo de reacción es requerido'],
    enum: Object.values(CONSTANTS.REACTION_TYPES)
  }
}, {
  timestamps: true
});

// Índices
reactionSchema.index({ targetType: 1, targetId: 1 });
reactionSchema.index({ userId: 1 });
reactionSchema.index({ type: 1 });

// Índice único para evitar reacciones duplicadas del mismo usuario al mismo target
reactionSchema.index({ targetType: 1, targetId: 1, userId: 1 }, { unique: true });

// Índice compuesto para consultas eficientes por target y tipo
reactionSchema.index({ targetType: 1, targetId: 1, type: 1 });

module.exports = mongoose.model('Reaction', reactionSchema); 