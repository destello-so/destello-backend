const { User } = require('../models');
// NUEVOS IMPORTS PARA PERFIL COMPLETO
const Comment = require('../models/Comment');
const Review = require('../models/Review');
const Order = require('../models/Order');
const followService = require('./followService');
const postService = require('./postService');
const cartService = require('./cartService');
const wishlistService = require('./wishlistService');
const Post = require('../models/Post'); // Added missing import for Post
const Reaction = require('../models/Reaction'); // Added missing import for Reaction
const Follow = require('../models/Follow'); // Added missing import for Follow
const Product = require('../models/Product'); // Added missing import for Product
const reactionService = require('./reactionService'); // Added missing import for reactionService

class UserService {

  // Obtener usuario por ID
  async getById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  // Actualizar perfil de usuario
  async updateProfile(userId, updateData) {
    const { firstName, lastName, phone } = updateData;
    
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    // Actualizar campos
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;

    await user.save();
    return user;
  }

  // Agregar dirección
  async addAddress(userId, addressData) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    // Si es la primera dirección, hacerla default
    if (user.addresses.length === 0) {
      addressData.isDefault = true;
    }

    // Si se marca como default, quitar default de otras
    if (addressData.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push(addressData);
    await user.save();
    
    return user;
  }

  // Actualizar dirección
  async updateAddress(userId, addressId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      const error = new Error('Dirección no encontrada');
      error.statusCode = 404;
      throw error;
    }

    // Si se marca como default, quitar default de otras
    if (updateData.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    // Actualizar campos de la dirección
    Object.assign(address, updateData);
    await user.save();
    
    return user;
  }

  // Eliminar dirección
  async removeAddress(userId, addressId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      const error = new Error('Dirección no encontrada');
      error.statusCode = 404;
      throw error;
    }

    // No permitir eliminar si es la única dirección
    if (user.addresses.length === 1) {
      const error = new Error('No se puede eliminar la única dirección');
      error.statusCode = 400;
      throw error;
    }

    const wasDefault = address.isDefault;
    address.remove();

    // Si era default, hacer default la primera dirección restante
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    return user;
  }

  // Obtener usuarios (solo admin)
  async getUsers(filters = {}) {
    const { page = 1, limit = 12, role, isActive } = filters;
    
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive;

    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Activar/Desactivar usuario (solo admin)
  async toggleUserStatus(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    user.isActive = !user.isActive;
    await user.save();
    
    return user;
  }

  // PERFIL COMPLETO (público o propio)
  async getFullProfile(profileUserId, viewerId = null) {
    // 1) datos básicos de usuario
    const user = await User.findById(profileUserId).select('-passwordHash');
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const isOwner = viewerId && viewerId.toString() === profileUserId.toString();

    // 2) estadísticas sociales y de posts
    const [
      followStats,
      postStats,
      commentCount,
      reviewAgg,
      recentPostsRes,
      recentReviewsRes,
      isFollowing
    ] = await Promise.all([
      followService.getUserFollowStats(profileUserId),
      postService.getUserPostStats(profileUserId),
      Comment.countDocuments({ userId: profileUserId }),
      Review.aggregate([
        { $match: { userId: user._id } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, total: { $sum: 1 } } }
      ]),
      postService.getPosts(1, 5, profileUserId),
      Review.find({ userId: profileUserId })
            .populate('productId', 'name sku imageUrl')
            .sort({ createdAt: -1 })
            .limit(5),
      viewerId && !isOwner ? followService.isFollowing(viewerId, profileUserId) : null
    ]);

    const reviewStats = reviewAgg.length
      ? { total: reviewAgg[0].total, averageRating: Math.round(reviewAgg[0].avgRating * 10) / 10 }
      : { total: 0, averageRating: 0 };

    // 3) datos privados si el propietario consulta
    let commerce = undefined;
    if (isOwner) {
      const [cartSummary, wishlistStats, ordersAgg, recentOrders] = await Promise.all([
        cartService.getTotal(profileUserId),
        wishlistService.getWishlistStats(profileUserId),
        Order.aggregate([
          { $match: { userId: user._id } },
          { $group: { _id: null, totalOrders: { $sum: 1 }, totalSpent: { $sum: '$totalAmount' } } }
        ]),
        Order.find({ userId: user._id })
             .select('totalAmount status createdAt')
             .sort({ createdAt: -1 })
             .limit(5)
      ]);

      commerce = {
        cart: cartSummary,
        wishlist: wishlistStats,
        orders: {
          total: ordersAgg.length ? ordersAgg[0].totalOrders : 0,
          totalSpent: ordersAgg.length ? ordersAgg[0].totalSpent : 0,
          recent: recentOrders
        }
      };
    }

    // 4) armar respuesta
    const profile = {
      user: isOwner ? user : {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      },
      social: {
        followers: followStats.followers,
        following: followStats.following,
        isFollowing: !!isFollowing
      },
      posts: {
        stats: postStats,
        recent: recentPostsRes.posts
      },
      reviews: {
        total: reviewStats.total,
        averageRating: reviewStats.averageRating,
        recent: recentReviewsRes
      },
      comments: {
        total: commentCount
      },
      commerce
    };

    return profile;
  }

  // VISTA DE INICIO COMPLETA
  async getHomeData(userId) {
    try {
      // 1) Verificar que el usuario existe
      const user = await User.findById(userId).select('-passwordHash');
      if (!user) {
        const error = new Error('Usuario no encontrado');
        error.statusCode = 404;
        throw error;
      }

      // 2) Fechas para filtros temporales
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // 3) Obtener IDs de posts del usuario para stats
      const userPosts = await Post.find({ userId }).select('_id');
      const userPostIds = userPosts.map(p => p._id);

      // 4) Obtener IDs de usuarios que sigue
      const followingResult = await followService.getFollowing(userId, 1, 1000);
      const followingIds = followingResult.following.map(u => u._id);

      // 5) EJECUTAR TODAS LAS QUERIES EN PARALELO
      const [
        // Feed data
        personalizedPosts,
        trendingPosts,
        recentGlobalPosts,
        
        // Social data
        newFollowers,
        recentInteractions,
        suggestions,
        followingActivityToday,
        recentlyActiveFollowing,
        
        // Commerce data
        cartSummary,
        wishlistSummary,
        pendingOrders,
        newProducts,
        topRatedProducts,
        
        // Stats data
        followStats,
        postStats,
        reactionsReceivedThisWeek,
        commentsReceivedThisWeek,
        totalReviews,
        totalOrders,
        
        // Insights data
        myTopCategories,
        myTopTags,
        myReactionStyle,
        
        // Trending data
        trendingTags,
        topReviews,
        activeUsers,
        
        // Highlights
        myLastPost,
        myLastReview,
        myLastOrder
        
      ] = await Promise.all([
        // Feed queries
        postService.getFeedPosts(userId, 1, 10),
        reactionService.getMostReactedPosts(5, '7d'),
        postService.getPosts(1, 5),
        
        // Social queries
        Follow.find({ 
          targetUserId: userId, 
          createdAt: { $gte: weekAgo } 
        }).populate('userId', 'firstName lastName profilePicture').limit(10),
        
        Reaction.find({ 
          targetType: 'post', 
          targetId: { $in: userPostIds }, 
          createdAt: { $gte: weekAgo } 
        }).populate('userId', 'firstName lastName profilePicture').limit(20),
        
        followService.getFollowSuggestions(userId, 5),
        
        Post.countDocuments({ 
          userId: { $in: followingIds }, 
          createdAt: { $gte: today } 
        }),
        
        Post.find({ 
          userId: { $in: followingIds }, 
          createdAt: { $gte: weekAgo } 
        }).populate('userId', 'firstName lastName profilePicture').limit(5),
        
        // Commerce queries
        cartService.getTotal(userId),
        wishlistService.getWishlistStats(userId),
        
        Order.find({ 
          userId, 
          status: { $in: ['pending', 'confirmed', 'processing', 'shipped'] } 
        }).select('totalAmount status createdAt').limit(5),
        
        Product.find({ 
          createdAt: { $gte: weekAgo }, 
          isActive: true 
        }).populate('categories', 'name').limit(8),
        
        // Top rated products (agregación)
        Review.aggregate([
          { $group: { 
            _id: '$productId', 
            avgRating: { $avg: '$rating' }, 
            reviewCount: { $sum: 1 } 
          }},
          { $match: { avgRating: { $gte: 4.5 }, reviewCount: { $gte: 3 } } },
          { $sort: { avgRating: -1, reviewCount: -1 } },
          { $limit: 6 },
          { $lookup: { 
            from: 'products', 
            localField: '_id', 
            foreignField: '_id', 
            as: 'product' 
          }},
          { $unwind: '$product' },
          { $match: { 'product.isActive': true } }
        ]),
        
        // Stats queries
        followService.getUserFollowStats(userId),
        postService.getUserPostStats(userId),
        
        Reaction.countDocuments({ 
          targetType: 'post', 
          targetId: { $in: userPostIds }, 
          createdAt: { $gte: weekAgo } 
        }),
        
        Comment.countDocuments({ 
          parentType: 'post', 
          parentId: { $in: userPostIds }, 
          createdAt: { $gte: weekAgo } 
        }),
        
        Review.countDocuments({ userId }),
        Order.countDocuments({ userId }),
        
        // Insights queries - Top categorías del usuario
        Order.aggregate([
          { $match: { userId: user._id } },
          { $unwind: '$items' },
          { $lookup: { 
            from: 'products', 
            localField: 'items.productId', 
            foreignField: '_id', 
            as: 'product' 
          }},
          { $unwind: '$product' },
          { $unwind: '$product.categories' },
          { $lookup: { 
            from: 'categories', 
            localField: 'product.categories', 
            foreignField: '_id', 
            as: 'category' 
          }},
          { $unwind: '$category' },
          { $group: { 
            _id: '$category._id', 
            name: { $first: '$category.name' },
            count: { $sum: 1 } 
          }},
          { $sort: { count: -1 } },
          { $limit: 5 }
        ]),
        
        // Top tags del usuario
        Post.aggregate([
          { $match: { userId: user._id } },
          { $unwind: '$tags' },
          { $group: { _id: '$tags', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ]),
        
        // Estilo de reacciones del usuario
        Reaction.aggregate([
          { $match: { userId: user._id } },
          { $group: { _id: '$type', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        
        // Trending queries
        Post.aggregate([
          { $match: { createdAt: { $gte: weekAgo } } },
          { $unwind: '$tags' },
          { $group: { _id: '$tags', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),
        
        Review.find({ createdAt: { $gte: weekAgo } })
               .populate('userId', 'firstName lastName profilePicture')
               .populate('productId', 'name imageUrl')
               .sort({ helpfulCount: -1, createdAt: -1 })
               .limit(5),
        
        Post.aggregate([
          { $match: { createdAt: { $gte: weekAgo } } },
          { $group: { _id: '$userId', postCount: { $sum: 1 } } },
          { $sort: { postCount: -1 } },
          { $limit: 5 },
          { $lookup: { 
            from: 'users', 
            localField: '_id', 
            foreignField: '_id', 
            as: 'user' 
          }},
          { $unwind: '$user' },
          { $project: { 
            _id: '$user._id',
            firstName: '$user.firstName',
            lastName: '$user.lastName',
            profilePicture: '$user.profilePicture',
            postCount: 1
          }}
        ]),
        
        // Highlights queries
        Post.findOne({ userId }).sort({ createdAt: -1 }),
        Review.findOne({ userId }).populate('productId', 'name imageUrl').sort({ createdAt: -1 }),
        Order.findOne({ userId }).select('totalAmount status createdAt').sort({ createdAt: -1 })
      ]);

      // 6) Procesar productos recomendados basados en categorías favoritas
      let recommendedProducts = [];
      if (myTopCategories.length > 0) {
        const topCategoryIds = myTopCategories.slice(0, 3).map(cat => cat._id);
        recommendedProducts = await Product.find({
          categories: { $in: topCategoryIds },
          isActive: true
        }).populate('categories', 'name').limit(8);
      }

      // 7) Construir respuesta
      const homeData = {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture
        },
        
        feed: {
          personalizedPosts: personalizedPosts.posts || [],
          trendingPosts: trendingPosts || [],
          recentGlobalPosts: recentGlobalPosts.posts || []
        },
        
        social: {
          newFollowers: newFollowers || [],
          recentInteractions: recentInteractions || [],
          suggestions: suggestions || [],
          followingActivity: {
            activeToday: followingActivityToday || 0,
            totalFollowing: followingIds.length,
            recentlyActive: recentlyActiveFollowing || []
          }
        },
        
        commerce: {
          recommendedProducts: recommendedProducts || [],
          trendingProducts: topRatedProducts.map(item => ({
            ...item.product,
            avgRating: Math.round(item.avgRating * 10) / 10,
            reviewCount: item.reviewCount
          })) || [],
          newProducts: newProducts || [],
          cartSummary: cartSummary || { total: 0, itemCount: 0, items: 0 },
          wishlistSummary: wishlistSummary || { totalItems: 0, totalValue: 0 },
          pendingOrders: pendingOrders || []
        },
        
        stats: {
          personal: {
            postsCount: postStats?.totalPosts || 0,
            followersCount: followStats?.followers || 0,
            followingCount: followStats?.following || 0,
            totalReviews: totalReviews || 0,
            totalOrders: totalOrders || 0
          },
          recentActivity: {
            postsThisWeek: postStats?.recentPosts || 0,
            reactionsReceived: reactionsReceivedThisWeek || 0,
            commentsReceived: commentsReceivedThisWeek || 0
          }
        },
        
        insights: {
          myTopCategories: myTopCategories || [],
          myTopTags: myTopTags || [],
          myReactionStyle: myReactionStyle || []
        },
        
        trending: {
          tags: trendingTags || [],
          reviews: topReviews || [],
          activeUsers: activeUsers || []
        },
        
        highlights: {
          newProducts: newProducts?.slice(0, 4) || [],
          topRatedProducts: topRatedProducts?.slice(0, 4) || [],
          myRecentActivity: {
            lastPost: myLastPost || null,
            lastReview: myLastReview || null,
            lastOrder: myLastOrder || null
          }
        }
      };

      return homeData;

    } catch (error) {
      console.error('Error en getHomeData:', error);
      throw error;
    }
  }

}

module.exports = new UserService(); 