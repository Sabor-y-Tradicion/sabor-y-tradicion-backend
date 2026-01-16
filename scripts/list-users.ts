import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        tenant: {
          select: {
            name: true,
            domain: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log('');
    console.log('═'.repeat(70));
    console.log('📋 LISTADO DE USUARIOS EN EL SISTEMA');
    console.log('═'.repeat(70));
    console.log('');
    console.log(`Total de usuarios: ${users.length}`);
    console.log('');

    if (users.length === 0) {
      console.log('⚠️  No hay usuarios en el sistema');
      console.log('');
      console.log('💡 Ejecuta: npm run reset:database');
      console.log('   para crear el usuario SUPERADMIN');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   Email:    ${user.email}`);
        console.log(`   Role:     ${user.role}`);
        console.log(`   Tenant:   ${user.tenant ? `${user.tenant.name} (${user.tenant.domain})` : 'N/A (Global - SuperAdmin)'}`);
        console.log(`   Creado:   ${user.createdAt.toLocaleString()}`);
        console.log('');
      });
    }

    console.log('═'.repeat(70));
    console.log('');

  } catch (error) {
    console.error('❌ Error al listar usuarios:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();

