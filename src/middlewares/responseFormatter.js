// Middleware para agregar funciones de respuesta formateadas a res
const responseFormatter = (req, res, next) => {
  // Respuesta de éxito
  res.success = (data = null, message = 'Operación exitosa', statusCode = 200) => {
    const response = {
      success: true,
      message,
      timestamp: new Date().toISOString()
    };

    if (data !== null) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  };

  // Respuesta de éxito para creación
  res.created = (data, message = 'Recurso creado exitosamente') => {
    return res.success(data, message, 201);
  };

  // Respuesta de éxito para actualización
  res.updated = (data, message = 'Recurso actualizado exitosamente') => {
    return res.success(data, message, 200);
  };

  // Respuesta de éxito para eliminación
  res.deleted = (message = 'Recurso eliminado exitosamente') => {
    return res.success(null, message, 200);
  };

  // Respuesta paginada
  res.paginated = (data, pagination, message = 'Consulta exitosa') => {
    const response = {
      success: true,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        pages: Math.ceil(pagination.total / pagination.limit),
        hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
        hasPrev: pagination.page > 1
      },
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(response);
  };

  // Respuesta de error
  res.error = (message = 'Error interno del servidor', statusCode = 500, details = null) => {
    const response = {
      success: false,
      error: {
        message
      },
      timestamp: new Date().toISOString()
    };

    if (details && process.env.NODE_ENV !== 'production') {
      response.error.details = details;
    }

    return res.status(statusCode).json(response);
  };

  // Respuestas de error específicas
  res.badRequest = (message = 'Solicitud inválida', details = null) => {
    return res.error(message, 400, details);
  };

  res.unauthorized = (message = 'No autorizado') => {
    return res.error(message, 401);
  };

  res.forbidden = (message = 'Acceso prohibido') => {
    return res.error(message, 403);
  };

  res.notFound = (message = 'Recurso no encontrado') => {
    return res.error(message, 404);
  };

  res.conflict = (message = 'Conflicto de datos') => {
    return res.error(message, 409);
  };

  res.internal = (message = 'Error interno del servidor') => {
    return res.error(message, 500);
  };

  // Respuesta de validación fallida
  res.validationError = (details, message = 'Datos de entrada inválidos') => {
    const response = {
      success: false,
      error: {
        message,
        details
      },
      timestamp: new Date().toISOString()
    };

    return res.status(400).json(response);
  };

  next();
};

module.exports = responseFormatter; 