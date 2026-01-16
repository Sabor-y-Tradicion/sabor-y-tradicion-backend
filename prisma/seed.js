"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('ℹ️  Seed deshabilitado');
    console.log('   Los datos se crean manualmente desde el panel de SUPERADMIN');
    console.log('');
    console.log('💡 Para crear el SUPERADMIN inicial, ejecuta:');
    console.log('   npm run create:admin');
    console.log('   o ejecuta: npx tsx scripts/create-superadmin.ts');
}
main()
    .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map