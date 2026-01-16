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
/**
 * Script para instalación NUEVA de sistema multitenant
 * Solo crea el SUPERADMIN, sin tenants ni datos
 *
 * Usar este script para instalaciones desde cero
 */
async function main() {
    console.log('🚀 Iniciando instalación limpia del sistema multitenant...\n');
    // 1. Verificar que NO hay tenants
    const existingTenants = await prisma.tenant.count();
    if (existingTenants > 0) {
        console.log('⚠️  Ya existen tenants en el sistema.');
        console.log('   Este script es solo para instalaciones nuevas.');
        console.log('   Usa "npm run migrate:multitenant" para migrar datos existentes.');
        process.exit(1);
    }
    // 2. Verificar si ya existe un superadmin
    const existingSuperAdmin = await prisma.user.findFirst({
        where: { role: 'SUPERADMIN' },
    });
    if (existingSuperAdmin) {
        console.log('✅ Ya existe un SuperAdmin en el sistema');
        console.log(`   Email: ${existingSuperAdmin.email}`);
        console.log(`   Nombre: ${existingSuperAdmin.name}`);
        console.log('');
        console.log('ℹ️  El sistema está listo para usar.');
        console.log('   El SuperAdmin puede crear tenants desde el panel de administración.');
        return;
    }
    // 3. Crear usuario SUPERADMIN
    console.log('Creando usuario SUPERADMIN...');
    const hashedPassword = await bcrypt.hash('superadmin123', 10);
    const superAdmin = await prisma.user.create({
        data: {
            email: 'superadmin@tuapp.com',
            password: hashedPassword,
            name: 'Super Administrator',
            role: 'SUPERADMIN',
            tenantId: null, // SuperAdmin no pertenece a ningún tenant
        },
    });
    console.log('');
    console.log('═'.repeat(60));
    console.log('✅ Sistema multitenant instalado exitosamente');
    console.log('═'.repeat(60));
    console.log('');
    console.log('🔐 Credenciales SUPERADMIN:');
    console.log('   Email:    superadmin@tuapp.com');
    console.log('   Password: superadmin123');
    console.log('');
    console.log('⚠️  IMPORTANTE: Cambiar la contraseña después del primer login');
    console.log('');
    console.log('📊 Estado del sistema:');
    console.log('   ✅ SUPERADMIN creado');
    console.log('   ❌ Sin tenants (se crean desde el panel SuperAdmin)');
    console.log('   ❌ Sin usuarios ADMIN');
    console.log('   ❌ Sin usuarios ORDERS_MANAGER');
    console.log('   ❌ Sin datos de restaurantes');
    console.log('');
    console.log('🚀 Próximos pasos:');
    console.log('   1. Iniciar servidor: npm run dev');
    console.log('   2. Login como SuperAdmin');
    console.log('   3. Crear primer tenant desde /superadmin/tenants');
    console.log('   4. Al crear tenant se generará su usuario ADMIN');
    console.log('');
    console.log('📚 Documentación:');
    console.log('   - Ver implementar.md para flujo completo');
    console.log('   - Ver MULTITENANT.md para uso de endpoints');
    console.log('');
}
main()
    .catch((error) => {
    console.error('');
    console.error('❌ Error en la instalación:', error);
    console.error('');
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=install-fresh.js.map