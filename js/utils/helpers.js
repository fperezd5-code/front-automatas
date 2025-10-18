// js/utils/helpers.js - Funciones auxiliares generales

/**
 * Genera un token de sesión único
 * @returns {string} - Token generado
 */
function generateSessionToken() {
  return Math.random().toString(36).substr(2) + Date.now().toString(36);
}

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} - true si es válido
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida formato de teléfono (8 dígitos)
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} - true si es válido
 */
function isValidPhone(phone) {
  return phone.length === 8 && /^\d{8}$/.test(phone);
}

/**
 * Formatea una fecha a string legible
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formatea fecha y hora
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} - Fecha y hora formateadas
 */
function formatDateTime(date) {
  const d = new Date(date);
  return d.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Muestra el indicador de carga
 */
function showLoading() {
  const spinner = document.getElementById('loading-spinner');
  if (spinner) {
    spinner.classList.remove('hidden');
  }
}

/**
 * Oculta el indicador de carga
 */
function hideLoading() {
  const spinner = document.getElementById('loading-spinner');
  if (spinner) {
    spinner.classList.add('hidden');
  }
}

/**
 * Detiene todos los streams de cámara activos
 */
function stopAllCameraStreams() {
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
  });
}

/**
 * Muestra/oculta una sección
 * @param {string} sectionId - ID de la sección
 */
function showSection(sectionId) {
  document.querySelectorAll('.form-section').forEach(section => {
    section.classList.add('hidden');
  });

  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.remove('hidden');
  }

  stopAllCameraStreams();
}

/**
 * Descarga un archivo de texto
 * @param {string} content - Contenido del archivo
 * @param {string} filename - Nombre del archivo
 */
function downloadTextFile(content, filename) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Genera un código QR en un elemento
 * @param {string} elementId - ID del elemento donde generar el QR
 * @param {object} data - Datos para el QR
 */
function generateQRCode(elementId, data) {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.innerHTML = '';

  const qrData = JSON.stringify(data);

  if (typeof QRCode !== 'undefined') {
    new QRCode(element, {
      text: qrData,
      width: 150,
      height: 150,
      colorDark: '#333333',
      colorLight: '#FFFFFF',
      correctLevel: QRCode.CorrectLevel.H
    });
  } else {
    console.error('Librería QRCode no cargada');
  }
}

/**
 * Hash simple de una contraseña (NO usar en producción)
 * @param {string} password - Contraseña a hashear
 * @returns {string} - Hash de la contraseña
 */
function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
}