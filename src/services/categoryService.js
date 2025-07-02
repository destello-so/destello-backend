const { Category } = require('../models');

class CategoryService {

  // Crear categoría (solo admin)
  async create(categoryData) {
    const { name, description, parentId } = categoryData;

    // Verificar que la categoría padre existe si se proporciona
    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        const error = new Error('Categoría padre no encontrada');
        error.statusCode = 404;
        throw error;
      }
    }

    // Verificar que no existe una categoría con el mismo nombre en el mismo nivel
    const query = { name: { $regex: new RegExp(`^${name}$`, 'i') } };
    if (parentId) {
      query.parentId = parentId;
    } else {
      query.parentId = null;
    }

    const existingCategory = await Category.findOne(query);
    if (existingCategory) {
      const error = new Error('Ya existe una categoría con ese nombre en este nivel');
      error.statusCode = 409;
      throw error;
    }

    const category = await Category.create({
      name,
      description,
      parentId: parentId || null
    });

    return category;
  }

  // Obtener todas las categorías (estructura jerárquica)
  async getAll() {
    const allCategories = await Category.find().sort({ name: 1 });
    
    // Organizar en estructura jerárquica
    const categoryMap = new Map();
    const rootCategories = [];

    // Crear mapa de categorías
    allCategories.forEach(category => {
      categoryMap.set(category._id.toString(), {
        ...category.toObject(),
        children: []
      });
    });

    // Organizar jerarquía
    allCategories.forEach(category => {
      const categoryObj = categoryMap.get(category._id.toString());
      
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId.toString());
        if (parent) {
          parent.children.push(categoryObj);
        }
      } else {
        rootCategories.push(categoryObj);
      }
    });

    return rootCategories;
  }

  // Obtener categorías raíz (sin padre)
  async getRootCategories() {
    return await Category.find({ parentId: null }).sort({ name: 1 });
  }

  // Obtener categorías hijas de una categoría
  async getChildren(parentId) {
    const parentCategory = await Category.findById(parentId);
    if (!parentCategory) {
      const error = new Error('Categoría padre no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return await Category.find({ parentId }).sort({ name: 1 });
  }

  // Obtener categoría por ID
  async getById(categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      const error = new Error('Categoría no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return category;
  }

  // Actualizar categoría (solo admin)
  async update(categoryId, updateData) {
    const { name, description, parentId } = updateData;

    const category = await Category.findById(categoryId);
    if (!category) {
      const error = new Error('Categoría no encontrada');
      error.statusCode = 404;
      throw error;
    }

    // Verificar que no se esté intentando hacer una categoría padre de sí misma
    if (parentId && parentId === categoryId) {
      const error = new Error('Una categoría no puede ser padre de sí misma');
      error.statusCode = 400;
      throw error;
    }

    // Verificar que el nuevo padre existe si se proporciona
    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        const error = new Error('Categoría padre no encontrada');
        error.statusCode = 404;
        throw error;
      }

      // Verificar que no se esté creando un ciclo
      if (await this.wouldCreateCycle(categoryId, parentId)) {
        const error = new Error('Esta operación crearía un ciclo en la jerarquía');
        error.statusCode = 400;
        throw error;
      }
    }

    // Verificar nombre único en el mismo nivel (si se cambia)
    if (name && name !== category.name) {
      const query = { 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: categoryId }
      };
      
      if (parentId !== undefined) {
        query.parentId = parentId || null;
      } else {
        query.parentId = category.parentId;
      }

      const existingCategory = await Category.findOne(query);
      if (existingCategory) {
        const error = new Error('Ya existe una categoría con ese nombre en este nivel');
        error.statusCode = 409;
        throw error;
      }
    }

    // Actualizar campos
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (parentId !== undefined) category.parentId = parentId || null;

    await category.save();
    return category;
  }

  // Eliminar categoría (solo admin)
  async delete(categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      const error = new Error('Categoría no encontrada');
      error.statusCode = 404;
      throw error;
    }

    // Verificar que no tenga categorías hijas
    const children = await Category.find({ parentId: categoryId });
    if (children.length > 0) {
      const error = new Error('No se puede eliminar una categoría que tiene subcategorías');
      error.statusCode = 400;
      throw error;
    }

    // TODO: Verificar que no tenga productos asociados
    // const { Product } = require('../models');
    // const products = await Product.find({ categories: categoryId });
    // if (products.length > 0) {
    //   const error = new Error('No se puede eliminar una categoría que tiene productos asociados');
    //   error.statusCode = 400;
    //   throw error;
    // }

    await Category.findByIdAndDelete(categoryId);
    return { message: 'Categoría eliminada exitosamente' };
  }

  // Verificar si cambiar el padre crearía un ciclo
  async wouldCreateCycle(categoryId, newParentId) {
    let currentParentId = newParentId;
    
    while (currentParentId) {
      if (currentParentId === categoryId) {
        return true; // Ciclo detectado
      }
      
      const parent = await Category.findById(currentParentId);
      currentParentId = parent ? parent.parentId : null;
    }
    
    return false;
  }

}

module.exports = new CategoryService(); 