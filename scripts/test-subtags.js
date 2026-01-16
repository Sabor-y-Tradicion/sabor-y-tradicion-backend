"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function testSubtags() {
    console.log('🧪 Iniciando prueba del módulo de Subtags...\n');
    try {
        // 1. Obtener un tenant de ejemplo
        const tenant = await prisma.tenant.findFirst({
            where: { status: 'active' }
        });
        if (!tenant) {
            console.log('❌ No hay tenants activos. Crea un tenant primero.');
            return;
        }
        console.log(`✅ Usando tenant: ${tenant.name} (${tenant.id})\n`);
        // 2. Crear algunos subtags de ejemplo
        const subtagsToCreate = ['Vegetariano', 'Picante', 'Sin Gluten', 'Vegano', 'Orgánico'];
        console.log('📝 Creando subtags de ejemplo...');
        for (const name of subtagsToCreate) {
            try {
                const subtag = await prisma.subtag.create({
                    data: {
                        name,
                        tenantId: tenant.id
                    }
                });
                console.log(`   ✓ ${subtag.name} (${subtag.id})`);
            }
            catch (error) {
                if (error.code === 'P2002') {
                    console.log(`   - ${name} ya existe (omitido)`);
                }
                else {
                    throw error;
                }
            }
        }
        // 3. Listar todos los subtags
        const allSubtags = await prisma.subtag.findMany({
            where: { tenantId: tenant.id },
            orderBy: { name: 'asc' }
        });
        console.log(`\n📋 Total de subtags: ${allSubtags.length}`);
        allSubtags.forEach(st => {
            console.log(`   - ${st.name} (ID: ${st.id})`);
        });
        // 4. Verificar que el campo subtagIds existe en Dish
        console.log('\n🍽️  Verificando integración con Dishes...');
        const dishes = await prisma.dish.findMany({
            where: { tenantId: tenant.id },
            take: 3
        });
        console.log(`   Platos encontrados: ${dishes.length}`);
        dishes.forEach(dish => {
            console.log(`   - ${dish.name}`);
            console.log(`     subtagIds: ${dish.subtagIds.length > 0 ? dish.subtagIds.join(', ') : 'ninguno'}`);
        });
        console.log('\n✨ Prueba completada exitosamente!');
        console.log('\n📌 Endpoints disponibles:');
        console.log('   GET    /api/subtags');
        console.log('   GET    /api/subtags/:id');
        console.log('   POST   /api/subtags');
        console.log('   PATCH  /api/subtags/:id');
        console.log('   DELETE /api/subtags/:id');
        console.log('\n💡 Usa Postman o Thunder Client para probar los endpoints');
    }
    catch (error) {
        console.error('\n❌ Error durante la prueba:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
testSubtags();
//# sourceMappingURL=test-subtags.js.map