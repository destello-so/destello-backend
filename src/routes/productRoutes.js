const express = require('express');
const router = express.Router();
const { productController } = require('../controllers');
const { validateBody, validateParams, validateQuery, commonSchemas } = require('../middlewares/validation');
const { productSchemas, paramIdSchema } = require('../middlewares/validation');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const customJoi = require('joi');

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear nuevo producto
 *     description: Crea un nuevo producto en el sistema (solo admin)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso restringido a administradores
 */
router.post('/', 
  authenticate,
  requireAdmin,
  validateBody(productSchemas.create),
  productController.create
);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtener productos
 *     description: Obtiene lista de productos con filtros y paginación
 *     tags: [Productos]
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
 *           default: 12
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente
 */
router.get('/', 
  validateQuery(productSchemas.query),
  productController.getProducts
);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     description: Obtiene un producto específico por su ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto obtenido exitosamente
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:id', 
  validateParams(paramIdSchema),
  productController.getById
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Actualizar producto
 *     description: Actualiza un producto existente (solo admin)
 *     tags: [Productos]
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
 *             $ref: '#/components/schemas/UpdateProductRequest'
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso restringido a administradores
 *       404:
 *         description: Producto no encontrado
 */
router.put('/:id', 
  authenticate,
  requireAdmin,
  validateParams(paramIdSchema),
  validateBody(productSchemas.update),
  productController.update
);

/**
 * @swagger
 * /api/products/{id}/stock:
 *   patch:
 *     summary: Actualizar stock
 *     description: Actualiza el stock de un producto (solo admin)
 *     tags: [Productos]
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
 *             type: object
 *             properties:
 *               qtyChange:
 *                 type: number
 *                 description: Cambio en cantidad (positivo o negativo)
 *                 example: 10
 *               type:
 *                 type: string
 *                 enum: [restock, sale, adjustment]
 *                 example: restock
 *               note:
 *                 type: string
 *                 example: 'Reposición de stock inicial'
 *     responses:
 *       200:
 *         description: Stock actualizado exitosamente
 *       400:
 *         description: Stock insuficiente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso restringido a administradores
 *       404:
 *         description: Producto no encontrado
 */
router.patch('/:id/stock', 
  authenticate,
  requireAdmin,
  validateParams(paramIdSchema),
  validateBody(customJoi.object({
    qtyChange: customJoi.number().required(),
    type: customJoi.string().valid('restock', 'sale', 'adjustment').required(),
    note: customJoi.string().optional()
  })),
  productController.updateStock
);

/**
 * @swagger
 * /api/products/{id}/stock:
 *   get:
 *     summary: Verificar stock
 *     description: Verifica la disponibilidad de stock para un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: quantity
 *         required: true
 *         schema:
 *           type: integer
 *           example: 5
 *     responses:
 *       200:
 *         description: Stock verificado exitosamente
 *       400:
 *         description: Stock insuficiente
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:id/stock', 
  validateParams(paramIdSchema),
  validateQuery(customJoi.object({
    quantity: customJoi.number().integer().min(1).required()
  })),
  productController.checkStock
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Eliminar producto
 *     description: Elimina un producto (soft delete - solo admin)
 *     tags: [Productos]
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
 *         description: Producto eliminado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso restringido a administradores
 *       404:
 *         description: Producto no encontrado
 */
router.delete('/:id', 
  authenticate,
  requireAdmin,
  validateParams(paramIdSchema),
  productController.delete
);

module.exports = router;