// Middleware de manejo de errores centralizado
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log del error
  console.error(`❌ Error: ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // MongoDB CastError (ID inválido)
  if (err.name === 'CastError') {
    const message = 'ID inválido';
    error = {
      statusCode: 400,
      message
    };
  }

  // MongoDB ValidationError
  if (err.name === 'ValidationError') {
    let message;
    if (err.errors && typeof err.errors === 'object') {
      message = Object.values(err.errors).map(val => val.message).join(', ');
    } else {
      message = err.message || 'Datos de entrada inválidos';
    }
    error = {
      statusCode: 400,
      message: 'Datos de entrada inválidos',
      details: message
    };
  }

  // MongoDB Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `El ${field} '${value}' ya existe`;
    error = {
      statusCode: 409,
      message
    };
  }

  // JWT JsonWebTokenError
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token de acceso inválido';
    error = {
      statusCode: 401,
      message
    };
  }

  // JWT TokenExpiredError
  if (err.name === 'TokenExpiredError') {
    const message = 'Token de acceso expirado';
    error = {
      statusCode: 401,
      message
    };
  }

  // Joi ValidationError
  if (err.isJoi) {
    const details = err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));

    error = {
      statusCode: 400,
      message: 'Datos de entrada inválidos',
      details
    };
  }

  // Error personalizado con statusCode
  if (err.statusCode) {
    error = {
      statusCode: err.statusCode,
      message: err.message
    };
  }

  // Respuesta de error
  const response = {
    success: false,
    error: {
      message: error.message || 'Error interno del servidor'
    },
    timestamp: new Date().toISOString()
  };

  // Agregar detalles solo en desarrollo
  if (process.env.NODE_ENV !== 'production' && (error.details || err.stack)) {
    response.error.details = error.details;
    if (!error.details) {
      response.error.stack = err.stack;
    }
  }

  res.status(error.statusCode || 500).json(response);
};

// Middleware para rutas no encontradas (404)
const notFound = (req, res, next) => {
  const error = new Error(`Ruta ${req.originalUrl} no encontrada`);
  error.statusCode = 404;
  next(error);
};

// Función helper para crear errores personalizados
const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Errores comunes predefinidos
const errors = {
  notFound: (resource = 'Recurso') => createError(`${resource} no encontrado`, 404),
  unauthorized: (message = 'No autorizado') => createError(message, 401),
  forbidden: (message = 'Acceso prohibido') => createError(message, 403),
  badRequest: (message = 'Solicitud inválida') => createError(message, 400),
  conflict: (message = 'Conflicto de datos') => createError(message, 409),
  internal: (message = 'Error interno del servidor') => createError(message, 500)
};

module.exports = {
  errorHandler,
  notFound,
  createError,
  errors
}; 