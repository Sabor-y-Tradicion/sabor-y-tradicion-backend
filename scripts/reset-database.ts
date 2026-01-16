import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Script para resetear la base de datos y crear solo el SUPERADMIN
 * Este script:
 * 1. Elimina todos los datos
 * 2. Crea solo el usuario SUPERADMIN
 * 3. NO crea tenants ni otros usuarios
 */
async function resetDatabase() {
  console.log('⚠️  ATENCIÓN: Este script eliminará TODOS los datos de la base de datos');
  console.log('');

  try {
    console.log('🗑️  Eliminando datos existentes...\n');

    // Eliminar en orden correcto (respetando foreign keys)
    await prisma.auditLog.deleteMany();
    console.log('✅ Audit logs eliminados');

    await prisma.order.deleteMany();
    console.log('✅ Órdenes eliminadas');

    await prisma.dish.deleteMany();
    console.log('✅ Platos eliminados');

    await prisma.category.deleteMany();
    console.log('✅ Categorías eliminadas');

    await prisma.user.deleteMany();
    console.log('✅ Usuarios eliminados');

    await prisma.tenant.deleteMany();
    console.log('✅ Tenants eliminados');

    await prisma.settings.deleteMany();
    console.log('✅ Settings eliminados');

    await prisma.pageContent.deleteMany();
    console.log('✅ Page content eliminado');

    console.log('');
    console.log('✅ Base de datos limpiada completamente\n');

    // Crear solo el SUPERADMIN
    console.log('👤 Creando usuario SUPERADMIN...\n');

    const hashedPassword = await bcrypt.hash('superadmin123', 10);

    const superAdmin = await prisma.user.create({
      data: {
        email: 'superadmin@tuapp.com',
        password: hashedPassword,
        name: 'Super Administrator',
        role: 'SUPERADMIN',
        tenantId: null, // SuperAdmin NO pertenece a ningún tenant
      },
    });

    console.log('═'.repeat(70));
    console.log('✅ BASE DE DATOS RESETEADA EXITOSAMENTE');
    console.log('═'.repeat(70));
    console.log('');
    console.log('📊 Estado de la Base de Datos:');
    console.log('   Tenants: 0');
    console.log('   Usuarios: 1 (SUPERADMIN)');
    console.log('   Categorías: 0');
    console.log('   Platos: 0');
    console.log('   Órdenes: 0');
    console.log('');
    console.log('🔐 Credenciales SUPERADMIN:');
    console.log('   Email:    superadmin@tuapp.com');
    console.log('   Password: superadmin123');
    console.log('');
    console.log('⚠️  IMPORTANTE: Cambiar la contraseña después del primer login');
    console.log('');
    console.log('🚀 Próximos pasos:');
    console.log('   1. Iniciar servidor: npm run dev');
    console.log('   2. Login como SuperAdmin');
    console.log('   3. Crear primer tenant desde /superadmin/tenants');
    console.log('   4. Al crear tenant se generará automáticamente su usuario ADMIN');
    console.log('');
    console.log('📚 Documentación:');
    console.log('   - Ver implementar.md para flujo completo');
    console.log('   - Ver INSTALLATION_GUIDE.md para detalles');
    console.log('');
    console.log('═'.repeat(70));

  } catch (error) {
    console.error('');
    console.error('❌ Error al resetear la base de datos:', error);
    console.error('');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
resetDatabase();

