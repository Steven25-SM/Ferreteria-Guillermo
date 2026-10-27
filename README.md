# Ferretería Guillermo V2 — Proyecto reestructurado

**Abrirlo correctamente en IntelliJ IDEA:** usa **File → Open → `backend/pom.xml` → Open as Project**. Si ves «Maven build scripts found», pulsa **Load Maven Project**. El icono de taza de café en un archivo `.java` es NORMAL; la identificación Spring Boot se ve en la configuración de ejecución y en el panel Maven. En algunas ediciones de IntelliJ el soporte Spring es limitado.

Los archivos fuente se han reformateado; no se incluyen `node_modules`, `target` ni contraseñas.

**Nota:** este ZIP es una base de desarrollo. Los módulos deben verificarse con Maven y Vite en tu entorno y reforzarse antes de producción.

# Ferretería Guillermo 2.0

Nuevo proyecto **React + Vite + Tailwind CSS 4 / Spring Boot 3.5 + PostgreSQL 18**. Diseño basado en las tres referencias proporcionadas: hero fotográfico minimalista, catálogo editorial y panel de inventario claro con barra lateral. **No incluye productos precargados**.

## Requisitos
- Node.js 20.19+ / 22+, Java 21+ y Maven 3.9+ (o Maven integrado de IntelliJ), PostgreSQL.
- Usa una **base nueva** distinta de la versión anterior. **No borres tu base antigua**.

## 1. PostgreSQL
En pgAdmin ejecuta, conectado a la BD de mantenimiento `postgres` (fuera de una transacción):
```sql
CREATE DATABASE ferreteria_guillermo_v2;
```
> No ejecutes SQL de productos antiguos. Flyway crea el esquema y únicamente categorías, sin usuarios de prueba ni productos.

## 2. Backend
En IntelliJ abre `backend/pom.xml` como proyecto Maven. Configura las siguientes variables de entorno en Run → Edit Configurations:
```
DB_URL=jdbc:postgresql://localhost:5432/ferreteria_guillermo_v2
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD_POSTGRES
ADMIN_EMAIL=admin@ferreteriaguillermo.pe
ADMIN_INITIAL_PASSWORD=ELIGE_UNA_CONTRASEÑA_PROPIA_DE_12_O_MAS_CARACTERES
```
Ejecuta `com.ferreteriaguillermo.Application` o desde la carpeta `backend`: `mvn spring-boot:run`. El backend abre en `http://localhost:8080`.

**Importante:** si `ADMIN_INITIAL_PASSWORD` no está configurada, el backend falla intencionalmente en su primer inicio. La cuenta admin se crea **solo** si todavía no existe un administrador. No se crean productos.

## 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Abre `http://localhost:5173/`. Vite redirige `/api` al backend local. Para producción será necesario generar build, servir bajo HTTPS y configurar el proxy inverso.

## Pantallas
- `/` Inicio: hero, categorías, más vendidos (vacío hasta que haya ventas), información y contacto.
- `/catalogo` Catálogo público vacío hasta registrar productos reales.
- `/login`, `/registro`: usuarios clientes.
- `/admin/login`: acceso administrativo; `/admin`: panel protegido.
- `/carrito`: reservar productos para recojo en tienda. Efectivo, Yape y Plin con verificación **manual** en tienda.

## Flujo real de stock
1. Admin crea producto con SKU, categoría, precio, stock inicial y mínimo.
2. Entrada/salida manual: `stock_movements` registra el cambio.
3. Venta presencial: descuenta stock y registra `sales` + `sale_items` en una transacción.
4. Pedido web: descuenta stock para reservar; al cancelar se libera; al completar se confirma pago manual sin volver a descontar.
5. Producto desactivado: deja de aparecer al público sin romper el historial.

## Decisiones / pendientes antes de producción
- **El reconocimiento automático por foto NO está conectado**: la interfaz deja tomar/subir una foto, pero se necesita integrar un modelo visual, umbral de confianza y confirmación del empleado. Una foto no mide stock físico: identifica el producto y consulta el stock de PostgreSQL.
- **Recomendaciones personalizadas pendientes**; ambos endpoints devuelven `[]`. Más vendidos debería calcularse desde `sale_items` y pedidos completados. Groq se integrará SOLO desde backend; no se incluye API key.
- Las imágenes se guardan como `imageUrl` (URL HTTPS o ruta pública). Falta implementar almacenamiento/upload de imágenes desde el admin; por ahora se pega una URL o se ponen archivos en `frontend/public/images`.
- El checkout Yape/Plin **no procesa pagos**; quedan como pendientes para verificación humana. No fiarse de capturas.
- El carrito MVP usa `localStorage`; el servidor verifica precios y cantidades en el pedido.
- Este es un **MVP para desarrollo local**, no una entrega de producción: activar protección CSRF para sesiones, rate limiting, recuperación de contraseña, control de concurrencia en pedidos y cancelaciones, expiración de reservas, logs auditables completos, exportación Excel, gestión multiartículo en caja, pruebas automatizadas y respaldo de datos.
- Agregar dirección, horario y contacto reales desde configuración; no se inventan.
- El hero usa una foto externa de Unsplash: para operación offline reemplazarla por un archivo local con permisos de uso adecuados.

## API principal
- `GET /api/products`, `GET /api/products/{id}`, `GET /api/categories`
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- `GET/POST /api/admin/products`, `PUT/DELETE /api/admin/products/{id}`
- `POST /api/admin/inventory/movements`
- `POST /api/admin/sales`, `GET /api/admin/orders`, `POST /api/admin/orders/{id}/complete`, `POST /api/admin/orders/{id}/cancel`
- `POST /api/orders`

Las rutas `/api/admin/**` requieren `ROLE_ADMIN`, mientras que el catálogo es público.
