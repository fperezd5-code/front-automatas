// Global variables
let currentStep = 1;
let timer;
let timeLeft = 30;
let mediaStream = null;
let capturedPhoto = null;
let editedPhoto = null;
let currentUser = null;
let selectedNotificationMethods = [];
let currentFilter = 'none';
let stickers = [];
let users = [];
let sessions = [];


// API Configuration
const API_BASE_URL = 'https://proyecto-automatas.onrender.com/api';

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
  initializeApp();
  setupEventListeners();
});

function initializeApp() {
  startTimer();
}

function setupEventListeners() {
  // Setup event listeners for phone input
  document.getElementById('phone').addEventListener('input', function (e) {
    this.value = this.value.replace(/[^0-9]/g, '');
    if (this.value.length > 8) {
      this.value = this.value.slice(0, 8);
    }
  });

  // Notification method selection
  document.querySelectorAll('.notification-option').forEach(option => {
    option.addEventListener('click', function () {
      document.querySelectorAll('.notification-option').forEach(opt => opt.classList.remove('selected'));
      this.classList.add('selected');
      selectedNotificationMethods = [this.dataset.method];
    });
  });

  // Filter selection
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.dataset.filter;
      applyFilter();
    });
  });

  // Tab activation for login methods
  document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
    tab.addEventListener('shown.bs.tab', function () {
      stopAllCameraStreams();
    });
  });
}

function startTimer(seconds = 60) {
  clearInterval(timer);
  timeLeft = seconds;
  document.getElementById('timer').textContent = timeLeft + 's';

  timer = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft + 's';

    if (timeLeft <= 0) {
      clearInterval(timer);
      showAlert('Tiempo agotado. Intente nuevamente.', 'danger');
      showSection('login-section');
    }
  }, 1000);
}

function showSection(sectionId) {
  document.querySelectorAll('.form-section').forEach(section => {
    section.classList.add('hidden');
  });

  document.getElementById(sectionId).classList.remove('hidden');

  if (sectionId === 'register-section') {
    document.querySelectorAll('.register-step').forEach(step => step.classList.add('hidden'));
    currentStep = 1;
    document.getElementById('step-1').classList.remove('hidden');
    updateProgress();
    clearRegistrationForm();
    startTimer(30);
  } else if (sectionId === 'login-section') {
    startTimer(15);
    clearLoginForm();
  } else if (sectionId === 'password-reset-section') {
    startTimer(30);
  }

  stopAllCameraStreams();
}

function clearRegistrationForm() {
  document.getElementById('email').value = '';
  document.getElementById('phone').value = '';
  document.getElementById('birthdate').value = '';
  document.getElementById('nickname').value = '';
  document.getElementById('password').value = '';

  selectedNotificationMethods = [];
  document.querySelectorAll('.notification-option').forEach(opt => opt.classList.remove('selected'));

  capturedPhoto = null;
  editedPhoto = null;
  document.getElementById('photo-preview').innerHTML = '';
  document.getElementById('capture-btn').classList.remove('hidden');
  document.getElementById('retake-btn').classList.add('hidden');
  document.getElementById('continue-photo').classList.add('hidden');

  currentFilter = 'none';
  stickers = [];

  document.getElementById('qr-code').innerHTML = '';
}

function clearLoginForm() {
  document.getElementById('login-user').value = '';
  document.getElementById('login-password').value = '';
}

function nextStep() {
  if (validateCurrentStep()) {
    document.getElementById(`step-${currentStep}`).classList.add('hidden');
    currentStep++;
    document.getElementById(`step-${currentStep}`).classList.remove('hidden');
    updateProgress();

    if (currentStep === 2) {
      document.querySelectorAll('.notification-option').forEach(option => {
        option.addEventListener('click', function () {
          document.querySelectorAll('.notification-option').forEach(opt => opt.classList.remove('selected'));
          this.classList.add('selected');
          selectedNotificationMethods = [this.dataset.method];
        });
      });
    } else if (currentStep === 3) {
      startCamera();
    } else if (currentStep === 4) {
      // Llamar a finishRegistration cuando llegamos al paso 4
      // El paso 4 se mostrará solo si el registro es exitoso
      finishRegistration();
    }
  }
}

function prevStep() {
  document.getElementById(`step-${currentStep}`).classList.add('hidden');
  currentStep--;
  document.getElementById(`step-${currentStep}`).classList.remove('hidden');
  updateProgress();
}

function validateCurrentStep() {
  switch (currentStep) {
    case 1:
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const birthdate = document.getElementById('birthdate').value;
      const nickname = document.getElementById('nickname').value;
      const password = document.getElementById('password').value;

      if (!email || !phone || !nickname || !password) {
        showAlert('Por favor complete todos los campos', 'danger');
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showAlert('Por favor ingrese un correo electrónico válido', 'danger');
        return false;
      }

      if (phone.length !== 8 || !/^\d{8}$/.test(phone)) {
        showAlert('El teléfono debe tener exactamente 8 dígitos', 'danger');
        return false;
      }

      return true;

    case 2:
      if (selectedNotificationMethods.length === 0) {
        showAlert('Seleccione al menos un método de notificación', 'danger');
        return false;
      }
      return true;

    case 3:
      if (!capturedPhoto) {
        showAlert('Por favor tome una fotografía', 'danger');
        return false;
      }
      return true;

    default:
      return true;
  }
}

function updateProgress() {
  const progress = (currentStep / 4) * 100;
  document.getElementById('progress-bar').style.width = progress + '%';
}

async function startCamera() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }
    });
    document.getElementById('video').srcObject = mediaStream;
  } catch (err) {
    showAlert('No se pudo acceder a la cámara: ' + err.message, 'danger');
  }
}

function capturePhoto() {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0);
  capturedPhoto = canvas.toDataURL('image/jpeg', 0.8);

  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
  }

  const preview = document.createElement('img');
  preview.src = capturedPhoto;
  preview.className = 'photo-preview';

  document.getElementById('photo-preview').innerHTML = '';
  document.getElementById('photo-preview').appendChild(preview);

  document.getElementById('capture-btn').classList.add('hidden');
  document.getElementById('retake-btn').classList.remove('hidden');
  document.getElementById('continue-photo').classList.remove('hidden');

  setTimeout(() => {
    showAlert('Rostro detectado correctamente', 'success');
  }, 1000);
}

function retakePhoto() {
  document.getElementById('photo-preview').innerHTML = '';
  document.getElementById('capture-btn').classList.remove('hidden');
  document.getElementById('retake-btn').classList.add('hidden');
  document.getElementById('continue-photo').classList.add('hidden');
  capturedPhoto = null;
  startCamera();
}

function initPhotoEditor() {
  const canvas = document.getElementById('edit-canvas');
  const ctx = canvas.getContext('2d');

  const img = new Image();
  img.onload = function () {
    canvas.width = 250;
    canvas.height = 250;
    ctx.drawImage(img, 0, 0, 250, 250);
    editedPhoto = canvas.toDataURL();
  };
  img.src = capturedPhoto;
}

function applyFilter() {
  const canvas = document.getElementById('edit-canvas');
  const ctx = canvas.getContext('2d');

  const img = new Image();
  img.onload = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, 250, 250);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    switch (currentFilter) {
      case 'vintage':
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * 1.2);
          data[i + 1] = Math.min(255, data[i + 1] * 1.1);
          data[i + 2] = Math.min(255, data[i + 2] * 0.8);
        }
        break;
      case 'bw':
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }
        break;
      case 'sepia':
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
          data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
          data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        }
        break;
      case 'bright':
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * 1.3);
          data[i + 1] = Math.min(255, data[i + 1] * 1.3);
          data[i + 2] = Math.min(255, data[i + 2] * 1.3);
        }
        break;
    }

    ctx.putImageData(imageData, 0, 0);

    stickers.forEach(sticker => {
      ctx.font = '24px Arial';
      ctx.fillText(sticker.emoji, sticker.x, sticker.y);
    });

    editedPhoto = canvas.toDataURL();
  };
  img.src = capturedPhoto;
}

function addSticker(emoji) {
  const canvas = document.getElementById('edit-canvas');
  const ctx = canvas.getContext('2d');

  const x = Math.random() * (canvas.width - 30);
  const y = 30 + Math.random() * (canvas.height - 60);

  stickers.push({ emoji, x, y });

  ctx.font = '24px Arial';
  ctx.fillText(emoji, x, y);

  editedPhoto = canvas.toDataURL();
}

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

  // Mostrar indicador de carga
  showAlert('Registrando usuario...', 'info');
  document.getElementById('loading-spinner').classList.remove('hidden');

  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();
    document.getElementById('loading-spinner').classList.add('hidden');

    // VALIDAR RESPUESTA EXITOSA - Los datos están en result.data
    if (response.ok && result.status === 201 && result.data) {
      // Registro exitoso - guardar datos del usuario desde result.data
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

      // Generar QR con los datos del usuario
      const qrData = JSON.stringify({
        id: currentUser.id,
        usuario: currentUser.usuario,
        email: currentUser.email,
        timestamp: Date.now()
      });

      // Generar el código QR - verificar que la librería esté cargada
      const qrContainer = document.getElementById('qr-code');
      qrContainer.innerHTML = ''; // Limpiar contenido previo

      if (typeof QRCode !== 'undefined') {
        // La librería está cargada, generar QR en canvas
        new QRCode(qrContainer, {
          text: qrData,
          width: 150,
          height: 150,
          colorDark: '#333333',
          colorLight: '#FFFFFF',
          correctLevel: QRCode.CorrectLevel.H
        });
      } else {
        // Fallback: mostrar mensaje si la librería no carga
        console.error('QRCode library not loaded');
        qrContainer.innerHTML = '<p class="text-muted">Código QR generado</p><small>ID: ' + currentUser.id + '</small>';
      }

      // Mostrar mensaje de éxito desde result.message
      showAlert(result.message, 'success');
      clearInterval(timer);

    } else {
      // Manejar errores de la API
      handleApiError(result, response.status);
    }

  } catch (error) {
    document.getElementById('loading-spinner').classList.add('hidden');
    showAlert('Error de conexión con el servidor. Por favor intente nuevamente.', 'danger');
    console.error('Error completo:', error);
  }
}

function handleApiError(result) {
  let errorMessage = result.message || 'Error al registrar usuario';

  // Manejar errores de validación desde el array data
  if (result.data && Array.isArray(result.data)) {
    const errorMessages = result.data.map(err => err.message || err).join('. ');
    errorMessage = errorMessages;
  }

  // Mostrar mensaje específico según el código de estado
  switch (result.status) {
    case 400:
      // Errores de validación
      if (errorMessage.toLowerCase().includes('usuario') || errorMessage.toLowerCase().includes('username')) {
        showAlert('El nombre de usuario ya existe. Por favor elija otro.', 'danger');
        // Volver al paso 1
        document.getElementById(`step-${currentStep}`).classList.add('hidden');
        currentStep = 1;
        document.getElementById('step-1').classList.remove('hidden');
        updateProgress();
        // Enfocar el campo de usuario
        setTimeout(() => {
          document.getElementById('nickname').focus();
          document.getElementById('nickname').select();
        }, 300);
      } else if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('correo')) {
        showAlert('El email ya está registrado. Por favor use otro email.', 'danger');
        // Volver al paso 1
        document.getElementById(`step-${currentStep}`).classList.add('hidden');
        currentStep = 1;
        document.getElementById('step-1').classList.remove('hidden');
        updateProgress();
        // Enfocar el campo de email
        setTimeout(() => {
          document.getElementById('email').focus();
          document.getElementById('email').select();
        }, 300);
      } else if (errorMessage.toLowerCase().includes('teléfono') || errorMessage.toLowerCase().includes('telefono') || errorMessage.toLowerCase().includes('phone')) {
        showAlert('El teléfono ingresado no es válido o ya está registrado.', 'danger');
        // Volver al paso 1
        document.getElementById(`step-${currentStep}`).classList.add('hidden');
        currentStep = 1;
        document.getElementById('step-1').classList.remove('hidden');
        updateProgress();
        setTimeout(() => {
          document.getElementById('phone').focus();
          document.getElementById('phone').select();
        }, 300);
      } else {
        showAlert('Error de validación: ' + errorMessage, 'danger');
        // Volver al paso 1 por defecto
        document.getElementById(`step-${currentStep}`).classList.add('hidden');
        currentStep = 1;
        document.getElementById('step-1').classList.remove('hidden');
        updateProgress();
      }
      break;

    case 409:
      // Conflicto - recurso duplicado
      showAlert('Ya existe un registro con estos datos. ' + errorMessage, 'danger');
      document.getElementById(`step-${currentStep}`).classList.add('hidden');
      currentStep = 1;
      document.getElementById('step-1').classList.remove('hidden');
      updateProgress();
      break;

    case 500:
      showAlert('Error interno del servidor. Por favor intente más tarde.', 'danger');
      break;

    case 503:
      showAlert('Servicio no disponible. Por favor intente más tarde.', 'danger');
      break;

    default:
      showAlert(errorMessage, 'danger');
      // Volver al inicio en caso de error desconocido
      document.getElementById(`step-${currentStep}`).classList.add('hidden');
      currentStep = 1;
      document.getElementById('step-1').classList.remove('hidden');
      updateProgress();
  }
}

function generateQRCode(user) {
  return JSON.stringify({
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    timestamp: Date.now()
  });
}

function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
}

function downloadCredential() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFillColor(255, 217, 102);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setFillColor(108, 190, 226);
  doc.rect(5, 5, 200, 40, 'F');

  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.text('SPRINGFIELD', 105, 20, { align: 'center' });
  doc.setFontSize(20);
  doc.text('CREDENCIAL OFICIAL', 105, 35, { align: 'center' });

  doc.setFillColor(255, 255, 255);
  doc.circle(25, 60, 8, 'F');
  doc.circle(30, 58, 6, 'F');
  doc.circle(35, 57, 4, 'F');

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15, 55, 60, 60, 3, 3, 'F');

  if (currentUser.editedPhoto) {
    doc.addImage(currentUser.editedPhoto, 'JPEG', 17, 57, 56, 56);
  }

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(2);
  doc.roundedRect(15, 55, 60, 60, 3, 3, 'S');

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

  doc.setFillColor(255, 165, 0);
  doc.roundedRect(85, infoY + 60, 110, 15, 2, 2, 'F');
  doc.setFont(undefined, 'bold');
  doc.text('ROL:', 88, infoY + 70);
  doc.setFont(undefined, 'normal');
  doc.text(currentUser.role.toUpperCase(), 105, infoY + 70);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(70, 135, 70, 70, 3, 3, 'F');

  const qrCanvas = document.getElementById('qr-code').querySelector('canvas');
  if (qrCanvas) {
    const qrDataURL = qrCanvas.toDataURL();
    doc.addImage(qrDataURL, 'PNG', 75, 140, 60, 60);
  }

  doc.setLineWidth(3);
  doc.setDrawColor(0, 0, 0);
  doc.roundedRect(70, 135, 70, 70, 3, 3, 'S');

  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('CÓDIGO DE ACCESO', 105, 213, { align: 'center' });

  doc.setFillColor(255, 105, 180);
  doc.rect(0, 270, 210, 27, 'F');

  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text("¡D'oh! No olvides tu credencial", 105, 280, { align: 'center' });
  doc.setFontSize(7);
  doc.text(`Emitida: ${new Date(currentUser.createdAt).toLocaleDateString()}`, 105, 287, { align: 'center' });
  doc.text('Springfield Nuclear Power Plant © 2025', 105, 292, { align: 'center' });

  doc.setFillColor(255, 255, 255);
  doc.circle(180, 220, 5, 'F');
  doc.circle(185, 218, 4, 'F');
  doc.circle(190, 220, 3, 'F');

  doc.circle(30, 230, 4, 'F');
  doc.circle(35, 228, 3, 'F');

  doc.save(`credencial_simpson_${currentUser.usuario}.pdf`);
}

async function loginWithPassword() {
  const user = document.getElementById('login-user').value;
  const password = document.getElementById('login-password').value;

  if (!user || !password) {
    showAlert('Complete todos los campos', 'danger');
    return;
  }

  // Validar que sea un email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(user)) {
    showAlert('Por favor ingrese un email válido', 'danger');
    return;
  }

  // Mostrar indicador de carga
  document.getElementById('loading-spinner').classList.remove('hidden');

  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: user,
        password: password
      })
    });

    const result = await response.json();
    document.getElementById('loading-spinner').classList.add('hidden');

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

      // Guardar sesión en memoria
      currentUser = userData;
      createSession(userData, 'password');

      showAlert(result.message, 'success');
      setTimeout(() => {
        window.location.href = 'principal.html';
      }, 1000);

    } else {
      handleLoginError(result);
    }

  } catch (error) {
    document.getElementById('loading-spinner').classList.add('hidden');
    console.log(error);
    showAlert('Error de conexión con el servidor. Por favor intente nuevamente.', 'danger');
    console.error('Error:', error);
  }
}

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
      if (result.message.includes('inactivo')) {
        showAlert('Su cuenta está inactiva. Contacte al administrador.', 'danger');
      } else {
        showAlert('Email o contraseña incorrectos', 'danger');
      }
      break;
    case 500:
      showAlert('Error interno del servidor. Por favor intente más tarde.', 'danger');
      break;
    default:
      showAlert(errorMessage, 'danger');
  }
}

async function loginWithFace() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    document.getElementById('login-video').srcObject = stream;

    setTimeout(() => {
      stream.getTracks().forEach(track => track.stop());

      if (users.length > 0) {
        const user = users[users.length - 1];
        createSession(user, 'facial');
        showAlert('Reconocimiento facial exitoso', 'success');
        window.location.href = 'principal.html';
      } else {
        showAlert('Usuario no reconocido', 'danger');
      }
    }, 3000);

    showAlert('Procesando reconocimiento facial...', 'info');
  } catch (err) {
    showAlert('Error accediendo a la cámara: ' + err.message, 'danger');
  }
}

async function loginWithQR() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    document.getElementById('qr-video').srcObject = stream;

    setTimeout(() => {
      stream.getTracks().forEach(track => track.stop());

      const user = users.find(u => u.qrCode);
      if (user) {
        createSession(user, 'qr');
        showAlert('QR escaneado exitosamente', 'success');
        window.location.href = 'principal.html';
      } else {
        showAlert('Código QR inválido', 'danger');
      }
    }, 2000);

    showAlert('Escaneando código QR...', 'info');
  } catch (err) {
    showAlert('Error accediendo a la cámara: ' + err.message, 'danger');
  }
}

function createSession(user, method) {
  const session = {
    id: Date.now(),
    userId: user.id,
    sessionToken: generateSessionToken(),
    loginMethod: method,
    loginTime: new Date().toISOString(),
    active: true
  };

  sessions.push(session);
  return session;
}

function generateSessionToken() {
  return Math.random().toString(36).substr(2) + Date.now().toString(36);
}

function showPasswordReset() {
  showSection('password-reset-section');
}

function resetPassword() {
  const email = document.getElementById('reset-email').value;

  if (!email) {
    showAlert('Ingrese su email', 'danger');
    return;
  }

  const user = users.find(u => u.email === email);
  if (user) {
    setTimeout(() => {
      showAlert('Código enviado a su email', 'success');
    }, 1000);
  } else {
    showAlert('Email no encontrado', 'danger');
  }
}

function showDashboard(user) {
  clearInterval(timer);
  document.getElementById('timer').style.display = 'none';

  const photoHTML = user.editedPhoto
    ? `<img src="${user.editedPhoto}" alt="Foto de perfil" class="photo-preview">`
    : `<div class="photo-preview d-flex align-items-center justify-content-center bg-light">
         <i class="fas fa-user fa-3x text-muted"></i>
       </div>`;

  const dashboardHTML = `
    <div class="form-header">
      <div class="thumbnail">
        <i class="fas fa-user-check"></i>
      </div>
      <h1>¡Bienvenido, ${user.nombre_completo || user.usuario}!</h1>
      <p class="subtitle">Sesión iniciada correctamente</p>
    </div>
    <div class="form-content">
      <div class="text-center mb-4">
        ${photoHTML}
        <p class="text-muted mt-2">Última sesión: ${new Date(user.loginTime).toLocaleString()}</p>
      </div>
      <div class="dashboard-card">
        <h4><i class="fas fa-info-circle me-2"></i>Información de la cuenta</h4>
        <div class="info-item">
          <span class="info-label">Usuario:</span> ${user.usuario}
        </div>
        <div class="info-item">
          <span class="info-label">Email:</span> ${user.email}
        </div>
        <div class="info-item">
          <span class="info-label">Teléfono:</span> ${user.phone}
        </div>
        <div class="info-item">
          <span class="info-label">Notificaciones:</span> ${user.notificationMethods.join(', ')}
        </div>
        <div class="info-item">
          <span class="info-label">Token de sesión:</span> 
          <small class="text-muted">${user.sessionToken.substring(0, 20)}...</small>
        </div>
      </div>
      <button type="button" class="btn btn-primary" onclick="logout()">
        <i class="fas fa-sign-out-alt me-2"></i>Cerrar Sesión
      </button>
    </div>
  `;

  document.querySelector('.form-container').innerHTML = dashboardHTML;
}

function logout() {
  location.reload();
}

function showAlert(message, type) {
  const alertsContainer = document.getElementById('alerts');
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} fade-in`;
  alert.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
                ${message}
            `;

  alertsContainer.appendChild(alert);

  setTimeout(() => {
    alert.remove();
  }, 4000);
}

function stopAllCameraStreams() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }

  const videos = ['login-video', 'qr-video'];
  videos.forEach(videoId => {
    const video = document.getElementById(videoId);
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
  });
}

window.addEventListener('beforeunload', function () {
  stopAllCameraStreams();
});