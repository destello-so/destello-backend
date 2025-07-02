const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middlewares/auth');
const { validateReview } = require('../middlewares/validation');

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Crear una reseña para un producto
 *     tags: [Reseñas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, rating, title, body]
 *             properties:
 *               productId:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reseña creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/', authenticate, validateReview, reviewController.createReview);

/**
 * @swagger
 * /api/reviews/product/{productId}:
 *   get:
 *     summary: Obtener reseñas de un producto
 *     tags: [Reseñas]
 *     parameters:
 *       - in: path
 *         name: productId
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
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, rating, helpful, newest, oldest]
 *           default: createdAt
 *     responses:
 *       200:
 *         description: Reseñas del producto obtenidas exitosamente
 *       404:
 *         description: Producto no encontrado
 */
router.get('/product/:productId', reviewController.getProductReviews);

/**
 * @swagger
 * /api/reviews/product/{productId}/stats:
 *   get:
 *     summary: Obtener estadísticas de reseñas de un producto
 *     tags: [Reseñas]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estadísticas de reseñas obtenidas exitosamente
 *       404:
 *         description: Producto no encontrado
 */
router.get('/product/:productId/stats', reviewController.getProductReviewStats);

/**
 * @swagger
 * /api/reviews/user/{userId}:
 *   get:
 *     summary: Obtener reseñas de un usuario
 *     tags: [Reseñas]
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
 *           default: 10
 *     responses:
 *       200:
 *         description: Reseñas del usuario obtenidas exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/user/:userId', reviewController.getUserReviews);

/**
 * @swagger
 * /api/reviews/search:
 *   get:
 *     summary: Buscar reseñas por contenido
 *     tags: [Reseñas]
 *     parameters:
 *       - in: query
 *         name: searchTerm
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
 *           default: 10
 *     responses:
 *       200:
 *         description: Resultados de búsqueda de reseñas obtenidos exitosamente
 */
router.get('/search', reviewController.searchReviews);

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   get:
 *     summary: Obtener una reseña por ID
 *     tags: [Reseñas]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reseña obtenida exitosamente
 *       404:
 *         description: Reseña no encontrada
 *   put:
 *     summary: Actualizar una reseña (solo autor)
 *     tags: [Reseñas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reseña actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Reseña no encontrada
 *   delete:
 *     summary: Eliminar una reseña (solo autor)
 *     tags: [Reseñas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reseña eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Reseña no encontrada
 */
router.get('/:reviewId', reviewController.getReviewById);
router.put('/:reviewId', authenticate, validateReview, reviewController.updateReview);
router.delete('/:reviewId', authenticate, reviewController.deleteReview);

/**
 * @swagger
 * /api/reviews/{reviewId}/helpful:
 *   post:
 *     summary: Marcar una reseña como útil
 *     tags: [Reseñas]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reseña marcada como útil
 *       404:
 *         description: Reseña no encontrada
 */
router.post('/:reviewId/helpful', reviewController.markAsHelpful);

module.exports = router; 