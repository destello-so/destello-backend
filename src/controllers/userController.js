const { userService } = require('../services');

class UserController {
  /**
   * GET /api/users/profile
   * Obtener perfil completo del usuario autenticado
   */
  async getProfile(req, res) {
    try {
      const userId = req.user._id;
      
      // Obtener usuario con todas sus direcciones
      const user = await userService.getById(userId);
      
      return res.success({
        user: user.toJSON()
      }, 'Perfil obtenido exitosamente');
      
    } catch (error) {
      if (error.statusCode === 404) {
        return res.notFound('Usuario no encontrado');
      }
      
      return res.internal('Error al obtener perfil');
    }
  }

  /**
   * PUT /api/users/profile
   * Actualizar datos del perfil del usuario autenticado
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user._id;
      const updateData = req.body;
      
      // Actualizar perfil
      const user = await userService.updateProfile(userId, updateData);
      
      return res.updated({
        user: user.toJSON()
      }, 'Perfil actualizado exitosamente');
      
    } catch (error) {
      if (error.statusCode === 404) {
        return res.notFound('Usuario no encontrado');
      }
      
      return res.internal('Error al actualizar perfil');
    }
  }

  /**
   * GET /api/users/addresses
   * Obtener direcciones del usuario autenticado
   */
  async getAddresses(req, res) {
    try {
      const userId = req.user._id;
      
      // Obtener usuario con sus direcciones
      const user = await userService.getById(userId);
      
      return res.success({
        addresses: user.addresses
      }, 'Direcciones obtenidas exitosamente');
      
    } catch (error) {
      if (error.statusCode === 404) {
        return res.notFound('Usuario no encontrado');
      }
      
      return res.internal('Error al obtener direcciones');
    }
  }

  /**
   * POST /api/users/addresses
   * Agregar nueva dirección al usuario autenticado
   */
  async addAddress(req, res) {
    try {
      const userId = req.user._id;
      const addressData = req.body;
      
      // Agregar dirección
      const user = await userService.addAddress(userId, addressData);
      
      // Obtener la dirección recién agregada (la última)
      const newAddress = user.addresses[user.addresses.length - 1];
      
      return res.created({
        address: newAddress,
        addresses: user.addresses
      }, 'Dirección agregada exitosamente');
      
    } catch (error) {
      if (error.statusCode === 404) {
        return res.notFound('Usuario no encontrado');
      }
      
      return res.internal('Error al agregar dirección');
    }
  }

  /**
   * PUT /api/users/addresses/:id
   * Actualizar dirección específica del usuario autenticado
   */
  async updateAddress(req, res) {
    try {
      const userId = req.user._id;
      const addressId = req.params.id;
      const updateData = req.body;
      
      // Actualizar dirección
      const user = await userService.updateAddress(userId, addressId, updateData);
      
      // Obtener la dirección actualizada
      const updatedAddress = user.addresses.id(addressId);
      
      return res.updated({
        address: updatedAddress,
        addresses: user.addresses
      }, 'Dirección actualizada exitosamente');
      
    } catch (error) {
      if (error.statusCode === 404) {
        return res.notFound('Usuario o dirección no encontrada');
      }
      
      return res.internal('Error al actualizar dirección');
    }
  }

  /**
   * DELETE /api/users/addresses/:id
   * Eliminar dirección específica del usuario autenticado
   */
  async deleteAddress(req, res) {
    try {
      const userId = req.user._id;
      const addressId = req.params.id;
      
      // Eliminar dirección
      const user = await userService.removeAddress(userId, addressId);
      
      return res.deleted('Dirección eliminada exitosamente');
      
    } catch (error) {
      if (error.statusCode === 404) {
        return res.notFound('Usuario o dirección no encontrada');
      }
      
      if (error.statusCode === 400) {
        return res.badRequest(error.message);
      }
      
      return res.internal('Error al eliminar dirección');
    }
  }
}

module.exports = new UserController();