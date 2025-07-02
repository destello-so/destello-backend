const express = require('express');
const router = express.Router();
const { categoryController } = require('../controllers');
const { validateBody, validateParams } = require('../middlewares/validation');
const { requireAdmin, authenticate } = require('../middlewares/auth');
const { commonSchemas } = require('../middlewares/validation');

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Crear nueva categoría
 *     description: Crea una nueva categoría (solo admin)
 *     tags: [Categorías]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryRequest'
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso restringido a administradores
 */
// Esquema simple para categoría
const categorySchema = {
  name: { type: 'string', required: true, example: 'Ropa' },
  description: { type: 'string', example: 'Categoría de ropa y accesorios' }
};

router.post(
  '/',
  authenticate,
  requireAdmin,
  validateBody(require('../middlewares/validation').categorySchemas?.create || {}),
  categoryController.create
);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Listar categorías
 *     description: Obtiene todas las categorías activas
 *     tags: [Categorías]
 *     responses:
 *       200:
 *         description: Lista de categorías obtenida exitosamente
 */
// Listar categorías
router.get('/', categoryController.getAll);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Obtener categoría por ID
 *     description: Obtiene una categoría específica por su ID
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categoría obtenida exitosamente
 *       404:
 *         description: Categoría no encontrada
 */
// Obtener categoría por ID
router.get(
  '/:id',
  validateParams(require('../middlewares/validation').paramIdSchema),
  categoryController.getById
);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Actualizar categoría
 *     description: Actualiza una categoría existente (solo admin)
 *     tags: [Categorías]
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
 *             $ref: '#/components/schemas/UpdateCategoryRequest'
 *     responses:
 *       200:
 *         description: Categoría actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso restringido a administradores
 *       404:
 *         description: Categoría no encontrada
 */
// Actualizar categoría (solo admin)
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validateParams(require('../middlewares/validation').paramIdSchema),
  validateBody(require('../middlewares/validation').categorySchemas?.update || {}),
  categoryController.update
);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Eliminar categoría
 *     description: Elimina una categoría (soft delete, solo admin)
 *     tags: [Categorías]
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
 *         description: Categoría eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso restringido a administradores
 *       404:
 *         description: Categoría no encontrada
 */
// Eliminar categoría (solo admin)
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validateParams(require('../middlewares/validation').paramIdSchema),
  categoryController.delete
);

module.exports = router;