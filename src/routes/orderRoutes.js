const express = require('express');
const router = express.Router();
const { orderController } = require('../controllers');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const { validateBody, validateParams } = require('../middlewares/validation');
const customJoi = require('joi');

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Crear una orden
 *     description: Crea una orden de compra a partir del carrito del usuario autenticado.
 *     tags: [Órdenes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 *       400:
 *         description: Datos inválidos
 */
// Esquema correcto para crear una orden
const createOrderSchema = customJoi.object({
  address: customJoi.object({
    street: customJoi.string().required(),
    city: customJoi.string().required(),
    state: customJoi.string().required(),
    zipCode: customJoi.string().required(),
    country: customJoi.string().required()
  }).required(),
  paymentMethod: customJoi.string().required()
});

// Crear una orden (usuario autenticado)
router.post(
  '/',
  authenticate,
  validateBody(createOrderSchema),
  orderController.create
);

/**
 * @swagger
 * /api/orders/my:
 *   get:
 *     summary: Listar mis órdenes
 *     description: Obtiene todas las órdenes del usuario autenticado.
 *     tags: [Órdenes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Órdenes obtenidas exitosamente
 */
// Listar órdenes del usuario autenticado
router.get('/my', authenticate, orderController.getMyOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Obtener orden por ID
 *     description: Obtiene una orden específica por su ID (usuario dueño o admin).
 *     tags: [Órdenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orden obtenida exitosamente
 *       403:
 *         description: No tienes acceso a esta orden
 *       404:
 *         description: Orden no encontrada
 */
// Obtener una orden por ID (usuario o admin)
router.get(
  '/:id',
  authenticate,
  validateParams(
    customJoi.object({
      id: customJoi.string().hex().length(24).required()
    })
  ),
  orderController.getById
);

/**
 * @swagger
 * /api/orders/admin/all:
 *   get:
 *     summary: Listar todas las órdenes (admin)
 *     description: Obtiene todas las órdenes del sistema (solo admin).
 *     tags: [Órdenes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Órdenes obtenidas exitosamente
 */
// Listar todas las órdenes (solo admin)
router.get('/admin/all', authenticate, requireAdmin, orderController.getAll);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Actualizar estado de la orden
 *     description: Actualiza el estado de una orden (solo admin).
 *     tags: [Órdenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderStatusRequest'
 *     responses:
 *       200:
 *         description: Estado de la orden actualizado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Orden no encontrada
 */
// Actualizar estado de la orden (solo admin)
router.patch(
  '/:id/status',
  authenticate,
  requireAdmin,
  validateParams(
    customJoi.object({
      id: customJoi.string().hex().length(24).required()
    })
  ),
  validateBody(
    customJoi.object({
      status: customJoi.string().valid('pending', 'paid', 'shipped', 'delivered', 'cancelled').required()
    })
  ),
  orderController.updateStatus
);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     summary: Cancelar una orden
 *     description: Cancela una orden (usuario dueño o admin).
 *     tags: [Órdenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orden cancelada exitosamente
 *       403:
 *         description: No tienes acceso a cancelar esta orden
 *       404:
 *         description: Orden no encontrada
 */
// Cancelar una orden (usuario o admin)
router.patch(
  '/:id/cancel',
  authenticate,
  validateParams(
    customJoi.object({
      id: customJoi.string().hex().length(24).required()
    })
  ),
  orderController.cancel
);

module.exports = router;