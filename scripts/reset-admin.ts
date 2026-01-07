import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdminUser() {
  console.log('🔄 Reseteando usuario administrador...');

  try {
    // Buscar o crear tenant por defecto
    let tenant = await prisma.tenant.findFirst();
    
    if (!tenant) {
      console.log('📝 Creando tenant por defecto...');
      tenant = await prisma.tenant.create({
        data: {
          name: 'Sabor y Tradición',
          slug: 'sabor-y-tradicion',
          isActive: true,
        },
      });
      console.log(`✅ Tenant creado: ${tenant.name}`);
    }

    // PASO 1: Eliminar TODOS los usuarios del tenant
    console.log('🗑️ Eliminando todos los usuarios del tenant...');
    const deleted = await prisma.user.deleteMany({
      where: {
        tenantId: tenant.id
      }
    });
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
        tenantId: tenant.id,
      },
    });

    console.log('\n✨ ¡Usuario administrador creado exitosamente!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    admin@sabor-tradicion.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Nombre:   Administrador');
    console.log('🎯 Rol:      ADMIN');
    console.log('🆔 ID:      ', admin.id);
    console.log('🏢 Tenant:  ', tenant.name);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ ¡Ahora puedes hacer login en el frontend!');

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminUser();

