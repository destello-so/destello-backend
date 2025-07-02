const { authService } = require('../services');
const { userSchemas } = require('../middlewares/validation');

class AuthController {
  /**
   * POST /api/auth/register
   * Registro de nuevo usuario
   */
  async register(req, res) {
    try {
      console.log('🔄 Iniciando registro...');
      const userData = req.body;
      console.log('📦 Datos recibidos:', userData);
      
      // El authService ya maneja todas las validaciones internas
      console.log('🔄 Llamando a authService.register...');
      const result = await authService.register(userData);
      console.log('✅ authService.register completado');
      console.log('📦 Resultado:', JSON.stringify(result, null, 2));
      
      // Usar el response formatter para respuesta consistente
      console.log('🔄 Llamando a res.created...');
      return res.created({
        user: result.user,
        token: result.token
      }, 'Usuario registrado exitosamente');
      
    } catch (error) {
      console.error('❌ Error en register:', error);
      console.error('❌ Stack trace:', error.stack);
      
      // Manejar errores específicos del authService
      if (error.statusCode === 409) {
        return res.conflict(error.message);
      }
      
      // Error interno
      return res.internal('Error al registrar usuario');
    }
  }

  /**
   * POST /api/auth/login
   * Login de usuario
   */
  async login(req, res) {
    try {
      const credentials = req.body;
      
      // El authService ya maneja todas las validaciones internas
      const result = await authService.login(credentials);
      
      // Usar el response formatter para respuesta consistente
      return res.success({
        user: result.user,
        token: result.token
      }, 'Login exitoso');
      
    } catch (error) {
      // Manejar errores específicos del authService
      if (error.statusCode === 401) {
        return res.unauthorized(error.message);
      }
      
      // Error interno
      return res.internal('Error al iniciar sesión');
    }
  }

  /**
   * GET /api/auth/me
   * Obtener perfil del usuario autenticado
   */
  async getProfile(req, res) {
    try {
      // req.user ya está disponible gracias al middleware authenticate
      const userId = req.user._id;
      console.log('🔄 userId:', userId);
      
      // Obtener datos actualizados del usuario
      const user = await authService.getUserById(userId);
      
      // Usar el response formatter para respuesta consistente
      return res.success({
        user: user.toJSON()
      }, 'Perfil obtenido exitosamente');
      
    } catch (error) {
      // Manejar errores específicos del authService
      if (error.statusCode === 404) {
        return res.notFound('Usuario no encontrado');
      }
      
      if (error.statusCode === 401) {
        return res.unauthorized('Usuario desactivado');
      }
      
      // Error interno
      return res.internal('Error al obtener perfil');
    }
  }
}

module.exports = new AuthController();