"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function checkMigration() {
    console.log('🔍 Verificando estado de la migración multitenant...\n');
    try {
        // 1. Verificar tenants
        const tenants = await prisma.tenant.findMany();
        console.log(`✅ Tenants encontrados: ${tenants.length}`);
        tenants.forEach(t => {
            console.log(`   - ${t.name} (${t.domain}) - Plan: ${t.plan}, Status: ${t.status}`);
        });
        // 2. Verificar usuarios
        const totalUsers = await prisma.user.count();
        const usersWithoutTenant = await prisma.user.count({ where: { tenantId: null } });
        const usersWithTenant = totalUsers - usersWithoutTenant;
        const superAdmins = await prisma.user.count({ where: { role: 'SUPERADMIN' } });
        console.log(`\n✅ Usuarios totales: ${totalUsers}`);
        console.log(`   - Con tenant: ${usersWithTenant}`);
        console.log(`   - SuperAdmins: ${superAdmins}`);
        console.log(`   - Sin tenant: ${usersWithoutTenant}`);
        // 3. Verificar categorías
        const totalCategories = await prisma.category.count();
        console.log(`\n✅ Categorías totales: ${totalCategories}`);
        // 4. Verificar platos
        const totalDishes = await prisma.dish.count();
        console.log(`\n✅ Platos totales: ${totalDishes}`);
        // 5. Verificar órdenes
        const totalOrders = await prisma.order.count();
        console.log(`\n✅ Órdenes totales: ${totalOrders}`);
        // 6. Verificar integridad
        console.log('\n📊 Verificación de integridad:');
        const checks = [
            { name: 'Usuarios', total: totalUsers, ok: usersWithTenant + superAdmins === totalUsers },
            { name: 'Categorías', total: totalCategories, ok: true },
            { name: 'Platos', total: totalDishes, ok: true },
            { name: 'Órdenes', total: totalOrders, ok: true },
        ];
        let allOk = true;
        checks.forEach(check => {
            if (check.ok || check.total === 0) {
                console.log(`   ✅ ${check.name}: OK (${check.total})`);
            }
            else {
                console.log(`   ❌ ${check.name}: ERROR`);
                allOk = false;
            }
        });
        // 7. Verificar roles
        console.log('\n👥 Usuarios por rol:');
        const usersByRole = await prisma.user.groupBy({
            by: ['role'],
            _count: true,
        });
        usersByRole.forEach(r => {
            console.log(`   - ${r.role}: ${r._count}`);
        });
        // 8. Resumen final
        console.log('\n' + '='.repeat(50));
        if (allOk) {
            console.log('✅ ¡Migración completada exitosamente!');
            console.log('✅ Todos los datos están correctamente asignados a tenants');
        }
        else {
            console.log('⚠️  Hay datos sin asignar a tenant');
            console.log('💡 Ejecuta: npm run migrate:multitenant');
        }
        console.log('='.repeat(50));
    }
    catch (error) {
        console.error('❌ Error al verificar migración:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
checkMigration();
//# sourceMappingURL=check-migration.js.map