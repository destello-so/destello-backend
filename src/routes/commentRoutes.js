const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticate } = require('../middlewares/auth');
const { validateComment } = require('../middlewares/validation');

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Crear un comentario
 *     tags: [Comentarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [parentType, parentId, text]
 *             properties:
 *               parentType:
 *                 type: string
 *                 enum: [post, product, review]
 *               parentId:
 *                 type: string
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comentario creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */

// Crear comentario (requiere autenticación)
router.post(
  '/',
  authenticate,
  validateComment, // Valida parentType, parentId, text
  commentController.createComment
);

/**
 * @swagger
 * /api/comments/parent/{parentType}/{parentId}:
 *   get:
 *     summary: Obtener comentarios de un parent (post, producto, review)
 *     tags: [Comentarios]
 *     parameters:
 *       - in: path
 *         name: parentType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [post, product, review]
 *       - in: path
 *         name: parentId
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
 *         description: Comentarios obtenidos exitosamente
 *       404:
 *         description: Parent no encontrado
 */

// Obtener comentarios de un parent (post, producto, review)
router.get(
  '/parent/:parentType/:parentId',
  commentController.getCommentsByParent
);

/**
 * @swagger
 * /api/comments/parent/{parentType}/{parentId}/stats:
 *   get:
 *     summary: Obtener estadísticas de comentarios de un parent
 *     tags: [Comentarios]
 *     parameters:
 *       - in: path
 *         name: parentType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [post, product, review]
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estadísticas de comentarios obtenidas exitosamente
 *       404:
 *         description: Parent no encontrado
 */

// Obtener un comentario específico por ID
router.get(
  '/:commentId',
  commentController.getCommentById
);

/**
 * @swagger
 * /api/comments/user/{userId}:
 *   get:
 *     summary: Obtener comentarios de un usuario
 *     tags: [Comentarios]
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
 *         description: Comentarios del usuario obtenidos exitosamente
 *       404:
 *         description: Usuario no encontrado
 */

// Obtener comentarios de un usuario
router.get(
  '/user/:userId',
  commentController.getCommentsByUser
);

/**
 * @swagger
 * /api/comments/recent:
 *   get:
 *     summary: Obtener comentarios recientes
 *     tags: [Comentarios]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Comentarios recientes obtenidos exitosamente
 */

// Obtener estadísticas de comentarios de un parent
router.get(
  '/parent/:parentType/:parentId/stats',
  commentController.getParentCommentStats
);

// Obtener comentarios recientes
router.get(
  '/recent',
  commentController.getRecentComments
);

/**
 * @swagger
 * /api/comments/{commentId}:
 *   get:
 *     summary: Obtener un comentario por ID
 *     tags: [Comentarios]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comentario obtenido exitosamente
 *       404:
 *         description: Comentario no encontrado
 *   put:
 *     summary: Actualizar un comentario (solo autor)
 *     tags: [Comentarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comentario actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Comentario no encontrado
 *   delete:
 *     summary: Eliminar un comentario (solo autor)
 *     tags: [Comentarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comentario eliminado exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Comentario no encontrado
 */

// Actualizar comentario (solo autor)
router.put(
  '/:commentId',
  authenticate,
  validateComment, // Solo valida el campo text
  commentController.updateComment
);

// Eliminar comentario (solo autor)
router.delete(
  '/:commentId',
  authenticate,
  commentController.deleteComment
);

module.exports = router; 