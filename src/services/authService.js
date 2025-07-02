const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { CONSTANTS } = require('../config');

class AuthService {
  
  // Registrar nuevo usuario
  async register(userData) {
    const { firstName, lastName, email, password, phone } = userData;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('El email ya está registrado');
      error.statusCode = 409;
      throw error;
    }

    // Hash del password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const user = await User.create({
      firstName,
      lastName,
      email,
      passwordHash,
      phone
    });

    // Generar token
    const token = this.generateToken(user);

    // Retornar usuario y token (sin password)
    try {
      const userJson = user.toJSON();
      return {
        user: userJson,
        token
      };
    } catch (error) {
      console.error('Error en toJSON:', error);
      // Fallback: crear objeto manualmente
      const userObj = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        addresses: user.addresses || [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      return {
        user: userObj,
        token
      };
    }
  }

  // Login de usuario
  async login(credentials) {
    const { email, password } = credentials;

    // Buscar usuario por email (incluir passwordHash)
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    // Verificar si está activo
    if (!user.isActive) {
      const error = new Error('Usuario desactivado');
      error.statusCode = 401;
      throw error;
    }

    // Verificar password
    const isValidPassword = await this.verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    // Generar token
    const token = this.generateToken(user);

    // Retornar usuario y token (sin password)
    try {
      const userJson = user.toJSON();
      return {
        user: userJson,
        token
      };
    } catch (error) {
      console.error('Error en toJSON:', error);
      // Fallback: crear objeto manualmente
      const userObj = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        addresses: user.addresses || [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      return {
        user: userObj,
        token
      };
    }
  }

  // Generar JWT token
  generateToken(user) {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role
    };

    const options = {
      expiresIn: CONSTANTS.JWT.EXPIRES_IN
    };

    return jwt.sign(payload, process.env.JWT_SECRET, options);
  }

  // Verificar password
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Verificar si un email existe
  async emailExists(email) {
    const user = await User.findOne({ email });
    return !!user;
  }

  // Obtener usuario por ID (sin password)
  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('Usuario desactivado');
      error.statusCode = 401;
      throw error;
    }

    return user;
  }

}

module.exports = new AuthService(); 