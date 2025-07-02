// Importar todos los middlewares
const auth = require('./auth');
const validation = require('./validation');
const { errorHandler, notFound, createError, errors } = require('./errorHandler');
const responseFormatter = require('./responseFormatter');

// Exportar todos los middlewares
module.exports = {
  // Auth middlewares
  ...auth,
  
  // Validation middlewares
  ...validation,
  
  // Error handling
  errorHandler,
  notFound,
  createError,
  errors,
  
  // Response formatting
  responseFormatter
}; 