const Joi = require('joi');

// Configuración personalizada de Joi
const customJoi = Joi.defaults((schema) => {
  return schema.options({
    stripUnknown: true, // Remover campos no definidos
    abortEarly: false,  // Mostrar todos los errores
    allowUnknown: false // No permitir campos no definidos
  });
});

// Validador genérico para body
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        error: {
          message: 'Datos de entrada inválidos',
          details
        }
      });
    }

    req.body = value; // Usar valor validado y sanitizado
    next();
  };
};

// Validador genérico para params
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params);
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        error: {
          message: 'Parámetros inválidos',
          details
        }
      });
    }

    req.params = value;
    next();
  };
};

// Validador genérico para query
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        error: {
          message: 'Parámetros de consulta inválidos',
          details
        }
      });
    }

    req.query = value;
    next();
  };
};

// Schemas comunes reutilizables
const commonSchemas = {
  // ID de MongoDB
  mongoId: customJoi.string().hex().length(24).required(),
  
  // Paginación
  pagination: customJoi.object({
    page: customJoi.number().integer().min(1).default(1),
    limit: customJoi.number().integer().min(1).max(100).default(12)
  }),

  // Email
  email: customJoi.string().email().lowercase().required(),
  
  // Password
  password: customJoi.string().min(6).max(50).required(),
  
  // Texto requerido
  requiredText: customJoi.string().trim().min(1).required(),
  
  // Texto opcional
  optionalText: customJoi.string().trim().allow(''),
  
  // Número positivo
  positiveNumber: customJoi.number().min(0).required(),
  
  // Rating 1-5
  rating: customJoi.number().integer().min(1).max(5).required()
};

// Schemas específicos para User
const userSchemas = {
  register: customJoi.object({
    firstName: commonSchemas.requiredText.max(50),
    lastName: commonSchemas.requiredText.max(50),
    email: commonSchemas.email,
    password: commonSchemas.password,
    phone: customJoi.string().pattern(/^\d{9}$/).optional()
  }),

  login: customJoi.object({
    email: commonSchemas.email,
    password: commonSchemas.password
  }),

  updateProfile: customJoi.object({
    firstName: commonSchemas.requiredText.max(50),
    lastName: commonSchemas.requiredText.max(50),
    phone: customJoi.string().pattern(/^\d{9}$/).optional()
  }),

  // Schema para direcciones
  address: customJoi.object({
    street: commonSchemas.requiredText.max(200),
    city: commonSchemas.requiredText.max(100),
    state: commonSchemas.requiredText.max(100),
    zipCode: commonSchemas.requiredText.max(20),
    country: commonSchemas.requiredText.max(100),
    isDefault: customJoi.boolean().default(false)
  })
};

// Schemas específicos para Product
const productSchemas = {
  create: customJoi.object({
    name: commonSchemas.requiredText.max(200),
    sku: commonSchemas.requiredText.uppercase(),
    description: commonSchemas.requiredText.max(2000),
    price: commonSchemas.positiveNumber,
    weight: customJoi.number().min(0).default(0),
    dimensions: commonSchemas.optionalText,
    stockQty: customJoi.number().integer().min(0).required(),
    imageUrl: customJoi.string().uri().allow(''),
    categories: customJoi.array().items(commonSchemas.mongoId).min(1).required()
  }),

  update: customJoi.object({
    name: commonSchemas.requiredText.max(200),
    description: commonSchemas.requiredText.max(2000),
    price: commonSchemas.positiveNumber,
    weight: customJoi.number().min(0),
    dimensions: commonSchemas.optionalText,
    stockQty: customJoi.number().integer().min(0),
    imageUrl: customJoi.string().uri().allow(''),
    categories: customJoi.array().items(commonSchemas.mongoId).min(1),
    isActive: customJoi.boolean()
  }),

  query: customJoi.object({
    page: customJoi.number().integer().min(1).default(1),
    limit: customJoi.number().integer().min(1).max(100).default(12),
    category: commonSchemas.mongoId.optional(),
    minPrice: customJoi.number().min(0).optional(),
    maxPrice: customJoi.number().min(0).optional(),
    search: customJoi.string().trim().optional()
  })
};

// Schema para parámetros con ID
const paramIdSchema = customJoi.object({
  id: commonSchemas.mongoId
});

const categorySchemas = {
  create: customJoi.object({
    name: commonSchemas.requiredText.max(100),
    description: commonSchemas.optionalText.max(500)
  }),
  update: customJoi.object({
    name: commonSchemas.requiredText.max(100),
    description: commonSchemas.optionalText.max(500)
  })
};

// Schemas específicos para Reaction
const reactionSchemas = {
  create: customJoi.object({
    targetType: customJoi.string().valid('post', 'comment', 'review', 'product').required(),
    targetId: commonSchemas.mongoId,
    reactionType: customJoi.string().valid('like', 'love', 'helpful', 'dislike', 'laugh', 'wow').required()
  }),

  params: customJoi.object({
    targetType: customJoi.string().valid('post', 'comment', 'review', 'product').required(),
    targetId: commonSchemas.mongoId
  }),

  query: customJoi.object({
    page: customJoi.number().integer().min(1).default(1),
    limit: customJoi.number().integer().min(1).max(100).default(20),
    reactionType: customJoi.string().valid('like', 'love', 'helpful', 'dislike', 'laugh', 'wow').optional(),
    timeFrame: customJoi.string().valid('7d', '30d').default('7d')
  })
};

// Schemas específicos para Comment
const commentSchemas = {
  create: customJoi.object({
    parentType: customJoi.string().valid('post', 'product', 'review').required(),
    parentId: commonSchemas.mongoId,
    text: commonSchemas.requiredText.max(1000)
  }),
  update: customJoi.object({
    text: commonSchemas.requiredText.max(1000)
  })
};

// Schemas específicos para Review
const reviewSchemas = {
  create: customJoi.object({
    productId: commonSchemas.mongoId,
    rating: customJoi.number().integer().min(1).max(5).required(),
    title: commonSchemas.requiredText.max(200),
    body: commonSchemas.requiredText.max(2000)
  }),
  update: customJoi.object({
    rating: customJoi.number().integer().min(1).max(5).optional(),
    title: commonSchemas.requiredText.max(200).optional(),
    body: commonSchemas.requiredText.max(2000).optional()
  })
};

// Middleware específico para validar reacciones
const validateReaction = validateBody(reactionSchemas.create);

// Middleware específico para validar comentarios
const validateComment = (req, res, next) => {
  if (req.method === 'POST') {
    return validateBody(commentSchemas.create)(req, res, next);
  } else if (req.method === 'PUT') {
    return validateBody(commentSchemas.update)(req, res, next);
  }
  next();
};

// Middleware específico para validar reviews
const validateReview = (req, res, next) => {
  if (req.method === 'POST') {
    return validateBody(reviewSchemas.create)(req, res, next);
  } else if (req.method === 'PUT') {
    return validateBody(reviewSchemas.update)(req, res, next);
  }
  next();
};

module.exports = {
  validateBody,
  validateParams,
  validateQuery,
  commonSchemas,
  userSchemas,
  productSchemas,
  reactionSchemas,
  commentSchemas,
  reviewSchemas,
  paramIdSchema,
  categorySchemas,
  validateReaction,
  validateComment,
  validateReview
}; 