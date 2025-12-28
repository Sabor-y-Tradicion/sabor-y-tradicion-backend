# Sabor y Tradición - Backend API

Backend API REST para el sistema de gestión de menú del restaurante Sabor y Tradición.

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
npm run prisma:migrate

# Poblar la base de datos con datos de prueba
npm run prisma:seed
```

## 🏃 Ejecutar el proyecto

### Modo desarrollo
```bash
npm run dev
```

### Modo producción
```bash
npm run build
npm start
```

## 📚 Endpoints API

### 🔐 Autenticación

#### Registrar usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "Usuario",
  "role": "ADMIN" // o "EDITOR"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@sabor-tradicion.com",
  "password": "admin123"
}
```

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

## 🚀 Deploy

### Railway.app (Recomendado)

1. Crear cuenta en [Railway.app](https://railway.app)
2. Conectar repositorio de GitHub
3. Agregar PostgreSQL desde el marketplace
4. Configurar variables de entorno
5. Deploy automático

### Render.com

1. Crear cuenta en [Render.com](https://render.com)
2. Crear nuevo Web Service
3. Agregar PostgreSQL
4. Configurar variables de entorno
5. Deploy

## 📝 Licencia

ISC

