const { wishlistService } = require('../services');

class WishlistController {
  // Obtener la lista de deseos del usuario autenticado
  async getWishlist(req, res) {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 20 } = req.query;
      const result = await wishlistService.getWishlist(userId, Number(page), Number(limit));
      return res.paginated(result.items, result.pagination, 'Lista de deseos obtenida exitosamente');
    } catch (error) {
      return res.internal('Error al obtener la lista de deseos');
    }
  }

  // Agregar producto a la lista de deseos
  async addToWishlist(req, res) {
    try {
      const userId = req.user._id;
      const { productId } = req.body;
      const wishlist = await wishlistService.addToWishlist(userId, productId);
      return res.created(wishlist, 'Producto agregado a la lista de deseos');
    } catch (error) {
      if (error.statusCode === 400) return res.badRequest(error.message);
      if (error.statusCode === 404) return res.notFound(error.message);
      return res.internal('Error al agregar producto a la lista de deseos');
    }
  }

  // Remover producto de la lista de deseos
  async removeFromWishlist(req, res) {
    try {
      const userId = req.user._id;
      const { productId } = req.body;
      const result = await wishlistService.removeFromWishlist(userId, productId);
      return res.success(result, 'Producto removido de la lista de deseos');
    } catch (error) {
      if (error.statusCode === 404) return res.notFound(error.message);
      return res.internal('Error al remover producto de la lista de deseos');
    }
  }

  // Limpiar la lista de deseos
  async clearWishlist(req, res) {
    try {
      const userId = req.user._id;
      const result = await wishlistService.clearWishlist(userId);
      return res.success(result, 'Lista de deseos limpiada exitosamente');
    } catch (error) {
      return res.internal('Error al limpiar la lista de deseos');
    }
  }

  // Verificar si un producto está en la lista de deseos
  async isInWishlist(req, res) {
    try {
      const userId = req.user._id;
      const { productId } = req.query;
      const exists = await wishlistService.isInWishlist(userId, productId);
      return res.success({ inWishlist: exists }, exists ? 'El producto está en la lista de deseos' : 'El producto no está en la lista de deseos');
    } catch (error) {
      return res.internal('Error al verificar la lista de deseos');
    }
  }

  // Obtener estadísticas de la lista de deseos
  async getWishlistStats(req, res) {
    try {
      const userId = req.user._id;
      const stats = await wishlistService.getWishlistStats(userId);
      return res.success(stats, 'Estadísticas de la lista de deseos obtenidas exitosamente');
    } catch (error) {
      return res.internal('Error al obtener estadísticas de la lista de deseos');
    }
  }
}

module.exports = new WishlistController();