const Reaction = require('../models/Reaction');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { CONSTANTS } = require('../config');

class ReactionService {
  /**
   * Crear o actualizar una reacción
   */
  async createOrUpdateReaction(userId, targetType, targetId, reactionType) {
    try {
      // Validar tipo de reacción
      if (!Object.values(CONSTANTS.REACTION_TYPES).includes(reactionType)) {
        throw new ValidationError('Tipo de reacción inválido');
      }

      // Validar tipo de target
      if (!Object.values(CONSTANTS.REACTION_TARGET_TYPES).includes(targetType)) {
        throw new ValidationError('Tipo de target inválido');
      }

      // Verificar que el target existe
      await this.verifyTargetExists(targetType, targetId);

      // Buscar reacción existente
      let reaction = await Reaction.findOne({
        targetType,
        targetId,
        userId
      });

      if (reaction) {
        // Actualizar reacción existente
        if (reaction.type === reactionType) {
          // Si es el mismo tipo, eliminar la reacción (toggle)
          await Reaction.findByIdAndDelete(reaction._id);
          return { 
            message: 'Reacción eliminada',
            action: 'removed',
            reaction: null
          };
        } else {
          // Cambiar tipo de reacción
          reaction.type = reactionType;
          await reaction.save();
          return {
            message: 'Reacción actualizada',
            action: 'updated',
            reaction
          };
        }
      } else {
        // Crear nueva reacción
        reaction = new Reaction({
          targetType,
          targetId,
          userId,
          type: reactionType
        });
        await reaction.save();
        
        return {
          message: 'Reacción creada',
          action: 'created',
          reaction
        };
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar una reacción
   */
  async removeReaction(userId, targetType, targetId) {
    try {
      const reaction = await Reaction.findOne({
        targetType,
        targetId,
        userId
      });

      if (!reaction) {
        throw new NotFoundError('Reacción no encontrada');
      }

      await Reaction.findByIdAndDelete(reaction._id);

      return { message: 'Reacción eliminada exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener reacciones de un target específico
   */
  async getTargetReactions(targetType, targetId, page = 1, limit = 20) {
    try {
      // Verificar que el target existe
      await this.verifyTargetExists(targetType, targetId);

      const skip = (page - 1) * limit;

      const reactions = await Reaction.find({ targetType, targetId })
        .populate('userId', 'firstName lastName email profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Reaction.countDocuments({ targetType, targetId });

      // Agrupar por tipo de reacción
      const reactionsByType = {};
      Object.values(CONSTANTS.REACTION_TYPES).forEach(type => {
        reactionsByType[type] = reactions.filter(r => r.type === type);
      });

      return {
        reactions,
        reactionsByType,
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
   * Obtener estadísticas de reacciones de un target
   */
  async getTargetReactionStats(targetType, targetId) {
    try {
      // Verificar que el target existe
      await this.verifyTargetExists(targetType, targetId);

      const reactions = await Reaction.find({ targetType, targetId });
      
      const stats = {
        total: reactions.length,
        byType: {}
      };

      // Inicializar contadores por tipo
      Object.values(CONSTANTS.REACTION_TYPES).forEach(type => {
        stats.byType[type] = 0;
      });

      // Contar reacciones por tipo
      reactions.forEach(reaction => {
        stats.byType[reaction.type]++;
      });

      return stats;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener reacciones de un usuario específico
   */
  async getUserReactions(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const reactions = await Reaction.find({ userId })
        .populate('userId', 'firstName lastName email profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Poblar targets dinámicamente
      const populatedReactions = await this.populateTargets(reactions);

      const total = await Reaction.countDocuments({ userId });

      return {
        reactions: populatedReactions,
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
   * Verificar si un usuario ha reaccionado a un target específico
   */
  async hasUserReacted(userId, targetType, targetId) {
    try {
      const reaction = await Reaction.findOne({
        targetType,
        targetId,
        userId
      });

      return {
        hasReacted: !!reaction,
        reactionType: reaction ? reaction.type : null,
        reaction
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener usuarios que reaccionaron a un target
   */
  async getUsersWhoReacted(targetType, targetId, reactionType = null, page = 1, limit = 20) {
    try {
      // Verificar que el target existe
      await this.verifyTargetExists(targetType, targetId);

      const skip = (page - 1) * limit;
      
      const query = { targetType, targetId };
      if (reactionType) {
        query.type = reactionType;
      }

      const reactions = await Reaction.find(query)
        .populate('userId', 'firstName lastName email profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Reaction.countDocuments(query);

      const users = reactions.map(reaction => ({
        user: reaction.userId,
        reactionType: reaction.type,
        reactedAt: reaction.createdAt
      }));

      return {
        users,
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
   * Obtener posts más reaccionados
   */
  async getMostReactedPosts(limit = 10, timeFrame = '7d') {
    try {
      const dateFilter = {};
      if (timeFrame === '7d') {
        dateFilter.createdAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
      } else if (timeFrame === '30d') {
        dateFilter.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
      }

      const reactions = await Reaction.aggregate([
        { $match: { targetType: 'post', ...dateFilter } },
        {
          $group: {
            _id: '$targetId',
            totalReactions: { $sum: 1 },
            reactionsByType: {
              $push: '$type'
            }
          }
        },
        { $sort: { totalReactions: -1 } },
        { $limit: limit }
      ]);

      // Si no hay reacciones, retornar array vacío
      if (reactions.length === 0) {
        return [];
      }

      // Obtener detalles de los posts
      const postIds = reactions.map(r => r._id);
      const posts = await Post.find({ _id: { $in: postIds } })
        .populate('userId', 'firstName lastName email profilePicture');

      // Combinar resultados
      const postsWithReactions = reactions.map(reaction => {
        const post = posts.find(p => p._id.toString() === reaction._id.toString());
        return {
          post,
          totalReactions: reaction.totalReactions,
          reactionsByType: reaction.reactionsByType.reduce((acc, type) => {
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {})
        };
      }).filter(item => item.post); // Filtrar posts que no existen

      return postsWithReactions;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar que el target existe
   */
  async verifyTargetExists(targetType, targetId) {
    let target;
    
    switch (targetType) {
      case 'post':
        target = await Post.findById(targetId);
        break;
      case 'comment':
        target = await Comment.findById(targetId);
        break;
      case 'review':
        target = await Review.findById(targetId);
        break;
      case 'product':
        target = await Product.findById(targetId);
        break;
      default:
        throw new ValidationError('Tipo de target no soportado');
    }

    if (!target) {
      throw new NotFoundError(`${targetType} no encontrado`);
    }

    return target;
  }

  /**
   * Poblar targets dinámicamente (método auxiliar)
   */
  async populateTargets(reactions) {
    const populatedReactions = [];

    for (const reaction of reactions) {
      let target;
      
      switch (reaction.targetType) {
        case 'post':
          target = await Post.findById(reaction.targetId)
            .populate('userId', 'firstName lastName email profilePicture');
          break;
        case 'comment':
          target = await Comment.findById(reaction.targetId)
            .populate('author', 'firstName lastName email profilePicture');
          break;
        case 'review':
          target = await Review.findById(reaction.targetId)
            .populate('userId', 'firstName lastName email profilePicture')
            .populate('productId', 'name sku imageUrl');
          break;
        case 'product':
          target = await Product.findById(reaction.targetId);
          break;
        default:
          target = null;
      }

      populatedReactions.push({
        ...reaction.toObject(),
        target
      });
    }

    return populatedReactions;
  }

  /**
   * Obtener reacciones recientes (para notificaciones)
   */
  async getRecentReactions(limit = 20) {
    try {
      const reactions = await Reaction.find()
        .populate('userId', 'firstName lastName email profilePicture')
        .sort({ createdAt: -1 })
        .limit(limit);

      // Poblar targets dinámicamente
      const populatedReactions = await this.populateTargets(reactions);

      return populatedReactions;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ReactionService();