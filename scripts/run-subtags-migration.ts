import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runMigration() {
  console.log('🔧 Ejecutando migración manual de subtags...\n');

  try {
    // 1. Crear tabla subtags
    console.log('1️⃣ Creando tabla subtags...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "subtags" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "tenantId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "subtags_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('   ✅ Tabla subtags creada');

    // 2. Crear índices
    console.log('2️⃣ Creando índices...');
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "subtags_name_tenantId_key" ON "subtags"("name", "tenantId");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "subtags_tenantId_idx" ON "subtags"("tenantId");
    `);
    console.log('   ✅ Índices creados');

    // 3. Agregar foreign key
    console.log('3️⃣ Agregando foreign key...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "subtags" DROP CONSTRAINT IF EXISTS "subtags_tenantId_fkey";
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "subtags" ADD CONSTRAINT "subtags_tenantId_fkey" 
          FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);
    console.log('   ✅ Foreign key agregada');

    // 4. Verificar si el campo subtagIds existe en dishes
    console.log('4️⃣ Verificando campo subtagIds en dishes...');
    const columnExists = await prisma.$queryRawUnsafe<any[]>(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'dishes' AND column_name = 'subtagIds'
    `);

    if (columnExists.length === 0) {
      console.log('   Campo no existe, agregándolo...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "dishes" ADD COLUMN "subtagIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
      `);
      console.log('   ✅ Campo subtagIds agregado a dishes');
    } else {
      console.log('   ✅ Campo subtagIds ya existe en dishes');
    }

    // 5. Verificar la estructura
    console.log('\n5️⃣ Verificando estructura final...');
    const tables = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
          table_name, 
          column_name, 
          data_type,
          is_nullable
      FROM information_schema.columns 
      WHERE table_name IN ('subtags', 'dishes') 
        AND (table_name = 'subtags' OR column_name IN ('subtagIds', 'name', 'id'))
      ORDER BY table_name, ordinal_position;
    `);

    console.log('\n📊 Estructura de tablas:');
    tables.forEach(col => {
      console.log(`   ${col.table_name}.${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    console.log('\n✨ Migración completada exitosamente!');
    console.log('\n📌 Próximo paso: Reinicia el servidor con npm run dev');

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();

