# 🔐 Documentación de Autenticación - Destello Perú API

## Resumen General

El sistema de autenticación de Destello Perú utiliza **JWT (JSON Web Tokens)** para manejar la autenticación de usuarios. Todos los endpoints están bajo la ruta base `/api/auth/`.

**Características principales:**
- ✅ Registro de nuevos usuarios
- ✅ Login con email y contraseña
- ✅ Obtener perfil del usuario autenticado
- ✅ Tokens JWT con expiración configurable
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Validaciones robustas en todos los endpoints
- ✅ Manejo de errores consistente

---

## 📋 Endpoints Disponibles

| Método | Endpoint         | Descripción                        | Autenticación |
|--------|------------------|------------------------------------|---------------|
| POST   | `/api/auth/register` | Registrar nuevo usuario            | ❌ No         |
| POST   | `/api/auth/login`    | Iniciar sesión                     | ❌ No         |
| GET    | `/api/auth/me`       | Obtener perfil del usuario autenticado | ✅ Sí      |

---

## 🚀 1. Registro de Usuario

### `POST /api/auth/register`

**Descripción:** Crea una nueva cuenta de usuario en el sistema.

### Request

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "firstName": "Juan",
  "lastName": "Pérez", 
  "email": "juan@example.com",
  "password": "password123",
  "phone": "999888777"
}
```

**Campos requeridos:**
- `firstName` (string): Nombre del usuario
- `lastName` (string): Apellido del usuario
- `email` (string): Email válido (debe ser único)
- `password` (string): Contraseña (mínimo 6 caracteres)

**Campos opcionales:**
- `phone` (string): Número de teléfono (9 dígitos)

### Response

**✅ Éxito (201 Created):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "juan@example.com",
      "phone": "999888777",
      "role": "user",
      "isActive": true,
      "addresses": [],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**❌ Error (400 Bad Request) - Validación:**
```json
{
  "success": false,
  "error": {
    "message": "Datos de entrada inválidos",
    "details": [
      {
        "field": "email",
        "message": "El email es requerido",
        "value": ""
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**❌ Error (409 Conflict) - Email ya existe:**
```json
{
  "success": false,
  "error": {
    "message": "El email ya está registrado"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🔑 2. Iniciar Sesión

### `POST /api/auth/login`

**Descripción:** Autentica un usuario y retorna un token JWT.

### Request

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Campos requeridos:**
- `email` (string): Email del usuario
- `password` (string): Contraseña del usuario

### Response

**✅ Éxito (200 OK):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "juan@example.com",
      "phone": "999888777",
      "role": "user",
      "isActive": true,
      "addresses": [],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**❌ Error (400 Bad Request) - Validación:**
```json
{
  "success": false,
  "error": {
    "message": "Datos de entrada inválidos",
    "details": [
      {
        "field": "email",
        "message": "El email es requerido",
        "value": ""
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**❌ Error (401 Unauthorized) - Credenciales inválidas:**
```json
{
  "success": false,
  "error": {
    "message": "Credenciales inválidas"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**❌ Error (401 Unauthorized) - Usuario desactivado:**
```json
{
  "success": false,
  "error": {
    "message": "Usuario desactivado"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 👤 3. Obtener Perfil

### `GET /api/auth/me`

**Descripción:** Retorna los datos del usuario actualmente autenticado.

### Request

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:** No requiere body.

### Response

**✅ Éxito (200 OK):**
```json
{
  "success": true,
  "message": "Perfil obtenido exitosamente",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "Juan",
      "lastName": "Pérez",
      "email": "juan@example.com",
      "phone": "999888777",
      "role": "user",
      "isActive": true,
      "addresses": [],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**❌ Error (401 Unauthorized) - Token requerido:**
```json
{
  "success": false,
  "error": {
    "message": "Token de acceso requerido"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**❌ Error (401 Unauthorized) - Token inválido:**
```json
{
  "success": false,
  "error": {
    "message": "Token de acceso inválido"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**❌ Error (404 Not Found) - Usuario no encontrado:**
```json
{
  "success": false,
  "error": {
    "message": "Usuario no encontrado"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🛡️ Manejo de Autenticación

### **Token JWT**
- **Formato:** `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Header requerido:** `Authorization: Bearer <token>`
- **Almacenamiento recomendado:** localStorage o Context API de React
- **Validez:** Configurada en el backend (verificar expiración)

### **Flujo Recomendado**
1. **Usuario se registra/loguea** → Recibe token
2. **Guardar token** en localStorage/context
3. **Enviar token** en todas las peticiones protegidas
4. **Verificar validez** del token en cada request
5. **Manejar errores 401** redirigiendo a login

### **Estados de Usuario**
- `isActive: true` → Usuario activo, puede usar la plataforma
- `isActive: false` → Usuario desactivado, no puede loguearse
- `role: "user"` → Usuario normal
- `role: "admin"` → Usuario administrador

---

## ⚠️ Errores Comunes

### **400 Bad Request**
- Campos requeridos faltantes
- Formato de email inválido
- Contraseña muy corta
- Datos de entrada inválidos

### **401 Unauthorized**
- Credenciales incorrectas
- Token no proporcionado
- Token inválido o expirado
- Usuario desactivado

### **409 Conflict**
- Email ya registrado

### **500 Internal Server Error**
- Error del servidor (contactar soporte)

---

## 📝 Notas Importantes para el Frontend

1. **Siempre validar datos antes de enviar** para evitar errores 400
2. **Manejar todos los códigos de estado** para una mejor UX
3. **Guardar el token de forma segura** (considerar localhost para guardarlo)
5. **Mostrar mensajes de error claros** al usuario
6. **Redirigir a login** automáticamente en errores 401
7. **El token no expira automáticamente** en el frontend, verificar con `/me`
