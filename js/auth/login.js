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
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'user' } 
    });
    const videoElement = document.getElementById('login-video');
    if (videoElement) {
      videoElement.srcObject = stream;
    }

    showAlert('Procesando reconocimiento facial...', 'info');

    // Simular reconocimiento facial (3 segundos)
    setTimeout(() => {
      stream.getTracks().forEach(track => track.stop());
      showAlert('Funcionalidad de reconocimiento facial en desarrollo', 'warning');
    }, 3000);

  } catch (err) {
    showAlert('Error accediendo a la cámara: ' + err.message, 'danger');
    console.error('Error de cámara:', err);
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