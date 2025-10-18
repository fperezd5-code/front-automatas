// js/utils/api.js - Manejo de llamadas a la API

const API_BASE_URL = 'https://proyecto-automatas.onrender.com/api';

/**
 * Realiza una petición POST a la API
 * @param {string} endpoint - Endpoint de la API
 * @param {object} data - Datos a enviar
 * @returns {Promise<object>} - Respuesta de la API
 */
async function apiPost(endpoint, data) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    return { response, result };
  } catch (error) {
    console.error('Error en API:', error);
    throw error;
  }
}

/**
 * Realiza una petición GET a la API
 * @param {string} endpoint - Endpoint de la API
 * @returns {Promise<object>} - Respuesta de la API
 */
async function apiGet(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    return { response, result };
  } catch (error) {
    console.error('Error en API:', error);
    throw error;
  }
}

/**
 * Registra un nuevo usuario
 * @param {object} userData - Datos del usuario
 * @returns {Promise<object>} - Respuesta de la API
 */
async function registerUser(userData) {
  return await apiPost('/usuarios/registro', userData);
}

/**
 * Inicia sesión de usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<object>} - Respuesta de la API
 */
async function loginUser(email, password) {
  return await apiPost('/usuarios/login', { email, password });
}

/**
 * Envía un email con los resultados del análisis
 * @param {object} emailData - Datos del email a enviar
 * @returns {Promise<object>} - Respuesta de la API
 */
async function sendEmail(emailData) {
  try {
    const { response, result } = await apiPost('/email/send', emailData);
    
    if (response.ok) {
      return {
        success: true,
        message: result.message || 'Email enviado correctamente',
        data: result.data
      };
    } else {
      return {
        success: false,
        message: result.message || 'Error al enviar el email',
        error: result.error
      };
    }
  } catch (error) {
    console.error('Error enviando email:', error);
    return {
      success: false,
      message: 'Error de conexión al enviar el email',
      error: error.message
    };
  }
}