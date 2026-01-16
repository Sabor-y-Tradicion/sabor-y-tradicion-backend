
// Script de prueba para verificar endpoints de subtags
const http = require('http');

const BASE_URL = 'localhost';
const PORT = 5000;

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data ? JSON.parse(data) : null
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testSubtagsEndpoint() {
  console.log('🧪 Probando endpoint de subtags...\n');

  try {
    // Test 1: Verificar que el servidor esté corriendo
    console.log('1️⃣ Verificando que el servidor esté corriendo...');
    const healthCheck = await makeRequest('/health');
    console.log('   ✅ Servidor corriendo:', healthCheck.data);

    // Test 2: Intentar acceder al endpoint de subtags sin autenticación
    console.log('\n2️⃣ Intentando acceder a /api/subtags sin autenticación...');
    try {
      const response = await makeRequest('/api/subtags');
      console.log(`   ℹ️  Status: ${response.status}`);

      if (response.status === 401) {
        console.log('   ✅ Correcto: Requiere autenticación (401)');
        console.log('   ✅ El endpoint de subtags ESTÁ funcionando correctamente!');
      } else if (response.status === 404) {
        console.log('   ❌ ERROR: Endpoint no encontrado (404)');
        console.log('   🔍 El servidor necesita reiniciarse correctamente');
      } else if (response.status === 200) {
        console.log('   ✅ Endpoint responde correctamente (200)');
      } else {
        console.log(`   ⚠️  Respuesta inesperada: ${response.status}`);
      }
    } catch (error) {
      console.log('   ❌ Error de conexión:', error.message);
    }

    console.log('\n📋 Resumen:');
    console.log('   - Si ves 401 o 403: ✅ El endpoint está funcionando, solo necesitas autenticación');
    console.log('   - Si ves 404: ❌ El servidor necesita reiniciarse');
    console.log('\n💡 Para usar el endpoint:');
    console.log('   1. Inicia sesión en el frontend');
    console.log('   2. El token de autenticación se enviará automáticamente');
    console.log('   3. Asegúrate de enviar el header X-Tenant-Domain');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n🔍 Verifica que:');
    console.log('   1. El servidor esté corriendo en http://localhost:5000');
    console.log('   2. No haya errores de compilación');
    console.log('\n💡 Inicia el servidor con: npm run dev');
  }
}

testSubtagsEndpoint();

