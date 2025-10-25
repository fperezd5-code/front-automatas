// js/auth/register.js - CON DEBUG COMPLETO PARA DETECTAR ERRORES

let currentStep = 1;
let selectedNotificationMethods = [];
let capturedPhoto = null;
let currentUser = null;

/**
 * Avanza al siguiente paso del registro
 */
function nextStep() {
  if (validateCurrentStep()) {
    document.getElementById(`step-${currentStep}`).classList.add('hidden');
    currentStep++;
    document.getElementById(`step-${currentStep}`).classList.remove('hidden');
    updateProgress();

    if (currentStep === 2) {
      setupNotificationListeners();
    } else if (currentStep === 3) {
      startCamera();
    } else if (currentStep === 4) {
      finishRegistration();
      return;
    }
  }
}

/**
 * Retrocede al paso anterior del registro
 */
function prevStep() {
  document.getElementById(`step-${currentStep}`).classList.add('hidden');
  currentStep--;
  document.getElementById(`step-${currentStep}`).classList.remove('hidden');
  updateProgress();
}

/**
 * Valida el paso actual del registro
 * @returns {boolean} - true si es válido
 */
function validateCurrentStep() {
  switch (currentStep) {
    case 1:
      return validateStep1();
    case 2:
      return validateStep2(selectedNotificationMethods);
    case 3:
      return validateStep3(capturedPhoto);
    default:
      return true;
  }
}

/**
 * Actualiza la barra de progreso
 */
function updateProgress() {
  const progress = (currentStep / 5) * 100;
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    progressBar.style.width = progress + '%';
  }
}

/**
 * Configura los listeners para la selección de notificaciones
 */
function setupNotificationListeners() {
  document.querySelectorAll('.notification-option').forEach(option => {
    option.addEventListener('click', function () {
      document.querySelectorAll('.notification-option').forEach(opt => 
        opt.classList.remove('selected')
      );
      this.classList.add('selected');
      selectedNotificationMethods = [this.dataset.method];
    });
  });
}

/**
 * Finaliza el proceso de registro
 */
async function finishRegistration() {
  console.log('📝 ============== INICIO REGISTRO ==============');
  
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const nickname = document.getElementById('nickname').value;
  const password = document.getElementById('password').value;
  const birthdate = document.getElementById('birthdate').value;

  // Determinar métodos de notificación
  let notif_email = false;
  let notif_whatsapp = false;

  if (selectedNotificationMethods.includes('email')) {
    notif_email = true;
  } else if (selectedNotificationMethods.includes('whatsapp')) {
    notif_whatsapp = true;
  } else if (selectedNotificationMethods.includes('both')) {
    notif_email = true;
    notif_whatsapp = true;
  }

  // Extraer solo el base64 de la imagen
  const imageBase64 = capturedPhoto.split(',')[1];

  const requestBody = {
    usuario: nickname,
    email: email,
    nombre_completo: nickname,
    password: password,
    telefono: phone,
    notif_email: notif_email,
    notif_whatsapp: notif_whatsapp,
    imagen_referencia: imageBase64
  };

  console.log('📤 Enviando al backend:', {
    ...requestBody,
    imagen_referencia: imageBase64.substring(0, 50) + '...'
  });

  try {
    const { response, result } = await registerUser(requestBody);

    console.log('📥 Respuesta del backend:', result);

    if (response.ok && result.status === 201 && result.data) {
      console.log('✅ Registro exitoso en backend');
      
      // Registro exitoso - Guardar datos del usuario
      currentUser = {
        id: result.data.id,
        usuario: result.data.usuario,
        email: result.data.email,
        nombre_completo: result.data.nombre_completo,
        phone: phone,
        birthdate: birthdate,
        editedPhoto: capturedPhoto,
        notificationMethods: selectedNotificationMethods,
        notificaciones: result.data.notificaciones,
        role: 'analyst',
        createdAt: new Date().toISOString(),
        active: true,
        qr_token: result.data.qr_token || generateQRToken(),
      };

      console.log('💾 currentUser guardado:', currentUser);

      // Avanzar al paso 4 (procesando)
      document.getElementById(`step-${currentStep}`).classList.add('hidden');
      currentStep = 4;
      document.getElementById('step-4').classList.remove('hidden');
      updateProgress();

      console.log('⏱️ Esperando 1.5 segundos antes de generar QR...');

      // Generar y mostrar QR después de un momento
      setTimeout(() => {
        console.log('🚀 Llamando a generateAndShowQR()...');
        generateAndShowQR(result);
      }, 1500);

    } else {
      console.error('❌ Error en registro:', result);
      handleApiError(result);
    }

  } catch (error) {
    console.error('❌ Error fatal en registro:', error);
    showAlert('Error de conexión con el servidor. Por favor intente nuevamente.', 'danger');
  }
  
  console.log('📝 ============== FIN REGISTRO ==============');
}

/**
 * 🔍 VERSIÓN CON DEBUG COMPLETO - Genera y muestra el código QR
 * SEGURO: El QR contiene SOLO el token, no información del usuario
 * @param {object} result - Resultado de la API
 */
function generateAndShowQR(result) {
  console.log('');
  console.log('🔐 ============== GENERACIÓN QR START ==============');
  console.log('📊 [1/10] Verificando currentUser:', currentUser);
  
  if (!currentUser) {
    console.error('❌ currentUser es null!');
    showAlert('Error: Datos de usuario no disponibles', 'danger');
    return;
  }
  
  if (!currentUser.qr_token) {
    console.error('❌ qr_token no está disponible!');
    showAlert('Error: Token QR no generado por el servidor', 'danger');
    return;
  }
  
  // El QR contiene SOLO el token (string simple)
  // NO incluye usuario_id, email, ni ningún dato sensible
  const qrDataString = currentUser.qr_token;
  
  console.log('📦 [2/10] Token QR para codificar:', qrDataString.substring(0, 30) + '...');
  console.log('🔒 [2.5/10] SEGURIDAD: QR contiene SOLO el token, sin datos del usuario');

  // Pasar al Step 5
  console.log('🔄 [3/10] Ocultando step-4...');
  document.getElementById('step-4').classList.add('hidden');
  
  currentStep = 5;
  console.log('🔄 [4/10] Mostrando step-5...');
  document.getElementById('step-5').classList.remove('hidden');
  
  updateProgress();
  console.log('✅ [5/10] Avanzado a step 5 correctamente');

  // Obtener contenedor del QR
  console.log('🔍 [6/10] Buscando contenedor #qr-code...');
  const qrContainer = document.getElementById('qr-code');
  
  if (!qrContainer) {
    console.error('❌ ERROR CRÍTICO: Contenedor #qr-code NO ENCONTRADO en el DOM!');
    console.log('🔍 Elementos disponibles con id que contienen "qr":');
    document.querySelectorAll('[id*="qr"]').forEach(el => {
      console.log('   -', el.id, el.tagName);
    });
    showAlert('Error: Contenedor QR no encontrado en la página', 'danger');
    return;
  }

  console.log('✅ [7/10] Contenedor encontrado:', qrContainer);
  console.log('   - Tipo:', qrContainer.tagName);
  console.log('   - Clases:', qrContainer.className);
  console.log('   - Dimensiones:', qrContainer.offsetWidth, 'x', qrContainer.offsetHeight);
  console.log('   - Visible:', qrContainer.offsetParent !== null);

  // Limpiar contenedor
  console.log('🧹 [8/10] Limpiando contenedor...');
  qrContainer.innerHTML = '';
  console.log('✅ Contenedor limpiado');

  // Verificar si QRCode está disponible
  console.log('🔍 [9/10] Verificando librería QRCode...');
  console.log('   - typeof QRCode:', typeof QRCode);
  console.log('   - QRCode definido:', typeof QRCode !== 'undefined');
  
  if (typeof QRCode === 'undefined') {
    console.error('❌ ERROR CRÍTICO: Librería QRCode NO ESTÁ CARGADA!');
    console.log('📋 Scripts cargados en la página:');
    document.querySelectorAll('script[src]').forEach(script => {
      console.log('   -', script.src);
    });
    
    qrContainer.innerHTML = `
      <div class="text-center p-4 border rounded bg-light">
        <i class="fas fa-exclamation-triangle fa-4x text-warning mb-3"></i>
        <p class="text-danger mb-1"><strong>Error: Librería QRCode no cargada</strong></p>
        <small class="text-secondary">ID: ${currentUser.id}</small>
        <br><small class="text-muted">Recarga la página</small>
      </div>
    `;
    showAlert('⚠️ Error: Librería QRCode no disponible. Recarga la página.', 'warning');
    return;
  }

  console.log('✅ Librería QRCode disponible');

  // Generar QR
  console.log('🎨 [10/10] Generando QR visual...');
  
  try {
    console.log('   - Token string:', qrDataString);
    console.log('   - Longitud token:', qrDataString.length);
    
    console.log('🔨 Creando instancia de QRCode...');
    
    new QRCode(qrContainer, {
      text: qrDataString, // SOLO el token
      width: 200,
      height: 200,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });

    console.log('✅ ¡Instancia QRCode creada!');
    console.log('⏱️ Esperando 500ms para verificar canvas...');

    // Verificar que el canvas se creó
    setTimeout(() => {
      console.log('🔍 Verificando canvas...');
      const canvas = qrContainer.querySelector('canvas');
      const img = qrContainer.querySelector('img');
      
      console.log('   - Canvas encontrado:', !!canvas);
      console.log('   - Img encontrado:', !!img);
      
      if (canvas) {
        console.log('✅ ¡CANVAS DEL QR CONFIRMADO!');
        console.log('   - Dimensiones:', canvas.width, 'x', canvas.height);
        console.log('   - Visible:', canvas.offsetParent !== null);
        console.log('   - En DOM:', document.body.contains(canvas));
        
        // Intentar obtener data URL para confirmar que tiene contenido
        try {
          const dataUrl = canvas.toDataURL('image/png');
          console.log('   - Data URL length:', dataUrl.length);
          console.log('   - Primeros 50 chars:', dataUrl.substring(0, 50));
        } catch (err) {
          console.warn('   - No se pudo obtener dataURL:', err.message);
        }
      } else {
        console.error('❌ Canvas NO ENCONTRADO después de generar QR!');
        console.log('🔍 Contenido del contenedor:');
        console.log(qrContainer.innerHTML);
      }
      
      if (img) {
        console.log('ℹ️ Imagen encontrada (algunos QR usan img en lugar de canvas)');
        console.log('   - Src length:', img.src.length);
      }
      
      console.log('🔐 ============== GENERACIÓN QR END ==============');
      console.log('');
    }, 500);

    showAlert(result.message || '✅ ¡Registro completado! Código QR generado', 'success');
    
  } catch (error) {
    console.error('❌ ERROR AL GENERAR QR:', error);
    console.error('   - Nombre:', error.name);
    console.error('   - Mensaje:', error.message);
    console.error('   - Stack:', error.stack);
    
    qrContainer.innerHTML = `
      <div class="text-center p-4 border rounded bg-light">
        <i class="fas fa-qrcode fa-4x text-muted mb-3"></i>
        <p class="text-danger mb-1"><strong>Error al generar QR</strong></p>
        <small class="text-muted">${error.message}</small><br>
        <small class="text-secondary">ID: ${currentUser.id}</small>
      </div>
    `;
    showAlert('⚠️ Error al generar código QR: ' + error.message, 'warning');
  }
}

/**
 * Genera un token único para el QR
 * @returns {string} - Token generado
 */
function generateQRToken() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const token = `qr_${timestamp}_${random}`;
  console.log('🎲 Token QR generado:', token);
  return token;
}

/**
 * Maneja errores de la API durante el registro
 * @param {object} result - Resultado de la API
 */
function handleApiError(result) {
  let errorMessage = result.message || 'Error al registrar usuario';

  if (result.data && Array.isArray(result.data)) {
    const errorMessages = result.data.map(err => err.message || err).join('. ');
    errorMessage = errorMessages;
  }

  switch (result.status) {
    case 400:
      if (errorMessage.toLowerCase().includes('usuario') || 
          errorMessage.toLowerCase().includes('username')) {
        showAlert('El nombre de usuario ya existe. Por favor elija otro.', 'danger');
        goToStep(1, 'nickname');
      } else if (errorMessage.toLowerCase().includes('email') || 
                 errorMessage.toLowerCase().includes('correo')) {
        showAlert('El email ya está registrado. Por favor use otro email.', 'danger');
        goToStep(1, 'email');
      } else if (errorMessage.toLowerCase().includes('teléfono') || 
                 errorMessage.toLowerCase().includes('telefono') || 
                 errorMessage.toLowerCase().includes('phone')) {
        showAlert('El teléfono ingresado no es válido o ya está registrado.', 'danger');
        goToStep(1, 'phone');
      } else {
        showAlert('Error de validación: ' + errorMessage, 'danger');
        goToStep(1);
      }
      break;

    case 409:
      showAlert('Ya existe un registro con estos datos. ' + errorMessage, 'danger');
      goToStep(1);
      break;

    case 500:
      showAlert('Error interno del servidor. Por favor intente más tarde.', 'danger');
      break;

    case 503:
      showAlert('Servicio no disponible. Por favor intente más tarde.', 'danger');
      break;

    default:
      showAlert(errorMessage, 'danger');
      goToStep(1);
  }
}

/**
 * Va a un paso específico y enfoca un campo
 * @param {number} step - Número de paso
 * @param {string} fieldId - ID del campo a enfocar
 */
function goToStep(step, fieldId = null) {
  document.getElementById(`step-${currentStep}`).classList.add('hidden');
  currentStep = step;
  document.getElementById(`step-${currentStep}`).classList.remove('hidden');
  updateProgress();
  
  if (fieldId) {
    setTimeout(() => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.focus();
        field.select();
      }
    }, 300);
  }
}

/**
 * Descarga la credencial del usuario con QR
 */
function downloadCredential() {
  console.log('📄 ============== DESCARGA PDF START ==============');
  
  if (!currentUser) {
    console.error('❌ No hay currentUser para generar PDF');
    showAlert('No hay información de usuario para generar la credencial', 'warning');
    return;
  }

  console.log('👤 Usuario para PDF:', currentUser);

  // Verificar si jsPDF está disponible
  if (typeof window.jspdf === 'undefined') {
    console.error('❌ jsPDF no está disponible');
    showAlert('❌ Error: Librería jsPDF no cargada', 'danger');
    return;
  }

  console.log('✅ jsPDF disponible');

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  console.log('📝 Creando estructura del PDF...');

  // Fondo
  doc.setFillColor(255, 217, 102);
  doc.rect(0, 0, 210, 297, 'F');

  // Header
  doc.setFillColor(108, 190, 226);
  doc.rect(5, 5, 200, 40, 'F');

  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.text('SISTEMA DE ANÁLISIS', 105, 20, { align: 'center' });
  doc.setFontSize(20);
  doc.text('CREDENCIAL OFICIAL', 105, 35, { align: 'center' });

  // Foto
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15, 55, 60, 60, 3, 3, 'F');

  if (currentUser.editedPhoto) {
    try {
      doc.addImage(currentUser.editedPhoto, 'JPEG', 17, 57, 56, 56);
      console.log('✅ Foto añadida');
    } catch (error) {
      console.error('❌ Error añadiendo foto:', error);
    }
  }

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(2);
  doc.roundedRect(15, 55, 60, 60, 3, 3, 'S');

  // Información del usuario
  const infoY = 55;
  
  doc.setFillColor(255, 182, 193);
  doc.roundedRect(85, infoY, 110, 15, 2, 2, 'F');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'bold');
  doc.text('NOMBRE:', 88, infoY + 10);
  doc.setFont(undefined, 'normal');
  doc.text(currentUser.usuario, 115, infoY + 10);

  doc.setFillColor(152, 251, 152);
  doc.roundedRect(85, infoY + 20, 110, 15, 2, 2, 'F');
  doc.setFont(undefined, 'bold');
  doc.text('EMAIL:', 88, infoY + 30);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  doc.text(currentUser.email, 110, infoY + 30);

  doc.setFillColor(173, 216, 230);
  doc.roundedRect(85, infoY + 40, 110, 15, 2, 2, 'F');
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('TELÉFONO:', 88, infoY + 50);
  doc.setFont(undefined, 'normal');
  doc.text(currentUser.phone, 120, infoY + 50);

  doc.setFillColor(255, 255, 204);
  doc.roundedRect(85, infoY + 60, 110, 15, 2, 2, 'F');
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('ID:', 88, infoY + 70);
  doc.setFont(undefined, 'normal');
  doc.text(String(currentUser.id), 102, infoY + 70);

  console.log('✅ Información de usuario añadida');

  // QR Code
  console.log('🔍 Buscando canvas del QR para PDF...');
  
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(70, 135, 70, 70, 3, 3, 'F');

  const qrContainer = document.getElementById('qr-code');
  console.log('   - Contenedor encontrado:', !!qrContainer);
  
  const qrCanvas = qrContainer ? qrContainer.querySelector('canvas') : null;
  console.log('   - Canvas encontrado:', !!qrCanvas);
  
  if (qrCanvas) {
    try {
      console.log('   - Dimensiones canvas:', qrCanvas.width, 'x', qrCanvas.height);
      const qrDataURL = qrCanvas.toDataURL('image/png');
      console.log('   - Data URL generado:', qrDataURL.substring(0, 50) + '...');
      doc.addImage(qrDataURL, 'PNG', 75, 140, 60, 60);
      console.log('✅ QR añadido al PDF exitosamente');
    } catch (error) {
      console.error('❌ Error añadiendo QR al PDF:', error);
      addQRFallback(doc);
    }
  } else {
    console.warn('⚠️ Canvas del QR no encontrado, usando fallback');
    addQRFallback(doc);
  }

  doc.setLineWidth(3);
  doc.setDrawColor(0, 0, 0);
  doc.roundedRect(70, 135, 70, 70, 3, 3, 'S');

  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('CÓDIGO DE ACCESO QR', 105, 213, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text('Escanee para iniciar sesión', 105, 219, { align: 'center' });

  // Footer
  doc.setFillColor(93, 193, 185);
  doc.rect(0, 270, 210, 27, 'F');

  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Credencial Oficial del Sistema', 105, 280, { align: 'center' });
  doc.setFontSize(7);
  doc.text(`Emitida: ${new Date(currentUser.createdAt).toLocaleDateString()}`, 105, 287, { align: 'center' });
  doc.text('Sistema de Análisis Léxico © 2025', 105, 292, { align: 'center' });

  // Guardar PDF
  const filename = `credencial_${currentUser.usuario}_${Date.now()}.pdf`;
  console.log('💾 Guardando PDF:', filename);
  doc.save(filename);
  showAlert('✅ Credencial descargada exitosamente', 'success');
  console.log('📄 ============== DESCARGA PDF END ==============');
}

/**
 * Añade un fallback visual cuando no hay QR canvas
 * @param {jsPDF} doc - Documento PDF
 */
function addQRFallback(doc) {
  console.log('🔄 Añadiendo fallback de QR al PDF...');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('QR de acceso', 105, 165, { align: 'center' });
  doc.setFontSize(8);
  doc.text(`ID: ${currentUser.id}`, 105, 172, { align: 'center' });
  
  const tokenPreview = (currentUser.qr_token || 'N/A').substring(0, 20);
  doc.text('Token: ' + tokenPreview + '...', 105, 178, { align: 'center' });
  
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('Use la versión digital del QR', 105, 185, { align: 'center' });
  console.log('✅ Fallback añadido');
}