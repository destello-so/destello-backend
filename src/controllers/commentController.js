const commentService = require('../services/commentService');
const { ValidationError } = require('../utils/errors');

class CommentController {
  // Crear comentario
  async createComment(req, res, next) {
    try {
      const userId = req.user.id;
      const { parentType, parentId, text } = req.body;
      const comment = await commentService.createComment(userId, parentType, parentId, text);
      res.created(comment, 'Comentario creado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  // Obtener comentarios de un parent (post, producto, review)
  async getCommentsByParent(req, res, next) {
    try {
      const { parentType, parentId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const result = await commentService.getCommentsByParent(
        parentType,
        parentId,
        parseInt(page),
        parseInt(limit)
      );
      res.success(result, 'Comentarios obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  // Obtener un comentario por ID
  async getCommentById(req, res, next) {
    try {
      const { commentId } = req.params;
      const comment = await commentService.getCommentById(commentId);
      res.success(comment, 'Comentario obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  }

  // Actualizar comentario (solo autor)
  async updateComment(req, res, next) {
    try {
      const userId = req.user.id;
      const { commentId } = req.params;
      const { text } = req.body;
      const updated = await commentService.updateComment(commentId, userId, text);
      res.updated(updated, 'Comentario actualizado exitosamente');
    } catch (error) {
      next(error);
    }
  }

  // Eliminar comentario (solo autor)
  async deleteComment(req, res, next) {
    try {
      const userId = req.user.id;
      const { commentId } = req.params;
      const result = await commentService.deleteComment(commentId, userId);
      res.deleted(result.message);
    } catch (error) {
      next(error);
    }
  }

  // Obtener comentarios de un usuario
  async getCommentsByUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const result = await commentService.getCommentsByUser(
        userId,
        parseInt(page),
        parseInt(limit)
      );
      res.success(result, 'Comentarios del usuario obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  // Obtener estadísticas de comentarios de un parent
  async getParentCommentStats(req, res, next) {
    try {
      const { parentType, parentId } = req.params;
      const stats = await commentService.getParentCommentStats(parentType, parentId);
      res.success(stats, 'Estadísticas de comentarios obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  // Obtener comentarios recientes
  async getRecentComments(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const comments = await commentService.getRecentComments(parseInt(limit));
      res.success(comments, 'Comentarios recientes obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentController(); 