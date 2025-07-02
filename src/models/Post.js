const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El ID del usuario es requerido']
  },
  text: {
    type: String,
    required: [true, 'El contenido del post es requerido'],
    trim: true,
    maxlength: [2000, 'El post no puede exceder 2000 caracteres']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Cada tag no puede exceder 50 caracteres']
  }]
}, {
  timestamps: true
});

// Índices
postSchema.index({ userId: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ createdAt: -1 });

// Índice de texto para búsqueda
postSchema.index({ text: 'text', tags: 'text' });

// Método para agregar tag
postSchema.methods.addTag = function(tag) {
  const cleanTag = tag.toLowerCase().trim();
  if (!this.tags.includes(cleanTag)) {
    this.tags.push(cleanTag);
  }
  return this.save();
};

// Método para remover tag
postSchema.methods.removeTag = function(tag) {
  const cleanTag = tag.toLowerCase().trim();
  this.tags = this.tags.filter(t => t !== cleanTag);
  return this.save();
};

module.exports = mongoose.model('Post', postSchema); 