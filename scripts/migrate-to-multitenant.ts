import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateToMultitenant() {
  console.log('🚀 Migrando a sistema multitenant...');

  try {
    // Verificar si ya existe un tenant
    const existingTenant = await prisma.tenant.findFirst();

    if (existingTenant) {
      // Verificar si hay datos sin migrar
      const unmigrated = {
        users: await prisma.user.count({ where: { tenantId: null } }),
        categories: await prisma.category.count({ where: { tenantId: null } }),
        dishes: await prisma.dish.count({ where: { tenantId: null } }),
        settings: await prisma.settings.count({ where: { tenantId: null } }),
        pageContents: await prisma.pageContent.count({ where: { tenantId: null } }),
      };

      const totalUnmigrated = Object.values(unmigrated).reduce((a, b) => a + b, 0);

      if (totalUnmigrated === 0) {
        console.log('⚠️  Ya existe un tenant. Saltando migración.');
        console.log(`   Tenant existente: ${existingTenant.name}`);
        return;
      } else {
        console.log(`⚠️  Tenant existe pero hay ${totalUnmigrated} registro(s) sin migrar.`);
        console.log('📝 Continuando con la migración de datos pendientes...');
      }
    }

    // Crear el tenant por defecto si no existe
    const tenant = existingTenant || await prisma.tenant.create({
      data: {
        name: 'Sabor y Tradición',
        slug: 'sabor-y-tradicion',
        isActive: true,
      },
    });

    if (!existingTenant) {
      console.log(`✅ Tenant creado: ${tenant.name}`);
    }

    // Migrar usuarios existentes al nuevo tenant
    const usersCount = await prisma.user.count({
      where: { tenantId: null },
    });
    
    if (usersCount > 0) {
      console.log(`🔄 Migrando ${usersCount} usuario(s)...`);
      await prisma.user.updateMany({
        where: { tenantId: null },
        data: { tenantId: tenant.id },
      });
      console.log('✅ Usuarios migrados');
    }

    // Migrar categorías existentes al nuevo tenant
    const categoriesCount = await prisma.category.count({
      where: { tenantId: null },
    });
    
    if (categoriesCount > 0) {
      console.log(`🔄 Migrando ${categoriesCount} categoría(s)...`);
      await prisma.category.updateMany({
        where: { tenantId: null },
        data: { tenantId: tenant.id },
      });
      console.log('✅ Categorías migradas');
    }

    // Migrar platos existentes al nuevo tenant
    const dishesCount = await prisma.dish.count({
      where: { tenantId: null },
    });
    
    if (dishesCount > 0) {
      console.log(`🔄 Migrando ${dishesCount} plato(s)...`);
      await prisma.dish.updateMany({
        where: { tenantId: null },
        data: { tenantId: tenant.id },
      });
      console.log('✅ Platos migrados');
    }

    // Migrar configuraciones existentes al nuevo tenant
    const settingsCount = await prisma.settings.count({
      where: { tenantId: null },
    });
    
    if (settingsCount > 0) {
      console.log(`🔄 Migrando ${settingsCount} configuración(es)...`);
      await prisma.settings.updateMany({
        where: { tenantId: null },
        data: { tenantId: tenant.id },
      });
      console.log('✅ Configuraciones migradas');
    }

    // Migrar contenido de página existente al nuevo tenant
    const pageContentsCount = await prisma.pageContent.count({
      where: { tenantId: null },
    });
    
    if (pageContentsCount > 0) {
      console.log(`🔄 Migrando ${pageContentsCount} contenido(s) de página...`);
      await prisma.pageContent.updateMany({
        where: { tenantId: null },
        data: { tenantId: tenant.id },
      });
      console.log('✅ Contenidos de página migrados');
    }

    console.log('\n🎉 ¡Migración completada exitosamente!');
    console.log(`📊 Tenant: ${tenant.name} (${tenant.slug})`);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateToMultitenant();
