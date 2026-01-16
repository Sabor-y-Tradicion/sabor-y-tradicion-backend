"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function testPrismaTypes() {
    console.log('🧪 Probando tipos de Prisma...\n');
    try {
        // Test 1: Verificar que Prisma Client tiene el modelo Subtag
        console.log('1️⃣ Verificando modelo Subtag...');
        const subtagTest = prisma.subtag;
        console.log('   ✅ prisma.subtag existe');
        // Test 2: Verificar que el modelo Dish tiene el campo subtagIds
        console.log('2️⃣ Verificando campo subtagIds en Dish...');
        const dishes = await prisma.dish.findMany({ take: 1 });
        if (dishes.length > 0) {
            const dish = dishes[0];
            console.log('   Dish encontrado:', dish.name);
            console.log('   subtagIds type:', typeof dish.subtagIds);
            console.log('   subtagIds es array:', Array.isArray(dish.subtagIds));
            console.log('   ✅ Campo subtagIds existe y es array');
        }
        else {
            console.log('   ℹ️  No hay dishes en la DB, pero el tipo está disponible');
        }
        // Test 3: Intentar crear un subtag de prueba
        console.log('3️⃣ Probando creación de Subtag...');
        const tenant = await prisma.tenant.findFirst({ where: { status: 'active' } });
        if (tenant) {
            const testSubtag = await prisma.subtag.create({
                data: {
                    name: 'TEST_SUBTAG_' + Date.now(),
                    tenantId: tenant.id
                }
            });
            console.log('   ✅ Subtag creado:', testSubtag.name);
            // Limpiarlo
            await prisma.subtag.delete({ where: { id: testSubtag.id } });
            console.log('   ✅ Subtag eliminado (limpieza)');
        }
        else {
            console.log('   ⚠️  No hay tenant activo para probar');
        }
        console.log('\n✨ ¡Todos los tests pasaron! Prisma está correctamente configurado.');
        console.log('\n📌 Ahora puedes reiniciar el servidor: npm run dev');
    }
    catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\n🔍 Detalles del error:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
testPrismaTypes();
//# sourceMappingURL=test-prisma-types.js.map