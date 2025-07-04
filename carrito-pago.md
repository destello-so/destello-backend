# 📦 API – Productos, Carrito, Wishlist y Órdenes

> Todas las rutas están bajo el prefijo base `https://TU_BACKEND_HOST/api`. Reemplaza **TU_BACKEND_HOST** por tu dominio/host real.
>
> • 🔒 = Requiere token JWT en el header `Authorization: Bearer <token>`.
> • 🛠️ = Sólo ADMIN (usuario con `role: "admin"`).

---

## 1. Productos (`/products`)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `GET`  | `/products` | – | Lista paginada con filtros |
| `POST` | `/products` | 🔒🛠️ | Crear producto |
| `GET`  | `/products/{id}` | – | Detalle de producto |
| `PUT`  | `/products/{id}` | 🔒🛠️ | Actualizar producto |
| `DELETE` | `/products/{id}` | 🔒🛠️ | Eliminar (soft) producto |
| `PATCH` | `/products/{id}/stock` | 🔒🛠️ | Ajustar stock |
| `GET` | `/products/{id}/stock` | – | Verificar disponibilidad de stock |

### 1.1 `GET /products`
```
GET /api/products?page=1&limit=12&category=<catId>&minPrice=0&maxPrice=999&search=iphone
```
**Query params**
| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `page` | int ≥1 | 1 | Nº de página |
| `limit` | int 1-100 | 12 | Ítems por página |
| `category` | MongoID | – | Filtrar por categoría |
| `minPrice` `maxPrice` | number | – | Rango de precio |
| `search` | string | – | Busca en `name`, `description`, `sku` |

**Respuesta 200**
```json
{
  "success": true,
  "message": "Productos obtenidos exitosamente",
  "data": [ { "_id": "…", "name": "…", "price": 120, … } ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 152,
    "pages": 13,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-05-02T13:45:00.000Z"
}
```

### 1.2 `GET /products/{id}`
```
GET /api/products/60a1b2c3d4e5f6a7b8c9d0e1
```
**Respuesta 200**
```json
{
  "success": true,
  "data": {
    "product": {
      "_id": "60a1b2…",
      "name": "iPhone 15",
      "sku": "IPH15BLK",
      "description": "Smartphone …",
      "price": 999.99,
      "stockQty": 50,
      "categories": [
        { "_id": "60af…", "name": "Tecnología" }
      ],
      "isActive": true
    }
  },
  "timestamp": "…"
}
```

### 1.3 `GET /products/{id}/stock`
```
GET /api/products/60a1b2…/stock?quantity=3
```
**Query:** `quantity` int ≥1 (requerido).  
**Respuesta 200**
```json
{ "success": true, "data": { "available": true }, "timestamp": "…" }
```
**Errores**: 400 stock insuficiente, 404 producto no encontrado.

### 1.4 `POST /products` 🔒🛠️
```
POST /api/products
Content-Type: application/json
Authorization: Bearer <adminToken>
{
  "name": "iPhone 15",
  "sku": "IPH15BLK",
  "description": "Smartphone …",
  "price": 999.99,
  "weight": 0.3,
  "dimensions": "146.7×71.5×7.7 mm",
  "stockQty": 50,
  "imageUrl": "https://…/iphone15.jpg",
  "categories": ["60af…"]
}
```
**Respuesta 201**: objeto producto creado.

### 1.5 `PUT /products/{id}` 🔒🛠️ – mismo cuerpo que create (campos opcionales).
```json
{
  "name": "iPhone 15",
  "sku": "IPH15BLK",
  "description": "Smartphone …",
  "price": 999.99,
  "weight": 0.3,
  "dimensions": "146.7×71.5×7.7 mm",
  "stockQty": 50,
  "imageUrl": "https://…/iphone15.jpg",
  "categories": ["60af…"]
}
```
**Respuesta 200**
```json
{ "success": true, "data": { "product": { /* igual estructura que al crear */ } }, "timestamp": "…" }
```

### 1.6 `PATCH /products/{id}/stock` 🔒🛠️
```json
{
  "qtyChange": 10,
  "type": "restock",          // restock | sale | adjustment
  "note": "Compra al proveedor"
}
```
**Respuesta 200**: producto con `stockQty` actualizado.

### 1.7 `DELETE /products/{id}` 🔒🛠️ – respuesta `res.deleted()` estándar.
```json
{ "success": true, "message": "Producto eliminado exitosamente", "timestamp": "…" }
```

---

## 2. Carrito (`/cart`) 🔒

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/cart` | Obtener carrito actual |
| `POST` | `/cart/add` | Agregar o sumar ítem |
| `PUT` | `/cart/update` | Cambiar cantidad |
| `DELETE` | `/cart/remove` | Quitar ítem |
| `DELETE` | `/cart/clear` | Vaciar carrito |

### 2.1 `GET /cart`
```
GET /api/cart
Authorization: Bearer <token>
```
**Respuesta 200**
```json
{
  "success": true,
  "data": {
    "items": [
      { "product": { "_id": "…", "name": "…", "price": 50 }, "quantity": 2, "subtotal": 100 }
    ],
    "total": 100
  },
  "timestamp": "…"
}
```

### 2.2 `POST /cart/add`
```json
{
  "productId": "60a1b2…",
  "quantity": 1
}
```
**Respuesta 200**: carrito actualizado.
```json
{
  "success": true,
  "data": {
    "items": [
      { "product": { "_id": "60a1b2…", "name": "iPhone 15", "price": 999.99 }, "quantity": 1, "subtotal": 999.99 }
    ],
    "total": 999.99
  },
  "timestamp": "…"
}
```

### 2.3 `PUT /cart/update`
```json
{
  "productId": "60a1b2…",
  "quantity": 3
}
```
**Respuesta 200** – carrito actualizado (misma estructura que arriba).

### 2.4 `DELETE /cart/remove`
```json
{ "productId": "60a1b2…" }
```
**Respuesta 200** – carrito actualizado.

### 2.5 `DELETE /cart/clear` – sin cuerpo.
**Respuesta 200**
```json
{ "success": true, "message": "Carrito vaciado exitosamente", "timestamp": "…" }
```

---

## 3. Wishlist (`/wishlist`) 🔒

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/wishlist` | Listar wishlist |
| `POST` | `/wishlist/add` | Agregar producto |
| `DELETE` | `/wishlist/remove` | Quitar producto |
| `DELETE` | `/wishlist/clear` | Vaciar wishlist |
| `GET` | `/wishlist/check` | ¿Producto en wishlist? |
| `GET` | `/wishlist/stats` | Stats wishlist |

### 3.1 `GET /wishlist`
Query opcional: `page`, `limit`  
**Respuesta 200**
```json
{
  "success": true,
  "data": {
    "products": [ { "_id": "60a1b2…", "name": "iPhone 15", "price": 999.99 } ],
    "pagination": { "page": 1, "limit": 20, "total": 1, "pages": 1 }
  },
  "timestamp": "…"
}
```

### 3.2 `POST /wishlist/add`
```json
{ "productId": "60a1b2…" }
```
**Respuesta 201**: wishlist actualizada.
```json
{ "success": true, "data": { "wishlist": { /* … */ } }, "timestamp": "…" }
```

### 3.3 `DELETE /wishlist/remove`
```json
{ "productId": "60a1b2…" }
```
**Respuesta 200** – wishlist actualizada.

### 3.4 `DELETE /wishlist/clear` – sin cuerpo.
**Respuesta 200**
```json
{ "success": true, "message": "Lista de deseos limpiada exitosamente", "timestamp": "…" }
```

### 3.5 `GET /wishlist/check?productId=60a1b2…`
**Respuesta 200**
```json
{ "success": true, "data": { "inWishlist": true } }
```

### 3.6 `GET /wishlist/stats`
Devuelve, por ejemplo:
```json
{ "success": true, "data": { "totalItems": 5 } }
```

---

## 4. Órdenes (`/orders`) 🔒

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `POST` | `/orders` | 🔒 | Crear orden (checkout) |
| `GET` | `/orders/my` | 🔒 | Mis órdenes |
| `GET` | `/orders/{id}` | 🔒 | Detalle de orden |
| `GET` | `/orders/admin/all` | 🔒🛠️ | Todas las órdenes |
| `PATCH` | `/orders/{id}/status` | 🔒🛠️ | Cambiar estado |
| `PATCH` | `/orders/{id}/cancel` | 🔒 | Cancelar orden |

### 4.1 `POST /orders` (Checkout)
```json
{
  "address": {
    "street": "Av. Arequipa 123",
    "city": "Lima",
    "state": "Lima",
    "zipCode": "15001",
    "country": "Perú"
  },
  "paymentMethod": "credit_card"
}
```
• Toma el carrito completo, valida stock y genera la orden.  
**Respuesta 201**
```json
{
  "success": true,
  "message": "Orden creada exitosamente",
  "data": {
    "order": {
      "_id": "60bf…",
      "items": [ { "product": "…", "quantity": 2, "price": 50 } ],
      "total": 100,
      "status": "pending",
      "paymentMethod": "credit_card"
    }
  },
  "timestamp": "…"
}
```

### 4.2 `GET /orders/my`
Lista mis órdenes.  
**Respuesta 200**
```json
{ "success": true, "data": { "orders": [ { "_id": "60bf…", "total": 100, "status": "pending" } ] }, "timestamp": "…" }
```

### 4.3 `GET /orders/{id}`
Detalle de una orden si soy dueño (o admin).  
**Respuesta 200** – estructura igual a la orden creada en 4.1.

Errores: 403 / 404.

### 4.4 `PATCH /orders/{id}/cancel`
Sin cuerpo.  
**Respuesta 200**: orden con `status: "cancelled"`.
```json
{ "success": true, "data": { "order": { "_id": "60bf…", "status": "cancelled" } }, "timestamp": "…" }
```

### 4.5 Endpoints sólo-admin
 * `GET /orders/admin/all` – listar todo.  
   **Respuesta 200**
   ```json
   {
     "success": true,
     "data": {
       "orders": [
         {
           "_id": "60bf…",
           "user": "60a1…",
           "total": 100,
           "status": "paid",
           "createdAt": "2024-05-02T12:00:00.000Z"
         },
         { /* más órdenes */ }
       ]
     },
     "timestamp": "…"
   }
   ```
 * `PATCH /orders/{id}/status`  
   ```json
   { "status": "shipped" }   // pending | paid | shipped | delivered | cancelled
   ```
   **Respuesta 200**
   ```json
   {
     "success": true,
     "data": {
       "order": {
         "_id": "60bf…",
         "status": "shipped",
         "updatedAt": "2024-05-03T15:30:00.000Z"
       }
     },
     "timestamp": "…"
   }
   ```

---

## 5. Categorías (`/categories`) 🔒 (CRUD de admin excepto listado)

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `POST` | `/categories` | 🔒🛠️ | Crear categoría |
| `GET`  | `/categories` | – | Listar categorías activas |
| `GET`  | `/categories/{id}` | – | Detalle de categoría |
| `PUT`  | `/categories/{id}` | 🔒🛠️ | Actualizar categoría |
| `DELETE` | `/categories/{id}` | 🔒🛠️ | Eliminar (soft) categoría |

### 5.1 `POST /categories` 🔒🛠️
```json
{
  "name": "Ropa",
  "description": "Categoría de ropa y accesorios"
}
```
**Respuesta 201** – objeto categoría creado.

### 5.2 `GET /categories`
Lista todas las categorías con `isActive: true`.

**Respuesta 200**
```json
{
  "success": true,
  "data": [ { "_id": "…", "name": "Ropa", "description": "…" } ],
  "timestamp": "…"
}
```

### 5.3 `GET /categories/{id}`
Detalle de categoría.  
**Respuesta 200**
```json
{ "success": true, "data": { "category": { "_id": "…", "name": "Ropa", "description": "…" } }, "timestamp": "…" }
```
Errores: 404 si no existe.

### 5.4 `PUT /categories/{id}` 🔒🛠️
```json
{
  "name": "Moda",
  "description": "Ropa, calzado y accesorios"
}
```
**Respuesta 200** – categoría actualizada.

### 5.5 `DELETE /categories/{id}` 🔒🛠️
Sin cuerpo. Respuesta estándar `res.deleted()`.
```json
{ "success": true, "message": "Categoría eliminada exitosamente", "timestamp": "…" }
```

---

## 6. Headers comunes
```
Content-Type: application/json
Authorization: Bearer <token>      // sólo en rutas 
```

---

> Última actualización: {{DATE}}
