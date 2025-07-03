const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Destello Perú API',
      version: '1.0.0',
      description: 'API completa para Destello Perú - E-commerce con funcionalidades de red social',
      contact: {
        name: 'Destello Perú',
        email: 'contacto@destelloperu.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor Local (HTTP)'
      },
      {
        url: 'http://20.245.229.182:3000',
        description: 'Servidor Azure (HTTP)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido al hacer login'
        }
      },
      schemas: {
        // Schemas de Usuario
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            firstName: { type: 'string', example: 'Juan' },
            lastName: { type: 'string', example: 'Pérez' },
            email: { type: 'string', format: 'email', example: 'juan@example.com' },
            phone: { type: 'string', example: '999888777' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            isActive: { type: 'boolean', example: true },
            profilePicture: { type: 'string', example: 'https://example.com/avatar.jpg' },
            addresses: {
              type: 'array',
              items: { $ref: '#/components/schemas/Address' }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Address: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
            street: { type: 'string', example: 'Av. Arequipa 123' },
            city: { type: 'string', example: 'Lima' },
            state: { type: 'string', example: 'Lima' },
            zipCode: { type: 'string', example: '15001' },
            country: { type: 'string', example: 'Perú' },
            isDefault: { type: 'boolean', example: true }
          }
        },
        // Schemas de Autenticación
        RegisterRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password'],
          properties: {
            firstName: { type: 'string', minLength: 1, maxLength: 50, example: 'Juan' },
            lastName: { type: 'string', minLength: 1, maxLength: 50, example: 'Pérez' },
            email: { type: 'string', format: 'email', example: 'juan@example.com' },
            password: { type: 'string', minLength: 6, maxLength: 50, example: 'password123' },
            phone: { type: 'string', pattern: '^\\d{9}$', example: '999888777' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'juan@example.com' },
            password: { type: 'string', example: 'password123' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
          }
        },
        // Schemas de Respuesta
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operación exitosa' },
            data: { type: 'object' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Error descriptivo' },
                details: { type: 'array', items: { type: 'object' } }
              }
            },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        // Schemas de Validación
        ValidationError: {
          type: 'object',
          properties: {
            field: { type: 'string', example: 'email' },
            message: { type: 'string', example: 'El email es requerido' },
            value: { type: 'string', example: '' }
          }
        },
        // Schemas de Producto
        CreateProductRequest: {
          type: 'object',
          required: [
            'name',
            'sku',
            'description',
            'price',
            'stockQty',
            'categories'
          ],
          properties: {
            name: { type: 'string', example: 'Camiseta Destello' },
            sku: { type: 'string', example: 'CAMISETA001' },
            description: { type: 'string', example: 'Camiseta oficial de Destello Perú' },
            price: { type: 'number', example: 49.99 },
            weight: { type: 'number', example: 0.2 },
            dimensions: { type: 'string', example: '30x20x2' },
            stockQty: { type: 'integer', example: 100 },
            imageUrl: { type: 'string', example: 'https://ejemplo.com/imagen.jpg' },
            categories: {
              type: 'array',
              items: { type: 'string', example: '66a1b2c3d4e5f6a7b8c9d0e1' }
            }
          }
        },
        UpdateProductRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Camiseta Destello' },
            description: { type: 'string', example: 'Camiseta oficial de Destello Perú' },
            price: { type: 'number', example: 49.99 },
            weight: { type: 'number', example: 0.2 },
            dimensions: { type: 'string', example: '30x20x2' },
            stockQty: { type: 'integer', example: 100 },
            imageUrl: { type: 'string', example: 'https://ejemplo.com/imagen.jpg' },
            categories: {
              type: 'array',
              items: { type: 'string', example: '66a1b2c3d4e5f6a7b8c9d0e1' }
            },
            isActive: { type: 'boolean', example: true }
          }
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '66a1b2c3d4e5f6a7b8c9d0e1' },
            name: { type: 'string', example: 'Camiseta Destello' },
            sku: { type: 'string', example: 'CAMISETA001' },
            description: { type: 'string', example: 'Camiseta oficial de Destello Perú' },
            price: { type: 'number', example: 49.99 },
            weight: { type: 'number', example: 0.2 },
            dimensions: { type: 'string', example: '30x20x2' },
            stockQty: { type: 'integer', example: 100 },
            imageUrl: { type: 'string', example: 'https://ejemplo.com/imagen.jpg' },
            categories: {
              type: 'array',
              items: { $ref: '#/components/schemas/Category' }
            },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateCategoryRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Ropa' },
            description: { type: 'string', example: 'Categoría de ropa y accesorios' }
          }
        },
        UpdateCategoryRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Ropa' },
            description: { type: 'string', example: 'Categoría de ropa y accesorios' }
          }
        },
        Category: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '66a1b2c3d4e5f6a7b8c9d0e1' },
            name: { type: 'string', example: 'Ropa' },
            description: { type: 'string', example: 'Categoría de ropa y accesorios' },
            isActive: { type: 'boolean', example: true }
          }
        },
        AddCartItemRequest: {
          type: 'object',
          required: ['productId', 'quantity'],
          properties: {
            productId: { type: 'string', example: '66a1b2c3d4e5f6a7b8c9d0e1' },
            quantity: { type: 'integer', example: 2 }
          }
        },
        UpdateCartItemRequest: {
          type: 'object',
          required: ['productId', 'quantity'],
          properties: {
            productId: { type: 'string', example: '66a1b2c3d4e5f6a7b8c9d0e1' },
            quantity: { type: 'integer', example: 3 }
          }
        },
        RemoveCartItemRequest: {
          type: 'object',
          required: ['productId'],
          properties: {
            productId: { type: 'string', example: '66a1b2c3d4e5f6a7b8c9d0e1' }
          }
        },
        Cart: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '66a1b2c3d4e5f6a7b8c9d0e2' },
            user: { type: 'string', example: '66a1b2c3d4e5f6a7b8c9d0e0' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { $ref: '#/components/schemas/Product' },
                  quantity: { type: 'integer', example: 2 }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateOrderRequest: {
          type: 'object',
          required: ['address', 'paymentMethod'],
          properties: {
            address: {
              type: 'object',
              required: ['street', 'city', 'state', 'zipCode', 'country'],
              properties: {
                street: { type: 'string', example: 'Av. Arequipa 123' },
                city: { type: 'string', example: 'Lima' },
                state: { type: 'string', example: 'Lima' },
                zipCode: { type: 'string', example: '15001' },
                country: { type: 'string', example: 'Perú' }
              }
            },
            paymentMethod: { type: 'string', example: 'tarjeta' }
          }
        },
        UpdateOrderStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'], example: 'shipped' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '66a1b2c3d4e5f6a7b8c9d0e3' },
            user: { type: 'string', example: '66a1b2c3d4e5f6a7b8c9d0e0' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { $ref: '#/components/schemas/Product' },
                  quantity: { type: 'integer', example: 2 },
                  price: { type: 'number', example: 49.99 }
                }
              }
            },
            shippingAddress: { type: 'string', example: 'Av. Arequipa 123, Lima, Perú' },
            paymentMethod: { type: 'string', example: 'tarjeta' },
            status: { type: 'string', enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'], example: 'pending' },
            total: { type: 'number', example: 99.98 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        // Schemas de Posts
        Post: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '66a1b2c3d4e5f6a7b8c9d0e5' },
            userId: { 
              $ref: '#/components/schemas/User',
              description: 'Usuario que creó el post'
            },
            text: { 
              type: 'string', 
              example: '¡Hola, este es mi primer post en Destello Perú!',
              description: 'Contenido del post'
            },
            tags: {
              type: 'array',
              items: { type: 'string', example: 'noticias' },
              description: 'Tags del post'
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreatePostRequest: {
          type: 'object',
          required: ['text'],
          properties: {
            text: { 
              type: 'string', 
              minLength: 1, 
              maxLength: 2000, 
              example: '¡Hola, este es mi primer post en Destello Perú!' 
            },
            tags: {
              type: 'array',
              items: { 
                type: 'string', 
                maxLength: 50,
                example: 'noticias' 
              }
            }
          }
        },
        UpdatePostRequest: {
          type: 'object',
          properties: {
            text: { 
              type: 'string', 
              minLength: 1, 
              maxLength: 2000, 
              example: 'Editando mi post...' 
            },
            tags: {
              type: 'array',
              items: { 
                type: 'string', 
                maxLength: 50,
                example: 'actualización' 
              }
            }
          }
        },
        PostListResponse: {
          type: 'object',
          properties: {
            posts: {
              type: 'array',
              items: { $ref: '#/components/schemas/Post' },
              description: 'Lista de posts'
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 10 },
                total: { type: 'integer', example: 25 },
                pages: { type: 'integer', example: 3 }
              }
            }
          }
        },
        PostStats: {
          type: 'object',
          properties: {
            totalPosts: { 
              type: 'integer', 
              example: 15,
              description: 'Total de posts del usuario'
            },
            recentPosts: { 
              type: 'integer', 
              example: 3,
              description: 'Posts de los últimos 7 días'
            },
            lastMonthPosts: { 
              type: 'integer', 
              example: 12,
              description: 'Posts del último mes'
            },
            averagePostsPerWeek: { 
              type: 'number', 
              example: 3.0,
              description: 'Promedio de posts por semana'
            },
            activityLevel: { 
              type: 'string', 
              enum: ['active', 'inactive'],
              example: 'active',
              description: 'Nivel de actividad del usuario'
            }
          }
        },
        AddTagRequest: {
          type: 'object',
          required: ['tag'],
          properties: {
            tag: { 
              type: 'string', 
              maxLength: 50,
              example: 'nuevo-tag' 
            }
          }
        },
        RemoveTagRequest: {
          type: 'object',
          required: ['tag'],
          properties: {
            tag: { 
              type: 'string', 
              maxLength: 50,
              example: 'tag-a-remover' 
            }
          }
        },
        Wishlist: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '66a1b2c3d4e5f6a7b8c9d0e2' },
            user: { type: 'string', example: '66a1b2c3d4e5f6a7b8c9d0e0' },
            products: {
              type: 'array',
              items: { $ref: '#/components/schemas/Product' }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        AddWishlistItemRequest: {
          type: 'object',
          required: ['productId'],
          properties: {
            productId: { type: 'string', example: '66a1b2c3d4e5f6a7b8c9d0e1' }
          }
        },
        RemoveWishlistItemRequest: {
          type: 'object',
          required: ['productId'],
          properties: {
            productId: { type: 'string', example: '66a1b2c3d4e5f6a7b8c9d0e1' }
          }
        },
        WishlistStats: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 5 }
          }
        },
        WishlistCheckResponse: {
          type: 'object',
          properties: {
            inWishlist: { type: 'boolean', example: true }
          }
        },
        // Schemas de Seguimientos
        Follow: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '66a1b2c3d4e5f6a7b8c9d0e4' },
            userId: { 
              $ref: '#/components/schemas/User',
              description: 'Usuario que sigue'
            },
            targetUserId: { 
              $ref: '#/components/schemas/User',
              description: 'Usuario seguido'
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        FollowUserRequest: {
          type: 'object',
          required: ['targetUserId'],
          properties: {
            targetUserId: { 
              type: 'string', 
              example: '66a1b2c3d4e5f6a7b8c9d0e1',
              description: 'ID del usuario a seguir'
            }
          }
        },
        UnfollowUserRequest: {
          type: 'object',
          required: ['targetUserId'],
          properties: {
            targetUserId: { 
              type: 'string', 
              example: '66a1b2c3d4e5f6a7b8c9d0e1',
              description: 'ID del usuario a dejar de seguir'
            }
          }
        },
        FollowCheckResponse: {
          type: 'object',
          properties: {
            isFollowing: { 
              type: 'boolean', 
              example: true,
              description: 'Indica si el usuario sigue al usuario objetivo'
            }
          }
        },
        FollowStats: {
          type: 'object',
          properties: {
            following: { 
              type: 'integer', 
              example: 15,
              description: 'Número de usuarios que sigue'
            },
            followers: { 
              type: 'integer', 
              example: 23,
              description: 'Número de seguidores'
            }
          }
        },
        FollowListResponse: {
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: { $ref: '#/components/schemas/User' },
              description: 'Lista de usuarios'
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 20 },
                total: { type: 'integer', example: 50 },
                pages: { type: 'integer', example: 3 }
              }
            }
          }
        }
      },
      externalDocs: {
        description: 'Documentación adicional',
        url: 'http://20.245.229.182:3000/api-docs'
      }
    },
    tags: [
      {
        name: 'Autenticación',
        description: 'Endpoints para registro, login y gestión de tokens'
      },
      {
        name: 'Usuarios',
        description: 'Gestión de perfiles de usuario y direcciones'
      },
      {
        name: 'Productos',
        description: 'Gestión de productos del catálogo'
      },
      {
        name: 'Categorías',
        description: 'Gestión de categorías de productos'
      },
      {
        name: 'Carrito',
        description: 'Gestión del carrito de compras'
      },
      {
        name: 'Órdenes',
        description: 'Gestión de órdenes de compra'
      },
      {
        name: 'Posts',
        description: 'Gestión de posts de la red social'
      },
      {
        name: 'Seguimientos',
        description: 'Gestión de seguimientos entre usuarios'
      },
      {
        name: 'Comentarios',
        description: 'Gestión de comentarios en posts'
      },
      {
        name: 'Reacciones',
        description: 'Gestión de reacciones en posts'
      },
      {
        name: 'Lista de Deseos',
        description: 'Gestión de lista de deseos'
      },
      {
        name: 'Reseñas',
        description: 'Gestión de reseñas de productos'
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;