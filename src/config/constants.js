// Constantes para Destello Perú
const CONSTANTS = {
  // Roles de Usuario
  USER_ROLES: {
    ADMIN: 'admin',
    USER: 'user'
  },

  // Estados de Orden
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
  },

  // Estados de Envío
  SHIPMENT_STATUS: {
    PENDING: 'pending',
    SHIPPED: 'shipped',
    IN_TRANSIT: 'in_transit',
    DELIVERED: 'delivered',
    FAILED: 'failed'
  },

  // Tipos de Transacción de Inventario
  INVENTORY_TYPES: {
    SALE: 'sale',
    RESTOCK: 'restock',
    ADJUSTMENT: 'adjustment',
    RETURN: 'return'
  },

  // Tipos de Reacción
  REACTION_TYPES: {
    LIKE: 'like',
    LOVE: 'love',
    HELPFUL: 'helpful',
    DISLIKE: 'dislike',
    LAUGH: 'laugh',
    WOW: 'wow'
  },

  // Tipos de Comentario (polimórfico)
  COMMENT_PARENT_TYPES: {
    PRODUCT: 'product',
    REVIEW: 'review',
    POST: 'post'
  },

  // Tipos de Reacción Target (polimórfico)
  REACTION_TARGET_TYPES: {
    PRODUCT: 'product',
    REVIEW: 'review',
    COMMENT: 'comment',
    POST: 'post'
  },

  // Configuración JWT
  JWT: {
    EXPIRES_IN: '7d',
    REFRESH_EXPIRES_IN: '30d'
  },

  // Configuración de Paginación
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12,
    MAX_LIMIT: 100
  },

  // Configuración de Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutos
    MAX_REQUESTS: 100
  },


};

module.exports = CONSTANTS; 