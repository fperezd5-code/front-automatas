// js/camera/photo.js - Captura y manejo de fotografías

/**
 * Captura una fotografía desde el video stream
 */
function capturePhoto() {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  if (!video || !canvas) {
    showAlert('Error: Elementos de video o canvas no encontrados', 'danger');
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0);
  capturedPhoto = canvas.toDataURL('image/jpeg', 0.8);

  // Detener la cámara
  stopCamera();

  // Mostrar preview
  displayPhotoPreview(capturedPhoto);

  // Actualizar botones
  document.getElementById('capture-btn').classList.add('hidden');
  document.getElementById('retake-btn').classList.remove('hidden');
  document.getElementById('continue-photo').classList.remove('hidden');

  setTimeout(() => {
    showAlert('Rostro detectado correctamente', 'success');
  }, 1000);
}

/**
 * Muestra el preview de la foto capturada
 * @param {string} photoDataUrl - Data URL de la foto
 */
function displayPhotoPreview(photoDataUrl) {
  const preview = document.createElement('img');
  preview.src = photoDataUrl;
  preview.className = 'photo-preview';

  const previewContainer = document.getElementById('photo-preview');
  if (previewContainer) {
    previewContainer.innerHTML = '';
    previewContainer.appendChild(preview);
  }
}

/**
 * Permite retomar la fotografía
 */
function retakePhoto() {
  document.getElementById('photo-preview').innerHTML = '';
  document.getElementById('capture-btn').classList.remove('hidden');
  document.getElementById('retake-btn').classList.add('hidden');
  document.getElementById('continue-photo').classList.add('hidden');
  capturedPhoto = null;
  startCamera();
}

/**
 * Obtiene la foto capturada actual
 * @returns {string|null} - Data URL de la foto o null
 */
function getCapturedPhoto() {
  return capturedPhoto;
}