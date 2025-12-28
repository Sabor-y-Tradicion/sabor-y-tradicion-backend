# 🚀 Inicio Rápido - Backend Sabor y Tradición

## ⚡ Setup en 5 Pasos

### 1️⃣ Instalar Dependencias
```bash
npm install
```

### 2️⃣ Configurar PostgreSQL

**Opción A: PostgreSQL Local**
```bash
# Crear base de datos
createdb saborytradicion

# Actualizar .env
DATABASE_URL="postgresql://postgres:jamesdroide@localhost:5432/saborytradicion"
```

**Opción B: PostgreSQL en Docker**
```bash
docker run --name postgres-sabor -e POSTGRES_PASSWORD=jamesdroide -e POSTGRES_DB=saborytradicion -p 5432:5432 -d postgres:15
```

**Opción C: Neon.tech (Cloud Gratis)**
1. Crear cuenta en https://neon.tech
2. Crear nuevo proyecto
3. Copiar connection string a `.env`

### 3️⃣ Configurar Base de Datos
```bash
# Generar cliente Prisma
npm run prisma:generate

# Crear tablas
npm run prisma:migrate

# Cargar datos de prueba
npm run prisma:seed
```

### 4️⃣ Iniciar Servidor
```bash
npm run dev
```

### 5️⃣ Probar API

Abrir: http://localhost:5000/health

Deberías ver:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-27T..."
}
```

---

## 🔑 Credenciales de Prueba

Después del seed:
- **Email**: admin@sabor-tradicion.com
- **Password**: admin123

---

## 📝 Comandos Útiles

```bash
# Desarrollo
npm run dev                 # Inicia servidor con hot-reload

# Base de Datos
npm run prisma:studio      # Abre GUI de base de datos
npm run prisma:migrate     # Ejecuta migraciones
npm run prisma:seed        # Carga datos de prueba

# Producción
npm run build              # Compila TypeScript
npm start                  # Inicia servidor producción
```

---

## 🧪 Probar Endpoints

### Con curl

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sabor-tradicion.com","password":"admin123"}'
```

**Obtener Categorías:**
```bash
curl http://localhost:5000/api/categories
```

**Obtener Platos:**
```bash
curl http://localhost:5000/api/dishes
```

### Con PowerShell

**Login:**
```powershell
$body = @{
    email = "admin@sabor-tradicion.com"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

---

## ❗ Solución de Problemas

### Error: "Cannot connect to database"
```bash
# Verificar que PostgreSQL está corriendo
pg_isready

# Verificar variables de entorno
cat .env
```

### Error: "Prisma Client not generated"
```bash
npm run prisma:generate
```

### Error: "Port 5000 already in use"
```bash
# Cambiar puerto en .env
PORT=5001
```

### Error al ejecutar migraciones
```bash
# Reset completo de base de datos
npx prisma migrate reset
npm run prisma:seed
```

---

## 📁 Archivos Importantes

- `.env` - Variables de entorno (NO subir a git)
- `prisma/schema.prisma` - Definición de modelos
- `src/server.ts` - Punto de entrada
- `src/routes/` - Definición de endpoints
- `src/controllers/` - Lógica de endpoints
- `src/services/` - Lógica de negocio

---

## 🔗 Recursos

- [Documentación Prisma](https://www.prisma.io/docs)
- [Express.js Docs](https://expressjs.com/)
- [Zod Validation](https://zod.dev/)
- [JWT.io](https://jwt.io/)

---

## ✅ Checklist de Verificación

- [ ] PostgreSQL instalado y corriendo
- [ ] Dependencias instaladas (`npm install`)
- [ ] Variables de entorno configuradas (`.env`)
- [ ] Prisma client generado
- [ ] Migraciones ejecutadas
- [ ] Seed ejecutado correctamente
- [ ] Servidor corriendo sin errores
- [ ] Health check funciona
- [ ] Login funciona con usuario de prueba
- [ ] Endpoints devuelven datos

---

**¿Listo?** 🎉 Ahora puedes empezar a desarrollar!

