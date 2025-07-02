const { User } = require('../models');

class UserService {

  // Obtener usuario por ID
  async getById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  // Actualizar perfil de usuario
  async updateProfile(userId, updateData) {
    const { firstName, lastName, phone } = updateData;
    
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    // Actualizar campos
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;

    await user.save();
    return user;
  }

  // Agregar dirección
  async addAddress(userId, addressData) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    // Si es la primera dirección, hacerla default
    if (user.addresses.length === 0) {
      addressData.isDefault = true;
    }

    // Si se marca como default, quitar default de otras
    if (addressData.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push(addressData);
    await user.save();
    
    return user;
  }

  // Actualizar dirección
  async updateAddress(userId, addressId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      const error = new Error('Dirección no encontrada');
      error.statusCode = 404;
      throw error;
    }

    // Si se marca como default, quitar default de otras
    if (updateData.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    // Actualizar campos de la dirección
    Object.assign(address, updateData);
    await user.save();
    
    return user;
  }

  // Eliminar dirección
  async removeAddress(userId, addressId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      const error = new Error('Dirección no encontrada');
      error.statusCode = 404;
      throw error;
    }

    // No permitir eliminar si es la única dirección
    if (user.addresses.length === 1) {
      const error = new Error('No se puede eliminar la única dirección');
      error.statusCode = 400;
      throw error;
    }

    const wasDefault = address.isDefault;
    address.remove();

    // Si era default, hacer default la primera dirección restante
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    return user;
  }

  // Obtener usuarios (solo admin)
  async getUsers(filters = {}) {
    const { page = 1, limit = 12, role, isActive } = filters;
    
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive;

    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Activar/Desactivar usuario (solo admin)
  async toggleUserStatus(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    user.isActive = !user.isActive;
    await user.save();
    
    return user;
  }

}

module.exports = new UserService(); 