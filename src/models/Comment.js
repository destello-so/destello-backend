const mongoose = require('mongoose');
const { CONSTANTS } = require('../config');

const commentSchema = new mongoose.Schema({
  parentType: {
    type: String,
    required: [true, 'El tipo de parent es requerido'],
    enum: Object.values(CONSTANTS.COMMENT_PARENT_TYPES)
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'El ID del parent es requerido'],
    refPath: 'parentType' // Referencia dinámica basada en parentType
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El ID del usuario es requerido']
  },
  text: {
    type: String,
    required: [true, 'El texto del comentario es requerido'],
    trim: true,
    maxlength: [1000, 'El comentario no puede exceder 1000 caracteres']
  }
}, {
  timestamps: true
});

// Índices
commentSchema.index({ parentType: 1, parentId: 1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ createdAt: -1 });

// Índice compuesto para consultas eficientes por parent
commentSchema.index({ parentType: 1, parentId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema); 