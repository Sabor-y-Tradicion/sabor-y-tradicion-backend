"use strict";
/**
 * Script de pre-deploy para verificar que todo está listo para producción
 */
console.log('🔍 Verificando configuración para producción...\n');
const checks = {
    passed: [],
    warnings: [],
    errors: []
};
// 1. Verificar que existe .env
try {
    require('dotenv').config();
    if (process.env.DATABASE_URL) {
        checks.passed.push('✅ DATABASE_URL configurada');
    }
    else {
        checks.errors.push('❌ DATABASE_URL no está configurada en .env');
    }
}
catch (error) {
    checks.errors.push('❌ No se pudo cargar .env');
}
// 2. Verificar JWT_SECRET
if (process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length >= 32) {
        checks.passed.push('✅ JWT_SECRET configurada correctamente');
    }
    else {
        checks.warnings.push('⚠️  JWT_SECRET es muy corta (mínimo 32 caracteres)');
    }
}
else {
    checks.errors.push('❌ JWT_SECRET no está configurada');
}
// 3. Verificar CLOUDINARY
if (process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET) {
    checks.passed.push('✅ Cloudinary configurado');
}
else {
    checks.warnings.push('⚠️  Cloudinary no está completamente configurado');
}
// 4. Verificar PORT
if (process.env.PORT) {
    checks.passed.push(`✅ Puerto configurado: ${process.env.PORT}`);
}
else {
    checks.warnings.push('⚠️  PORT no configurado (usará 5000 por defecto)');
}
// 5. Verificar NODE_ENV
if (process.env.NODE_ENV === 'production') {
    checks.passed.push('✅ NODE_ENV está en producción');
}
else {
    checks.warnings.push(`⚠️  NODE_ENV: ${process.env.NODE_ENV || 'no definido'} (debería ser "production")`);
}
// 6. Verificar que el seed está deshabilitado
const fs = require('fs');
const seedContent = fs.readFileSync('./prisma/seed.ts', 'utf-8');
if (seedContent.includes('Seed deshabilitado')) {
    checks.passed.push('✅ Seed deshabilitado correctamente');
}
else {
    checks.warnings.push('⚠️  Verifica que el seed no cree datos no deseados');
}
// 7. Verificar migraciones
const migrationsDir = './prisma/migrations';
if (fs.existsSync(migrationsDir)) {
    const migrations = fs.readdirSync(migrationsDir).filter((f) => !f.includes('migration_lock.toml'));
    checks.passed.push(`✅ ${migrations.length} migraciones encontradas`);
}
else {
    checks.errors.push('❌ No se encontró el directorio de migraciones');
}
// Mostrar resultados
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 RESULTADOS DE LA VERIFICACIÓN');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
if (checks.passed.length > 0) {
    console.log('✅ VERIFICACIONES EXITOSAS:\n');
    checks.passed.forEach(check => console.log(`   ${check}`));
    console.log('');
}
if (checks.warnings.length > 0) {
    console.log('⚠️  ADVERTENCIAS:\n');
    checks.warnings.forEach(warning => console.log(`   ${warning}`));
    console.log('');
}
if (checks.errors.length > 0) {
    console.log('❌ ERRORES CRÍTICOS:\n');
    checks.errors.forEach(error => console.log(`   ${error}`));
    console.log('');
}
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if (checks.errors.length > 0) {
    console.log('\n❌ HAY ERRORES CRÍTICOS. NO DESPLEGAR A PRODUCCIÓN.\n');
    process.exit(1);
}
else if (checks.warnings.length > 0) {
    console.log('\n⚠️  Hay advertencias. Revisa antes de desplegar.\n');
    process.exit(0);
}
else {
    console.log('\n✅ TODO LISTO PARA PRODUCCIÓN!\n');
    console.log('💡 Comandos útiles:');
    console.log('   - Para aplicar migraciones: npm run prisma:migrate:prod');
    console.log('   - Para iniciar: npm start');
    console.log('');
    process.exit(0);
}
//# sourceMappingURL=check-production.js.map