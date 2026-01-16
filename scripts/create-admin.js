"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function createSuperAdmin() {
    console.log('👤 Creando usuario SUPERADMIN...\n');
    try {
        // Verificar si ya existe el SUPERADMIN
        const existingUser = await prisma.user.findUnique({
            where: { email: 'superadmin@tuapp.com' }
        });
        if (existingUser) {
            console.log('✅ Usuario SUPERADMIN ya existe');
            console.log('📧 Email: superadmin@tuapp.com');
            console.log('🔑 Password: superadmin123');
            console.log('🌐 Login: /superadmin/login');
            console.log('');
            return;
        }
        // Hash de la contraseña
        const hashedPassword = await bcryptjs_1.default.hash('superadmin123', 10);
        // Crear SUPERADMIN (sin tenant)
        const superadmin = await prisma.user.create({
            data: {
                email: 'superadmin@tuapp.com',
                password: hashedPassword,
                name: 'Super Administrador',
                role: 'SUPERADMIN',
                tenantId: null, // SUPERADMIN no tiene tenant
            },
        });
        console.log('✅ Usuario SUPERADMIN creado exitosamente!');
        console.log('📧 Email: superadmin@tuapp.com');
        console.log('🔑 Password: superadmin123');
        console.log('🌐 Login: /superadmin/login');
        console.log('👤 ID:', superadmin.id);
        console.log('');
        console.log('🎉 Ahora puedes iniciar sesión y crear tenants desde el panel de SUPERADMIN');
    }
    catch (error) {
        console.error('❌ Error al crear SUPERADMIN:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
createSuperAdmin();
//# sourceMappingURL=create-admin.js.map