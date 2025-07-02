const { followService } = require('../services');

class FollowController {
  // Seguir a un usuario
  async followUser(req, res) {
    try {
      const followerId = req.user._id;
      const { targetUserId } = req.body;
      
      const follow = await followService.followUser(followerId, targetUserId);
      return res.created(follow, 'Usuario seguido exitosamente');
    } catch (error) {
      if (error.statusCode === 400) return res.badRequest(error.message);
      if (error.statusCode === 404) return res.notFound(error.message);
      return res.internal('Error al seguir usuario');
    }
  }

  // Dejar de seguir a un usuario
  async unfollowUser(req, res) {
    try {
      const followerId = req.user._id;
      const { targetUserId } = req.body;
      
      const result = await followService.unfollowUser(followerId, targetUserId);
      return res.success(result, 'Dejaste de seguir al usuario exitosamente');
    } catch (error) {
      if (error.statusCode === 400) return res.badRequest(error.message);
      return res.internal('Error al dejar de seguir usuario');
    }
  }

  // Verificar si un usuario sigue a otro
  async isFollowing(req, res) {
    try {
      const followerId = req.user._id;
      const { targetUserId } = req.query;
      
      const isFollowing = await followService.isFollowing(followerId, targetUserId);
      return res.success(
        { isFollowing }, 
        isFollowing ? 'Sigues a este usuario' : 'No sigues a este usuario'
      );
    } catch (error) {
      return res.internal('Error al verificar seguimiento');
    }
  }

  // Obtener usuarios que sigue el usuario autenticado
  async getFollowing(req, res) {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 20 } = req.query;
      
      const result = await followService.getFollowing(userId, Number(page), Number(limit));
      return res.paginated(result.following, result.pagination, 'Usuarios seguidos obtenidos exitosamente');
    } catch (error) {
      return res.internal('Error al obtener usuarios seguidos');
    }
  }

  // Obtener seguidores del usuario autenticado
  async getFollowers(req, res) {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 20 } = req.query;
      
      const result = await followService.getFollowers(userId, Number(page), Number(limit));
      return res.paginated(result.followers, result.pagination, 'Seguidores obtenidos exitosamente');
    } catch (error) {
      return res.internal('Error al obtener seguidores');
    }
  }

  // Obtener usuarios que sigue un usuario específico (público)
  async getUserFollowing(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const result = await followService.getFollowing(userId, Number(page), Number(limit));
      return res.paginated(result.following, result.pagination, 'Usuarios seguidos obtenidos exitosamente');
    } catch (error) {
      return res.internal('Error al obtener usuarios seguidos');
    }
  }

  // Obtener seguidores de un usuario específico (público)
  async getUserFollowers(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const result = await followService.getFollowers(userId, Number(page), Number(limit));
      return res.paginated(result.followers, result.pagination, 'Seguidores obtenidos exitosamente');
    } catch (error) {
      return res.internal('Error al obtener seguidores');
    }
  }

  // Obtener estadísticas de seguimiento del usuario autenticado
  async getFollowStats(req, res) {
    try {
      const userId = req.user._id;
      const stats = await followService.getUserFollowStats(userId);
      return res.success(stats, 'Estadísticas de seguimiento obtenidas exitosamente');
    } catch (error) {
      return res.internal('Error al obtener estadísticas de seguimiento');
    }
  }

  // Obtener estadísticas de seguimiento de un usuario específico (público)
  async getUserFollowStats(req, res) {
    try {
      const { userId } = req.params;
      const stats = await followService.getUserFollowStats(userId);
      return res.success(stats, 'Estadísticas de seguimiento obtenidas exitosamente');
    } catch (error) {
      return res.internal('Error al obtener estadísticas de seguimiento');
    }
  }

  // Obtener sugerencias de usuarios para seguir
  async getFollowSuggestions(req, res) {
    try {
      const userId = req.user._id;
      const { limit = 10 } = req.query;
      
      const suggestions = await followService.getFollowSuggestions(userId, Number(limit));
      return res.success(suggestions, 'Sugerencias de usuarios obtenidas exitosamente');
    } catch (error) {
      return res.internal('Error al obtener sugerencias de usuarios');
    }
  }
}

module.exports = new FollowController(); 