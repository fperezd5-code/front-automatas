// js/auth/validation.js - Validaciones de formularios de autenticación

/**
 * Valida el paso 1 del registro (información básica)
 * @returns {boolean} - true si es válido
 */
function validateStep1() {
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const birthdate = document.getElementById('birthdate').value;
  const nickname = document.getElementById('nickname').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  // Verificar campos vacíos
  if (!email || !phone || !birthdate || !nickname || !password || !confirmPassword) {
    showAlert('Por favor complete todos los campos', 'danger');
    return false;
  }

  // Validar email
  if (!isValidEmail(email)) {
    showAlert('Por favor ingrese un correo electrónico válido', 'danger');
    return false;
  }

  // Validar teléfono
  if (!isValidPhone(phone)) {
    showAlert('El teléfono debe tener exactamente 8 dígitos', 'danger');
    return false;
  }

  // Validar contraseñas
  if (password !== confirmPassword) {
    showAlert('Las contraseñas no coinciden. Por favor verifique.', 'danger');
    document.getElementById('confirm-password').value = '';
    document.getElementById('confirm-password').focus();
    return false;
  }

  if (password.length < 6) {
    showAlert('La contraseña debe tener al menos 6 caracteres', 'danger');
    return false;
  }

  return true;
}

/**
 * Valida el paso 2 del registro (notificaciones)
 * @param {array} selectedMethods - Métodos seleccionados
 * @returns {boolean} - true si es válido
 */
function validateStep2(selectedMethods) {
  if (selectedMethods.length === 0) {
    showAlert('Seleccione al menos un método de notificación', 'danger');
    return false;
  }
  return true;
}

/**
 * Valida el paso 3 del registro (foto)
 * @param {string} capturedPhoto - Foto capturada
 * @returns {boolean} - true si es válido
 */
function validateStep3(capturedPhoto) {
  if (!capturedPhoto) {
    showAlert('Por favor tome una fotografía', 'danger');
    return false;
  }
  return true;
}

/**
 * Valida el formulario de login
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {boolean} - true si es válido
 */
function validateLogin(email, password) {
  if (!email || !password) {
    showAlert('Complete todos los campos', 'danger');
    return false;
  }

  if (!isValidEmail(email)) {
    showAlert('Por favor ingrese un email válido', 'danger');
    return false;
  }

  return true;
}

/**
 * Limpia el formulario de registro
 */
function clearRegistrationForm() {
  document.getElementById('email').value = '';
  document.getElementById('phone').value = '';
  document.getElementById('birthdate').value = '';
  document.getElementById('nickname').value = '';
  document.getElementById('password').value = '';
  document.getElementById('confirm-password').value = '';

  // Limpiar selección de notificaciones
  document.querySelectorAll('.notification-option').forEach(opt => {
    opt.classList.remove('selected');
  });

  // Limpiar foto
  document.getElementById('photo-preview').innerHTML = '';
  document.getElementById('capture-btn').classList.remove('hidden');
  document.getElementById('retake-btn').classList.add('hidden');
  document.getElementById('continue-photo').classList.add('hidden');

  // Limpiar QR
  document.getElementById('qr-code').innerHTML = '';
}

/**
 * Limpia el formulario de login
 */
function clearLoginForm() {
  document.getElementById('login-user').value = '';
  document.getElementById('login-password').value = '';
}