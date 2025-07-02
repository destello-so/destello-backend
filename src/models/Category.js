const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la categoría es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null // null = categoría raíz
  }
}, {
  timestamps: true
});

// Índices
categorySchema.index({ name: 1 });
categorySchema.index({ parentId: 1 });

// Método para obtener categorías hijas
categorySchema.methods.getChildren = function() {
  return this.model('Category').find({ parentId: this._id });
};

// Método para verificar si es categoría raíz
categorySchema.methods.isRoot = function() {
  return this.parentId === null;
};

module.exports = mongoose.model('Category', categorySchema); 