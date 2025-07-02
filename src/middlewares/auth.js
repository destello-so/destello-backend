const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware para autenticar usuario
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token de acceso requerido'
        }
      });
    }

    const token = authHeader.substring(7); // Remover 'Bearer '
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Usuario no encontrado'
        }
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Usuario desactivado'
        }
      });
    }

    // Agregar usuario a request
    req.user = user;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token inválido'
        }
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token expirado'
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        message: 'Error de autenticación'
      }
    });
  }
};

// Middleware para requerir usuario autenticado
const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Acceso no autorizado'
      }
    });
  }
  next();
};

// Middleware para requerir rol admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Acceso no autorizado'
      }
    });
  }

  if (!req.user.isAdmin()) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Acceso restringido a administradores'
      }
    });
  }
  
  next();
};

// Middleware opcional de autenticación (no falla si no hay token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continúa sin usuario
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (user && user.isActive) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Si hay error en token opcional, simplemente continúa sin usuario
    next();
  }
};

module.exports = {
  authenticate,
  requireUser,
  requireAdmin,
  optionalAuth
}; 