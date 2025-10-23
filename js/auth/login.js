// js/auth/login.js - Lógica de inicio de sesión

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
  try {
    // Iniciar la cámara
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'user' } 
    });
    const videoElement = document.getElementById('login-video');
    
    if (!videoElement) {
      showAlert('Error: elemento de video no encontrado', 'danger');
      return;
    }
    
    videoElement.srcObject = stream;
    
    // Mostrar instrucciones
    showAlert('Posicione su rostro frente a la cámara', 'info');
    
    // Esperar 2 segundos antes de capturar
    setTimeout(async () => {
      try {
        // Capturar imagen facial
        const canvas = document.getElementById('login-canvas');
        if (!canvas) {
          showAlert('Error: elemento canvas no encontrado', 'danger');
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        const ctx = canvas.getContext('2d');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        ctx.drawImage(videoElement, 0, 0);
        
        // Obtener imagen en base64 (sin el prefijo data:image/jpeg;base64,)
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const imageBase64 = imageDataUrl.split(',')[1];
        
        // Detener la cámara
        stream.getTracks().forEach(track => track.stop());
        
        // Mostrar loading
        showLoading();
        showAlert('Procesando reconocimiento facial...', 'info');
        
        // Llamar al endpoint de autenticación facial
        const { response, result } = await loginWithFacialRecognition(imageBase64);
        hideLoading();
        
        if (response.ok && result.status === 200) {
          // Login exitoso
          const userData = {
            id: result.data.resultado,
            usuario: result.data.mensaje.replace('Bienvenido ', '').trim(),
            email: result.data.metodos_notificacion.find(n => n.tipo_notificacion === 'email')?.destino || '',
            nombre_completo: result.data.mensaje.replace('Bienvenido ', '').trim(),
            phone: result.data.metodos_notificacion.find(n => n.tipo_notificacion === 'whatsapp')?.destino || '',
            role: 'user',
            active: true,
            editedPhoto: result.data.autenticacion_facial?.imagen_referencia
              ? `data:image/jpeg;base64,${result.data.autenticacion_facial.imagen_referencia}`
              : null,
            notificationMethods: result.data.metodos_notificacion.map(n => n.tipo_notificacion),
            sessionToken: result.data.session_token,
            loginTime: new Date().toISOString()
          };
          
          // Guardar sesión
          saveUserSession(userData);
          
          showAlert(result.message || 'Verificación facial exitosa', 'success');
          
          // Redirigir después de 1 segundo
          setTimeout(() => {
            window.location.href = 'principal.html';
          }, 1000);
          
        } else if (result.status === 404) {
          // No se encontró coincidencia facial
          showAlert(result.message || 'No se encontró coincidencia facial. Verifique que su rostro esté registrado.', 'danger');
        } else {
          handleFacialLoginError(result);
        }
        
      } catch (error) {
        hideLoading();
        stream.getTracks().forEach(track => track.stop());
        showAlert('Error durante el procesamiento facial: ' + error.message, 'danger');
        console.error('Error:', error);
      }
    }, 2000);
    
  } catch (err) {
    showAlert('Error accediendo a la cámara: ' + err.message, 'danger');
    console.error('Error de cámara:', err);
  }
}

/**
 * Maneja errores específicos del login facial
 * @param {object} result - Resultado de la API
 */
function handleFacialLoginError(result) {
  let errorMessage = result.message || 'Error en el reconocimiento facial';
  
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

/**
 * Maneja errores específicos del login facial
 * @param {object} result - Resultado de la API
 */
function handleFacialLoginError(result) {
  let errorMessage = result.message || 'Error en el reconocimiento facial';
  
  switch (result.status) {
    case 400:
      showAlert('Imagen no válida. Por favor intente nuevamente.', 'danger');
      break;
    case 404:
      showAlert('No se encontró coincidencia facial. Verifique que esté registrado.', 'danger');
      break;
    case 500:
      showAlert('Error interno del servidor. Por favor intente más tarde.', 'danger');
      break;
    default:
      showAlert(errorMessage, 'danger');
  }
}

/**
 * Inicia sesión con código QR
 */
async function loginWithQR() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    });
    const videoElement = document.getElementById('qr-video');
    if (videoElement) {
      videoElement.srcObject = stream;
    }

    showAlert('Escaneando código QR...', 'info');

    // Simular escaneo QR (2 segundos)
    setTimeout(() => {
      stream.getTracks().forEach(track => track.stop());
      showAlert('Funcionalidad de escaneo QR en desarrollo', 'warning');
    }, 2000);

  } catch (err) {
    showAlert('Error accediendo a la cámara: ' + err.message, 'danger');
    console.error('Error de cámara:', err);
  }
}

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

  // Verificar si la sesión no ha expirado (opcional)
  // Aquí puedes agregar lógica de expiración de sesión

  return true;
}