const { Cart, Product } = require('../models');

class CartService {

  // Obtener carrito del usuario
  async getCart(userId) {
    let cart = await Cart.findOne({ userId }).populate('items.productId', 'name sku price imageUrl stockQty isActive');
    
    if (!cart) {
      // Crear carrito vacío si no existe
      cart = await Cart.create({ userId, items: [] });
    }

    const originalLength = cart.items.length;
    cart.items = cart.items.filter(
      item =>
        item.productId &&
        item.productId.isActive &&
        item.productId.stockQty > 0
    );

    // Guardar solo si realmente se removieron elementos
    if (cart.items.length !== originalLength) {
      await cart.save();
    }

    return cart;
  }

  // Agregar producto al carrito
  async addItem(userId, productId, quantity = 1) {
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      const error = new Error('Producto no disponible');
      error.statusCode = 400;
      throw error;
    }

    if (product.stockQty < quantity) {
      const error = new Error(`Stock insuficiente. Disponible: ${product.stockQty}`);
      error.statusCode = 400;
      throw error;
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    const existingItem = cart.items.find(item => 
      item.productId.toString() === productId.toString()
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stockQty < newQuantity) {
        const error = new Error(`Stock insuficiente para la cantidad solicitada`);
        error.statusCode = 400;
        throw error;
      }
      existingItem.quantity = newQuantity;
      existingItem.price = product.price;
    } else {
      cart.items.push({
        productId,
        quantity,
        price: product.price
      });
    }

    cart.updatedAt = new Date();
    await cart.save();
    return await this.getCart(userId);
  }

  // Actualizar cantidad de un producto en el carrito (usa productId)
  async updateItem(userId, productId, quantity) {
    if (quantity <= 0) {
      return await this.removeItem(userId, productId);
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      const error = new Error('Carrito no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const item = cart.items.find(
      i => i.productId.toString() === productId.toString()
    );
    if (!item) {
      const error = new Error('Item no encontrado en el carrito');
      error.statusCode = 404;
      throw error;
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      const error = new Error('Producto no disponible');
      error.statusCode = 400;
      throw error;
    }

    if (product.stockQty < quantity) {
      const error = new Error(`Stock insuficiente. Disponible: ${product.stockQty}`);
      error.statusCode = 400;
      throw error;
    }

    item.quantity = quantity;
    item.price = product.price;
    cart.updatedAt = new Date();
    await cart.save();

    return await this.getCart(userId);
  }

  // Remover producto del carrito (usa productId)
  async removeItem(userId, productId) {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      const error = new Error('Carrito no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const index = cart.items.findIndex(
      i => i.productId.toString() === productId.toString()
    );
    if (index === -1) {
      const error = new Error('Item no encontrado en el carrito');
      error.statusCode = 404;
      throw error;
    }

    cart.items.splice(index, 1);
    cart.updatedAt = new Date();
    await cart.save();

    return await this.getCart(userId);
  }

  // Vaciar carrito
  async clearCart(userId) {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return { message: 'Carrito ya está vacío' };
    }

    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();

    return { message: 'Carrito vaciado exitosamente' };
  }

  // Calcular total del carrito
  async getTotal(userId) {
    const cart = await this.getCart(userId);
    
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const itemCount = cart.items.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);

    return {
      total: parseFloat(total.toFixed(2)),
      itemCount,
      items: cart.items.length
    };
  }

  // Verificar disponibilidad de todos los items
  async validateCart(userId) {
    const cart = await this.getCart(userId);
    const errors = [];
    const validItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      
      if (!product || !product.isActive) {
        errors.push(`Producto ${item.productId} no está disponible`);
        continue;
      }

      if (product.stockQty < item.quantity) {
        errors.push(`Stock insuficiente para ${product.name}. Disponible: ${product.stockQty}, Solicitado: ${item.quantity}`);
        continue;
      }

      validItems.push({
        ...item.toObject(),
        product: product
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      validItems,
      total: validItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };
  }

  // Obtener carrito con información completa para checkout
  async getCartForCheckout(userId) {
    const cart = await this.getCart(userId);
    const validation = await this.validateCart(userId);

    return {
      cart,
      validation,
      summary: {
        totalItems: validation.validItems.length,
        totalQuantity: validation.validItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: validation.total
      }
    };
  }

}

module.exports = new CartService(); 