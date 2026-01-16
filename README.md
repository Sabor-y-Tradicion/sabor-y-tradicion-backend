# Sabor y Tradición - Backend API (Sistema Multitenant)

Backend API REST multitenant para sistema de gestión de menú de restaurantes.

> 🎉 **Actualizado a Sistema Multitenant v2.0** - Enero 2026

## ✨ Características Principales

- 🏢 **Sistema Multitenant** - Múltiples restaurantes en una plataforma
- 🔐 **3 Roles de Usuario** - SUPERADMIN, ADMIN, ORDERS_MANAGER
- 📦 **3 Planes** - Free, Premium, Enterprise
- 🔒 **Aislamiento de Datos** - Cada tenant con sus propios datos
- 📊 **33+ Endpoints API** - REST API completa
- 🎨 **Configuración Personalizable** - Settings por tenant
- 📝 **Auditoría Completa** - Registro de acciones críticas

## 🚀 Stack Tecnológico

- **Runtime**: Node.js 20+
- **Framework**: Express.js + TypeScript
- **ORM**: Prisma
- **Base de Datos**: PostgreSQL
- **Validación**: Zod
- **Autenticación**: JWT + bcrypt
- **Upload**: Multer + Cloudinary

## 📋 Prerequisitos

- Node.js 20+ instalado
- PostgreSQL 15+ instalado y corriendo
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd sabor-y-tradicion-backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:
```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://postgres:jamesdroide@localhost:5432/saborytradicion"
JWT_SECRET=tu_secret_key_super_seguro
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

4. **Configurar la base de datos**
```bash
# Generar el cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate:deploy
```

5. **Instalar Sistema Multitenant**

**Opción A: Instalación Nueva (Vacía)**
```bash
npm run install:fresh
```
Crea solo el SUPERADMIN (superadmin@tuapp.com / superadmin123)

**Opción B: Migración de Datos Existentes**
```bash
npm run migrate:multitenant
```
Migra datos de "Sabor y Tradición" y crea SUPERADMIN

> 📚 Ver [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) para detalles completos

## 🏃 Ejecutar el proyecto

### Modo desarrollo
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:5000`

### Modo producción
```bash
npm run build
npm start
```

## 🔐 Credenciales Iniciales

### Instalación Nueva
```
Email: superadmin@tuapp.com
Password: superadmin123
```

### Migración Sabor y Tradición
```
Email: superadmin@saborytradicion.pe
Password: SuperAdmin2026!
```

⚠️ **Cambiar la contraseña después del primer login**

## 📚 Documentación Completa

### Guías Principales
- **[DOCS_INDEX.md](./DOCS_INDEX.md)** - Índice de toda la documentación ⭐
- **[INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)** - Guía de instalación detallada
- **[MULTITENANT.md](./MULTITENANT.md)** - Sistema multitenant completo
- **[implementar.md](./implementar.md)** - Flujo de usuarios visual

### Referencia Técnica
- **[IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)** - Detalles de implementación
- **[MIGRATION_STATUS.md](./MIGRATION_STATUS.md)** - Estado de migraciones
- **[CHECKLIST_FINAL.md](./CHECKLIST_FINAL.md)** - Estado del proyecto

### API Reference
- **Swagger UI:** `http://localhost:5000/docs`
- **JSON Spec:** `http://localhost:5000/docs.json`

## 📡 Endpoints API (33 total)

### 🔐 Autenticación (5)

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "superadmin@tuapp.com",
  "password": "superadmin123"
}
```

#### Obtener Usuario Actual
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### 🏢 Tenants (11 endpoints)

#### Obtener Tenant por Dominio (Público)
```http
GET /api/tenants/domain/sabor-y-tradicion.local
```

#### Crear Tenant (SUPERADMIN)
```http
POST /api/tenants
Authorization: Bearer {superadmin_token}
Content-Type: application/json

{
  "name": "Nuevo Restaurante",
  "slug": "nuevo-restaurante",
  "email": "contacto@nuevo.com",
  "plan": "premium",
  "adminName": "Admin",
  "adminEmail": "admin@nuevo.com",
  "adminPassword": "Admin123!"
}
```

### 📋 Categorías, Platos y Órdenes

**Nota:** Todos los endpoints requieren header `X-Tenant-Domain`

```http
GET /api/categories
X-Tenant-Domain: sabor-y-tradicion.local
Authorization: Bearer {token}
```

> Ver [MULTITENANT.md](./MULTITENANT.md) para la lista completa de endpoints

## 🔐 Autenticación

El sistema usa JWT con información del tenant:

```javascript
// Headers requeridos
{
  "Authorization": "Bearer {token}",
  "X-Tenant-Domain": "sabor-y-tradicion.local"
}
```

## 📚 Endpoints API Anteriores (Actualizados)

#### Verificar Token
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

### 📂 Categorías

#### Obtener todas las categorías
```http
GET /api/categories
```

#### Obtener categoría por ID
```http
GET /api/categories/:id
```

#### Crear categoría
```http
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Nueva Categoría",
  "description": "Descripción opcional",
  "icon": "🍕",
  "order": 0,
  "isActive": true
}
```

#### Actualizar categoría
```http
PUT /api/categories/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Categoría Actualizada",
  "isActive": false
}
```

#### Eliminar categoría
```http
DELETE /api/categories/:id
Authorization: Bearer <token>
```

#### Reordenar categorías
```http
POST /api/categories/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "categoryIds": ["id1", "id2", "id3"]
}
```

### 🍽️ Platos

#### Obtener todos los platos (con filtros)
```http
GET /api/dishes?categoryId=xxx&search=cafe&isActive=true&page=1&limit=10
```

#### Obtener plato por ID
```http
GET /api/dishes/:id
```

#### Crear plato
```http
POST /api/dishes
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Nuevo Plato",
  "description": "Descripción del plato",
  "price": 15.50,
  "categoryId": "category_id",
  "imageUrl": "https://cloudinary.com/...",
  "isActive": true,
  "isVegetarian": false,
  "isVegan": false,
  "isGlutenFree": false,
  "isSpicy": false,
  "isFeatured": true,
  "allergens": ["gluten", "lactosa"],
  "tags": ["tag_id_1", "tag_id_2"]
}
```

#### Actualizar plato
```http
PUT /api/dishes/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Plato Actualizado",
  "price": 18.00
}
```

#### Eliminar plato
```http
DELETE /api/dishes/:id
Authorization: Bearer <token>
```

## 🗄️ Estructura del Proyecto

```
src/
├── config/          # Configuración (DB, Cloudinary)
├── controllers/     # Controladores de rutas
├── middlewares/     # Middlewares (auth, error handling)
├── routes/          # Definición de rutas
├── services/        # Lógica de negocio
├── types/           # Tipos TypeScript
├── utils/           # Funciones helper
├── validators/      # Schemas de validación Zod
└── server.ts        # Archivo principal del servidor

prisma/
├── schema.prisma    # Schema de la base de datos
└── seed.ts          # Datos de prueba
```

## 👤 Usuario de Prueba

Después de ejecutar el seed, puedes usar estas credenciales:

- **Email**: admin@sabor-tradicion.com
- **Password**: admin123

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor en modo desarrollo
- `npm run build` - Compila TypeScript a JavaScript
- `npm start` - Inicia el servidor en modo producción
- `npm run prisma:generate` - Genera el cliente de Prisma
- `npm run prisma:migrate` - Ejecuta migraciones de base de datos
- `npm run prisma:studio` - Abre Prisma Studio (GUI de base de datos)
- `npm run prisma:seed` - Puebla la base de datos con datos de prueba

## 🚀 Deploy en Railway

### Paso 1: Preparar el Repositorio

1. **Asegúrate de tener un repositorio Git**
```bash
git init
git add .
git commit -m "Initial commit"
```

2. **Subir a GitHub**
```bash
gh repo create sabor-y-tradicion-backend --public
git remote add origin https://github.com/tu-usuario/sabor-y-tradicion-backend.git
git push -u origin main
```

### Paso 2: Configurar Railway

1. **Crear cuenta en [Railway.app](https://railway.app)**

2. **Crear nuevo proyecto**
   - Click en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Autoriza Railway a acceder a tu repositorio
   - Selecciona el repositorio `sabor-y-tradicion-backend`

3. **Agregar PostgreSQL**
   - En tu proyecto, click en "New"
   - Selecciona "Database" → "Add PostgreSQL"
   - Railway creará automáticamente la base de datos

### Paso 3: Configurar Variables de Entorno

En Railway, ve a tu servicio → Variables → Add Variables:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=tu_secret_super_seguro_cambiar_en_produccion
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://tu-frontend.vercel.app
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

**⚠️ IMPORTANTE:** 
- Cambia `JWT_SECRET` por un valor aleatorio seguro
- Actualiza `FRONTEND_URL` con la URL de tu frontend en producción
- `DATABASE_URL` se referencia automáticamente desde PostgreSQL

### Paso 4: Configurar Build & Deploy

Railway detecta automáticamente Node.js. Verificar en Settings:

- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Install Command**: `npm install`

### Paso 5: Ejecutar Migraciones

Después del primer deploy, ejecuta las migraciones:

1. Ve a tu proyecto en Railway
2. Click en tu servicio
3. Ve a la pestaña "Deployments"
4. Click en el último deployment
5. Ve a "Command" y ejecuta:
```bash
npx prisma migrate deploy
```

### Paso 6: Crear Usuario Administrador

En Railway, ejecuta el script de creación de admin:

```bash
npm run create:admin
```

O conéctate a la BD y crea manualmente:
```sql
INSERT INTO users (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  'admin_id',
  'admin@sabor-tradicion.com',
  '$2a$10$hashedPassword',
  'Administrador',
  'ADMIN',
  NOW(),
  NOW()
);
```

### Paso 7: Verificar Deploy

Tu API estará disponible en:
```
https://sabor-y-tradicion-backend-production.up.railway.app
```

Verifica que funciona:
```bash
curl https://tu-url.railway.app/health
```

### Troubleshooting

#### Error de conexión a PostgreSQL
- Verifica que la variable `DATABASE_URL` esté correctamente configurada
- Asegúrate de que Railway haya vinculado el servicio de PostgreSQL

#### Error en migraciones
```bash
# Reiniciar la base de datos (⚠️ CUIDADO: Elimina todos los datos)
npx prisma migrate reset --force
npx prisma migrate deploy
```

#### Ver logs
```bash
# En Railway, ve a tu servicio → Deployments → View Logs
```

### Alternativa: Render.com

Si prefieres Render:

1. Crear cuenta en [Render.com](https://render.com)
2. Crear nuevo Web Service desde GitHub
3. Agregar PostgreSQL desde Dashboard
4. Configurar variables de entorno
5. Build Command: `npm run build`
6. Start Command: `npm start`

## 📝 Licencia

ISC

