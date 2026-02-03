// js/utils/storage.js - Manejo de almacenamiento local

/**
 * Guarda datos del usuario en sessionStorage
 * @param {object} userData - Datos del usuario
 */
function saveUserSession(userData) {
  try {
    sessionStorage.setItem('currentUser', JSON.stringify(userData));
    sessionStorage.setItem('userName', userData.usuario || userData.nombre_completo);
    sessionStorage.setItem('userEmail', userData.email);
    sessionStorage.setItem('sessionToken', userData.sessionToken);
    sessionStorage.setItem('loginTime', new Date().toISOString());
  } catch (error) {
    console.error('Error guardando sesión:', error);
  }
}

/**
 * Obtiene los datos del usuario desde sessionStorage
 * @returns {object|null} - Datos del usuario o null si no existe
 */
function getUserSession() {
  try {
    const userData = sessionStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error obteniendo sesión:', error);
    return null;
  }
}

/**
 * Verifica si hay una sesión activa
 * @returns {boolean} - true si hay sesión activa
 */
function hasActiveSession() {
  return sessionStorage.getItem('sessionToken') !== null;
}

/**
 * Limpia la sesión del usuario
 */
function clearUserSession() {
  sessionStorage.clear();
}

/**
 * Obtiene el nombre del usuario
 * @returns {string} - Nombre del usuario o 'Usuario' por defecto
 */
function getUserName() {
  return sessionStorage.getItem('userName') || 'Usuario';
}

/**
 * Obtiene el email del usuario
 * @returns {string|null} - Email del usuario
 */
function getUserEmail() {
  return sessionStorage.getItem('userEmail');
}

/**
 * Obtiene el token de sesión
 * @returns {string|null} - Token de sesión
 */
function getSessionToken() {
  return sessionStorage.getItem('sessionToken');
}

/**
 * Guarda resultados de análisis en sessionStorage
 * @param {object} results - Resultados del análisis
 */
function saveAnalysisResults(results) {
  try {
    sessionStorage.setItem('lastAnalysis', JSON.stringify(results));
    sessionStorage.setItem('lastAnalysisDate', new Date().toISOString());
  } catch (error) {
    console.error('Error guardando resultados:', error);
  }
}

/**
 * Obtiene los últimos resultados de análisis
 * @returns {object|null} - Resultados del análisis
 */
function getAnalysisResults() {
  try {
    const results = sessionStorage.getItem('lastAnalysis');
    return results ? JSON.parse(results) : null;
  } catch (error) {
    console.error('Error obteniendo resultados:', error);
    return null;
  }
}

/**
 * Obtiene la fecha del último análisis
 * @returns {string|null} - Fecha en formato ISO
 */
function getLastAnalysisDate() {
  return sessionStorage.getItem('lastAnalysisDate');
}

/**
 * Guarda preferencias del usuario
 * @param {object} preferences - Objeto con preferencias
 */
function saveUserPreferences(preferences) {
  try {
    sessionStorage.setItem('userPreferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('Error guardando preferencias:', error);
  }
}

/**
 * Obtiene las preferencias del usuario
 * @returns {object|null} - Preferencias del usuario
 */
function getUserPreferences() {
  try {
    const prefs = sessionStorage.getItem('userPreferences');
    return prefs ? JSON.parse(prefs) : null;
  } catch (error) {
    console.error('Error obteniendo preferencias:', error);
    return null;
  }
}

/**
 * Verifica si el usuario tiene un rol específico
 * @param {string} role - Rol a verificar
 * @returns {boolean} - true si el usuario tiene ese rol
 */
function userHasRole(role) {
  const user = getUserSession();
  return user && user.role === role;
}

/**
 * Actualiza un campo específico de la sesión del usuario
 * @param {string} field - Campo a actualizar
 * @param {any} value - Nuevo valor
 */
function updateUserSessionField(field, value) {
  try {
    const user = getUserSession();
    if (user) {
      user[field] = value;
      saveUserSession(user);
    }
  } catch (error) {
    console.error('Error actualizando campo de sesión:', error);
  }
}