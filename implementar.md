# 📝 Requisitos del Backend - Editor de Página Web

Este documento describe los endpoints y estructura de datos necesaria para el sistema de edición de la página web del restaurante.

---

## 📊 Modelo de Base de Datos (Prisma)

```prisma
model Tenant {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  domain        String   @unique
  customDomain  String?  @unique
  email         String
  plan          String   @default("free")
  status        String   @default("active")
  
  // Configuración de la página web (JSON)
  webConfig     Json?    @default("{}")
  
  settings      Json?    @default("{}")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  users         User[]
  categories    Category[]
  dishes        Dish[]
  orders        Order[]
  subtags       Subtag[]

  @@index([domain])
  @@index([slug])
}
```

### Estructura de `webConfig` (JSON):

```typescript
{
  "home": {
    "hero": {
      "title": "Bienvenido a Sabor y Tradición",
      "subtitle": "Descubre la auténtica cocina peruana",
      "imageUrl": "/images/hero.jpg",
      "ctaText": "Ver Menú",
      "ctaLink": "/menu"
    },
    "features": {
      "enabled": true,
      "items": [
        {
          "id": "uuid-1",
          "title": "Ingredientes Frescos",
          "description": "Productos seleccionados diariamente",
          "imageUrl": "/images/feature1.jpg"
        },
        {
          "id": "uuid-2",
          "title": "Recetas Tradicionales",
          "description": "Preparadas con amor y dedicación",
          "imageUrl": "/images/feature2.jpg"
        }
      ]
    },
    "carousel": {
      "enabled": true,
      "autoplay": true,
      "interval": 5000,
      "images": [
        {
          "id": "uuid-1",
          "url": "/images/slide1.jpg",
          "alt": "Plato especial",
          "order": 0
        },
        {
          "id": "uuid-2",
          "url": "/images/slide2.jpg",
          "alt": "Ambiente acogedor",
          "order": 1
        }
      ]
    }
  },
  "about": {
    "history": {
      "enabled": true,
      "title": "Nuestra Historia",
      "content": "Desde 1995, hemos servido...",
      "imageUrl": "/images/history.jpg"
    },
    "mission": {
      "enabled": true,
      "title": "Nuestra Misión",
      "content": "Ofrecer la mejor experiencia gastronómica...",
      "imageUrl": "/images/mission.jpg"
    },
    "values": {
      "enabled": true,
      "title": "Nuestros Valores",
      "items": [
        {
          "id": "uuid-1",
          "title": "Calidad",
          "description": "Los mejores ingredientes"
        },
        {
          "id": "uuid-2",
          "title": "Tradición",
          "description": "Recetas auténticas"
        }
      ]
    }
  }
}
```

---

## 🔗 Endpoints REST

### 1. **Obtener Configuración de la Página Web**

**GET** `/api/tenants/:tenantId/website`

#### Headers:
```
Authorization: Bearer <token>
X-Tenant-Domain: saborytradicion.james.pe
```

#### Response Success (200):
```json
{
  "success": true,
  "data": {
    "home": {
      "hero": {
        "title": "Bienvenido a Sabor y Tradición",
        "subtitle": "Descubre la auténtica cocina peruana",
        "imageUrl": "/images/hero.jpg",
        "ctaText": "Ver Menú",
        "ctaLink": "/menu"
      },
      "features": {
        "enabled": true,
        "items": [...]
      },
      "carousel": {
        "enabled": true,
        "autoplay": true,
        "interval": 5000,
        "images": [...]
      }
    },
    "about": {
      "history": {...},
      "mission": {...},
      "values": {...}
    }
  }
}
```

#### Response Error (404):
```json
{
  "success": false,
  "error": "Tenant no encontrado"
}
```

---

### 2. **Actualizar Configuración de Home**

**PATCH** `/api/tenants/:tenantId/website/home`

#### Headers:
```
Authorization: Bearer <token>
X-Tenant-Domain: saborytradicion.james.pe
Content-Type: application/json
```

#### Request Body:
```json
{
  "hero": {
    "title": "Nuevo título",
    "subtitle": "Nuevo subtítulo",
    "imageUrl": "/uploads/hero-new.jpg",
    "ctaText": "Explorar Menú",
    "ctaLink": "/menu"
  },
  "features": {
    "enabled": true,
    "items": [
      {
        "id": "uuid-1",
        "title": "Ingredientes Frescos",
        "description": "Productos seleccionados diariamente",
        "imageUrl": "/uploads/feature1.jpg"
      }
    ]
  },
  "carousel": {
    "enabled": true,
    "autoplay": true,
    "interval": 5000,
    "images": [
      {
        "id": "uuid-1",
        "url": "/uploads/slide1.jpg",
        "alt": "Plato especial",
        "order": 0
      }
    ]
  }
}
```

#### Response Success (200):
```json
{
  "success": true,
  "message": "Configuración de Home actualizada correctamente",
  "data": {
    "home": {
      "hero": {...},
      "features": {...},
      "carousel": {...}
    }
  }
}
```

#### Validaciones:
- `hero.title`: string, max 100 caracteres, requerido
- `hero.subtitle`: string, max 200 caracteres, requerido
- `hero.imageUrl`: string, URL válida, requerido
- `hero.ctaText`: string, max 50 caracteres, requerido
- `hero.ctaLink`: string, debe empezar con `/`, requerido
- `features.items`: array, max 6 items
- `features.items[].title`: string, max 50 caracteres
- `features.items[].description`: string, max 200 caracteres
- `carousel.images`: array, max 10 imágenes
- `carousel.interval`: number, min 2000, max 10000 (milisegundos)

---

### 3. **Actualizar Configuración de About**

**PATCH** `/api/tenants/:tenantId/website/about`

#### Headers:
```
Authorization: Bearer <token>
X-Tenant-Domain: saborytradicion.james.pe
Content-Type: application/json
```

#### Request Body:
```json
{
  "history": {
    "enabled": true,
    "title": "Nuestra Historia",
    "content": "Desde 1995, hemos servido los mejores platos...",
    "imageUrl": "/uploads/history.jpg"
  },
  "mission": {
    "enabled": true,
    "title": "Nuestra Misión",
    "content": "Ofrecer la mejor experiencia gastronómica...",
    "imageUrl": "/uploads/mission.jpg"
  },
  "values": {
    "enabled": true,
    "title": "Nuestros Valores",
    "items": [
      {
        "id": "uuid-1",
        "title": "Calidad",
        "description": "Los mejores ingredientes"
      },
      {
        "id": "uuid-2",
        "title": "Tradición",
        "description": "Recetas auténticas"
      }
    ]
  }
}
```

#### Response Success (200):
```json
{
  "success": true,
  "message": "Configuración de About actualizada correctamente",
  "data": {
    "about": {
      "history": {...},
      "mission": {...},
      "values": {...}
    }
  }
}
```

#### Validaciones:
- `history.title`: string, max 100 caracteres
- `history.content`: string, max 2000 caracteres
- `history.imageUrl`: string, URL válida
- `mission.title`: string, max 100 caracteres
- `mission.content`: string, max 2000 caracteres
- `mission.imageUrl`: string, URL válida
- `values.items`: array, max 8 items
- `values.items[].title`: string, max 50 caracteres
- `values.items[].description`: string, max 200 caracteres

---

### 4. **Subir Imagen para el Website**

**POST** `/api/tenants/:tenantId/website/upload`

#### Headers:
```
Authorization: Bearer <token>
X-Tenant-Domain: saborytradicion.james.pe
Content-Type: multipart/form-data
```

#### Request Body (FormData):
```
file: <archivo de imagen>
section: "home" | "about" | "carousel" | "features"
```

#### Response Success (200):
```json
{
  "success": true,
  "message": "Imagen subida correctamente",
  "data": {
    "url": "/uploads/tenants/cmk8lq9640000jv3ox024v11m/website/hero-1736553600000.jpg",
    "filename": "hero-1736553600000.jpg",
    "size": 245678,
    "mimeType": "image/jpeg"
  }
}
```

#### Response Error (400):
```json
{
  "success": false,
  "error": "Formato de imagen no válido. Solo se permiten JPG, PNG, WEBP"
}
```

#### Validaciones:
- Formatos permitidos: JPG, PNG, WEBP
- Tamaño máximo: 5MB
- Dimensiones recomendadas:
    - Hero: 1920x1080px
    - Features: 600x400px
    - Carousel: 1920x1080px
    - About: 800x600px

---

## 🔧 Implementación del Controlador (Node.js/Express)

### Obtener Configuración

```javascript
// controllers/websiteController.js

const getWebsiteConfig = async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    // Verificar que el usuario pertenece al tenant
    if (req.user.tenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para acceder a esta configuración'
      });
    }
    
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { webConfig: true }
    });
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: 'Tenant no encontrado'
      });
    }
    
    // Si no hay configuración, devolver valores por defecto
    const defaultConfig = {
      home: {
        hero: {
          title: `Bienvenido a ${tenant.name}`,
          subtitle: 'Descubre nuestra deliciosa comida',
          imageUrl: '/images/default-hero.jpg',
          ctaText: 'Ver Menú',
          ctaLink: '/menu'
        },
        features: {
          enabled: false,
          items: []
        },
        carousel: {
          enabled: false,
          autoplay: true,
          interval: 5000,
          images: []
        }
      },
      about: {
        history: {
          enabled: false,
          title: 'Nuestra Historia',
          content: '',
          imageUrl: '/images/default-about.jpg'
        },
        mission: {
          enabled: false,
          title: 'Nuestra Misión',
          content: '',
          imageUrl: '/images/default-mission.jpg'
        },
        values: {
          enabled: false,
          title: 'Nuestros Valores',
          items: []
        }
      }
    };
    
    const webConfig = tenant.webConfig || defaultConfig;
    
    return res.json({
      success: true,
      data: webConfig
    });
    
  } catch (error) {
    console.error('Error obteniendo configuración web:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener la configuración'
    });
  }
};
```

### Actualizar Home

```javascript
const updateHomeConfig = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { hero, features, carousel } = req.body;
    
    // Verificar permisos
    if (req.user.tenantId !== tenantId || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para modificar esta configuración'
      });
    }
    
    // Validaciones
    if (hero) {
      if (!hero.title || hero.title.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'El título es requerido y debe tener máximo 100 caracteres'
        });
      }
      if (!hero.subtitle || hero.subtitle.length > 200) {
        return res.status(400).json({
          success: false,
          error: 'El subtítulo es requerido y debe tener máximo 200 caracteres'
        });
      }
    }
    
    if (features && features.items && features.items.length > 6) {
      return res.status(400).json({
        success: false,
        error: 'No se pueden agregar más de 6 características'
      });
    }
    
    if (carousel && carousel.images && carousel.images.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'No se pueden agregar más de 10 imágenes al carrusel'
      });
    }
    
    // Obtener configuración actual
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { webConfig: true }
    });
    
    const currentConfig = tenant.webConfig || {};
    
    // Actualizar solo la sección Home
    const newConfig = {
      ...currentConfig,
      home: {
        hero: hero || currentConfig.home?.hero,
        features: features || currentConfig.home?.features,
        carousel: carousel || currentConfig.home?.carousel
      }
    };
    
    // Guardar en la base de datos
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { 
        webConfig: newConfig,
        updatedAt: new Date()
      },
      select: { webConfig: true }
    });
    
    return res.json({
      success: true,
      message: 'Configuración de Home actualizada correctamente',
      data: updatedTenant.webConfig
    });
    
  } catch (error) {
    console.error('Error actualizando configuración de Home:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al actualizar la configuración'
    });
  }
};
```

### Actualizar About

```javascript
const updateAboutConfig = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { history, mission, values } = req.body;
    
    // Verificar permisos
    if (req.user.tenantId !== tenantId || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para modificar esta configuración'
      });
    }
    
    // Validaciones
    if (history && history.content && history.content.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'El contenido de historia debe tener máximo 2000 caracteres'
      });
    }
    
    if (mission && mission.content && mission.content.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'El contenido de misión debe tener máximo 2000 caracteres'
      });
    }
    
    if (values && values.items && values.items.length > 8) {
      return res.status(400).json({
        success: false,
        error: 'No se pueden agregar más de 8 valores'
      });
    }
    
    // Obtener configuración actual
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { webConfig: true }
    });
    
    const currentConfig = tenant.webConfig || {};
    
    // Actualizar solo la sección About
    const newConfig = {
      ...currentConfig,
      about: {
        history: history || currentConfig.about?.history,
        mission: mission || currentConfig.about?.mission,
        values: values || currentConfig.about?.values
      }
    };
    
    // Guardar en la base de datos
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: { 
        webConfig: newConfig,
        updatedAt: new Date()
      },
      select: { webConfig: true }
    });
    
    return res.json({
      success: true,
      message: 'Configuración de About actualizada correctamente',
      data: updatedTenant.webConfig
    });
    
  } catch (error) {
    console.error('Error actualizando configuración de About:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al actualizar la configuración'
    });
  }
};
```

### Subir Imagen

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configurar multer para subida de archivos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const { tenantId } = req.params;
    const uploadPath = path.join(__dirname, '../../public/uploads/tenants', tenantId, 'website');
    
    // Crear directorio si no existe
    await fs.mkdir(uploadPath, { recursive: true });
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const section = req.body.section || 'general';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${section}-${timestamp}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de imagen no válido. Solo se permiten JPG, PNG, WEBP'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter
});

const uploadWebsiteImage = async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    // Verificar permisos
    if (req.user.tenantId !== tenantId || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para subir imágenes'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se ha proporcionado ninguna imagen'
      });
    }
    
    const imageUrl = `/uploads/tenants/${tenantId}/website/${req.file.filename}`;
    
    return res.json({
      success: true,
      message: 'Imagen subida correctamente',
      data: {
        url: imageUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });
    
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al subir la imagen'
    });
  }
};
```

---

## 🛣️ Rutas (Express)

```javascript
// routes/website.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const websiteController = require('../controllers/websiteController');

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET configuración completa
router.get('/:tenantId/website', websiteController.getWebsiteConfig);

// PATCH actualizar Home
router.patch('/:tenantId/website/home', websiteController.updateHomeConfig);

// PATCH actualizar About
router.patch('/:tenantId/website/about', websiteController.updateAboutConfig);

// POST subir imagen
router.post(
  '/:tenantId/website/upload',
  upload.single('file'),
  websiteController.uploadWebsiteImage
);

module.exports = router;
```

---

## ⚠️ Consideraciones Importantes

### 1. **Seguridad**
- ✅ Validar que el usuario pertenece al tenant antes de permitir modificaciones
- ✅ Solo usuarios con rol `ADMIN` pueden editar la configuración
- ✅ Validar tipos de archivos en la subida de imágenes
- ✅ Sanitizar inputs para prevenir XSS

### 2. **Performance**
- 📦 Comprimir imágenes automáticamente al subirlas
- 🗜️ Generar múltiples tamaños (thumbnail, medium, large)
- 💾 Usar CDN para servir las imágenes en producción
- 🚀 Implementar caché de configuración (Redis)

### 3. **Migración de Datos Existentes**
Si ya hay tenants con `settings` en JSON, migrar a `webConfig`:

```javascript
// Script de migración
const migrateTenantSettings = async () => {
  const tenants = await prisma.tenant.findMany({
    where: {
      webConfig: null
    }
  });
  
  for (const tenant of tenants) {
    const settings = tenant.settings || {};
    
    const webConfig = {
      home: {
        hero: {
          title: `Bienvenido a ${tenant.name}`,
          subtitle: settings.slogan || 'Descubre nuestra deliciosa comida',
          imageUrl: '/images/default-hero.jpg',
          ctaText: 'Ver Menú',
          ctaLink: '/menu'
        },
        features: {
          enabled: false,
          items: []
        },
        carousel: {
          enabled: false,
          autoplay: true,
          interval: 5000,
          images: []
        }
      },
      about: {
        history: {
          enabled: true,
          title: 'Nuestra Historia',
          content: settings.longDescription || '',
          imageUrl: '/images/default-about.jpg'
        },
        mission: {
          enabled: false,
          title: 'Nuestra Misión',
          content: '',
          imageUrl: '/images/default-mission.jpg'
        },
        values: {
          enabled: false,
          title: 'Nuestros Valores',
          items: []
        }
      }
    };
    
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { webConfig }
    });
  }
  
  console.log(`Migrados ${tenants.length} tenants`);
};
```

### 4. **Valores por Defecto**
Cuando un tenant es creado, inicializar `webConfig` con valores por defecto usando el nombre del restaurante.

### 5. **Backup**
- 💾 Mantener historial de cambios (versiones anteriores)
- 🔄 Implementar sistema de "deshacer cambios"
- 📁 Backup automático antes de cada actualización

---

## ✅ Checklist de Implementación

- [ ] Actualizar modelo Prisma con campo `webConfig`
- [ ] Ejecutar migración: `npx prisma migrate dev`
- [ ] Crear controlador `websiteController.js`
- [ ] Implementar endpoint GET `/api/tenants/:tenantId/website`
- [ ] Implementar endpoint PATCH `/api/tenants/:tenantId/website/home`
- [ ] Implementar endpoint PATCH `/api/tenants/:tenantId/website/about`
- [ ] Implementar endpoint POST `/api/tenants/:tenantId/website/upload`
- [ ] Configurar multer para subida de imágenes
- [ ] Añadir validaciones de seguridad
- [ ] Implementar compresión de imágenes
- [ ] Crear script de migración de datos existentes
- [ ] Añadir valores por defecto al crear tenant
- [ ] Probar todos los endpoints con Postman
- [ ] Documentar en Swagger/OpenAPI
- [ ] Implementar logs de auditoría

---

## 🧪 Pruebas con cURL

```bash
# 1. Obtener configuración
curl -X GET http://localhost:5000/api/tenants/cmk8lq9640000jv3ox024v11m/website \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Tenant-Domain: saborytradicion.james.pe"

# 2. Actualizar Home
curl -X PATCH http://localhost:5000/api/tenants/cmk8lq9640000jv3ox024v11m/website/home \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Tenant-Domain: saborytradicion.james.pe" \
  -H "Content-Type: application/json" \
  -d '{
    "hero": {
      "title": "Nuevo título",
      "subtitle": "Nuevo subtítulo",
      "imageUrl": "/uploads/hero.jpg",
      "ctaText": "Ver Menú",
      "ctaLink": "/menu"
    }
  }'

# 3. Subir imagen
curl -X POST http://localhost:5000/api/tenants/cmk8lq9640000jv3ox024v11m/website/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Tenant-Domain: saborytradicion.james.pe" \
  -F "file=@/ruta/a/imagen.jpg" \
  -F "section=hero"
```

---

## 📞 Soporte

Para dudas o problemas con la implementación, contactar al equipo de desarrollo.

**Fecha de creación:** 10 de enero de 2026  
**Versión:** 1.0.0

