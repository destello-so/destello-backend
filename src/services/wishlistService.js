const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { ValidationError, NotFoundError } = require('../utils/errors');

class WishlistService {
  /**
   * Obtener la lista de deseos de un usuario
   */
  async getWishlist(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const wishlist = await Wishlist.findOne({ userId })
        .populate({
          path: 'items.productId',
          select: 'name sku price imageUrl stockQty isActive'
        })
        .sort({ 'items.addedAt': -1 });

      if (!wishlist) {
        return {
          items: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0
          }
        };
      }

      // Paginar los items
      const totalItems = wishlist.items.length;
      const paginatedItems = wishlist.items.slice(skip, skip + limit);

      return {
        items: paginatedItems,
        pagination: {
          page,
          limit,
          total: totalItems,
          pages: Math.ceil(totalItems / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Agregar un producto a la lista de deseos
   */
  async addToWishlist(userId, productId) {
    try {
      // Verificar que el producto existe y está activo
      const product = await Product.findOne({ _id: productId, isActive: true });
      if (!product) {
        throw new NotFoundError('Producto no encontrado o no disponible');
      }

      // Buscar o crear la lista de deseos del usuario
      let wishlist = await Wishlist.findOne({ userId });
      
      if (!wishlist) {
        wishlist = new Wishlist({ userId, items: [] });
      }

      // Verificar si el producto ya está en la lista
      const existingItem = wishlist.items.find(
        item => item.productId.toString() === productId
      );

      if (existingItem) {
        throw new ValidationError('El producto ya está en tu lista de deseos');
      }

      // Agregar el producto
      wishlist.items.push({
        productId,
        addedAt: new Date()
      });

      await wishlist.save();
      await wishlist.populate({
        path: 'items.productId',
        select: 'name sku price imageUrl stockQty isActive'
      });

      return wishlist;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remover un producto de la lista de deseos
   */
  async removeFromWishlist(userId, productId) {
    try {
      const wishlist = await Wishlist.findOne({ userId });
      
      if (!wishlist) {
        throw new NotFoundError('Lista de deseos no encontrada');
      }

      const itemIndex = wishlist.items.findIndex(
        item => item.productId.toString() === productId
      );

      if (itemIndex === -1) {
        throw new NotFoundError('Producto no encontrado en la lista de deseos');
      }

      // Remover el item
      wishlist.items.splice(itemIndex, 1);
      await wishlist.save();

      return { message: 'Producto removido de la lista de deseos' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar si un producto está en la lista de deseos
   */
  async isInWishlist(userId, productId) {
    try {
      const wishlist = await Wishlist.findOne({ userId });
      
      if (!wishlist) {
        return false;
      }

      return wishlist.items.some(
        item => item.productId.toString() === productId
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de la lista de deseos
   */
  async getWishlistStats(userId) {
    try {
      const wishlist = await Wishlist.findOne({ userId });
      
      if (!wishlist) {
        return {
          totalItems: 0,
          totalValue: 0,
          availableItems: 0,
          outOfStockItems: 0
        };
      }

      // Obtener productos con información de stock
      await wishlist.populate({
        path: 'items.productId',
        select: 'price stockQty isActive'
      });

      let totalValue = 0;
      let availableItems = 0;
      let outOfStockItems = 0;

      wishlist.items.forEach(item => {
        if (item.productId && item.productId.isActive) {
          totalValue += item.productId.price;
          
          if (item.productId.stockQty > 0) {
            availableItems++;
          } else {
            outOfStockItems++;
          }
        }
      });

      return {
        totalItems: wishlist.items.length,
        totalValue: Math.round(totalValue * 100) / 100, // Redondear a 2 decimales
        availableItems,
        outOfStockItems
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Limpiar toda la lista de deseos
   */
  async clearWishlist(userId) {
    try {
      const wishlist = await Wishlist.findOne({ userId });
      
      if (!wishlist) {
        throw new NotFoundError('Lista de deseos no encontrada');
      }

      wishlist.items = [];
      await wishlist.save();

      return { message: 'Lista de deseos limpiada exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mover productos de la lista de deseos al carrito
   */
  async moveToCart(userId, productIds = null) {
    try {
      const wishlist = await Wishlist.findOne({ userId });
      
      if (!wishlist || wishlist.items.length === 0) {
        throw new NotFoundError('Lista de deseos vacía');
      }

      // Filtrar productos si se especifican IDs
      let itemsToMove = wishlist.items;
      if (productIds && productIds.length > 0) {
        itemsToMove = wishlist.items.filter(item => 
          productIds.includes(item.productId.toString())
        );
      }

      if (itemsToMove.length === 0) {
        throw new ValidationError('No se encontraron productos para mover');
      }

      // Obtener información de productos
      await wishlist.populate({
        path: 'items.productId',
        select: 'name sku price stockQty isActive'
      });

      const cartItems = [];
      const itemsToRemove = [];

      itemsToMove.forEach(item => {
        if (item.productId && item.productId.isActive && item.productId.stockQty > 0) {
          cartItems.push({
            productId: item.productId._id,
            quantity: 1,
            price: item.productId.price
          });
          itemsToRemove.push(item.productId._id);
        }
      });

      // Remover productos de la lista de deseos
      wishlist.items = wishlist.items.filter(item => 
        !itemsToRemove.includes(item.productId)
      );
      await wishlist.save();

      return {
        message: `${cartItems.length} productos movidos al carrito`,
        cartItems,
        remainingItems: wishlist.items.length
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new WishlistService();