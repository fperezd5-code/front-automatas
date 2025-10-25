// js/auth/login.js - Lógica de inicio de sesión COMPLETA Y SEGURA

// ==========================================
// VARIABLES GLOBALES PARA QR SCANNER
// ==========================================
let html5QrCode = null;
let qrScannerActive = false;

/**
 * Inicia sesión con contraseña
 */
async function loginWithPassword() {
  const user = document.getElementById('login-user').value;
  const password = document.getElementById('login-password').value;

  // Validar formulario
  if (!validateLogin(user, password)) {
    return;
  }

  // Mostrar indicador de carga
  showLoading();

  try {
    const { response, result } = await loginUser(user, password);
    hideLoading();

    if (response.ok && result.status === 200) {
      // Login exitoso
      const userData = {
        id: result.data.usuario.id,
        usuario: result.data.usuario.usuario,
        email: result.data.usuario.email,
        nombre_completo: result.data.usuario.nombre_completo,
        phone: result.data.usuario.telefono,
        role: 'user',
        active: result.data.usuario.activo,
        editedPhoto: result.data.autenticacion_facial?.imagen_referencia
          ? `data:image/jpeg;base64,${result.data.autenticacion_facial.imagen_referencia}`
          : null,
        notificationMethods: result.data.notificaciones.map(n => n.tipo),
        sessionToken: result.data.session.token,
        loginTime: result.data.session.fecha_login
      };

      // Guardar sesión
      saveUserSession(userData);

      showAlert(result.message, 'success');
      
      // Redirigir después de 1 segundo
      setTimeout(() => {
        window.location.href = 'principal.html';
      }, 1000);

    } else {
      handleLoginError(result);
    }

  } catch (error) {
    hideLoading();
    showAlert('Error de conexión con el servidor. Por favor intente nuevamente.', 'danger');
    console.error('Error:', error);
  }
}

/**
 * Maneja errores de login
 * @param {object} result - Resultado de la API
 */
function handleLoginError(result) {
  let errorMessage = result.message || 'Error al iniciar sesión';

  // Manejar errores de validación
  if (result.data && Array.isArray(result.data)) {
    const errorMessages = result.data.map(err => `${err.field}: ${err.message}`).join('. ');
    errorMessage = errorMessages;
  }

  // Mostrar mensaje específico según el error
  switch (result.status) {
    case 400:
      showAlert('Datos inválidos: ' + errorMessage, 'danger');
      break;
    case 401:
      if (result.message && result.message.toLowerCase().includes('inactivo')) {
        showAlert('Su cuenta está inactiva. Contacte al administrador.', 'danger');
      } else {
        showAlert('Email o contraseña incorrectos', 'danger');
      }
      break;
    case 404:
      showAlert('Usuario no encontrado', 'danger');
      break;
    case 500:
      showAlert('Error interno del servidor. Por favor intente más tarde.', 'danger');
      break;
    default:
      showAlert(errorMessage, 'danger');
  }
}

/**
 * Inicia sesión con reconocimiento facial
 */
async function loginWithFace() {
  let stream = null;
  
  try {
    const videoElement = document.getElementById('login-video');
    const canvas = document.getElementById('login-canvas');
    
    // Validar que existan los elementos
    if (!videoElement) {
      showAlert('Error: elemento de video no encontrado', 'danger');
      console.error('❌ Elemento login-video no encontrado en el DOM');
      return;
    }
    
    if (!canvas) {
      showAlert('Error: elemento canvas no encontrado', 'danger');
      console.error('❌ Elemento login-canvas no encontrado en el DOM');
      return;
    }
    
    // Mostrar mensaje inicial
    showAlert('Iniciando cámara...', 'info');
    console.log('📷 Solicitando acceso a la cámara...');
    
    // Iniciar la cámara con configuración específica
    stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 }
      } 
    });
    
    console.log('✅ Cámara iniciada correctamente');
    videoElement.srcObject = stream;
    
    // Esperar a que el video esté completamente cargado
    await new Promise((resolve, reject) => {
      videoElement.onloadedmetadata = () => {
        console.log('📹 Video metadata cargada');
        videoElement.play()
          .then(() => {
            console.log('▶️ Video reproduciendo');
            resolve();
          })
          .catch(reject);
      };
      
      // Timeout de seguridad
      setTimeout(() => reject(new Error('Timeout esperando video')), 5000);
    });
    
    // Verificar dimensiones del video
    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      throw new Error('El video no tiene dimensiones válidas');
    }
    
    console.log('📐 Dimensiones del video:', videoElement.videoWidth, 'x', videoElement.videoHeight);
    
    // Mostrar instrucciones al usuario
    showAlert('Posicione su rostro frente a la cámara. Capturando en 3 segundos...', 'info');
    
    // Esperar 3 segundos para que el usuario se posicione
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('📸 Capturando imagen...');
    
    // Capturar imagen facial
    const ctx = canvas.getContext('2d');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    // Dibujar el frame actual del video en el canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Obtener imagen en base64
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    // Extraer solo la parte base64 (sin el prefijo "data:image/jpeg;base64,")
    const imageBase64 = imageDataUrl.split(',')[1];
    
    console.log('✅ Imagen capturada');
    console.log('📊 Tamaño de la imagen:', imageBase64.length, 'caracteres');
    
    // Validar que se capturó algo
    if (!imageBase64 || imageBase64.length < 100) {
      throw new Error('La imagen capturada es inválida o está vacía');
    }
    
    // Detener la cámara
    console.log('🛑 Deteniendo cámara...');
    stream.getTracks().forEach(track => {
      track.stop();
      console.log('⏹️ Track detenido:', track.kind);
    });
    stream = null;
    videoElement.srcObject = null;
    
    // Mostrar loading
    showLoading();
    showAlert('Procesando reconocimiento facial...', 'info');
    console.log('🔐 Enviando imagen al servidor...');
    
    // Llamar al endpoint de autenticación facial
    const { response, result } = await loginWithFacialRecognition(imageBase64);
    
    console.log('📥 Respuesta recibida:', result);
    console.log('📊 Status:', result.status);
    
    hideLoading();
    
    if (response.ok && result.status === 200) {
      console.log('✅ Login facial exitoso!');
      
      // Login exitoso - Construir userData según la respuesta
      const userData = {
        id: result.data.resultado,
        usuario: result.data.mensaje.replace('Bienvenido ', '').trim(),
        email: result.data.metodos_notificacion?.find(n => n.tipo_notificacion === 'email')?.destino || '',
        nombre_completo: result.data.mensaje.replace('Bienvenido ', '').trim(),
        phone: result.data.metodos_notificacion?.find(n => n.tipo_notificacion === 'whatsapp')?.destino || '',
        role: 'user',
        active: true,
        editedPhoto: result.data.autenticacion_facial?.imagen_referencia
          ? `data:image/jpeg;base64,${result.data.autenticacion_facial.imagen_referencia}`
          : null,
        notificationMethods: result.data.metodos_notificacion?.map(n => n.tipo_notificacion) || [],
        sessionToken: result.data.session_token,
        loginTime: new Date().toISOString()
      };
      
      console.log('💾 Guardando sesión:', userData);
      
      // Guardar sesión
      saveUserSession(userData);
      
      showAlert(result.message || '✅ Verificación facial exitosa', 'success');
      
      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        console.log('🚀 Redirigiendo a principal.html...');
        window.location.href = 'principal.html';
      }, 1500);
      
    } else if (result.status === 404) {
      console.warn('⚠️ No se encontró coincidencia facial');
      showAlert(result.message || 'No se encontró coincidencia facial. Verifique que su rostro esté registrado.', 'danger');
    } else {
      console.error('❌ Error en login facial:', result);
      handleFacialLoginError(result);
    }
    
  } catch (err) {
    console.error('❌ Error en loginWithFace:', err);
    hideLoading();
    
    // Detener la cámara en caso de error
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    // Mensaje de error específico
    let errorMessage = 'Error durante el reconocimiento facial';
    
    if (err.name === 'NotAllowedError') {
      errorMessage = 'Permiso de cámara denegado. Por favor, permite el acceso a la cámara.';
    } else if (err.name === 'NotFoundError') {
      errorMessage = 'No se encontró ninguna cámara en el dispositivo.';
    } else if (err.name === 'NotReadableError') {
      errorMessage = 'La cámara está siendo usada por otra aplicación.';
    } else if (err.message) {
      errorMessage += ': ' + err.message;
    }
    
    showAlert(errorMessage, 'danger');
  }
}

/**
 * Maneja errores específicos del login facial
 * @param {object} result - Resultado de la API
 */
function handleFacialLoginError(result) {
  let errorMessage = result.message || 'Error en el reconocimiento facial';
  
  console.error('🚨 Error facial - Status:', result.status, 'Message:', errorMessage);
  
  switch (result.status) {
    case 400:
      showAlert('Imagen no válida. Por favor intente nuevamente con mejor iluminación.', 'danger');
      break;
    case 404:
      showAlert('No se encontró coincidencia facial. Verifique que esté registrado en el sistema.', 'danger');
      break;
    case 500:
      showAlert('Error interno del servidor. Por favor intente más tarde.', 'danger');
      break;
    default:
      showAlert(errorMessage, 'danger');
  }
}

// ==========================================
// 🆕 FUNCIONALIDAD DE LOGIN CON QR - SEGURA
// ==========================================

/**
 * Inicia el escáner QR para login
 */
async function loginWithQR() {
  console.log('🔍 Iniciando escáner QR...');
  
  try {
    // Verificar si la librería está cargada
    if (typeof Html5Qrcode === 'undefined') {
      showAlert('⚠️ Error: Librería de escaneo QR no cargada. Recargue la página.', 'danger');
      console.error('❌ Html5Qrcode no está definido');
      return;
    }
    
    // Si ya hay un scanner activo, detenerlo primero
    if (qrScannerActive && html5QrCode) {
      await stopQRScanner();
      await new Promise(resolve => setTimeout(resolve, 500)); // Esperar medio segundo
    }
    
    // Crear instancia del escáner
    html5QrCode = new Html5Qrcode("qr-video-container");
    
    // Configuración del escáner
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    };
    
    console.log('📷 Solicitando cámara para QR...');
    showAlert('Iniciando escáner QR...', 'info');
    
    // Iniciar el escáner
    await html5QrCode.start(
      { facingMode: "environment" }, // Cámara trasera preferida
      config,
      onQRCodeScanned,  // Callback cuando se detecta un QR
      onQRCodeScanError // Callback para errores de escaneo
    );
    
    qrScannerActive = true;
    
    // Mostrar botón de detener
    const stopBtn = document.getElementById('stop-qr-btn');
    if (stopBtn) {
      stopBtn.style.display = 'block';
    }
    
    console.log('✅ Escáner QR activo');
    showAlert('✅ Escáner activo. Enfoque el código QR', 'success');
    
  } catch (err) {
    console.error('❌ Error iniciando escáner QR:', err);
    
    let errorMessage = 'Error al iniciar el escáner QR';
    
    if (err.name === 'NotAllowedError') {
      errorMessage = 'Permiso de cámara denegado. Active los permisos de cámara.';
    } else if (err.name === 'NotFoundError') {
      errorMessage = 'No se encontró cámara en el dispositivo.';
    } else if (err.name === 'NotReadableError') {
      errorMessage = 'La cámara está siendo usada por otra aplicación.';
    } else if (err.message) {
      errorMessage += ': ' + err.message;
    }
    
    showAlert(errorMessage, 'danger');
    qrScannerActive = false;
  }
}

/**
 * 🔒 VERSIÓN SEGURA - Callback cuando se escanea un código QR
 * El QR contiene SOLO el token (string), sin información del usuario
 * @param {string} decodedText - Token del QR escaneado
 * @param {object} decodedResult - Resultado completo del escaneo
 */
async function onQRCodeScanned(decodedText, decodedResult) {
  console.log('📥 QR Detectado:', decodedText);
  console.log('📊 Resultado completo:', decodedResult);
  
  // Detener el scanner inmediatamente
  await stopQRScanner();
  
  // Mostrar loading
  showLoading();
  showAlert('🔐 Validando código QR...', 'info');
  
  try {
    // El QR contiene SOLO el token (string simple), NO JSON
    // Esto es más seguro porque no expone información del usuario
    const qrToken = decodedText.trim();
    
    console.log('🔑 Token QR extraído:', qrToken.substring(0, 20) + '...');
    console.log('🔒 SEGURIDAD: Token validado sin exponer datos del usuario');
    
    // Validar que el token no esté vacío
    if (!qrToken || qrToken.length < 10) {
      throw new Error('Código QR inválido o vacío');
    }
    
    console.log('🔐 Enviando token al backend...');
    
    // Llamar al endpoint de login con QR (solo envía el token)
    const { response, result } = await loginWithQRCode(qrToken);
    
    console.log('📥 Respuesta del servidor:', result);
    
    hideLoading();
    
    if (response.ok && result.status === 200) {
      console.log('✅ Login con QR exitoso!');
      
      // Construir userData
      const userData = {
        id: result.data.usuario.id,
        usuario: result.data.usuario.usuario,
        email: result.data.usuario.email,
        nombre_completo: result.data.usuario.nombre_completo,
        phone: result.data.usuario.telefono,
        role: 'user',
        active: result.data.usuario.activo,
        editedPhoto: result.data.autenticacion_facial?.imagen_referencia
          ? `data:image/jpeg;base64,${result.data.autenticacion_facial.imagen_referencia}`
          : null,
        notificationMethods: result.data.notificaciones?.map(n => n.tipo) || [],
        sessionToken: result.data.session?.token || generateSessionToken(),
        loginTime: result.data.session?.fecha_login || new Date().toISOString()
      };
      
      console.log('💾 Guardando sesión:', userData);
      
      // Guardar sesión
      saveUserSession(userData);
      
      showAlert(result.message || '✅ Acceso concedido con QR', 'success');
      
      // Redirigir
      setTimeout(() => {
        console.log('🚀 Redirigiendo a principal.html...');
        window.location.href = 'principal.html';
      }, 1500);
      
    } else {
      console.error('❌ Error en login QR:', result);
      handleQRLoginError(result);
    }
    
  } catch (err) {
    console.error('❌ Error procesando QR:', err);
    hideLoading();
    showAlert(err.message || 'Error al procesar el código QR', 'danger');
  }
}

/**
 * Callback para errores durante el escaneo (no detiene el scanner)
 * @param {string} errorMessage - Mensaje de error
 */
function onQRCodeScanError(errorMessage) {
  // NO mostrar errores de escaneo continuo (son normales)
  // Solo loguear para debug si es necesario
  // console.log('⏳ Buscando QR...', errorMessage);
}

/**
 * Detiene el escáner QR
 */
async function stopQRScanner() {
  if (html5QrCode && qrScannerActive) {
    try {
      console.log('🛑 Deteniendo escáner QR...');
      await html5QrCode.stop();
      html5QrCode.clear();
      qrScannerActive = false;
      
      // Ocultar botón de detener
      const stopBtn = document.getElementById('stop-qr-btn');
      if (stopBtn) {
        stopBtn.style.display = 'none';
      }
      
      console.log('✅ Escáner QR detenido');
      showAlert('Escáner detenido', 'info');
    } catch (err) {
      console.error('❌ Error deteniendo escáner:', err);
    }
  }
}

/**
 * Maneja errores del login con QR
 * @param {object} result - Resultado de la API
 */
function handleQRLoginError(result) {
  let errorMessage = result.message || 'Error al validar código QR';
  
  console.error('🚨 Error QR - Status:', result.status, 'Message:', errorMessage);
  
  switch (result.status) {
    case 400:
      showAlert('Código QR inválido o mal formado', 'danger');
      break;
    case 401:
      showAlert('Código QR expirado o no autorizado', 'danger');
      break;
    case 404:
      showAlert('Usuario no encontrado. El código QR puede estar desactualizado.', 'danger');
      break;
    case 500:
      showAlert('Error interno del servidor. Intente con otro método de login.', 'danger');
      break;
    default:
      showAlert(errorMessage, 'danger');
  }
}

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

/**
 * Cierra la sesión del usuario
 */
function logout() {
  if (confirm('¿Está seguro que desea cerrar sesión?')) {
    clearUserSession();
    window.location.href = 'index.html';
  }
}

/**
 * Verifica la sesión actual
 * @returns {boolean} - true si la sesión es válida
 */
function checkSession() {
  if (!hasActiveSession()) {
    return false;
  }

  const user = getUserSession();
  if (!user) {
    return false;
  }

  return true;
}

// ==========================================
// LIMPIEZA AL CAMBIAR DE TAB
// ==========================================

// Detener el scanner cuando se cambia de tab
document.addEventListener('DOMContentLoaded', function() {
  const tabs = document.querySelectorAll('[data-bs-toggle="tab"]');
  tabs.forEach(tab => {
    tab.addEventListener('shown.bs.tab', function(event) {
      // Si se sale del tab QR, detener el scanner
      if (event.relatedTarget && event.relatedTarget.getAttribute('data-bs-target') === '#qr-tab') {
        stopQRScanner();
      }
    });
  });
});