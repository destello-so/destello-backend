const { categoryService } = require('../services');

class CategoryController {
  // Crear categoría
  async create(req, res) {
    try {
      const category = await categoryService.create(req.body);
      return res.created(category, 'Categoría creada exitosamente');
    } catch (error) {
      if (error.statusCode === 409) return res.conflict(error.message);
      if (error.statusCode === 400) return res.badRequest(error.message);
      return res.internal('Error al crear categoría');
    }
  }

  // Listar categorías
  async getAll(req, res) {
    try {
      const categories = await categoryService.getAll();
      return res.success(categories, 'Categorías obtenidas exitosamente');
    } catch (error) {
      return res.internal('Error al obtener categorías');
    }
  }

  // Obtener categoría por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const category = await categoryService.getById(id);
      return res.success(category, 'Categoría obtenida exitosamente');
    } catch (error) {
      if (error.statusCode === 404) return res.notFound('Categoría no encontrada');
      return res.internal('Error al obtener categoría');
    }
  }

  // Actualizar categoría
  async update(req, res) {
    try {
      const { id } = req.params;
      const category = await categoryService.update(id, req.body);
      return res.updated(category, 'Categoría actualizada exitosamente');
    } catch (error) {
      if (error.statusCode === 404) return res.notFound('Categoría no encontrada');
      if (error.statusCode === 409) return res.conflict(error.message);
      if (error.statusCode === 400) return res.badRequest(error.message);
      return res.internal('Error al actualizar categoría');
    }
  }

  // Eliminar categoría (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;
      await categoryService.delete(id);
      return res.deleted('Categoría eliminada exitosamente');
    } catch (error) {
      if (error.statusCode === 404) return res.notFound('Categoría no encontrada');
      return res.internal('Error al eliminar categoría');
    }
  }
}

module.exports = new CategoryController();