const mongoose = require('mongoose');
const { CONSTANTS } = require('../config');

// Subdocumento Address
const addressSchema = new mongoose.Schema({
  street: { 
    type: String, 
    required: true,
    trim: true 
  },
  city: { 
    type: String, 
    required: true,
    trim: true 
  },
  state: { 
    type: String, 
    required: true,
    trim: true 
  },
  zipCode: { 
    type: String, 
    required: true,
    trim: true 
  },
  country: { 
    type: String, 
    default: 'Perú',
    trim: true 
  },
  isDefault: { 
    type: Boolean, 
    default: false 
  }
}, { _id: true });

// Schema principal User
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  lastName: {
    type: String,
    required: [true, 'El apellido es requerido'],
    trim: true,
    maxlength: [50, 'El apellido no puede exceder 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  passwordHash: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\d{9}$/, 'Teléfono debe tener 9 dígitos']
  },
  role: {
    type: String,
    enum: Object.values(CONSTANTS.USER_ROLES),
    default: CONSTANTS.USER_ROLES.USER
  },
  isActive: {
    type: Boolean,
    default: true
  },
  addresses: [addressSchema]
}, {
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      delete ret.passwordHash; // Nunca exponer password
      return ret;
    }
  }
});

// Índices para performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Método para verificar si es admin
userSchema.methods.isAdmin = function() {
  return this.role === CONSTANTS.USER_ROLES.ADMIN;
};

module.exports = mongoose.model('User', userSchema); 