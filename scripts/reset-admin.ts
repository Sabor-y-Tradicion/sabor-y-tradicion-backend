import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetSuperAdmin() {
  console.log('🔄 Reseteando usuario SUPERADMIN...');

  try {
    // PASO 1: Eliminar SOLO el SUPERADMIN existente (si existe)
    console.log('🗑️ Eliminando SUPERADMIN anterior (si existe)...');
    const deleted = await prisma.user.deleteMany({
      where: {
        email: 'superadmin@tuapp.com'
      }
    });
    console.log(`✅ Eliminados ${deleted.count} usuario(s) SUPERADMIN`);

    // PASO 2: Crear nuevo usuario SUPERADMIN
    console.log('👤 Creando nuevo usuario SUPERADMIN...');

    const hashedPassword = await bcrypt.hash('superadmin123', 10);

    const superadmin = await prisma.user.create({
      data: {
        email: 'superadmin@tuapp.com',
        password: hashedPassword,
        name: 'Super Administrador',
        role: 'SUPERADMIN',
        tenantId: null, // SUPERADMIN no tiene tenant
      },
    });

    console.log('\n✨ ¡Usuario SUPERADMIN creado exitosamente!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    superadmin@tuapp.com');
    console.log('🔑 Password: superadmin123');
    console.log('👤 Nombre:   Super Administrador');
    console.log('🎯 Rol:      SUPERADMIN');
    console.log('🏢 Tenant:   Sin tenant (correcto)');
    console.log('🆔 ID:      ', superadmin.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ ¡Ahora puedes hacer login en el frontend!');
    console.log('🌐 URL de login: /superadmin/login');

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetSuperAdmin();

