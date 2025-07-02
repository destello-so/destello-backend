const express = require('express');
const router = express.Router();
const { wishlistController } = require('../controllers');
const { authenticate } = require('../middlewares/auth');
const { validateBody, validateQuery } = require('../middlewares/validation');
const customJoi = require('joi');

/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Obtener la lista de deseos del usuario autenticado
 *     tags: [Lista de Deseos]
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
 *         description: Lista de deseos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Wishlist'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authenticate, wishlistController.getWishlist);

/**
 * @swagger
 * /api/wishlist/add:
 *   post:
 *     summary: Agregar producto a la lista de deseos
 *     tags: [Lista de Deseos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddWishlistItemRequest'
 *     responses:
 *       201:
 *         description: Producto agregado a la lista de deseos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Wishlist'
 *       400:
 *         description: El producto ya está en la lista de deseos
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
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/add', authenticate, validateBody(customJoi.object({
  productId: customJoi.string().hex().length(24).required()
})), wishlistController.addToWishlist);

/**
 * @swagger
 * /api/wishlist/remove:
 *   delete:
 *     summary: Remover producto de la lista de deseos
 *     tags: [Lista de Deseos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RemoveWishlistItemRequest'
 *     responses:
 *       200:
 *         description: Producto removido de la lista de deseos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Wishlist'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Producto no encontrado en la lista de deseos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/remove', authenticate, validateBody(customJoi.object({
  productId: customJoi.string().hex().length(24).required()
})), wishlistController.removeFromWishlist);

/**
 * @swagger
 * /api/wishlist/clear:
 *   delete:
 *     summary: Limpiar la lista de deseos
 *     tags: [Lista de Deseos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de deseos limpiada exitosamente
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
 *                           example: "Lista de deseos limpiada exitosamente"
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/clear', authenticate, wishlistController.clearWishlist);

/**
 * @swagger
 * /api/wishlist/check:
 *   get:
 *     summary: Verificar si un producto está en la lista de deseos
 *     tags: [Lista de Deseos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           example: "66a1b2c3d4e5f6a7b8c9d0e1"
 *         description: ID del producto a verificar
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
 *                       $ref: '#/components/schemas/WishlistCheckResponse'
 *       400:
 *         description: ID de producto inválido
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
  productId: customJoi.string().hex().length(24).required()
})), wishlistController.isInWishlist);

/**
 * @swagger
 * /api/wishlist/stats:
 *   get:
 *     summary: Obtener estadísticas de la lista de deseos
 *     tags: [Lista de Deseos]
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
 *                       $ref: '#/components/schemas/WishlistStats'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/stats', authenticate, wishlistController.getWishlistStats);

module.exports = router;