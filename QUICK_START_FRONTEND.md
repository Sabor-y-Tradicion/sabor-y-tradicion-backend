# ⚡ GUÍA RÁPIDA DE INTEGRACIÓN
## Conectar Frontend con Backend en 10 Minutos

---

## 🚀 INICIO RÁPIDO

### 1. Instalar Dependencias (2 min)
```bash
cd tu-proyecto-frontend
npm install axios
```

### 2. Crear Variables de Entorno (1 min)
Crear `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Copiar Archivos Base (5 min)
Copia estos 3 archivos del documento `INTEGRACION_FRONTEND.md`:
- `lib/api/client.ts` - Cliente axios
- `lib/api/types.ts` - Tipos TypeScript
- `lib/api/auth.ts` - API de autenticación

### 4. Crear Context de Auth (2 min)
Copia `contexts/AuthContext.tsx` del documento.

### 5. Proteger Layout Admin (1 min)
Actualiza `app/admin/layout.tsx` para usar `AuthProvider`.

---

## 📋 CHECKLIST MÍNIMO

Archivos que DEBES crear:
- [x] `.env.local`
- [x] `lib/api/client.ts`
- [x] `lib/api/types.ts`
- [x] `lib/api/auth.ts`
- [x] `contexts/AuthContext.tsx`
- [x] Actualizar `app/admin/layout.tsx`

Archivos opcionales (pero recomendados):
- [ ] `lib/api/categories.ts`
- [ ] `lib/api/dishes.ts`
- [ ] `hooks/useCategories.ts`
- [ ] `hooks/useDishes.ts`

---

## 💡 EJEMPLO BÁSICO DE USO

### Login en cualquier componente:
```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { login, user, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    await login({
      email: 'admin@sabor-tradicion.com',
      password: 'admin123'
    });
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Hola, {user?.name}</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Obtener categorías:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { categoriesAPI } from '@/lib/api/categories';

export default function Categories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoriesAPI.getAll().then(setCategories);
  }, []);

  return (
    <ul>
      {categories.map(cat => (
        <li key={cat.id}>{cat.name}</li>
      ))}
    </ul>
  );
}
```

---

## 🎯 3 PASOS PARA PROBAR

1. **Backend corriendo:**
   ```bash
   cd backend
   npm run dev
   # ✅ http://localhost:5000
   ```

2. **Frontend corriendo:**
   ```bash
   cd frontend
   npm run dev
   # ✅ http://localhost:3000
   ```

3. **Probar login:**
   - Ir a `/admin/login`
   - Email: `admin@sabor-tradicion.com`
   - Password: `admin123`
   - ✅ Debe redirigir a dashboard

---

## 🔍 VERIFICACIÓN RÁPIDA

### ¿Backend está corriendo?
```bash
curl http://localhost:5000/health
# Debe retornar: {"success":true,"message":"Server is running",...}
```

### ¿Frontend puede conectarse?
Abre consola del navegador (F12) y ejecuta:
```javascript
fetch('http://localhost:5000/api/categories')
  .then(r => r.json())
  .then(console.log)
// Debe mostrar las categorías
```

---

## ⚠️ ERRORES COMUNES

### Error: "Network Error" o "ERR_CONNECTION_REFUSED"
**Solución:** Backend no está corriendo
```bash
cd backend
npm run dev
```

### Error: "CORS policy"
**Solución:** Verificar que `.env` del backend tenga:
```env
FRONTEND_URL=http://localhost:3000
```

### Error: "401 Unauthorized"
**Solución:** Token expirado o inválido
```javascript
// Limpiar storage y volver a hacer login
localStorage.clear();
```

### Error: "Cannot find module '@/lib/api/...'"
**Solución:** Verificar que los archivos existan y el path alias esté configurado en `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## 📦 ESTRUCTURA FINAL

```
frontend/
├── .env.local                    # ✅ CREAR
├── lib/
│   └── api/
│       ├── client.ts             # ✅ CREAR (base axios)
│       ├── types.ts              # ✅ CREAR (tipos)
│       ├── auth.ts               # ✅ CREAR (auth API)
│       ├── categories.ts         # ⏭️ Opcional
│       └── dishes.ts             # ⏭️ Opcional
├── contexts/
│   └── AuthContext.tsx           # ✅ CREAR (auth context)
├── hooks/
│   ├── useCategories.ts          # ⏭️ Opcional
│   └── useDishes.ts              # ⏭️ Opcional
└── app/
    └── admin/
        ├── layout.tsx            # ✅ ACTUALIZAR
        └── login/
            └── page.tsx          # ✅ ACTUALIZAR
```

---

## 🎉 RESULTADO FINAL

Después de implementar:
- ✅ Login funcional con JWT
- ✅ Protección de rutas admin
- ✅ Conexión con API real
- ✅ Manejo de errores automático
- ✅ Datos reales en lugar de mock

---

## 📚 DOCUMENTACIÓN COMPLETA

Para más detalles, revisa:
- `INTEGRACION_FRONTEND.md` - Guía completa con todo el código
- `EJEMPLOS_FRONTEND.md` - Ejemplos adicionales
- `http://localhost:5000/docs` - Documentación interactiva de la API

---

**¡Listo en 10 minutos! ⚡**

