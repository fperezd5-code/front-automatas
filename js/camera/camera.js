// js/camera/camera.js - Manejo de la cámara

let mediaStream = null;

/**
 * Inicia la cámara para captura de foto
 */
async function startCamera() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }
    });
    const videoElement = document.getElementById('video');
    if (videoElement) {
      videoElement.srcObject = mediaStream;
    }
  } catch (err) {
    showAlert('No se pudo acceder a la cámara: ' + err.message, 'danger');
    console.error('Error accediendo a la cámara:', err);
  }
}

/**
 * Detiene el stream de la cámara actual
 */
function stopCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
}

/**
 * Obtiene el stream de medios actual
 * @returns {MediaStream|null} - Stream de medios
 */
function getMediaStream() {
  return mediaStream;
}

/**
 * Verifica si la cámara está activa
 * @returns {boolean} - true si está activa
 */
function isCameraActive() {
  return mediaStream !== null && mediaStream.active;
}