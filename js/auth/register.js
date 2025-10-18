// js/auth/register.js - Lógica de registro de usuarios

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

  try {
    const { response, result } = await registerUser(requestBody);

    if (response.ok && result.status === 201 && result.data) {
      // Registro exitoso
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
        active: true
      };

      // Avanzar al paso 4
      document.getElementById(`step-${currentStep}`).classList.add('hidden');
      currentStep = 4;
      document.getElementById('step-4').classList.remove('hidden');
      updateProgress();

      // Generar QR
      const qrData = {
        id: currentUser.id,
        usuario: currentUser.usuario,
        email: currentUser.email,
        timestamp: Date.now()
      };

      // Crear contenedor temporal para QR
      const tempQrContainer = document.createElement('div');
      tempQrContainer.id = 'temp-qr-code';
      document.body.appendChild(tempQrContainer);

      let qrCodeHTML = '';
      if (typeof QRCode !== 'undefined') {
        new QRCode(tempQrContainer, {
          text: JSON.stringify(qrData),
          width: 150,
          height: 150,
          colorDark: '#333333',
          colorLight: '#FFFFFF',
          correctLevel: QRCode.CorrectLevel.H
        });
        
        setTimeout(() => {
          qrCodeHTML = tempQrContainer.innerHTML;
          document.body.removeChild(tempQrContainer);
          showSuccessScreen(qrCodeHTML, result);
        }, 100);
      } else {
        console.error('QRCode library not loaded');
        qrCodeHTML = `<p class="text-muted">Código QR generado</p><small>ID: ${currentUser.id}</small>`;
        showSuccessScreen(qrCodeHTML, result);
      }

    } else {
      handleApiError(result);
    }

  } catch (error) {
    showAlert('Error de conexión con el servidor. Por favor intente nuevamente.', 'danger');
    console.error('Error completo:', error);
  }
}

/**
 * Muestra la pantalla de éxito
 * @param {string} qrCodeHTML - HTML del código QR
 * @param {object} result - Resultado de la API
 */
function showSuccessScreen(qrCodeHTML, result) {
  setTimeout(() => {
    document.getElementById('step-4').classList.add('hidden');
    currentStep = 5;
    document.getElementById('step-5').classList.remove('hidden');
    updateProgress();
    
    const qrContainer = document.getElementById('qr-code');
    if (qrContainer) {
      qrContainer.innerHTML = qrCodeHTML;
    }
    
    showAlert(result.message || '¡Registro completado exitosamente!', 'success');
  }, 1500);
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
 * Descarga la credencial del usuario
 */
function downloadCredential() {
  if (!currentUser) {
    showAlert('No hay información de usuario para generar la credencial', 'warning');
    return;
  }

  // Verificar si jsPDF está disponible
  if (typeof window.jspdf === 'undefined') {
    showAlert('Error: Librería jsPDF no cargada', 'danger');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

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
    } catch (error) {
      console.error('Error añadiendo imagen:', error);
    }
  }

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(2);
  doc.roundedRect(15, 55, 60, 60, 3, 3, 'S');

  // Información
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

  // QR Code
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(70, 135, 70, 70, 3, 3, 'F');

  const qrCanvas = document.getElementById('qr-code').querySelector('canvas');
  if (qrCanvas) {
    try {
      const qrDataURL = qrCanvas.toDataURL();
      doc.addImage(qrDataURL, 'PNG', 75, 140, 60, 60);
    } catch (error) {
      console.error('Error añadiendo QR:', error);
    }
  }

  doc.setLineWidth(3);
  doc.setDrawColor(0, 0, 0);
  doc.roundedRect(70, 135, 70, 70, 3, 3, 'S');

  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('CÓDIGO DE ACCESO', 105, 213, { align: 'center' });

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
  doc.save(`credencial_${currentUser.usuario}.pdf`);
  showAlert('Credencial descargada exitosamente', 'success');
}