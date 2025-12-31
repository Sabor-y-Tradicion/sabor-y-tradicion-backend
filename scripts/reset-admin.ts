import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdminUser() {
  console.log('🔄 Reseteando usuario administrador...');

  try {
    // PASO 1: Eliminar TODOS los usuarios
    console.log('🗑️ Eliminando todos los usuarios...');
    const deleted = await prisma.user.deleteMany({});
    console.log(`✅ Eliminados ${deleted.count} usuario(s)`);

    // PASO 2: Crear usuario admin
    console.log('👤 Creando nuevo usuario administrador...');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@sabor-tradicion.com',
        password: hashedPassword,
        name: 'Administrador',
        role: 'ADMIN',
      },
    });

    console.log('\n✨ ¡Usuario administrador creado exitosamente!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    admin@sabor-tradicion.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Nombre:   Administrador');
    console.log('🎯 Rol:      ADMIN');
    console.log('🆔 ID:      ', admin.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ ¡Ahora puedes hacer login en el frontend!');

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminUser();

