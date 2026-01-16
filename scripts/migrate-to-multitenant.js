"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
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
    const usersResult = await prisma.$executeRaw `
    UPDATE users 
    SET "tenantId" = ${tenant.id}
    WHERE "tenantId" IS NULL
  `;
    console.log(`✅ ${usersResult} usuarios actualizados`);
    // Actualizar categorías existentes usando SQL directo
    const categoriesResult = await prisma.$executeRaw `
    UPDATE categories 
    SET "tenantId" = ${tenant.id}
    WHERE "tenantId" IS NULL
  `;
    console.log(`✅ ${categoriesResult} categorías actualizadas`);
    // Actualizar platos existentes usando SQL directo
    const dishesResult = await prisma.$executeRaw `
    UPDATE dishes 
    SET "tenantId" = ${tenant.id}
    WHERE "tenantId" IS NULL
  `;
    console.log(`✅ ${dishesResult} platos actualizados`);
    // Actualizar órdenes existentes usando SQL directo
    const ordersResult = await prisma.$executeRaw `
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
    }
    else {
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
//# sourceMappingURL=migrate-to-multitenant.js.map