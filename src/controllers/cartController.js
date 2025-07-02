const { cartService } = require('../services');

class CartController {
  // Obtener el carrito del usuario autenticado
  async getCart(req, res) {
    try {
      const userId = req.user._id;
      const cart = await cartService.getCart(userId);
      return res.success(cart, 'Carrito obtenido exitosamente');
    } catch (error) {
      return res.internal('Error al obtener el carrito');
    }
  }

  // Agregar producto al carrito
  async addItem(req, res) {
    try {
      const userId = req.user._id;
      const { productId, quantity } = req.body;
      const cart = await cartService.addItem(userId, productId, quantity);
      return res.success(cart, 'Producto agregado al carrito');
    } catch (error) {
      if (error.statusCode === 404) return res.notFound(error.message);
      if (error.statusCode === 400) return res.badRequest(error.message);
      return res.internal('Error al agregar producto al carrito');
    }
  }

  // Actualizar cantidad de un producto en el carrito
  async updateItem(req, res) {
    try {
      const userId = req.user._id;
      const { productId, quantity } = req.body;
      const cart = await cartService.updateItem(userId, productId, quantity);
      return res.success(cart, 'Cantidad actualizada en el carrito');
    } catch (error) {
      if (error.statusCode === 404) return res.notFound(error.message);
      if (error.statusCode === 400) return res.badRequest(error.message);
      return res.internal('Error al actualizar cantidad en el carrito');
    }
  }

  // Eliminar producto del carrito
  async removeItem(req, res) {
    try {
      const userId = req.user._id;
      const { productId } = req.body;
      const cart = await cartService.removeItem(userId, productId);
      return res.success(cart, 'Producto eliminado del carrito');
    } catch (error) {
      if (error.statusCode === 404) return res.notFound(error.message);
      return res.internal('Error al eliminar producto del carrito');
    }
  }

  // Vaciar el carrito
  async clearCart(req, res) {
    try {
      const userId = req.user._id;
      await cartService.clearCart(userId);
      return res.success(null, 'Carrito vaciado exitosamente');
    } catch (error) {
      return res.internal('Error al vaciar el carrito');
    }
  }
}

module.exports = new CartController();