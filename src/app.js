const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const routes = require('./routes');
const dotenv = require('dotenv');

// Importar middlewares
const responseFormatter = require('./middlewares/responseFormatter');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

dotenv.config();

const app = express();

// Permitir acceso desde cualquier origen (CORS abierto)
app.use(cors());

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

// Conectar a MongoDB
const connectDB = require('./config/database');
connectDB();

// ====== SWAGGER UI CON CONFIGURACIÓN CORREGIDA ======
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  // Configuración básica
  swaggerOptions: {
    url: '/api-docs.json',
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true,
    persistAuthorization: true
  },
  // CSS personalizado (solo ocultar elementos)
  customCss: '.swagger-ui .topbar { display: none }',
  // JavaScript personalizado (CORREGIDO)
  customSiteTitle: 'Destello Perú API - HTTP Only',
  customfavIcon: '/favicon.ico'
}));

// Ruta para obtener la especificación OpenAPI en JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpecs);
});

// ====== MIDDLEWARE PARA FORZAR HTTP ======
// Agregar esto ANTES de Swagger UI
app.use('/api-docs', (req, res, next) => {
  // Forzar HTTP en headers
  res.setHeader('X-Forwarded-Proto', 'http');
  res.setHeader('X-Forwarded-Ssl', 'off');
  next();
});

// ====== MIDDLEWARE GLOBAL PARA FORZAR HTTP ======
app.use((req, res, next) => {
  // Solo para peticiones de la API (no para Swagger UI)
  if (req.path.startsWith('/api/') && !req.path.startsWith('/api-docs')) {
    res.setHeader('X-Forwarded-Proto', 'http');
    res.setHeader('X-Forwarded-Ssl', 'off');
  }
  next();
});

// Health check simple
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

// ====== TUS RUTAS MODULARES ======
app.use('/api/auth', routes.authRoutes);
app.use('/api/users', routes.userRoutes);
app.use('/api/products', routes.productRoutes);
app.use('/api/categories', routes.categoryRoutes);
app.use('/api/cart', routes.cartRoutes);
app.use('/api/orders', routes.orderRoutes);
app.use('/api/posts', routes.postRoutes);
app.use('/api/wishlist', routes.wishlistRoutes);
app.use('/api/follow', routes.followRoutes);
app.use('/api/reactions', routes.reactionRoutes);
app.use('/api/comments', routes.commentRoutes);
app.use('/api/reviews', routes.reviewRoutes);

// ====== MIDDLEWARES DE ERROR (DEBEN IR AL FINAL) ======
// Middleware para rutas no encontradas (404)
app.use(notFound);

// Middleware de manejo de errores global
app.use(errorHandler);

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log(`�� Swagger docs: http://20.245.229.182:${PORT}/api-docs`);
  console.log(`�� Health Check: http://20.245.229.182:${PORT}/health`);
  console.log(`🎯 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;