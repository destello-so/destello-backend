const { Product, Category, InventoryTx } = require('../models');
const { CONSTANTS } = require('../config');

class ProductService {

  // Crear producto (solo admin)
  async create(productData) {
    const { categories, ...data } = productData;

    // Verificar que las categorías existen
    if (categories && categories.length > 0) {
      const existingCategories = await Category.find({ _id: { $in: categories } });
      if (existingCategories.length !== categories.length) {
        const error = new Error('Una o más categorías no existen');
        error.statusCode = 400;
        throw error;
      }
    }

    // Crear producto
    const product = await Product.create({
      ...data,
      categories: categories || []
    });

    // Crear transacción de inventario inicial
    if (product.stockQty > 0) {
      await InventoryTx.create({
        productId: product._id,
        qtyChange: product.stockQty,
        type: CONSTANTS.INVENTORY_TYPES.RESTOCK,
        note: 'Stock inicial del producto'
      });
    }

    return await Product.findById(product._id).populate('categories', 'name description');
  }

  // Obtener producto por ID
  async getById(productId) {
    const product = await Product.findById(productId)
      .populate('categories', 'name description');
    
    if (!product) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return product;
  }

  // Obtener productos con filtros
  async getProducts(filters = {}) {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      minPrice, 
      maxPrice, 
      search, 
      isActive = true 
    } = filters;

    // Construir query
    const query = {};
    
    if (isActive !== undefined) query.isActive = isActive;
    if (category) query.categories = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('categories', 'name description')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(query)
    ]);

    return {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Actualizar producto (solo admin)
  async update(productId, updateData) {
    const { categories, ...data } = updateData;

    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    // Verificar categorías si se actualizan
    if (categories && categories.length > 0) {
      const existingCategories = await Category.find({ _id: { $in: categories } });
      if (existingCategories.length !== categories.length) {
        const error = new Error('Una o más categorías no existen');
        error.statusCode = 400;
        throw error;
      }
    }

    // Actualizar campos
    Object.assign(product, data);
    if (categories) product.categories = categories;

    await product.save();

    return await Product.findById(product._id).populate('categories', 'name description');
  }

  // Actualizar stock (solo admin)
  async updateStock(productId, qtyChange, type, note = '') {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const newStock = product.stockQty + qtyChange;
    if (newStock < 0) {
      const error = new Error('Stock insuficiente');
      error.statusCode = 400;
      throw error;
    }

    // Actualizar stock del producto
    product.stockQty = newStock;
    await product.save();

    // Crear transacción de inventario
    await InventoryTx.create({
      productId,
      qtyChange,
      type,
      note
    });

    return product;
  }

  // Verificar disponibilidad de stock
  async checkStock(productId, quantity) {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (!product.isActive) {
      const error = new Error('Producto no disponible');
      error.statusCode = 400;
      throw error;
    }

    if (product.stockQty < quantity) {
      const error = new Error(`Stock insuficiente. Disponible: ${product.stockQty}`);
      error.statusCode = 400;
      throw error;
    }

    return true;
  }

  // Eliminar producto (soft delete - solo admin)
  async delete(productId) {
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    product.isActive = false;
    await product.save();

    return product;
  }

  // Obtener historial de inventario
  async getInventoryHistory(productId, filters = {}) {
    const { page = 1, limit = 20, type } = filters;

    const query = { productId };
    if (type) query.type = type;

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      InventoryTx.find(query)
        .populate('productId', 'name sku')
        .sort({ occurredAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      InventoryTx.countDocuments(query)
    ]);

    return {
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

}

module.exports = new ProductService(); 