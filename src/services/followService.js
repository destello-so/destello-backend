const Follow = require('../models/Follow');
const User = require('../models/User');
const { ValidationError, NotFoundError } = require('../utils/errors');

class FollowService {
  /**
   * Seguir a un usuario
   */
  async followUser(followerId, followingId) {
    try {
      // Validar que no se siga a sí mismo
      if (followerId === followingId) {
        throw new ValidationError('No puedes seguirte a ti mismo');
      }

      // Verificar que ambos usuarios existen
      const [follower, following] = await Promise.all([
        User.findById(followerId),
        User.findById(followingId)
      ]);

      if (!follower || !following) {
        throw new NotFoundError('Usuario no encontrado');
      }

      // Verificar si ya existe el seguimiento
      const existingFollow = await Follow.findOne({
        userId: followerId,
        targetUserId: followingId
      });

      if (existingFollow) {
        throw new ValidationError('Ya sigues a este usuario');
      }

      // Crear el seguimiento
      const follow = new Follow({
        userId: followerId,
        targetUserId: followingId
      });

      await follow.save();
      await follow.populate('userId', 'firstName lastName email profilePicture');
      await follow.populate('targetUserId', 'firstName lastName email profilePicture');

      return follow;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Dejar de seguir a un usuario
   */
  async unfollowUser(followerId, followingId) {
    try {
      const follow = await Follow.findOne({
        userId: followerId,
        targetUserId: followingId
      });

      if (!follow) {
        throw new ValidationError('No sigues a este usuario');
      }

      await Follow.findByIdAndDelete(follow._id);

      return { message: 'Dejaste de seguir al usuario exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar si un usuario sigue a otro
   */
  async isFollowing(followerId, followingId) {
    try {
      const follow = await Follow.findOne({
        userId: followerId,
        targetUserId: followingId
      });

      return !!follow;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener usuarios que sigue un usuario específico
   */
  async getFollowing(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const following = await Follow.find({ userId })
        .populate('targetUserId', 'firstName lastName email profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Follow.countDocuments({ userId });

      return {
        following: following.map(f => f.targetUserId),
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
   * Obtener seguidores de un usuario específico
   */
  async getFollowers(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const followers = await Follow.find({ targetUserId: userId })
        .populate('userId', 'firstName lastName email profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Follow.countDocuments({ targetUserId: userId });

      return {
        followers: followers.map(f => f.userId),
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
   * Obtener estadísticas de seguimiento de un usuario
   */
  async getUserFollowStats(userId) {
    try {
      const [followingCount, followersCount] = await Promise.all([
        Follow.countDocuments({ userId }),
        Follow.countDocuments({ targetUserId: userId })
      ]);

      return {
        following: followingCount,
        followers: followersCount
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener sugerencias de usuarios para seguir
   */
  async getFollowSuggestions(userId, limit = 10) {
    try {
      // Obtener usuarios que ya sigue
      const following = await Follow.find({ userId })
        .select('targetUserId');

      const followingIds = following.map(f => f.targetUserId);
      followingIds.push(userId); // Excluir al usuario actual

      // Buscar usuarios que no sigue
      const suggestions = await User.find({
        _id: { $nin: followingIds },
        isActive: true
      })
        .select('firstName lastName email profilePicture')
        .limit(limit);

      return suggestions;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new FollowService(); 