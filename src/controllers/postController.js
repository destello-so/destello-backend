const { postService } = require('../services');

class PostController {
  // Crear un nuevo post
  async createPost(req, res) {
    try {
      const userId = req.user._id;
      const { text, tags } = req.body;
      
      const post = await postService.createPost(userId, { text, tags });
      return res.created(post, 'Post creado exitosamente');
    } catch (error) {
      if (error.statusCode === 400) return res.badRequest(error.message);
      if (error.statusCode === 404) return res.notFound(error.message);
      return res.internal('Error al crear el post');
    }
  }

  // Obtener posts con paginación
  async getPosts(req, res) {
    try {
      const { page = 1, limit = 10, userId } = req.query;
      const result = await postService.getPosts(Number(page), Number(limit), userId);
      return res.paginated(result.posts, result.pagination, 'Posts obtenidos exitosamente');
    } catch (error) {
      if (error.statusCode === 404) return res.notFound(error.message);
      return res.internal('Error al obtener los posts');
    }
  }

  // Obtener un post específico por ID
  async getPostById(req, res) {
    try {
      const { postId } = req.params;
      const post = await postService.getPostById(postId);
      return res.success(post, 'Post obtenido exitosamente');
    } catch (error) {
      if (error.statusCode === 404) return res.notFound(error.message);
      return res.internal('Error al obtener el post');
    }
  }

  // Actualizar un post
  async updatePost(req, res) {
    try {
      const userId = req.user._id;
      console.log('==> [updatePost] userId:', userId);
      const { postId } = req.params;
      const { text, tags } = req.body;
      
      const post = await postService.updatePost(postId, userId, { text, tags });
      return res.success(post, 'Post actualizado exitosamente');
    } catch (error) {
      if (error.statusCode === 400) return res.badRequest(error.message);
      if (error.statusCode === 404) return res.notFound(error.message);
      return res.internal('Error al actualizar el post');
    }
  }

  // Eliminar un post
  async deletePost(req, res) {
    try {
      const userId = req.user._id;
      const { postId } = req.params;
      
      const result = await postService.deletePost(postId, userId);
      return res.success(result, 'Post eliminado exitosamente');
    } catch (error) {
      if (error.statusCode === 400) return res.badRequest(error.message);
      if (error.statusCode === 404) return res.notFound(error.message);
      return res.internal('Error al eliminar el post');
    }
  }

  // Obtener feed de posts (posts de usuarios seguidos + propios)
  async getFeedPosts(req, res) {
    try {
      console.log('req.user:', req.user);
      const userId = req.user._id;
      const { page = 1, limit = 10 } = req.query;
      const result = await postService.getFeedPosts(userId, Number(page), Number(limit));
      return res.paginated(result.posts, result.pagination, 'Feed de posts obtenido exitosamente');
    } catch (error) {
      console.error('Error en getFeedPosts:', error);
      if (error.statusCode === 404) return res.notFound(error.message);
      return res.internal('Error al obtener el feed de posts');
    }
  }

  // Buscar posts
  async searchPosts(req, res) {
    try {
      const { q: searchTerm, page = 1, limit = 10 } = req.query;
      
      if (!searchTerm) {
        return res.badRequest('El término de búsqueda es requerido');
      }
      
      const result = await postService.searchPosts(searchTerm, Number(page), Number(limit));
      return res.paginated(result.posts, result.pagination, 'Búsqueda completada exitosamente');
    } catch (error) {
      if (error.statusCode === 400) return res.badRequest(error.message);
      return res.internal('Error al buscar posts');
    }
  }

  // Obtener posts por tag
  async getPostsByTag(req, res) {
    try {
      const { tag, page = 1, limit = 10 } = req.query;
      
      if (!tag) {
        return res.badRequest('El tag es requerido');
      }
      
      const result = await postService.getPostsByTag(tag, Number(page), Number(limit));
      return res.paginated(result.posts, result.pagination, 'Posts por tag obtenidos exitosamente');
    } catch (error) {
      return res.internal('Error al obtener posts por tag');
    }
  }

  // Agregar tag a un post
  async addTagToPost(req, res) {
    try {
      const userId = req.user._id;
      const { postId } = req.params;
      const { tag } = req.body;
      
      if (!tag) {
        return res.badRequest('El tag es requerido');
      }
      
      const post = await postService.addTagToPost(postId, userId, tag);
      return res.success(post, 'Tag agregado exitosamente');
    } catch (error) {
      if (error.statusCode === 400) return res.badRequest(error.message);
      if (error.statusCode === 404) return res.notFound(error.message);
      return res.internal('Error al agregar tag al post');
    }
  }

  // Remover tag de un post
  async removeTagFromPost(req, res) {
    try {
      const userId = req.user._id;
      const { postId } = req.params;
      const { tag } = req.body;
      
      if (!tag) {
        return res.badRequest('El tag es requerido');
      }
      
      const post = await postService.removeTagFromPost(postId, userId, tag);
      return res.success(post, 'Tag removido exitosamente');
    } catch (error) {
      if (error.statusCode === 400) return res.badRequest(error.message);
      if (error.statusCode === 404) return res.notFound(error.message);
      return res.internal('Error al remover tag del post');
    }
  }

  // Obtener estadísticas de posts del usuario
  async getUserPostStats(req, res) {
    try {
      const userId = req.user._id;
      const stats = await postService.getUserPostStats(userId);
      return res.success(stats, 'Estadísticas de posts obtenidas exitosamente');
    } catch (error) {
      if (error.statusCode === 404) return res.notFound(error.message);
      return res.internal('Error al obtener estadísticas de posts');
    }
  }

  // Obtener estadísticas de posts de un usuario específico (público)
  async getUserPostStatsPublic(req, res) {
    try {
      const { userId } = req.params;
      const stats = await postService.getUserPostStats(userId);
      return res.success(stats, 'Estadísticas de posts obtenidas exitosamente');
    } catch (error) {
      if (error.statusCode === 404) return res.notFound(error.message);
      return res.internal('Error al obtener estadísticas de posts');
    }
  }
}

module.exports = new PostController();