const Post = require('../models/Post');
const User = require('../models/User');
const followService = require('./followService');
const { ValidationError, NotFoundError } = require('../utils/errors');
const mongoose = require('mongoose');

class PostService {
  /**
   * Crear un nuevo post
   */
  async createPost(userId, postData) {
    try {
      const { text, tags } = postData;
      
      // Validar que el usuario existe
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError('Usuario no encontrado');
      }

      // Validar contenido
      if (!text || text.trim().length === 0) {
        throw new ValidationError('El contenido del post es requerido');
      }

      if (text.length > 2000) {
        throw new ValidationError('El contenido no puede exceder 2000 caracteres');
      }

      // Validar tags
      if (tags && Array.isArray(tags)) {
        for (const tag of tags) {
          if (tag.length > 50) {
            throw new ValidationError('Cada tag no puede exceder 50 caracteres');
          }
        }
      }

      const post = new Post({
        userId,
        text: text.trim(),
        tags: tags || []
      });

      await post.save();
      await post.populate('userId', 'firstName lastName email profilePicture');
      
      return post;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener posts con paginación
   */
  async getPosts(page = 1, limit = 10, userId = null) {
    try {
      const skip = (page - 1) * limit;
      let query = {};

      if (userId) {
        // Verificar que el usuario existe
        const user = await User.findById(userId);
        if (!user) {
          throw new NotFoundError('Usuario no encontrado');
        }
        query.userId = userId;
      }

      const posts = await Post.find(query)
        .populate('userId', 'firstName lastName email profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Post.countDocuments(query);

      return {
        posts,
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
   * Obtener un post por ID
   */
  async getPostById(postId) {
    try {
      // Verificar si el ID es un ObjectId válido
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new NotFoundError('ID de post no válido');
      }

      const post = await Post.findById(postId)
        .populate('userId', 'firstName lastName email profilePicture');

      if (!post) {
        throw new NotFoundError('Post no encontrado');
      }

      return post;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar un post
   */
  async updatePost(postId, userId, updateData) {
    try {
      const { text, tags } = updateData;
      
      // Verificar que el post existe
      const post = await Post.findById(postId);
      if (!post) {
        throw new NotFoundError('Post no encontrado');
      }

      // Verificar permisos
      console.log('==> [updatePost] post.userId:', post.userId.toString(), 'userId:', userId.toString());
      if (post.userId.toString() !== userId.toString()) {
        throw new ValidationError('No tienes permisos para editar este post');
      }

      // Validar contenido si se está actualizando
      if (text !== undefined) {
        if (text.trim().length === 0) {
          throw new ValidationError('El contenido del post es requerido');
        }
        if (text.length > 2000) {
          throw new ValidationError('El contenido no puede exceder 2000 caracteres');
        }
      }

      // Validar tags si se están actualizando
      if (tags !== undefined && Array.isArray(tags)) {
        for (const tag of tags) {
          if (tag.length > 50) {
            throw new ValidationError('Cada tag no puede exceder 50 caracteres');
          }
        }
      }

      const updates = {};
      if (text !== undefined) updates.text = text.trim();
      if (tags !== undefined) updates.tags = tags;

      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        updates,
        { new: true, runValidators: true }
      ).populate('userId', 'firstName lastName email profilePicture');

      return updatedPost;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar un post (eliminación física)
   */
  async deletePost(postId, userId) {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new NotFoundError('Post no encontrado');
      }

      if (post.userId.toString() !== userId.toString()) {
        throw new ValidationError('No tienes permisos para eliminar este post');
      }

      await Post.findByIdAndDelete(postId);

      return { message: 'Post eliminado exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener feed de posts (posts de usuarios seguidos + propios)
   */
  async getFeedPosts(userId, page = 1, limit = 10) {
    try {
      console.log('getFeedPosts userId:', userId);
      // Verificar que el usuario existe
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError('Usuario no encontrado');
      }

     
      const followingResult = await followService.getFollowing(userId, 1, 1000);
      const followingIds = followingResult.following.map(user => user._id);
      followingIds.push(userId); // Incluir posts propios

      const skip = (page - 1) * limit;

      const posts = await Post.find({
        userId: { $in: followingIds }
      })
        .populate('userId', 'firstName lastName email profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Post.countDocuments({
        userId: { $in: followingIds }
      });

      return {
        posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error en postService.getFeedPosts:', error);
      throw error;
    }
  }

  /**
   * Buscar posts por texto o tags
   */
  async searchPosts(searchTerm, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const cleanSearchTerm = searchTerm.trim();

      if (!cleanSearchTerm) {
        throw new ValidationError('El término de búsqueda es requerido');
      }

      // Búsqueda usando regex en lugar de índice de texto
      const posts = await Post.find({
        $or: [
          { text: { $regex: cleanSearchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(cleanSearchTerm, 'i')] } }
        ]
      })
        .populate('userId', 'firstName lastName email profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Post.countDocuments({
        $or: [
          { text: { $regex: cleanSearchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(cleanSearchTerm, 'i')] } }
        ]
      });

      return {
        posts,
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
   * Obtener posts por tag
   */
  async getPostsByTag(tag, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const cleanTag = tag.toLowerCase().trim();

      const posts = await Post.find({
        tags: cleanTag
      })
        .populate('userId', 'firstName lastName email profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Post.countDocuments({
        tags: cleanTag
      });

      return {
        posts,
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
   * Agregar tag a un post
   */
  async addTagToPost(postId, userId, tag) {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new NotFoundError('Post no encontrado');
      }

      if (post.userId.toString() !== userId.toString()) {
        throw new ValidationError('No tienes permisos para modificar este post');
      }

      if (tag.length > 50) {
        throw new ValidationError('El tag no puede exceder 50 caracteres');
      }

      await post.addTag(tag);
      await post.populate('userId', 'firstName lastName email profilePicture');

      return post;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remover tag de un post
   */
  async removeTagFromPost(postId, userId, tag) {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw new NotFoundError('Post no encontrado');
      }

      if (post.userId.toString() !== userId.toString()) {
        throw new ValidationError('No tienes permisos para modificar este post');
      }

      await post.removeTag(tag);
      await post.populate('userId', 'firstName lastName email profilePicture');

      return post;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de posts de un usuario
   */
  async getUserPostStats(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError('Usuario no encontrado');
      }

      const totalPosts = await Post.countDocuments({ userId });
      
      // Posts de los últimos 7 días
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentPosts = await Post.countDocuments({
        userId,
        createdAt: { $gte: sevenDaysAgo }
      });

      // Posts de los últimos 30 días para calcular promedio semanal
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const lastMonthPosts = await Post.countDocuments({
        userId,
        createdAt: { $gte: thirtyDaysAgo }
      });

      // Calcular promedio semanal basado en el último mes
      const averagePostsPerWeek = Math.round((lastMonthPosts / 4) * 10) / 10;

      return {
        totalPosts,
        recentPosts,
        lastMonthPosts,
        averagePostsPerWeek,
        activityLevel: recentPosts > 0 ? 'active' : 'inactive'
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PostService();