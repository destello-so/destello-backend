const express = require('express');
const router = express.Router();
const reactionController = require('../controllers/reactionController');
const { authenticate } = require('../middlewares/auth');
const { validateReaction } = require('../middlewares/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Reaction:
 *       type: object
 *       required:
 *         - targetType
 *         - targetId
 *         - reactionType
 *       properties:
 *         targetType:
 *           type: string
 *           enum: [post, comment, review, product]
 *           description: Tipo de contenido al que se reacciona
 *         targetId:
 *           type: string
 *           description: ID del contenido al que se reacciona
 *         reactionType:
 *           type: string
 *           enum: [like, love, helpful, dislike, laugh, wow]
 *           description: Tipo de reacción
 *     ReactionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             action:
 *               type: string
 *               enum: [created, updated, removed]
 *             reaction:
 *               type: object
 *               nullable: true
 */

/**
 * @swagger
 * /api/reactions:
 *   post:
 *     summary: Crear o actualizar una reacción
 *     tags: [Reacciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reaction'
 *     responses:
 *       200:
 *         description: Reacción creada o actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReactionResponse'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Target no encontrado
 */
router.post('/', 
  authenticate, 
  validateReaction, 
  reactionController.createOrUpdateReaction
);

/**
 * @swagger
 * /api/reactions/user/me:
 *   get:
 *     summary: Obtener mis reacciones
 *     tags: [Reacciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Mis reacciones obtenidas exitosamente
 *       401:
 *         description: No autorizado
 */
router.get('/user/me', 
  authenticate, 
  reactionController.getMyReactions
);

/**
 * @swagger
 * /api/reactions/user/{userId}:
 *   get:
 *     summary: Obtener reacciones de un usuario específico
 *     tags: [Reacciones]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Reacciones del usuario obtenidas exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/user/:userId', 
  reactionController.getUserReactions
);

/**
 * @swagger
 * /api/reactions/posts/popular:
 *   get:
 *     summary: Obtener posts más reaccionados
 *     tags: [Reacciones]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: timeFrame
 *         schema:
 *           type: string
 *           enum: [7d, 30d]
 *           default: 7d
 *     responses:
 *       200:
 *         description: Posts más reaccionados obtenidos exitosamente
 *       400:
 *         description: Parámetros inválidos
 */
router.get('/posts/popular', 
  reactionController.getMostReactedPosts
);

/**
 * @swagger
 * /api/reactions/recent:
 *   get:
 *     summary: Obtener reacciones recientes
 *     tags: [Reacciones]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Reacciones recientes obtenidas exitosamente
 */
router.get('/recent', 
  reactionController.getRecentReactions
);

/**
 * @swagger
 * /api/reactions/summary:
 *   get:
 *     summary: Obtener resumen de reacciones para dashboard
 *     tags: [Reacciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen de reacciones obtenido exitosamente
 *       401:
 *         description: No autorizado
 */
router.get('/summary', 
  authenticate, 
  reactionController.getReactionSummary
);

/**
 * @swagger
 * /api/reactions/{targetType}/{targetId}/stats:
 *   get:
 *     summary: Obtener estadísticas de reacciones de un target
 *     tags: [Reacciones]
 *     parameters:
 *       - in: path
 *         name: targetType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [post, comment, review, product]
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       404:
 *         description: Target no encontrado
 */
router.get('/:targetType/:targetId/stats', 
  reactionController.getTargetReactionStats
);

/**
 * @swagger
 * /api/reactions/{targetType}/{targetId}/check:
 *   get:
 *     summary: Verificar si el usuario ha reaccionado a un target
 *     tags: [Reacciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [post, comment, review, product]
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estado de reacción verificado exitosamente
 *       401:
 *         description: No autorizado
 */
router.get('/:targetType/:targetId/check', 
  authenticate, 
  reactionController.checkUserReaction
);

/**
 * @swagger
 * /api/reactions/{targetType}/{targetId}/users:
 *   get:
 *     summary: Obtener usuarios que reaccionaron a un target
 *     tags: [Reacciones]
 *     parameters:
 *       - in: path
 *         name: targetType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [post, comment, review, product]
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: reactionType
 *         schema:
 *           type: string
 *           enum: [like, love, helpful, dislike, laugh, wow]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Usuarios obtenidos exitosamente
 *       404:
 *         description: Target no encontrado
 */
router.get('/:targetType/:targetId/users', 
  reactionController.getUsersWhoReacted
);

/**
 * @swagger
 * /api/reactions/{targetType}/{targetId}:
 *   get:
 *     summary: Obtener reacciones de un target específico
 *     tags: [Reacciones]
 *     parameters:
 *       - in: path
 *         name: targetType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [post, comment, review, product]
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Reacciones obtenidas exitosamente
 *       404:
 *         description: Target no encontrado
 */
router.get('/:targetType/:targetId', 
  reactionController.getTargetReactions
);

/**
 * @swagger
 * /api/reactions/{targetType}/{targetId}:
 *   delete:
 *     summary: Eliminar una reacción
 *     tags: [Reacciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [post, comment, review, product]
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reacción eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Reacción no encontrada
 */
router.delete('/:targetType/:targetId', 
  authenticate, 
  reactionController.removeReaction
);

module.exports = router;