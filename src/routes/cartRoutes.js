const express = require('express');
const router = express.Router();
const { cartController } = require('../controllers');
const { authenticate } = require('../middlewares/auth');
const { validateBody } = require('../middlewares/validation');
const customJoi = require('joi');

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Obtener el carrito del usuario autenticado
 *     description: Retorna el carrito actual del usuario autenticado.
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito obtenido exitosamente
 */
// Obtener el carrito del usuario autenticado
router.get('/', authenticate, cartController.getCart);

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Agregar producto al carrito
 *     description: Agrega un producto al carrito del usuario autenticado.
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddCartItemRequest'
 *     responses:
 *       200:
 *         description: Producto agregado al carrito
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Producto no encontrado
 */
// Agregar producto al carrito
router.post(
  '/add',
  authenticate,
  validateBody(
    customJoi.object({
      productId: customJoi.string().hex().length(24).required(),
      quantity: customJoi.number().integer().min(1).required()
    })
  ),
  cartController.addItem
);

/**
 * @swagger
 * /api/cart/update:
 *   put:
 *     summary: Actualizar cantidad de un producto en el carrito
 *     description: Actualiza la cantidad de un producto en el carrito del usuario autenticado.
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCartItemRequest'
 *     responses:
 *       200:
 *         description: Cantidad actualizada en el carrito
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Producto no encontrado
 */
// Actualizar cantidad de un producto en el carrito
router.put(
  '/update',
  authenticate,
  validateBody(
    customJoi.object({
      productId: customJoi.string().hex().length(24).required(),
      quantity: customJoi.number().integer().min(1).required()
    })
  ),
  cartController.updateItem
);

/**
 * @swagger
 * /api/cart/remove:
 *   delete:
 *     summary: Eliminar producto del carrito
 *     description: Elimina un producto del carrito del usuario autenticado.
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RemoveCartItemRequest'
 *     responses:
 *       200:
 *         description: Producto eliminado del carrito
 *       404:
 *         description: Producto no encontrado
 */
// Eliminar producto del carrito
router.delete(
  '/remove',
  authenticate,
  validateBody(
    customJoi.object({
      productId: customJoi.string().hex().length(24).required()
    })
  ),
  cartController.removeItem
);

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Vaciar el carrito
 *     description: Elimina todos los productos del carrito del usuario autenticado.
 *     tags: [Carrito]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito vaciado exitosamente
 */
// Vaciar el carrito
router.delete('/clear', authenticate, cartController.clearCart);

module.exports = router;