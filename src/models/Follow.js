const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El ID del usuario seguidor es requerido']
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El ID del usuario seguido es requerido']
  }
}, {
  timestamps: true
});

// Índices
followSchema.index({ userId: 1 });
followSchema.index({ targetUserId: 1 });

// Índice único para evitar seguimientos duplicados
followSchema.index({ userId: 1, targetUserId: 1 }, { unique: true });

// Validación para evitar que un usuario se siga a sí mismo
followSchema.pre('save', function(next) {
  if (this.userId.toString() === this.targetUserId.toString()) {
    const error = new Error('Un usuario no puede seguirse a sí mismo');
    return next(error);
  }
  next();
});

// Método estático para verificar si un usuario sigue a otro
followSchema.statics.isFollowing = function(userId, targetUserId) {
  return this.findOne({ userId, targetUserId });
};

// Método estático para obtener seguidores de un usuario
followSchema.statics.getFollowers = function(targetUserId) {
  return this.find({ targetUserId }).populate('userId', 'firstName lastName email');
};

// Método estático para obtener usuarios seguidos por un usuario
followSchema.statics.getFollowing = function(userId) {
  return this.find({ userId }).populate('targetUserId', 'firstName lastName email');
};

module.exports = mongoose.model('Follow', followSchema); 