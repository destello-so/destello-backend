const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
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

// Middlewares de seguridad con configuración permisiva
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "http:"],
      styleSrc: ["'self'", "'unsafe-inline'", "http://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "http:", "https:"],
      connectSrc: ["'self'", "http:", "https:"],
      fontSrc: ["'self'", "http://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
}));

// Configuración de CORS más permisiva
app.use(cors({
  origin: '*', // Permite cualquier origen
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: false,
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

app.use(limiter);

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware para headers adicionales
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware de logging simple
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Middleware de formateo de respuestas
app.use(responseFormatter);

// Servir archivos estáticos
app.use(express.static('public'));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Destello Perú API',
      version: '1.0.0',
      description: 'API completa para Destello Perú - E-commerce con funcionalidades de red social',
    },
    servers: [{ url: 'http://20.245.229.182:3000', description: 'Servidor de Destello Perú' }],
  },
  apis: ['./src/routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Documentación de la API con Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
  console.log(`�� Servidor corriendo en puerto ${PORT}`);
  console.log(`�� URL: http://20.245.229.182:${PORT}`);
  console.log(`📚 Documentación: http://20.245.229.182:${PORT}/api-docs`);
  console.log(`�� Health Check: http://20.245.229.182:${PORT}/health`);
  console.log(`🎯 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;