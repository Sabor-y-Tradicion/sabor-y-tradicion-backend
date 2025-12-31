#!/usr/bin/env node

/**
 * Script de verificación pre-deploy
 * Ejecuta varias comprobaciones antes de desplegar a producción
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando proyecto antes del deploy...\n');

let errors = [];
let warnings = [];

// 1. Verificar que existe .env.example
console.log('📄 Verificando .env.example...');
if (!fs.existsSync('.env.example')) {
  errors.push('.env.example no existe');
} else {
  console.log('✅ .env.example existe\n');
}

// 2. Verificar que .env NO está en git
console.log('🔐 Verificando .gitignore...');
const gitignore = fs.readFileSync('.gitignore', 'utf8');
if (!gitignore.includes('.env')) {
  errors.push('.env debe estar en .gitignore');
} else {
  console.log('✅ .env está en .gitignore\n');
}

// 3. Verificar que TypeScript compila
console.log('🔨 Compilando TypeScript...');
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ TypeScript compilado exitosamente\n');
} catch (error) {
  errors.push('Error al compilar TypeScript');
  console.log('❌ Error al compilar TypeScript\n');
}

// 4. Verificar que dist/ existe después del build
console.log('📦 Verificando carpeta dist/...');
if (!fs.existsSync('dist')) {
  errors.push('Carpeta dist/ no existe después del build');
} else {
  console.log('✅ Carpeta dist/ existe\n');
}

// 5. Verificar que package.json tiene los scripts necesarios
console.log('📜 Verificando scripts en package.json...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = ['dev', 'build', 'start', 'postinstall', 'prisma:migrate:deploy'];
const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);

if (missingScripts.length > 0) {
  warnings.push(`Scripts faltantes: ${missingScripts.join(', ')}`);
  console.log(`⚠️  Scripts faltantes: ${missingScripts.join(', ')}\n`);
} else {
  console.log('✅ Todos los scripts necesarios están presentes\n');
}

// 6. Verificar que no hay console.log en producción (warning)
console.log('🔍 Buscando console.log en el código...');
try {
  const result = execSync('grep -r "console.log" src/ --exclude-dir=node_modules || true', {
    encoding: 'utf8',
    shell: '/bin/bash'
  }).trim();

  if (result) {
    warnings.push('Se encontraron console.log en el código');
    console.log('⚠️  Se encontraron console.log en el código\n');
  } else {
    console.log('✅ No hay console.log en el código\n');
  }
} catch (error) {
  // En Windows, grep podría no estar disponible
  console.log('⚠️  No se pudo verificar console.log (requiere grep)\n');
}

// 7. Verificar que prisma está configurado
console.log('🗄️  Verificando Prisma...');
if (!fs.existsSync('prisma/schema.prisma')) {
  errors.push('prisma/schema.prisma no existe');
} else {
  console.log('✅ Prisma schema existe\n');
}

// 8. Verificar que existen migraciones
console.log('🔄 Verificando migraciones...');
if (!fs.existsSync('prisma/migrations')) {
  warnings.push('No se encontraron migraciones en prisma/migrations');
  console.log('⚠️  No se encontraron migraciones\n');
} else {
  const migrations = fs.readdirSync('prisma/migrations').filter(f => f !== 'migration_lock.toml');
  console.log(`✅ ${migrations.length} migraciones encontradas\n`);
}

// Resumen
console.log('\n' + '='.repeat(50));
console.log('📊 RESUMEN DE VERIFICACIÓN');
console.log('='.repeat(50) + '\n');

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ ¡Todo está listo para el deploy!\n');
  console.log('Próximos pasos:');
  console.log('1. git add .');
  console.log('2. git commit -m "Ready for deploy"');
  console.log('3. git push origin main');
  console.log('4. Sigue las instrucciones en DEPLOY_RAILWAY.md\n');
  process.exit(0);
}

if (errors.length > 0) {
  console.log('❌ ERRORES CRÍTICOS:\n');
  errors.forEach(error => console.log(`   - ${error}`));
  console.log('\n⚠️  Debes corregir estos errores antes de desplegar.\n');
}

if (warnings.length > 0) {
  console.log('⚠️  ADVERTENCIAS:\n');
  warnings.forEach(warning => console.log(`   - ${warning}`));
  console.log('\n💡 Estas advertencias no bloquean el deploy, pero deberías revisarlas.\n');
}

if (errors.length > 0) {
  process.exit(1);
}

process.exit(0);

