import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  console.log('👤 Creando usuario administrador...');

  try {
    // Verificar si ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@sabor-tradicion.com' }
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
      },
    });

    console.log('✅ Usuario administrador creado exitosamente!');
    console.log('📧 Email: admin@sabor-tradicion.com');
    console.log('🔑 Password: admin123');
    console.log('👤 ID:', admin.id);

  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();

