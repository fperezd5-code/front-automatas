// js/main.js - Archivo principal de inicialización

// Variables globales para el análisis léxico
let selectedFile = null;
let selectedLanguage = null;
let fileContent = null;
let analysisResults = null;

// Temporizador
let timer;
let timeLeft = 30;

/**
 * Inicializa la aplicación
 */
document.addEventListener('DOMContentLoaded', function () {
  initializeApp();
});

/**
 * Configuración inicial de la aplicación
 */
function initializeApp() {
  const currentPage = window.location.pathname;

  if (currentPage.includes('index.html') || currentPage.endsWith('/')) {
    // Página de autenticación
    initAuthPage();
  } else if (currentPage.includes('principal.html')) {
    // Página principal
    initPrincipalPage();
  }
}

/**
 * Inicializa la página de autenticación
 */
function initAuthPage() {
  startTimer(60);
  setupAuthEventListeners();
}

/**
 * Configura los event listeners de autenticación
 */
function setupAuthEventListeners() {
  // Phone input - solo números
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function (e) {
      this.value = this.value.replace(/[^0-9]/g, '');
      if (this.value.length > 8) {
        this.value = this.value.slice(0, 8);
      }
    });
  }

  // Tab activation para detener cámaras
  document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
    tab.addEventListener('shown.bs.tab', function () {
      stopAllCameraStreams();
    });
  });
}

/**
 * Inicia el temporizador
 * @param {number} seconds - Segundos del temporizador
 */
function startTimer(seconds = 60) {
  clearInterval(timer);
  timeLeft = seconds;
  
  const timerElement = document.getElementById('timer');
  if (timerElement) {
    timerElement.textContent = timeLeft + 's';

    timer = setInterval(() => {
      timeLeft--;
      timerElement.textContent = timeLeft + 's';

      if (timeLeft <= 0) {
        clearInterval(timer);
        showAlert('Tiempo agotado. Intente nuevamente.', 'danger');
        showSection('login-section');
      }
    }, 1000);
  }
}

/**
 * Inicializa la página principal
 */
function initPrincipalPage() {
  // Verificar sesión
  if (!hasActiveSession()) {
    showAlert('Debe iniciar sesión primero', 'warning');
    window.location.href = 'index.html';
    return;
  }

  // Mostrar nombre de usuario
  const userName = getUserName();
  const userNameElement = document.getElementById('user-name');
  if (userNameElement) {
    userNameElement.textContent = userName;
  }

  // Setup event listeners para análisis léxico
  setupLexicalEventListeners();
}

/**
 * Configura los event listeners del análisis léxico
 */
function setupLexicalEventListeners() {
  // File input
  const fileInput = document.getElementById('file-input');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelect);
  }
}

/**
 * Maneja la selección de archivo
 * @param {Event} event - Evento del input file
 */
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.name.endsWith('.txt')) {
    showAlert('Por favor seleccione un archivo de texto (.txt)', 'danger');
    event.target.value = '';
    return;
  }

  selectedFile = file;
  const fileNameElement = document.getElementById('file-name');
  if (fileNameElement) {
    fileNameElement.textContent = file.name;
  }

  // Leer el contenido del archivo
  const reader = new FileReader();
  reader.onload = function(e) {
    fileContent = e.target.result;
    console.log('Archivo cargado, contenido:', fileContent.substring(0, 100) + '...');
    checkReadyToProcess();
  };
  reader.onerror = function() {
    showAlert('Error al leer el archivo', 'danger');
  };
  reader.readAsText(file, 'UTF-8');

  showAlert('Archivo cargado correctamente', 'success');
}

/**
 * Selecciona un idioma
 * @param {string} lang - Código del idioma (es, en, ar)
 */
function selectLanguage(lang) {
  selectedLanguage = lang;
  
  // Remover selección de todas las opciones
  document.querySelectorAll('.language-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  
  // Agregar selección a la opción elegida
  const selectedOption = document.querySelector(`[data-lang="${lang}"]`);
  if (selectedOption) {
    selectedOption.classList.add('selected');
  }

  const langName = getLanguageName(lang);
  showAlert(`Idioma seleccionado: ${langName}`, 'success');
  
  checkReadyToProcess();
}

/**
 * Verifica si está listo para procesar
 */
function checkReadyToProcess() {
  const btn = document.getElementById('process-btn');
  if (btn) {
    if (selectedFile && selectedLanguage && fileContent) {
      btn.disabled = false;
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-primary');
    } else {
      btn.disabled = true;
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-secondary');
    }
  }
}

/**
 * Procesa el archivo de texto
 */
function processFile() {
  if (!selectedFile || !selectedLanguage || !fileContent) {
    showAlert('Por favor seleccione un archivo y un idioma', 'danger');
    return;
  }

  console.log('Iniciando procesamiento...');
  console.log('Archivo:', selectedFile.name);
  console.log('Idioma:', selectedLanguage);
  console.log('Contenido length:', fileContent.length);

  // Mostrar loading overlay
  showLoadingOverlay('Procesando documento...');

  // Simular tiempo de procesamiento
  setTimeout(() => {
    try {
      // Realizar análisis léxico
      console.log('Llamando a performLexicalAnalysis...');
      analysisResults = performLexicalAnalysis(fileContent, selectedLanguage);
      
      console.log('Análisis completado:', analysisResults);
      
      // Guardar resultados
      saveAnalysisResults(analysisResults);
      
      // Mostrar resultados
      displayResults(analysisResults);
      
      // Ocultar loading
      hideLoadingOverlay();
      
      // Scroll a resultados
      const resultsSection = document.getElementById('results-section');
      if (resultsSection) {
        setTimeout(() => {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
      
      showAlert('Análisis completado exitosamente', 'success');
    } catch (error) {
      hideLoadingOverlay();
      showAlert('Error al procesar el archivo: ' + error.message, 'danger');
      console.error('Error en análisis:', error);
    }
  }, 1500);
}

/**
 * Limpia el formulario cuando se cierra sesión
 */
window.addEventListener('beforeunload', function () {
  stopAllCameraStreams();
  if (timer) {
    clearInterval(timer);
  }
});