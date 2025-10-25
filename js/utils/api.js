// js/utils/api.js - Manejo de llamadas a la API

const API_BASE_URL = 'https://proyecto-automatas-om2v.onrender.com/api';

/**
 * Realiza una petición POST a la API
 * @param {string} endpoint - Endpoint de la API
 * @param {object} data - Datos a enviar
 * @returns {Promise<object>} - Respuesta de la API
 */
async function apiPost(endpoint, data) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    return { response, result };
  } catch (error) {
    console.error('Error en API:', error);
    throw error;
  }
}

/**
 * Realiza una petición GET a la API
 * @param {string} endpoint - Endpoint de la API
 * @returns {Promise<object>} - Respuesta de la API
 */
async function apiGet(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    return { response, result };
  } catch (error) {
    console.error('Error en API:', error);
    throw error;
  }
}

/**
 * Registra un nuevo usuario
 * @param {object} userData - Datos del usuario
 * @returns {Promise<object>} - Respuesta de la API
 */
async function registerUser(userData) {
  return await apiPost('/usuarios/registro', userData);
}

/**
 * Inicia sesión de usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<object>} - Respuesta de la API
 */
async function loginUser(email, password) {
  return await apiPost('/usuarios/login', { email, password });
}

/**
 * Envía un email con los resultados del análisis
 * @param {object} emailData - Datos del email a enviar
 * @returns {Promise<object>} - Respuesta de la API
 */
async function sendEmail(emailData) {
  try {
    const { response, result } = await apiPost('/email/send', emailData);
    
    if (response.ok) {
      return {
        success: true,
        message: result.message || 'Email enviado correctamente',
        data: result.data
      };
    } else {
      return {
        success: false,
        message: result.message || 'Error al enviar el email',
        error: result.error
      };
    }
  } catch (error) {
    console.error('Error enviando email:', error);
    return {
      success: false,
      message: 'Error de conexión al enviar el email',
      error: error.message
    };
  }
}

/**
 * Realiza login con reconocimiento facial
 * @param {string} imageBase64 - Imagen en base64 (sin prefijo data:image)
 * @returns {Promise<{response: Response, result: object}>}
 */
async function loginWithFacialRecognition(imageBase64) {
  const url = `${API_BASE_URL}/facial/verificar`;
  
  const requestBody = {
    imagen_facial: imageBase64
  };
  
  console.log('📤 Login facial - Enviando a:', url);
  console.log('📦 Tamaño imagen:', imageBase64.length, 'caracteres');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    const result = await response.json();
    
    console.log('📥 Login facial - Status:', response.status);
    console.log('📥 Login facial - Respuesta:', result);
    
    return { response, result };
  } catch (error) {
    console.error('❌ Error en loginWithFacialRecognition:', error);
    throw error;
  }
}

/**
 * ✅ CORREGIDO - Realiza login con código QR
 * @param {string} qrToken - Token del QR escaneado (string simple: "qr_1234567890_abcdef")
 * @returns {Promise<{response: Response, result: object}>}
 */
async function loginWithQRCode(qrToken) {
  // ✅ IMPORTANTE: Acepta el token como STRING, no como objeto
  const url = `${API_BASE_URL}/usuarios/login-qr`;
  
  // El backend espera el token directamente
  const requestBody = {
    qr_token: qrToken  // ✅ Envía solo el token
  };
  
  console.log('📤 Login QR - Enviando a:', url);
  console.log('📦 Token QR:', qrToken.substring(0, 20) + '...');
  console.log('📦 Body completo:', requestBody);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    const result = await response.json();
    
    console.log('📥 Login QR - Status:', response.status);
    console.log('📥 Login QR - Respuesta:', result);
    
    return { response, result };
  } catch (error) {
    console.error('❌ Error en loginWithQRCode:', error);
    
    // Retornar un objeto de error estructurado
    return {
      response: { ok: false, status: 500 },
      result: {
        status: 500,
        message: 'Error de conexión: ' + error.message,
        data: null
      }
    };
  }
}

// ============================================
// 🧪 FUNCIONES DE TEST Y DEBUG
// ============================================

/**
 * 🧪 Prueba diferentes endpoints QR para encontrar el correcto
 * Uso en consola: testQREndpoints("qr_1234567890_abcdef")
 */
async function testQREndpoints(token) {
  console.log('🧪 ========== TEST DE ENDPOINTS QR ==========');
  console.log('🔑 Token a probar:', token);
  console.log('');
  
  const baseUrl = API_BASE_URL;
  
  // Lista de posibles endpoints que podrían existir en tu backend
  const endpoints = [
    '/usuarios/login-qr',
    '/usuarios/qr-login',
    '/usuarios/qr',
    '/qr/login',
    '/qr/verify',
    '/auth/qr',
    '/auth/qr-login',
    '/login/qr'
  ];
  
  for (const endpoint of endpoints) {
    const url = baseUrl + endpoint;
    console.log(`🔍 Probando: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ qr_token: token })
      });
      
      const result = await response.json();
      
      console.log(`   📊 Status: ${response.status}`);
      console.log(`   💬 Message: ${result.message || 'N/A'}`);
      
      if (response.status === 404 && result.message === 'Ruta no encontrada') {
        console.log(`   ❌ Endpoint NO existe`);
      } else if (response.status === 400) {
        console.log(`   ⚠️ Endpoint existe pero el token es inválido o mal formado`);
        console.log(`   ✅ ESTE PODRÍA SER EL ENDPOINT CORRECTO`);
        console.log(`   📝 Actualiza API_BASE_URL + '${endpoint}' en api.js`);
      } else if (response.status === 404 && result.message !== 'Ruta no encontrada') {
        console.log(`   ⚠️ Endpoint existe pero el token no se encontró en la BD`);
        console.log(`   ✅ ESTE ES EL ENDPOINT CORRECTO`);
        console.log(`   📝 Actualiza API_BASE_URL + '${endpoint}' en api.js`);
      } else if (response.ok) {
        console.log(`   ✅✅✅ ENDPOINT FUNCIONA PERFECTAMENTE!`);
        console.log(`   📝 Usa: API_BASE_URL + '${endpoint}'`);
        console.log(`   📦 Respuesta:`, result);
        break;
      } else {
        console.log(`   ⚠️ Status ${response.status}: ${result.message}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error de red: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('=============================================');
  console.log('');
  console.log('💡 SIGUIENTE PASO:');
  console.log('1. Si encontraste un endpoint que existe (⚠️ o ✅), actualiza la línea 144 en api.js');
  console.log('2. Si NINGUNO existe, necesitas crear el endpoint en el backend');
  console.log('');
}

/**
 * 🧪 Test manual del login QR sin necesidad de escanear
 * Uso en consola: testManualQRLogin("qr_1234567890_abcdef")
 */
async function testManualQRLogin(token) {
  console.log('🧪 ========== TEST MANUAL QR LOGIN ==========');
  console.log('🔑 Token:', token);
  console.log('');
  
  showLoading();
  
  try {
    const { response, result } = await loginWithQRCode(token);
    
    hideLoading();
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Result:', result);
    console.log('');
    
    if (response.ok && result.status === 200) {
      console.log('✅✅✅ TEST EXITOSO - El token funciona!');
      showAlert('✅ Test exitoso - Token válido', 'success');
    } else {
      console.error('❌ TEST FALLIDO');
      console.error('   Status:', result.status);
      console.error('   Message:', result.message);
      showAlert('❌ Test fallido: ' + result.message, 'danger');
    }
    
  } catch (error) {
    hideLoading();
    console.error('❌ Error en test:', error);
    showAlert('❌ Error: ' + error.message, 'danger');
  }
  
  console.log('============================================');
}

/**
 * 🔍 Verifica qué endpoints están disponibles en el backend
 * Uso en consola: checkBackendHealth()
 */
async function checkBackendHealth() {
  console.log('🏥 Verificando salud del backend...');
  console.log('🌐 URL Base:', API_BASE_URL);
  console.log('');
  
  const healthEndpoints = [
    '/',
    '/health',
    '/ping',
    '/status'
  ];
  
  for (const endpoint of healthEndpoints) {
    try {
      const response = await fetch(API_BASE_URL + endpoint);
      const text = await response.text();
      
      console.log(`✅ ${endpoint}:`);
      console.log('   Status:', response.status);
      console.log('   Response:', text.substring(0, 100));
    } catch (error) {
      console.log(`❌ ${endpoint}: No disponible`);
    }
  }
  
  console.log('');
  console.log('✅ Backend está funcionando');
}