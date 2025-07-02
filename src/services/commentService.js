const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Product = require('../models/Product');
const Review = require('../models/Review');
const User = require('../models/User');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { CONSTANTS } = require('../config');

class CommentService {
  /**
   * Crear un comentario polimórfico (post, producto, review, etc)
   */
  async createComment(userId, parentType, parentId, text) {
    try {
      // Validar texto
      if (!text || text.trim().length === 0) {
        throw new ValidationError('El texto del comentario es requerido');
      }
      if (text.length > 1000) {
        throw new ValidationError('El comentario no puede exceder 1000 caracteres');
      }

      // Validar parentType
      if (!Object.values(CONSTANTS.COMMENT_PARENT_TYPES).includes(parentType)) {
        throw new ValidationError('Tipo de parent inválido');
      }

      // Validar que el parent existe
      let parent;
      switch (parentType) {
        case 'post':
          parent = await Post.findById(parentId);
          break;
        case 'product':
          parent = await Product.findById(parentId);
          break;
        case 'review':
          parent = await Review.findById(parentId);
          break;
        default:
          parent = null;
      }
      if (!parent) throw new NotFoundError('Elemento a comentar no encontrado');

      // Crear comentario
      const comment = new Comment({
        parentType,
        parentId,
        userId,
        text: text.trim()
      });
      await comment.save();
      await comment.populate('userId', 'username email profilePicture');
      return comment;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener comentarios de un parent (post, producto, review, etc) con paginación
   */
  async getCommentsByParent(parentType, parentId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const comments = await Comment.find({ parentType, parentId })
        .populate('userId', 'username email profilePicture')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit);
      const total = await Comment.countDocuments({ parentType, parentId });
      return {
        comments,
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
   * Obtener un comentario específico por ID
   */
  async getCommentById(commentId) {
    try {
      const comment = await Comment.findById(commentId)
        .populate('userId', 'username email profilePicture');
      if (!comment) {
        throw new NotFoundError('Comentario no encontrado');
      }
      return comment;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar un comentario
   */
  async updateComment(commentId, userId, text) {
    try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw new NotFoundError('Comentario no encontrado');
      }
      if (comment.userId.toString() !== userId.toString()) {
        throw new ValidationError('No tienes permisos para editar este comentario');
      }
      if (!text || text.trim().length === 0) {
        throw new ValidationError('El texto del comentario es requerido');
      }
      if (text.length > 1000) {
        throw new ValidationError('El comentario no puede exceder 1000 caracteres');
      }
      comment.text = text.trim();
      await comment.save();
      await comment.populate('userId', 'username email profilePicture');
      return comment;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar un comentario
   */
  async deleteComment(commentId, userId) {
    try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw new NotFoundError('Comentario no encontrado');
      }
      if (comment.userId.toString() !== userId.toString()) {
        throw new ValidationError('No tienes permisos para eliminar este comentario');
      }
      await Comment.findByIdAndDelete(commentId);
      return { message: 'Comentario eliminado exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener comentarios de un usuario específico
   */
  async getCommentsByUser(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const comments = await Comment.find({ userId })
        .populate('userId', 'username email profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      const total = await Comment.countDocuments({ userId });
      return {
        comments,
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
   * Obtener estadísticas de comentarios de un parent
   */
  async getParentCommentStats(parentType, parentId) {
    try {
      const commentCount = await Comment.countDocuments({ parentType, parentId });
      return {
        commentCount,
        parentType,
        parentId
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener comentarios recientes (últimos comentarios de cualquier parent)
   */
  async getRecentComments(limit = 10) {
    try {
      const comments = await Comment.find()
        .populate('userId', 'username email profilePicture')
        .sort({ createdAt: -1 })
        .limit(limit);
      return comments;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CommentService(); 