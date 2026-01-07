import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  console.log('👤 Creando usuario administrador...');

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

    // Verificar si ya existe el usuario
    const existingUser = await prisma.user.findFirst({
      where: { 
        email: 'admin@sabor-tradicion.com',
        tenantId: tenant.id
      }
    });

    if (existingUser) {
      console.log('✅ Usuario admin ya existe');
      return;
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Crear usuario
    const admin = await prisma.user.create({
      data: {
        email: 'admin@sabor-tradicion.com',
        password: hashedPassword,
        name: 'Administrador',
        role: 'ADMIN',
        tenantId: tenant.id,
      },
    });

    console.log('✅ Usuario administrador creado exitosamente!');
    console.log('📧 Email: admin@sabor-tradicion.com');
    console.log('🔑 Password: admin123');
    console.log('👤 ID:', admin.id);
    console.log('🏢 Tenant:', tenant.name);

  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();

