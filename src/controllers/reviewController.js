const reviewService = require('../services/reviewService');
const { ValidationError } = require('../utils/errors');

class ReviewController {
  // Crear reseña
  async createReview(req, res, next) {
    try {
      const userId = req.user.id;
      const { productId, rating, title, body } = req.body;
      const review = await reviewService.createReview(userId, productId, { rating, title, body });
      res.created(review, 'Reseña creada exitosamente');
    } catch (error) {
      next(error);
    }
  }

  // Obtener reseñas de un producto
  async getProductReviews(req, res, next) {
    try {
      const { productId } = req.params;
      const { page = 1, limit = 10, sortBy = 'createdAt' } = req.query;
      const result = await reviewService.getProductReviews(
        productId,
        parseInt(page),
        parseInt(limit),
        sortBy
      );
      res.success(result, 'Reseñas del producto obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  // Obtener una reseña por ID
  async getReviewById(req, res, next) {
    try {
      const { reviewId } = req.params;
      const review = await reviewService.getReviewById(reviewId);
      res.success(review, 'Reseña obtenida exitosamente');
    } catch (error) {
      next(error);
    }
  }

  // Actualizar reseña (solo autor)
  async updateReview(req, res, next) {
    try {
      const userId = req.user.id;
      const { reviewId } = req.params;
      const { rating, title, body } = req.body;
      const updated = await reviewService.updateReview(reviewId, userId, { rating, title, body });
      res.updated(updated, 'Reseña actualizada exitosamente');
    } catch (error) {
      next(error);
    }
  }

  // Eliminar reseña (solo autor)
  async deleteReview(req, res, next) {
    try {
      const userId = req.user.id;
      const { reviewId } = req.params;
      const result = await reviewService.deleteReview(reviewId, userId);
      res.deleted(result.message);
    } catch (error) {
      next(error);
    }
  }

  // Marcar reseña como útil
  async markAsHelpful(req, res, next) {
    try {
      const { reviewId } = req.params;
      const review = await reviewService.markAsHelpful(reviewId);
      res.success(review, 'Reseña marcada como útil');
    } catch (error) {
      next(error);
    }
  }

  // Obtener reseñas de un usuario
  async getUserReviews(req, res, next) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const result = await reviewService.getUserReviews(
        userId,
        parseInt(page),
        parseInt(limit)
      );
      res.success(result, 'Reseñas del usuario obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  // Obtener estadísticas de reseñas de un producto
  async getProductReviewStats(req, res, next) {
    try {
      const { productId } = req.params;
      const stats = await reviewService.getProductReviewStats(productId);
      res.success(stats, 'Estadísticas de reseñas obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  // Buscar reseñas por contenido
  async searchReviews(req, res, next) {
    try {
      const { searchTerm, page = 1, limit = 10 } = req.query;
      const result = await reviewService.searchReviews(searchTerm, parseInt(page), parseInt(limit));
      res.success(result, 'Resultados de búsqueda de reseñas obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReviewController(); 