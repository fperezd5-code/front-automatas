// js/lexical/analyzer.js - Análisis léxico para documentos de texto

/**
 * Realiza el análisis léxico completo de un documento
 * @param {string} content - Contenido del documento
 * @param {string} language - Idioma del documento
 * @returns {object} - Resultados del análisis
 */
function performLexicalAnalysis(content, language, fileName = 'unknown.txt') {
  if (!content || !language) {
    throw new Error('Debe proporcionar contenido y lenguaje');
  }

  console.log('Iniciando análisis léxico...');
  console.log('Idioma:', language);
  console.log('Longitud del contenido:', content.length);

  try {
    // Obtener palabras del documento
    const words = extractWords(content);
    
    // Calcular frecuencias
    const wordFrequency = calculateWordFrequency(words, language);
    
    // Identificar pronombres personales
    const pronouns = identifyPronouns(words, language);
    
    // Identificar posibles nombres propios
    const personNames = identifyPersonNames(content, language);
    
    // Identificar verbos
    const verbs = identifyVerbs(words, language);
    
    // Identificar sustantivos
    const nouns = identifyNouns(words, language);
    
    // Calcular estadísticas
    const statistics = calculateDocumentStatistics(content, words, wordFrequency);
    
    // Obtener palabras más y menos frecuentes
    const mostFrequent = getMostFrequentWords(wordFrequency, 10);
    const leastFrequent = getLeastFrequentWords(wordFrequency, 10);
    
    // Clasificaciones adicionales
    const additionalClassifications = performAdditionalClassifications(words, language);

    const result = {
      language: language,
      languageName: getLanguageName(language),
      fileName: fileName,
      processDate: new Date().toISOString(),
      originalContent: content,
      statistics: statistics,
      mostFrequent: mostFrequent,
      leastFrequent: leastFrequent,
      pronouns: pronouns,
      personNames: personNames,
      verbs: verbs,
      nouns: nouns,
      additionalClassifications: additionalClassifications,
      success: true
    };

    // Guardar automáticamente para que la UI o sesiones previas puedan recuperarlo
    try { saveAnalysisResults(result); } catch (e) { console.error('No se pudo guardar resultados:', e); }
    console.log('Análisis completado exitosamente');
    return result;

  } catch (error) {
    console.error('Error en análisis léxico:', error);
    throw error;
  }
}

/**
 * Extrae todas las palabras del contenido
 * @param {string} content - Contenido
 * @returns {Array} - Array de palabras
 */
function extractWords(content) {
  // Eliminar números y símbolos, mantener solo letras
  const cleaned = content.replace(/[0-9]/g, ' ');
  
  // Dividir en palabras
  const words = cleaned
    .toLowerCase()
    .split(/\s+/)
    .map(word => cleanWord(word))
    .filter(word => word.length > 0);
  
  return words;
}

/**
 * Calcula la frecuencia de cada palabra
 * @param {Array} words - Array de palabras
 * @param {string} language - Idioma
 * @returns {Map} - Mapa de frecuencias
 */
function calculateWordFrequency(words, language) {
  const frequency = new Map();
  const stopwords = getStopWords(language);
  
  words.forEach(word => {
    // Filtrar stopwords
    if (!stopwords.includes(word) && word.length > 2) {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    }
  });
  
  return frequency;
}

/**
 * Identifica pronombres personales
 * @param {Array} words - Array de palabras
 * @param {string} language - Idioma
 * @returns {Array} - Pronombres encontrados con frecuencia
 */
function identifyPronouns(words, language) {
  const pronounList = getPersonalPronouns(language);
  const found = new Map();
  
  words.forEach(word => {
    if (pronounList.includes(word)) {
      found.set(word, (found.get(word) || 0) + 1);
    }
  });
  
  return Array.from(found.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Identifica posibles nombres de personas
 * @param {string} content - Contenido original
 * @param {string} language - Idioma
 * @returns {Array} - Nombres encontrados
 */
function identifyPersonNames(content, language) {
  const names = new Set();
  const lines = content.split('\n');
  
  lines.forEach(line => {
    // Buscar palabras que empiecen con mayúscula
    const words = line.split(/\s+/);
    words.forEach(word => {
      const cleaned = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()¿?¡!"""''«»]/g, '');
      
      // Verificar si está capitalizada y no es la primera palabra de una oración
      if (cleaned.length > 2 && isCapitalized(cleaned)) {
        const lowerWord = cleaned.toLowerCase();
        const stopwords = getStopWords(language);
        
        // No agregar si es una stopword
        if (!stopwords.includes(lowerWord)) {
          names.add(cleaned);
        }
      }
    });
  });
  
  return Array.from(names).slice(0, 20); // Limitar a 20 nombres
}

/**
 * Identifica verbos
 * @param {Array} words - Array de palabras
 * @param {string} language - Idioma
 * @returns {Array} - Verbos encontrados
 */
function identifyVerbs(words, language) {
  const verbList = getCommonVerbs(language);
  const found = new Map();
  
  words.forEach(word => {
    // Buscar coincidencias exactas o raíces
    verbList.forEach(verb => {
      if (word === verb || word.startsWith(verb)) {
        found.set(verb, (found.get(verb) || 0) + 1);
      }
    });
  });
  
  return Array.from(found.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20); // Top 20 verbos
}

/**
 * Identifica sustantivos
 * @param {Array} words - Array de palabras
 * @param {string} language - Idioma
 * @returns {Array} - Sustantivos encontrados
 */
function identifyNouns(words, language) {
  const nounList = getCommonNouns(language);
  const found = new Map();
  
  words.forEach(word => {
    // Buscar coincidencias exactas o raíces
    nounList.forEach(noun => {
      if (word === noun || word.startsWith(noun)) {
        found.set(noun, (found.get(noun) || 0) + 1);
      }
    });
  });
  
  return Array.from(found.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20); // Top 20 sustantivos
}

/**
 * Calcula estadísticas del documento
 * @param {string} content - Contenido original
 * @param {Array} words - Palabras extraídas
 * @param {Map} wordFrequency - Frecuencia de palabras
 * @returns {object} - Estadísticas
 */
function calculateDocumentStatistics(content, words, wordFrequency) {
  const lines = content.split('\n');
  
  return {
    totalWords: words.length,
    uniqueWords: wordFrequency.size,
    totalCharacters: content.length,
    totalLines: lines.length,
    averageWordLength: words.reduce((sum, word) => sum + word.length, 0) / words.length || 0,
    averageWordsPerLine: words.length / lines.length || 0
  };
}

/**
 * Obtiene las palabras más frecuentes
 * @param {Map} frequency - Mapa de frecuencias
 * @param {number} limit - Límite de resultados
 * @returns {Array} - Palabras más frecuentes
 */
function getMostFrequentWords(frequency, limit = 10) {
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

/**
 * Obtiene las palabras menos frecuentes
 * @param {Map} frequency - Mapa de frecuencias
 * @param {number} limit - Límite de resultados
 * @returns {Array} - Palabras menos frecuentes
 */
function getLeastFrequentWords(frequency, limit = 10) {
  return Array.from(frequency.entries())
    .sort((a, b) => a[1] - b[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

/**
 * Realiza clasificaciones adicionales
 * @param {Array} words - Array de palabras
 * @param {string} language - Idioma
 * @returns {object} - Clasificaciones adicionales
 */
function performAdditionalClassifications(words, language) {
  // Longitud de palabras
  const shortWords = words.filter(w => w.length <= 3).length;
  const mediumWords = words.filter(w => w.length > 3 && w.length <= 7).length;
  const longWords = words.filter(w => w.length > 7).length;
  
  return {
    wordLengthDistribution: {
      short: shortWords,
      medium: mediumWords,
      long: longWords
    }
  };
}

/**
 * Guarda los resultados del análisis
 * @param {object} results - Resultados
 */
function saveAnalysisResults(results) {
  try {
    localStorage.setItem('lastAnalysisResults', JSON.stringify(results));
    localStorage.setItem('lastAnalysisDate', new Date().toISOString());
    console.log('Resultados guardados en localStorage');
  } catch (error) {
    console.error('Error guardando resultados:', error);
  }
}

/**
 * Recupera los últimos resultados
 * @returns {object|null} - Resultados o null
 */
function getLastAnalysisResults() {
  try {
    const results = localStorage.getItem('lastAnalysisResults');
    return results ? JSON.parse(results) : null;
  } catch (error) {
    console.error('Error recuperando resultados:', error);
    return null;
  }
}