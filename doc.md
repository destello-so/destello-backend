# 🛒 API REST Destello Perú — Resumen General

## 1. Tecnologías y Arquitectura

- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **Arquitectura:** Modular, profesional, escalable
- **Documentación:** Swagger UI disponible en `/api-docs`
- **Manejo de errores:** Centralizado y consistente
- **Validaciones:** Robustas, tanto a nivel de modelo como de request
- **CORS:** Abierto (puedes consumir desde cualquier frontend)
- **Autenticación:** JWT (Bearer Token en headers)
- **Rutas limpias y versionadas:** Todas bajo `/api/`

---

## 2. Principales Endpoints y Recursos

| Recurso      | Ruta base           | Descripción breve                                 |
|--------------|---------------------|---------------------------------------------------|
| Auth         | `/api/auth`         | Registro, login, refresh, logout                  |
| Usuarios     | `/api/users`        | CRUD de usuarios, perfil, direcciones             |
| Productos    | `/api/products`     | CRUD de productos, búsqueda, detalles             |
| Categorías   | `/api/categories`   | CRUD de categorías                                |
| Carrito      | `/api/cart`         | Añadir, quitar, actualizar productos en carrito   |
| Órdenes      | `/api/orders`       | Crear, listar, detalles de órdenes                |
| Posts        | `/api/posts`        | Crear, listar, editar, eliminar posts sociales    |
| Wishlist     | `/api/wishlist`     | Añadir/quitar productos de la lista de deseos     |
| Seguimientos | `/api/follow`       | Seguir/dejar de seguir usuarios                   |
| Reacciones   | `/api/reactions`    | Like/dislike en posts                             |
| Comentarios  | `/api/comments`     | Añadir, listar, eliminar comentarios              |
| Reseñas      | `/api/reviews`      | Crear, listar, eliminar reseñas de productos      |

---

## 3. Autenticación y Seguridad

- **Registro/Login:** `/api/auth/register` y `/api/auth/login`
- **Token JWT:** Se debe enviar en el header:  
  ```
  Authorization: Bearer <token>
  ```
- **Rutas protegidas:** Casi todas las rutas de usuario, carrito, órdenes, etc. requieren autenticación.
- **Roles:** Hay roles (`user`, `admin`) para control de acceso.

---

## 4. Formato de Respuesta

- **Éxito:**
  ```json
  {
    "success": true,
    "message": "Operación exitosa",
    "data": { ... },
    "timestamp": "2024-07-03T00:00:00.000Z"
  }
  ```
- **Error:**
  ```json
  {
    "success": false,
    "error": {
      "message": "Descripción del error",
      "details": [ ... ]
    },
    "timestamp": "2024-07-03T00:00:00.000Z"
  }
  ```

---

## 5. Validaciones y Errores

- **Validaciones robustas** en todos los endpoints (campos requeridos, formatos, etc.)
- **Errores claros** y con mensajes útiles para el frontend
- **Códigos de estado HTTP** correctos (`400`, `401`, `403`, `404`, `409`, `500`)

---

## 6. Swagger UI

- **URL:** `/api-docs`
- **Permite probar todos los endpoints**
- **Incluye ejemplos de request y response**
- **Puedes ver los schemas de cada recurso**

---

## 7. Cosas importantes para el Frontend

- **Siempre manejar el token JWT**: Guardar tras login, enviar en cada request protegido, refrescar si es necesario.
- **Manejar errores y mensajes**: Mostrar mensajes de error claros al usuario según la respuesta de la API.
- **Validar formularios antes de enviar**: Para evitar errores de validación del backend.
- **Paginar resultados**: Muchos endpoints devuelven listas paginadas (usuarios, productos, posts, etc.).
- **Manejar estados de carga y error**: El backend puede demorar en operaciones pesadas.
- **No asumir estructura fija**: Leer los schemas de Swagger para saber qué campos esperar.
- **Cargar datos relacionados**: Por ejemplo, productos en el carrito, detalles de usuario en posts, etc.
- **Respetar roles y permisos**: El backend puede devolver 403 si el usuario no tiene permisos.

---

## 8. Extras útiles

- **Health check:** `/health` para saber si la API está viva
- **Versionado fácil:** Puedes agregar `/v1/` en el futuro si necesitas nuevas versiones
- **Extensible:** Puedes agregar endpoints nuevos fácilmente siguiendo la arquitectura actual

---

## Resumen para el Frontend (React)

- **Base URL:** `http://20.245.229.182:3000/api/`
- **Autenticación:** JWT en header
- **Swagger:** `/api-docs` para ver y probar todo
- **Errores y validaciones:** Siempre manejar y mostrar al usuario
- **Paginar y filtrar:** Muchos endpoints lo soportan
- **Roles:** Hay usuarios y admins, respeta los permisos
- **Formato de respuesta:** Siempre revisa `success`, `data` y `error`
