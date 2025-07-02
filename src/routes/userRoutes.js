const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const { authenticate } = require('../middlewares/auth');
const { validateBody, validateParams } = require('../middlewares/validation');
const { userSchemas, paramIdSchema } = require('../middlewares/validation');

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Obtener perfil completo del usuario
 *     description: Retorna el perfil completo del usuario autenticado incluyendo direcciones
 *     tags: [Usuarios]
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
 *                   addresses:
 *                     - _id: "507f1f77bcf86cd799439012"
 *                       street: "Av. Arequipa 123"
 *                       city: "Lima"
 *                       state: "Lima"
 *                       zipCode: "15001"
 *                       country: "Perú"
 *                       isDefault: true
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
router.get('/profile', userController.getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Actualizar perfil del usuario
 *     description: Actualiza los datos personales del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             firstName: "Juan Carlos"
 *             lastName: "Pérez García"
 *             phone: "999888777"
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
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
 *               message: "Perfil actualizado exitosamente"
 *               data:
 *                 user:
 *                   _id: "507f1f77bcf86cd799439011"
 *                   firstName: "Juan Carlos"
 *                   lastName: "Pérez García"
 *                   email: "juan@example.com"
 *                   phone: "999888777"
 *                   role: "user"
 *                   isActive: true
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
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
router.put('/profile', 
  validateBody(userSchemas.updateProfile),
  userController.updateProfile
);

/**
 * @swagger
 * /api/users/addresses:
 *   get:
 *     summary: Obtener direcciones del usuario
 *     description: Retorna todas las direcciones del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Direcciones obtenidas exitosamente
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
 *                         addresses:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Address'
 *             example:
 *               success: true
 *               message: "Direcciones obtenidas exitosamente"
 *               data:
 *                 addresses:
 *                   - _id: "507f1f77bcf86cd799439012"
 *                     street: "Av. Arequipa 123"
 *                     city: "Lima"
 *                     state: "Lima"
 *                     zipCode: "15001"
 *                     country: "Perú"
 *                     isDefault: true
 *                   - _id: "507f1f77bcf86cd799439013"
 *                     street: "Jr. Tacna 456"
 *                     city: "Arequipa"
 *                     state: "Arequipa"
 *                     zipCode: "04001"
 *                     country: "Perú"
 *                     isDefault: false
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
router.get('/addresses', userController.getAddresses);

/**
 * @swagger
 * /api/users/addresses:
 *   post:
 *     summary: Agregar nueva dirección
 *     description: Agrega una nueva dirección al usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Address'
 *           example:
 *             street: "Av. Arequipa 123"
 *             city: "Lima"
 *             state: "Lima"
 *             zipCode: "15001"
 *             country: "Perú"
 *             isDefault: true
 *     responses:
 *       201:
 *         description: Dirección agregada exitosamente
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
 *                         address:
 *                           $ref: '#/components/schemas/Address'
 *                         addresses:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Address'
 *             example:
 *               success: true
 *               message: "Dirección agregada exitosamente"
 *               data:
 *                 address:
 *                   _id: "507f1f77bcf86cd799439012"
 *                   street: "Av. Arequipa 123"
 *                   city: "Lima"
 *                   state: "Lima"
 *                   zipCode: "15001"
 *                   country: "Perú"
 *                   isDefault: true
 *                 addresses:
 *                   - _id: "507f1f77bcf86cd799439012"
 *                     street: "Av. Arequipa 123"
 *                     city: "Lima"
 *                     state: "Lima"
 *                     zipCode: "15001"
 *                     country: "Perú"
 *                     isDefault: true
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
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
router.post('/addresses', 
  validateBody(userSchemas.address),
  userController.addAddress
);

/**
 * @swagger
 * /api/users/addresses/{id}:
 *   put:
 *     summary: Actualizar dirección específica
 *     description: Actualiza una dirección específica del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: ID de la dirección a actualizar
 *         example: "507f1f77bcf86cd799439012"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Address'
 *           example:
 *             street: "Av. Arequipa 456"
 *             city: "Lima"
 *             state: "Lima"
 *             zipCode: "15002"
 *             country: "Perú"
 *             isDefault: false
 *     responses:
 *       200:
 *         description: Dirección actualizada exitosamente
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
 *                         address:
 *                           $ref: '#/components/schemas/Address'
 *                         addresses:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Address'
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
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario o dirección no encontrada
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
router.put('/addresses/:id', 
  validateParams(paramIdSchema),
  validateBody(userSchemas.address),
  userController.updateAddress
);

/**
 * @swagger
 * /api/users/addresses/{id}:
 *   delete:
 *     summary: Eliminar dirección específica
 *     description: Elimina una dirección específica del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: ID de la dirección a eliminar
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Dirección eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Dirección eliminada exitosamente"
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: No se puede eliminar la única dirección
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error:
 *                 message: "No se puede eliminar la única dirección"
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario o dirección no encontrada
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
router.delete('/addresses/:id', 
  validateParams(paramIdSchema),
  userController.deleteAddress
);

module.exports = router;