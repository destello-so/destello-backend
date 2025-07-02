/**
 * Clases de error personalizadas para la aplicación
 */

// Error base personalizado
class AppError extends Error {
    constructor(message, statusCode = 500) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  // Error de validación
  class ValidationError extends AppError {
    constructor(message = 'Datos de entrada inválidos') {
      super(message, 400);
      this.name = 'ValidationError';
    }
  }
  
  // Error de recurso no encontrado
  class NotFoundError extends AppError {
    constructor(message = 'Recurso no encontrado') {
      super(message, 404);
      this.name = 'NotFoundError';
    }
  }
  
  // Error de autenticación
  class AuthenticationError extends AppError {
    constructor(message = 'No autorizado') {
      super(message, 401);
      this.name = 'AuthenticationError';
    }
  }
  
  // Error de autorización
  class AuthorizationError extends AppError {
    constructor(message = 'Acceso prohibido') {
      super(message, 403);
      this.name = 'AuthorizationError';
    }
  }
  
  // Error de conflicto
  class ConflictError extends AppError {
    constructor(message = 'Conflicto de datos') {
      super(message, 409);
      this.name = 'ConflictError';
    }
  }
  
  // Error de base de datos
  class DatabaseError extends AppError {
    constructor(message = 'Error de base de datos') {
      super(message, 500);
      this.name = 'DatabaseError';
    }
  }
  
  // Error de servicio
  class ServiceError extends AppError {
    constructor(message = 'Error en el servicio') {
      super(message, 500);
      this.name = 'ServiceError';
    }
  }
  
  module.exports = {
    AppError,
    ValidationError,
    NotFoundError,
    AuthenticationError,
    AuthorizationError,
    ConflictError,
    DatabaseError,
    ServiceError
  };