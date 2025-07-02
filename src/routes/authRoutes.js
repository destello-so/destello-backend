const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { validateBody } = require('../middlewares/validation');
const { userSchemas } = require('../middlewares/validation');
const { authenticate } = require('../middlewares/auth');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     description: Crea una nueva cuenta de usuario en el sistema
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             firstName: "Juan"
 *             lastName: "Pérez"
 *             email: "juan@example.com"
 *             password: "password123"
 *             phone: "999888777"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: "Usuario registrado exitosamente"
 *               data:
 *                 user:
 *                   _id: "507f1f77bcf86cd799439011"
 *                   firstName: "Juan"
 *                   lastName: "Pérez"
 *                   email: "juan@example.com"
 *                   role: "user"
 *                   isActive: true
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: object
 *                       properties:
 *                         details:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ValidationError'
 *             example:
 *               success: false
 *               error:
 *                 message: "Datos de entrada inválidos"
 *                 details:
 *                   - field: "email"
 *                     message: "El email es requerido"
 *                     value: ""
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *       409:
 *         description: El email ya está registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 message: "El email ya está registrado"
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', 
  validateBody(userSchemas.register),
  authController.register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica un usuario y retorna un token JWT
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "juan@example.com"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: "Login exitoso"
 *               data:
 *                 user:
 *                   _id: "507f1f77bcf86cd799439011"
 *                   firstName: "Juan"
 *                   lastName: "Pérez"
 *                   email: "juan@example.com"
 *                   role: "user"
 *                   isActive: true
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: object
 *                       properties:
 *                         details:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 message: "Credenciales inválidas"
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', 
  validateBody(userSchemas.login),
  authController.login
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     description: Retorna los datos del usuario actualmente autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: "Perfil obtenido exitosamente"
 *               data:
 *                 user:
 *                   _id: "507f1f77bcf86cd799439011"
 *                   firstName: "Juan"
 *                   lastName: "Pérez"
 *                   email: "juan@example.com"
 *                   role: "user"
 *                   isActive: true
 *                   addresses: []
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: No autorizado - Token requerido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 message: "Token de acceso requerido"
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/me', 
  authenticate,
  authController.getProfile
);

module.exports = router;