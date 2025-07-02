const { productService } = require('../services');
const { productSchemas, paramIdSchema } = require('../middlewares/validation');

class ProductController {
  /**
   * POST /api/products
   * Crear nuevo producto (solo admin)
   */
  async create(req, res) {
    try {
      const productData = req.body;
      const product = await productService.create(productData);
      
      return res.created(product, 'Producto creado exitosamente');
      
    } catch (error) {
      if (error.statusCode === 400) {
        return res.badRequest(error.message);
      }
      
      return res.internal('Error al crear producto');
    }
  }

  /**
   * GET /api/products/:id
   * Obtener producto por ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.getById(id);
      
      return res.success(product, 'Producto obtenido exitosamente');
      
    } catch (error) {
      if (error.statusCode === 404) {
        return res.notFound('Producto no encontrado');
      }
      
      return res.internal('Error al obtener producto');
    }
  }

  /**
   * GET /api/products
   * Obtener productos con filtros y paginación
   */
  async getProducts(req, res) {
    try {
      const filters = req.query;
      const result = await productService.getProducts(filters);
      
      return res.paginated(
        result.products, 
        result.pagination, 
        'Productos obtenidos exitosamente'
      );
      
    } catch (error) {
      return res.internal('Error al obtener productos');
    }
  }

  /**
   * PUT /api/products/:id
   * Actualizar producto (solo admin)
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const product = await productService.update(id, updateData);
      
      return res.updated(product, 'Producto actualizado exitosamente');
      
    } catch (error) {
      if (error.statusCode === 404) {
        return res.notFound('Producto no encontrado');
      }
      
      if (error.statusCode === 400) {
        return res.badRequest(error.message);
      }
      
      return res.internal('Error al actualizar producto');
    }
  }

  /**
   * PATCH /api/products/:id/stock
   * Actualizar stock del producto (solo admin)
   */
  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { qtyChange, type, note } = req.body;
      
      const product = await productService.updateStock(id, qtyChange, type, note);
      
      return res.updated(product, 'Stock actualizado exitosamente');
      
    } catch (error) {
      if (error.statusCode === 404) {
        return res.notFound('Producto no encontrado');
      }
      
      if (error.statusCode === 400) {
        return res.badRequest(error.message);
      }
      
      return res.internal('Error al actualizar stock');
    }
  }

  /**
   * DELETE /api/products/:id
   * Eliminar producto (soft delete - solo admin)
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      await productService.delete(id);
      
      return res.deleted('Producto eliminado exitosamente');
      
    } catch (error) {
      if (error.statusCode === 404) {
        return res.notFound('Producto no encontrado');
      }
      
      return res.internal('Error al eliminar producto');
    }
  }

  /**
   * GET /api/products/:id/stock
   * Verificar disponibilidad de stock
   */
  async checkStock(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.query;
      
      await productService.checkStock(id, parseInt(quantity));
      
      return res.success({ available: true }, 'Stock disponible');
      
    } catch (error) {
      if (error.statusCode === 404) {
        return res.notFound('Producto no encontrado');
      }
      
      if (error.statusCode === 400) {
        return res.badRequest(error.message);
      }
      
      return res.internal('Error al verificar stock');
    }
  }
}

module.exports = new ProductController();