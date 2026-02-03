/**
 * Encuentra emails en el texto
 * @param {string} text - Texto a analizar
 * @returns {array} - Emails encontrados
 */
function findEmails(text) {
  const regex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const matches = text.match(regex) || [];
  return [...new Set(matches)];
}

/**
 * Encuentra URLs en el texto
 * @param {string} text - Texto a analizar
 * @returns {array} - URLs encontradas
 */
function findUrls(text) {
  const regex = /https?:\/\/[^\s]+/g;
  const matches = text.match(regex) || [];
  return [...new Set(matches)];
}

/**
 * Calcula estadísticas adicionales del texto
 * @param {string} text - Texto a analizar
 * @returns {object} - Estadísticas
 */
function calculateStatistics(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  
  return {
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    avgWordsPerSentence: sentences.length > 0 
      ? Math.round(words.length / sentences.length) 
      : 0,
    avgCharsPerWord: words.length > 0
      ? Math.round(text.length / words.length)
      : 0
  };
}

/**
 * Analiza la densidad léxica del texto
 * @param {object} results - Resultados del análisis
 * @returns {number} - Porcentaje de densidad léxica
 */
function calculateLexicalDensity(results) {
  const contentWords = results.nouns.length + results.verbs.length + 
                       results.adjectives.length + results.adverbs.length;
  const totalWords = results.totalWords;
  
  return totalWords > 0 ? ((contentWords / totalWords) * 100).toFixed(2) : 0;
}

/**
 * Encuentra palabras largas en el texto
 * @param {string} text - Texto a analizar
 * @param {number} minLength - Longitud mínima
 * @returns {array} - Palabras largas encontradas
 */
function findLongWords(text, minLength = 10) {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const longWords = words.filter(word => word.length >= minLength);
  return [...new Set(longWords)].slice(0, 20);
}

/**
 * Encuentra palabras cortas en el texto
 * @param {string} text - Texto a analizar
 * @param {number} maxLength - Longitud máxima
 * @returns {array} - Palabras cortas encontradas
 */
function findShortWords(text, maxLength = 3) {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const shortWords = words.filter(word => word.length <= maxLength);
  return [...new Set(shortWords)].slice(0, 20);
}

// js/utils/alerts.js - Sistema de alertas y notificaciones

/**
 * Muestra una alerta en la pantalla
 * @param {string} message - Mensaje de la alerta
 * @param {string} type - Tipo de alerta (success, danger, warning, info)
 * @param {number} duration - Duración en milisegundos (default: 5000)
 */
function showAlert(message, type = 'info', duration = 5000) {
  const alertsContainer = document.getElementById('alerts');
  if (!alertsContainer) {
    console.error('Contenedor de alertas no encontrado');
    return;
  }

  // Crear el elemento de alerta
  const alertId = 'alert-' + Date.now();
  const alertHTML = `
    <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
      <i class="fas ${getAlertIcon(type)} me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;

  alertsContainer.insertAdjacentHTML('beforeend', alertHTML);

  // Auto-cerrar la alerta después de la duración especificada
  setTimeout(() => {
    const alertElement = document.getElementById(alertId);
    if (alertElement) {
      alertElement.classList.remove('show');
      setTimeout(() => {
        alertElement.remove();
      }, 150);
    }
  }, duration);
}

/**
 * Obtiene el icono apropiado según el tipo de alerta
 * @param {string} type - Tipo de alerta
 * @returns {string} - Clase del icono
 */
function getAlertIcon(type) {
  const icons = {
    success: 'fa-check-circle',
    danger: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  return icons[type] || icons.info;
}

/**
 * Muestra un overlay de carga con mensaje
 * @param {string} message - Mensaje a mostrar
 */
function showLoadingOverlay(message = 'Cargando...') {
  let overlay = document.getElementById('loading-overlay');
  
  if (!overlay) {
    // Crear el overlay si no existe
    overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div class="loading-content">
        <div class="spinner-border text-light mb-3" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-light" id="loading-message">${message}</p>
      </div>
    `;
    document.body.appendChild(overlay);
  } else {
    // Actualizar el mensaje si ya existe
    const messageElement = document.getElementById('loading-message');
    if (messageElement) {
      messageElement.textContent = message;
    }
    overlay.classList.remove('hidden');
  }
}

/**
 * Oculta el overlay de carga
 */
function hideLoadingOverlay() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
    setTimeout(() => {
      overlay.remove();
    }, 300);
  }
}

/**
 * Muestra un diálogo de confirmación
 * @param {string} message - Mensaje del diálogo
 * @param {function} onConfirm - Callback cuando se confirma
 * @param {function} onCancel - Callback cuando se cancela (opcional)
 */
function showConfirmDialog(message, onConfirm, onCancel = null) {
  if (confirm(message)) {
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
  } else {
    if (typeof onCancel === 'function') {
      onCancel();
    }
  }
}

/**
 * Limpia todas las alertas visibles
 */
function clearAllAlerts() {
  const alertsContainer = document.getElementById('alerts');
  if (alertsContainer) {
    alertsContainer.innerHTML = '';
  }
}