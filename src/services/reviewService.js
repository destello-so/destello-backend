const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');
const { ValidationError, NotFoundError } = require('../utils/errors');

class ReviewService {
  /**
   * Crear una nueva reseña
   */
  async createReview(userId, productId, reviewData) {
    try {
      const { rating, title, body } = reviewData;
      
      // Validar que el producto existe y está activo
      const product = await Product.findOne({ _id: productId, isActive: true });
      if (!product) {
        throw new NotFoundError('Producto no encontrado o no disponible');
      }

      // Verificar si el usuario ya ha reseñado este producto
      const existingReview = await Review.findOne({ userId, productId });
      if (existingReview) {
        throw new ValidationError('Ya has reseñado este producto');
      }

      // Validar rating
      if (rating < 1 || rating > 5) {
        throw new ValidationError('La calificación debe estar entre 1 y 5');
      }

      // Validar título y contenido
      if (!title || title.trim().length === 0) {
        throw new ValidationError('El título es requerido');
      }

      if (!body || body.trim().length === 0) {
        throw new ValidationError('El contenido de la reseña es requerido');
      }

      const review = new Review({
        userId,
        productId,
        rating,
        title: title.trim(),
        body: body.trim()
      });

      await review.save();
      await review.populate('userId', 'username email profilePicture');
      await review.populate('productId', 'name sku imageUrl');

      return review;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener reseñas de un producto con paginación
   */
  async getProductReviews(productId, page = 1, limit = 10, sortBy = 'createdAt') {
    try {
      const skip = (page - 1) * limit;
      
      // Verificar que el producto existe
      const product = await Product.findById(productId);
      if (!product) {
        throw new NotFoundError('Producto no encontrado');
      }

      let sortQuery = {};
      switch (sortBy) {
        case 'rating':
          sortQuery = { rating: -1, createdAt: -1 };
          break;
        case 'helpful':
          sortQuery = { helpfulCount: -1, createdAt: -1 };
          break;
        case 'newest':
          sortQuery = { createdAt: -1 };
          break;
        case 'oldest':
          sortQuery = { createdAt: 1 };
          break;
        default:
          sortQuery = { createdAt: -1 };
      }

      const reviews = await Review.find({ productId })
        .populate('userId', 'username email profilePicture')
        .populate('productId', 'name sku imageUrl')
        .sort(sortQuery)
        .skip(skip)
        .limit(limit);

      const total = await Review.countDocuments({ productId });

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener una reseña específica por ID
   */
  async getReviewById(reviewId) {
    try {
      const review = await Review.findById(reviewId)
        .populate('userId', 'username email profilePicture')
        .populate('productId', 'name sku imageUrl');

      if (!review) {
        throw new NotFoundError('Reseña no encontrada');
      }

      return review;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar una reseña
   */
  async updateReview(reviewId, userId, updateData) {
    try {
      const { rating, title, body } = updateData;
      
      const review = await Review.findById(reviewId);
      
      if (!review) {
        throw new NotFoundError('Reseña no encontrada');
      }

      if (review.userId.toString() !== userId.toString()) {
        throw new ValidationError('No tienes permisos para editar esta reseña');
      }

      // Validar rating si se proporciona
      if (rating !== undefined && (rating < 1 || rating > 5)) {
        throw new ValidationError('La calificación debe estar entre 1 y 5');
      }

      // Validar título y contenido si se proporcionan
      if (title !== undefined && title.trim().length === 0) {
        throw new ValidationError('El título es requerido');
      }

      if (body !== undefined && body.trim().length === 0) {
        throw new ValidationError('El contenido de la reseña es requerido');
      }

      const updates = {};
      if (rating !== undefined) updates.rating = rating;
      if (title !== undefined) updates.title = title.trim();
      if (body !== undefined) updates.body = body.trim();

      const updatedReview = await Review.findByIdAndUpdate(
        reviewId,
        updates,
        { new: true }
      ).populate('userId', 'username email profilePicture')
       .populate('productId', 'name sku imageUrl');

      return updatedReview;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar una reseña
   */
  async deleteReview(reviewId, userId) {
    try {
      const review = await Review.findById(reviewId);
      
      if (!review) {
        throw new NotFoundError('Reseña no encontrada');
      }

      if (review.userId.toString() !== userId.toString()) {
        throw new ValidationError('No tienes permisos para eliminar esta reseña');
      }

      await Review.findByIdAndDelete(reviewId);

      return { message: 'Reseña eliminada exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Marcar una reseña como útil
   */
  async markAsHelpful(reviewId) {
    try {
      const review = await Review.findById(reviewId);
      
      if (!review) {
        throw new NotFoundError('Reseña no encontrada');
      }

      await review.incrementHelpful();
      return review;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener reseñas de un usuario específico
   */
  async getUserReviews(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const reviews = await Review.find({ userId })
        .populate('productId', 'name sku imageUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Review.countDocuments({ userId });

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de reseñas de un producto
   */
  async getProductReviewStats(productId) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new NotFoundError('Producto no encontrado');
      }

      const reviews = await Review.find({ productId });
      
      if (reviews.length === 0) {
        return {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0
          },
          helpfulReviews: 0
        };
      }

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      const ratingDistribution = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      };

      let helpfulReviews = 0;

      reviews.forEach(review => {
        ratingDistribution[review.rating]++;
        if (review.helpfulCount > 0) {
          helpfulReviews++;
        }
      });

      return {
        totalReviews: reviews.length,
        averageRating: Math.round(averageRating * 10) / 10, // Redondear a 1 decimal
        ratingDistribution,
        helpfulReviews
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar reseñas por contenido
   */
  async searchReviews(searchTerm, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const searchRegex = new RegExp(searchTerm, 'i');
      
      const reviews = await Review.find({
        $or: [
          { title: searchRegex },
          { body: searchRegex }
        ]
      })
        .populate('userId', 'username email profilePicture')
        .populate('productId', 'name sku imageUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Review.countDocuments({
        $or: [
          { title: searchRegex },
          { body: searchRegex }
        ]
      });

      return {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ReviewService();