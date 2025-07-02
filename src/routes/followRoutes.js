const express = require('express');
const router = express.Router();
const { followController } = require('../controllers');
const { authenticate } = require('../middlewares/auth');
const { validateBody, validateQuery, validateParams } = require('../middlewares/validation');
const customJoi = require('joi');

/**
 * @swagger
 * /api/follow:
 *   post:
 *     summary: Seguir a un usuario
 *     tags: [Seguimientos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FollowUserRequest'
 *     responses:
 *       201:
 *         description: Usuario seguido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Follow'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 */
router.post('/', authenticate, validateBody(customJoi.object({
  targetUserId: customJoi.string().hex().length(24).required()
})), followController.followUser);

/**
 * @swagger
 * /api/follow:
 *   delete:
 *     summary: Dejar de seguir a un usuario
 *     tags: [Seguimientos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UnfollowUserRequest'
 *     responses:
 *       200:
 *         description: Dejaste de seguir al usuario exitosamente
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
 *                         message:
 *                           type: string
 *                           example: "Dejaste de seguir al usuario exitosamente"
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/', authenticate, validateBody(customJoi.object({
  targetUserId: customJoi.string().hex().length(24).required()
})), followController.unfollowUser);

/**
 * @swagger
 * /api/follow/check:
 *   get:
 *     summary: Verificar si sigues a un usuario
 *     tags: [Seguimientos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: string
 *           example: "66a1b2c3d4e5f6a7b8c9d0e1"
 *         description: ID del usuario a verificar
 *     responses:
 *       200:
 *         description: Resultado de la verificación
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/FollowCheckResponse'
 *       400:
 *         description: ID de usuario inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/check', authenticate, validateQuery(customJoi.object({
  targetUserId: customJoi.string().hex().length(24).required()
})), followController.isFollowing);

/**
 * @swagger
 * /api/follow/following:
 *   get:
 *     summary: Obtener usuarios que sigues
 *     tags: [Seguimientos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número de elementos por página
 *     responses:
 *       200:
 *         description: Usuarios seguidos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/FollowListResponse'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/following', authenticate, followController.getFollowing);

/**
 * @swagger
 * /api/follow/followers:
 *   get:
 *     summary: Obtener tus seguidores
 *     tags: [Seguimientos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número de elementos por página
 *     responses:
 *       200:
 *         description: Seguidores obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/FollowListResponse'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/followers', authenticate, followController.getFollowers);

/**
 * @swagger
 * /api/follow/users/{userId}/following:
 *   get:
 *     summary: Obtener usuarios que sigue un usuario específico
 *     tags: [Seguimientos]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: "66a1b2c3d4e5f6a7b8c9d0e1"
 *         description: ID del usuario
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número de elementos por página
 *     responses:
 *       200:
 *         description: Usuarios seguidos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/FollowListResponse'
 *       400:
 *         description: ID de usuario inválido
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
 */
router.get('/users/:userId/following', validateParams(customJoi.object({
  userId: customJoi.string().hex().length(24).required()
})), followController.getUserFollowing);

/**
 * @swagger
 * /api/follow/users/{userId}/followers:
 *   get:
 *     summary: Obtener seguidores de un usuario específico
 *     tags: [Seguimientos]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: "66a1b2c3d4e5f6a7b8c9d0e1"
 *         description: ID del usuario
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número de elementos por página
 *     responses:
 *       200:
 *         description: Seguidores obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/FollowListResponse'
 *       400:
 *         description: ID de usuario inválido
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
 */
router.get('/users/:userId/followers', validateParams(customJoi.object({
  userId: customJoi.string().hex().length(24).required()
})), followController.getUserFollowers);

/**
 * @swagger
 * /api/follow/stats:
 *   get:
 *     summary: Obtener estadísticas de seguimiento propias
 *     tags: [Seguimientos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/FollowStats'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/stats', authenticate, followController.getFollowStats);

/**
 * @swagger
 * /api/follow/users/{userId}/stats:
 *   get:
 *     summary: Obtener estadísticas de seguimiento de un usuario específico
 *     tags: [Seguimientos]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: "66a1b2c3d4e5f6a7b8c9d0e1"
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/FollowStats'
 *       400:
 *         description: ID de usuario inválido
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
 */
router.get('/users/:userId/stats', validateParams(customJoi.object({
  userId: customJoi.string().hex().length(24).required()
})), followController.getUserFollowStats);

/**
 * @swagger
 * /api/follow/suggestions:
 *   get:
 *     summary: Obtener sugerencias de usuarios para seguir
 *     tags: [Seguimientos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de sugerencias
 *     responses:
 *       200:
 *         description: Sugerencias obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/suggestions', authenticate, followController.getFollowSuggestions);

module.exports = router;