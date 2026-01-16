import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Migrando a sistema multitenant...');

  // Verificar si ya existe un tenant
  const existingTenant = await prisma.tenant.findFirst();
  if (existingTenant) {
    console.log('⚠️  Ya existe un tenant. Saltando migración.');
    console.log('   Tenant existente:', existingTenant.name);
    return;
  }

  // Crear primer tenant (Sabor y Tradición)
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Sabor y Tradición',
      slug: 'sabor-y-tradicion',
      domain: 'sabor-y-tradicion.local',
      email: 'contacto@saborytradicion.pe',
      plan: 'premium',
      status: 'active',
      settings: {
        colors: {
          primary: '#ff6b35',
          secondary: '#f7931e',
          accent: '#c1121f',
        },
        phone: '+51 941 234 567',
        email: 'contacto@saborytradicion.pe',
        location: {
          address: 'Jr Bolivia 715, Chachapoyas',
        },
      },
    },
  });

  console.log('✅ Tenant creado:', tenant.name);

  // Actualizar usuarios existentes usando SQL directo
  const usersResult = await prisma.$executeRaw`
    UPDATE users 
    SET "tenantId" = ${tenant.id}
    WHERE "tenantId" IS NULL
  `;
  console.log(`✅ ${usersResult} usuarios actualizados`);

  // Actualizar categorías existentes usando SQL directo
  const categoriesResult = await prisma.$executeRaw`
    UPDATE categories 
    SET "tenantId" = ${tenant.id}
    WHERE "tenantId" IS NULL
  `;
  console.log(`✅ ${categoriesResult} categorías actualizadas`);

  // Actualizar platos existentes usando SQL directo
  const dishesResult = await prisma.$executeRaw`
    UPDATE dishes 
    SET "tenantId" = ${tenant.id}
    WHERE "tenantId" IS NULL
  `;
  console.log(`✅ ${dishesResult} platos actualizados`);

  // Actualizar órdenes existentes usando SQL directo
  const ordersResult = await prisma.$executeRaw`
    UPDATE orders 
    SET "tenantId" = ${tenant.id}
    WHERE "tenantId" IS NULL
  `;
  console.log(`✅ ${ordersResult} órdenes actualizadas`);

  // Verificar si ya existe un superadmin
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { role: 'SUPERADMIN' },
  });

  if (existingSuperAdmin) {
    console.log('⚠️  Ya existe un SuperAdmin:', existingSuperAdmin.email);
  } else {
    // Crear usuario SUPERADMIN
    const hashedPassword = await bcrypt.hash('SuperAdmin2026!', 10);
    const superAdmin = await prisma.user.create({
      data: {
        email: 'superadmin@saborytradicion.pe',
        password: hashedPassword,
        name: 'Super Administrator',
        role: 'SUPERADMIN',
        tenantId: null, // SuperAdmin no pertenece a ningún tenant
      },
    });

    console.log('✅ SuperAdmin creado:', superAdmin.email);
    console.log('   Password: SuperAdmin2026!');
  }

  console.log('');
  console.log('✅ Migración completada exitosamente');
  console.log('');
  console.log('📋 Resumen:');
  console.log(`   - Tenant: ${tenant.name} (${tenant.domain})`);
  console.log(`   - Usuarios migrados: ${usersResult}`);
  console.log(`   - Categorías migradas: ${categoriesResult}`);
  console.log(`   - Platos migrados: ${dishesResult}`);
  console.log(`   - Órdenes migradas: ${ordersResult}`);
}

main()
  .catch((error) => {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

