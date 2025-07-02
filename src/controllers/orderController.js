const { orderService } = require('../services');

class OrderController {
  // Crear una orden (a partir del carrito)
  async create(req, res) {
    try {
      const userId = req.user._id;
      const order = await orderService.createOrder(userId, req.body);
      return res.created(order, 'Orden creada exitosamente');
    } catch (error) {
      if (error.statusCode === 400) return res.badRequest(error.message);
      return res.internal('Error al crear la orden');
    }
  }

  // Listar órdenes del usuario autenticado
  async getMyOrders(req, res) {
    try {
      const userId = req.user._id;
      const orders = await orderService.getUserOrders(userId);
      return res.success(orders, 'Órdenes obtenidas exitosamente');
    } catch (error) {
      return res.internal('Error al obtener órdenes');
    }
  }

  // Obtener una orden por ID (usuario o admin)
  async getById(req, res) {
    try {
      const userId = req.user._id;
      const { id } = req.params;
      const order = await orderService.getOrder(id, userId);
      return res.success(order, 'Orden obtenida exitosamente');
    } catch (error) {
      if (error.statusCode === 404) return res.notFound('Orden no encontrada');
      if (error.statusCode === 403) return res.forbidden('No tienes acceso a esta orden');
      return res.internal('Error al obtener la orden');
    }
  }

  // Listar todas las órdenes (solo admin)
  async getAll(req, res) {
    try {
      const orders = await orderService.getAllOrders();
      return res.success(orders, 'Órdenes obtenidas exitosamente');
    } catch (error) {
      return res.internal('Error al obtener todas las órdenes');
    }
  }

  // Actualizar estado de la orden (solo admin)
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await orderService.updateStatus(id, status, req.user._id);
      return res.updated(order, 'Estado de la orden actualizado');
    } catch (error) {
      if (error.statusCode === 404) return res.notFound('Orden no encontrada');
      if (error.statusCode === 400) return res.badRequest(error.message);
      return res.internal('Error al actualizar estado de la orden');
    }
  }

  // Cancelar una orden (usuario o admin)
  async cancel(req, res) {
    try {
      const userId = req.user._id;
      const { id } = req.params;
      const order = await orderService.cancelOrder(id, userId);
      return res.updated(order, 'Orden cancelada exitosamente');
    } catch (error) {
      if (error.statusCode === 404) return res.notFound('Orden no encontrada');
      if (error.statusCode === 403) return res.forbidden('No tienes acceso a cancelar esta orden');
      return res.internal('Error al cancelar la orden');
    }
  }
}

module.exports = new OrderController();