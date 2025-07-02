const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

// Importar configuraciones
const { connectDB, CONSTANTS } = require('./config');

// Importar configuración de Swagger
const swaggerSpecs = require('./config/swagger');

// Importar middlewares
const responseFormatter = require('./middlewares/responseFormatter');
const { errorHandler } = require('./middlewares/errorHandler');

// Importar rutas
const { authRoutes, userRoutes, productRoutes, categoryRoutes, cartRoutes, orderRoutes, postRoutes,wishlistRoutes,followRoutes,reactionRoutes,commentRoutes,reviewRoutes } = require('./routes');

// Crear app Express
const app = express();

// Conectar a MongoDB
connectDB();

// Configuración de Rate Limiting
const limiter = rateLimit({
  windowMs: CONSTANTS.RATE_LIMIT.WINDOW_MS,
  max: CONSTANTS.RATE_LIMIT.MAX_REQUESTS,
  message: {
    success: false,
    error: {
      message: 'Demasiadas solicitudes, intenta más tarde'
    }
  }
});

// Middlewares de seguridad
app.use(helmet());
app.use(cors());
app.use(limiter);

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging simple
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Middleware de formateo de respuestas
app.use(responseFormatter);

// Documentación de la API con Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Destello Perú API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true
  }
}));

// Ruta para obtener la especificación OpenAPI en JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpecs);
});

// Ruta de salud
app.get('/health', (req, res) => {
  res.success({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  }, 'API funcionando correctamente');
});

// Ruta raíz con información de la API
app.get('/', (req, res) => {
  res.success({
    name: 'Destello Perú API',
    version: '1.0.0',
    description: 'API completa para Destello Perú - E-commerce con funcionalidades de red social',
    documentation: '/api-docs',
    health: '/health',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      categories: '/api/categories',
      cart: '/api/cart',
      orders: '/api/orders',
      posts: '/api/posts',
      wishlist: '/api/wishlist',
      follow: '/api/follow',
      reactions: '/api/reactions',
      comments: '/api/comments',
      reviews: '/api/reviews'
    }
  }, 'Bienvenido a la API de Destello Perú');
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/reviews', reviewRoutes);

// Ruta 404 para rutas no encontradas
app.use('*', (req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Configurar puerto
const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 URL: http://20.245.229.182:${PORT}`);
  console.log(`📚 Documentación: http://20.245.229.182:${PORT}/api-docs`);
  console.log(`🏥 Health Check: http://20.245.229.182:${PORT}/health`);
  console.log(`🎯 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
