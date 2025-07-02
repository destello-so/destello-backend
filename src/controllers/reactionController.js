const reactionService = require('../services/reactionService');
const { ValidationError } = require('../utils/errors');

class ReactionController {
  /**
   * Crear o actualizar una reacción
   * POST /api/reactions
   */
  async createOrUpdateReaction(req, res, next) {
    try {
      const { targetType, targetId, reactionType } = req.body;
      const userId = req.user.id;

      // Validaciones básicas
      if (!targetType || !targetId || !reactionType) {
        throw new ValidationError('targetType, targetId y reactionType son requeridos');
      }

      const result = await reactionService.createOrUpdateReaction(
        userId,
        targetType,
        targetId,
        reactionType
      );

      res.success(
        { action: result.action, reaction: result.reaction },
        result.message
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar una reacción
   * DELETE /api/reactions/:targetType/:targetId
   */
  async removeReaction(req, res, next) {
    try {
      const { targetType, targetId } = req.params;
      const userId = req.user.id;

      const result = await reactionService.removeReaction(userId, targetType, targetId);

      res.success(null, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener reacciones de un target específico
   * GET /api/reactions/:targetType/:targetId
   */
  async getTargetReactions(req, res, next) {
    try {
      const { targetType, targetId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const result = await reactionService.getTargetReactions(
        targetType,
        targetId,
        parseInt(page),
        parseInt(limit)
      );

      res.success(
        result,
        'Reacciones obtenidas exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas de reacciones de un target
   * GET /api/reactions/:targetType/:targetId/stats
   */
  async getTargetReactionStats(req, res, next) {
    try {
      const { targetType, targetId } = req.params;

      const stats = await reactionService.getTargetReactionStats(targetType, targetId);

      res.success(
        stats,
        'Estadísticas de reacciones obtenidas exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener reacciones del usuario autenticado
   * GET /api/reactions/user/me
   */
  async getMyReactions(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;

      const result = await reactionService.getUserReactions(
        userId,
        parseInt(page),
        parseInt(limit)
      );

      res.success(
        result,
        'Mis reacciones obtenidas exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener reacciones de un usuario específico
   * GET /api/reactions/user/:userId
   */
  async getUserReactions(req, res, next) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const result = await reactionService.getUserReactions(
        userId,
        parseInt(page),
        parseInt(limit)
      );

      res.success(
        result,
        'Reacciones del usuario obtenidas exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verificar si el usuario ha reaccionado a un target
   * GET /api/reactions/:targetType/:targetId/check
   */
  async checkUserReaction(req, res, next) {
    try {
      const { targetType, targetId } = req.params;
      const userId = req.user.id;

      const result = await reactionService.hasUserReacted(userId, targetType, targetId);

      res.success(
        result,
        'Estado de reacción verificado exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener usuarios que reaccionaron a un target
   * GET /api/reactions/:targetType/:targetId/users
   */
  async getUsersWhoReacted(req, res, next) {
    try {
      const { targetType, targetId } = req.params;
      const { reactionType, page = 1, limit = 20 } = req.query;

      const result = await reactionService.getUsersWhoReacted(
        targetType,
        targetId,
        reactionType || null,
        parseInt(page),
        parseInt(limit)
      );

      res.success(
        result,
        'Usuarios que reaccionaron obtenidos exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener posts más reaccionados
   * GET /api/reactions/posts/popular
   */
  async getMostReactedPosts(req, res, next) {
    try {
      const { limit = 10, timeFrame = '7d' } = req.query;

      // Validar timeFrame
      if (!['7d', '30d'].includes(timeFrame)) {
        throw new ValidationError('timeFrame debe ser "7d" o "30d"');
      }

      const posts = await reactionService.getMostReactedPosts(
        parseInt(limit),
        timeFrame
      );

      res.success(
        { posts },
        'Posts más reaccionados obtenidos exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener reacciones recientes
   * GET /api/reactions/recent
   */
  async getRecentReactions(req, res, next) {
    try {
      const { limit = 20 } = req.query;

      const reactions = await reactionService.getRecentReactions(parseInt(limit));

      res.success(
        { reactions },
        'Reacciones recientes obtenidas exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener resumen de reacciones (para dashboard)
   * GET /api/reactions/summary
   */
  async getReactionSummary(req, res, next) {
    try {
      const userId = req.user.id;

      // Obtener estadísticas generales
      const [myReactions, recentReactions, popularPosts] = await Promise.all([
        reactionService.getUserReactions(userId, 1, 5), // Últimas 5 reacciones
        reactionService.getRecentReactions(10), // 10 reacciones recientes
        reactionService.getMostReactedPosts(5, '7d') // 5 posts más populares
      ]);

      const summary = {
        myRecentReactions: myReactions.reactions,
        recentReactions: recentReactions,
        popularPosts: popularPosts,
        totalMyReactions: myReactions.pagination.total
      };

      res.success(
        summary,
        'Resumen de reacciones obtenido exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReactionController();