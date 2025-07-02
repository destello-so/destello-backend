const { Order, Cart, Product, InventoryTx } = require('../models');
const { CONSTANTS } = require('../config');
const cartService = require('./cartService');
const productService = require('./productService');

class OrderService {

  // Crear orden desde carrito
  async createOrder(userId, addressData) {
    try {
      console.log('==> [createOrder] userId:', userId, 'addressData:', addressData);

      // Validar que address tenga todos los campos requeridos
      const requiredFields = ['street', 'city', 'state', 'zipCode', 'country'];
      const missingFields = requiredFields.filter(field => !addressData.address || !addressData.address[field]);
      if (missingFields.length > 0) {
        const error = new Error('Faltan campos requeridos en la dirección: ' + missingFields.join(', '));
        error.statusCode = 400;
        throw error;
      }

      // Validar carrito antes de crear orden
      const cartValidation = await cartService.validateCart(userId);
      console.log('==> [createOrder] cartValidation:', cartValidation);

      if (!cartValidation.isValid) {
        console.error('==> [createOrder] Carrito no válido:', cartValidation.errors);
        const error = new Error('Carrito no válido para checkout');
        error.statusCode = 400;
        error.details = cartValidation.errors;
        throw error;
      }

      if (cartValidation.validItems.length === 0) {
        console.error('==> [createOrder] Carrito vacío');
        const error = new Error('El carrito está vacío');
        error.statusCode = 400;
        throw error;
      }

      // Crear items de la orden (snapshot del carrito)
      const orderItems = cartValidation.validItems.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        productSku: item.product.sku,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity
      }));
      console.log('==> [createOrder] orderItems:', orderItems);

      // Crear la orden
      const order = await Order.create({
        userId,
        items: orderItems,
        address: addressData.address,
        totalAmount: cartValidation.total,
        status: CONSTANTS.ORDER_STATUS.PENDING
      });
      console.log('==> [createOrder] Orden creada:', order);

      // Actualizar stock de productos (reducir stock)
      for (const item of cartValidation.validItems) {
        console.log('==> [createOrder] Actualizando stock para producto:', item.productId, 'cantidad:', item.quantity);
        await productService.updateStock(
          item.productId,
          -item.quantity, // Reducir stock
          CONSTANTS.INVENTORY_TYPES.SALE,
          `Venta - Orden #${order._id}`
        );
      }

      // Limpiar carrito después de crear orden
      await cartService.clearCart(userId);
      console.log('==> [createOrder] Carrito limpiado');

      const ordenFinal = await Order.findById(order._id).populate('userId', 'firstName lastName email');
      console.log('==> [createOrder] Orden final:', ordenFinal);

      return ordenFinal;
    } catch (err) {
      console.error('==> [createOrder] ERROR:', err);
      throw err;
    }
  }

  // Obtener orden por ID
  async getOrder(orderId, userId = null) {
    const query = { _id: orderId };
    
    // Si se proporciona userId, verificar que la orden pertenece al usuario
    if (userId) {
      query.userId = userId;
    }

    const order = await Order.findOne(query)
      .populate('userId', 'firstName lastName email')
      .populate('shipments');

    if (!order) {
      const error = new Error('Orden no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return order;
  }

  // Obtener órdenes del usuario
  async getUserOrders(userId, filters = {}) {
    const { page = 1, limit = 12, status } = filters;
    
    const query = { userId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('shipments')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query)
    ]);

    return {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Obtener todas las órdenes (solo admin)
  async getAllOrders(filters = {}) {
    const { page = 1, limit = 12, status, userId } = filters;
    
    const query = {};
    if (status) query.status = status;
    if (userId) query.userId = userId;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('userId', 'firstName lastName email')
        .populate('shipments')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query)
    ]);

    return {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Actualizar estado de la orden (solo admin)
  async updateStatus(orderId, newStatus, adminId) {
    const order = await Order.findById(orderId);
    if (!order) {
      const error = new Error('Orden no encontrada');
      error.statusCode = 404;
      throw error;
    }

    // Validar transición de estado
    const validTransitions = {
      [CONSTANTS.ORDER_STATUS.PENDING]: [CONSTANTS.ORDER_STATUS.CONFIRMED, CONSTANTS.ORDER_STATUS.CANCELLED],
      [CONSTANTS.ORDER_STATUS.CONFIRMED]: [CONSTANTS.ORDER_STATUS.PROCESSING, CONSTANTS.ORDER_STATUS.CANCELLED],
      [CONSTANTS.ORDER_STATUS.PROCESSING]: [CONSTANTS.ORDER_STATUS.SHIPPED, CONSTANTS.ORDER_STATUS.CANCELLED],
      [CONSTANTS.ORDER_STATUS.SHIPPED]: [CONSTANTS.ORDER_STATUS.DELIVERED],
      [CONSTANTS.ORDER_STATUS.DELIVERED]: [],
      [CONSTANTS.ORDER_STATUS.CANCELLED]: []
    };

    const allowedTransitions = validTransitions[order.status];
    if (!allowedTransitions.includes(newStatus)) {
      const error = new Error(`No se puede cambiar de ${order.status} a ${newStatus}`);
      error.statusCode = 400;
      throw error;
    }

    // Si se cancela, restaurar stock
    if (newStatus === CONSTANTS.ORDER_STATUS.CANCELLED && order.status !== CONSTANTS.ORDER_STATUS.CANCELLED) {
      for (const item of order.items) {
        await productService.updateStock(
          item.productId,
          item.quantity, // Restaurar stock
          CONSTANTS.INVENTORY_TYPES.RETURN,
          `Cancelación de orden #${order._id}`
        );
      }
    }

    order.status = newStatus;
    await order.save();

    return await Order.findById(orderId)
      .populate('userId', 'firstName lastName email')
      .populate('shipments');
  }

  // Cancelar orden (usuario o admin)
  async cancelOrder(orderId, userId = null) {
    const query = { _id: orderId };
    if (userId) query.userId = userId;

    const order = await Order.findOne(query);
    if (!order) {
      const error = new Error('Orden no encontrada');
      error.statusCode = 404;
      throw error;
    }

    // Verificar si se puede cancelar
    if (!order.canBeCancelled()) {
      const error = new Error('Esta orden no se puede cancelar');
      error.statusCode = 400;
      throw error;
    }

    // Restaurar stock
    for (const item of order.items) {
      await productService.updateStock(
        item.productId,
        item.quantity,
        CONSTANTS.INVENTORY_TYPES.RETURN,
        `Cancelación de orden #${order._id}`
      );
    }

    order.status = CONSTANTS.ORDER_STATUS.CANCELLED;
    await order.save();

    return order;
  }

  // Obtener resumen de la orden
  async getOrderSummary(orderId) {
    const order = await Order.findById(orderId)
      .populate('userId', 'firstName lastName email')
      .populate('shipments');

    if (!order) {
      const error = new Error('Orden no encontrada');
      error.statusCode = 404;
      throw error;
    }

    const summary = {
      orderId: order._id,
      userId: order.userId,
      status: order.status,
      totalAmount: order.totalAmount,
      itemCount: order.items.length,
      totalQuantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
      address: order.address,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shipments: order.shipments,
      items: order.items
    };

    return summary;
  }

  // Obtener estadísticas de órdenes (solo admin)
  async getOrderStats(filters = {}) {
    const { startDate, endDate, status } = filters;
    
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (status) query.status = status;

    const [totalOrders, totalAmount, ordersByStatus] = await Promise.all([
      Order.countDocuments(query),
      Order.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    const stats = {
      totalOrders,
      totalAmount: ordersByStatus.length > 0 ? ordersByStatus[0].total : 0,
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      averageOrderValue: totalOrders > 0 ? (ordersByStatus[0]?.total || 0) / totalOrders : 0
    };

    return stats;
  }

}

module.exports = new OrderService(); 