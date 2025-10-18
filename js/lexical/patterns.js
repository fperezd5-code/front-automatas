// js/lexical/patterns.js - Patrones para análisis léxico de documentos en diferentes idiomas

/**
 * Obtiene los pronombres personales según el idioma
 * @param {string} language - Código del idioma
 * @returns {Array} - Array de pronombres
 */
function getPersonalPronouns(language) {
  const pronouns = {
    es: ['yo', 'tú', 'él', 'ella', 'nosotros', 'nosotras', 'vosotros', 'vosotras', 'ellos', 'ellas', 
         'me', 'te', 'le', 'nos', 'os', 'les', 'mí', 'ti', 'sí', 'conmigo', 'contigo', 'consigo'],
    en: ['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
         'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs'],
    ar: ['أنا', 'أنت', 'أنتِ', 'هو', 'هي', 'نحن', 'أنتم', 'أنتن', 'هم', 'هن']
  };

  return pronouns[language] || pronouns.es;
}

/**
 * Obtiene palabras comunes (stopwords) según el idioma
 * @param {string} language - Código del idioma
 * @returns {Array} - Array de stopwords
 */
function getStopWords(language) {
  const stopwords = {
    es: ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'haber', 'por', 'con', 
         'su', 'para', 'como', 'estar', 'tener', 'le', 'lo', 'todo', 'pero', 'más', 'hacer', 
         'o', 'poder', 'decir', 'este', 'ir', 'otro', 'ese', 'la', 'si', 'me', 'ya', 'ver', 
         'porque', 'dar', 'cuando', 'él', 'muy', 'sin', 'vez', 'mucho', 'saber', 'qué', 'sobre',
         'mi', 'alguno', 'mismo', 'yo', 'también', 'hasta', 'año', 'dos', 'querer', 'entre',
         'así', 'primero', 'desde', 'grande', 'eso', 'ni', 'nos', 'llegar', 'pasar', 'tiempo',
         'ella', 'sí', 'día', 'uno', 'bien', 'poco', 'deber', 'entonces', 'poner', 'cosa', 'tanto',
         'hombre', 'parecer', 'nuestro', 'tan', 'donde', 'ahora', 'parte', 'después', 'vida',
         'quedar', 'siempre', 'creer', 'hablar', 'llevar', 'dejar', 'nada', 'cada', 'seguir',
         'menos', 'nuevo', 'encontrar', 'algo', 'solo', 'decir', 'salir', 'volver', 'tomar',
         'conocer', 'vivir', 'sentir', 'tratar', 'mirar', 'contar', 'empezar', 'esperar',
         'buscar', 'existir', 'entrar', 'trabajar', 'escribir', 'perder', 'producir', 'ocurrir'],
    en: ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on',
         'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we',
         'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
         'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when',
         'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into',
         'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now',
         'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two',
         'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any',
         'these', 'give', 'day', 'most', 'us', 'is', 'was', 'are', 'been', 'has', 'had', 'were',
         'said', 'did', 'having', 'may', 'should', 'am', 'being', 'does'],
    ar: ['في', 'من', 'على', 'إلى', 'هذا', 'هذه', 'ذلك', 'التي', 'الذي', 'أن', 'لا', 'ما', 'قد',
         'كان', 'يكون', 'لم', 'إن', 'كل', 'عن', 'أو', 'هل', 'له', 'بعد', 'عند', 'غير', 'بين',
         'كما', 'حتى', 'منذ', 'قبل', 'خلال', 'بدون', 'مع', 'ضد', 'نحو', 'فوق', 'تحت']
  };

  return stopwords[language] || stopwords.es;
}

/**
 * Obtiene el nombre completo del idioma
 * @param {string} language - Código del idioma
 * @returns {string} - Nombre completo
 */
function getLanguageName(language) {
  const names = {
    es: 'Español (Latinoamérica)',
    en: 'Inglés (Estados Unidos)',
    ar: 'Árabe (Egipto)'
  };

  return names[language] || language.toUpperCase();
}

/**
 * Detecta si una palabra está en mayúscula inicial (posible nombre propio)
 * @param {string} word - Palabra a verificar
 * @returns {boolean} - true si parece nombre propio
 */
function isCapitalized(word) {
  return word.length > 0 && word[0] === word[0].toUpperCase() && word.slice(1) === word.slice(1).toLowerCase();
}

/**
 * Limpia una palabra de puntuación
 * @param {string} word - Palabra a limpiar
 * @returns {string} - Palabra limpia
 */
function cleanWord(word) {
  return word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()¿?¡!"""''«»]/g, '').toLowerCase();
}

/**
 * Obtiene patrones de verbos comunes según el idioma
 * @param {string} language - Código del idioma
 * @returns {Array} - Array de patrones de verbos
 */
function getCommonVerbs(language) {
  const verbs = {
    es: ['ser', 'estar', 'haber', 'tener', 'hacer', 'poder', 'decir', 'ir', 'ver', 'dar', 'saber',
         'querer', 'llegar', 'pasar', 'deber', 'poner', 'parecer', 'quedar', 'creer', 'hablar',
         'llevar', 'dejar', 'seguir', 'encontrar', 'llamar', 'venir', 'pensar', 'salir', 'volver',
         'tomar', 'conocer', 'vivir', 'sentir', 'tratar', 'mirar', 'contar', 'empezar', 'esperar',
         'buscar', 'existir', 'entrar', 'trabajar', 'escribir', 'perder', 'producir', 'ocurrir',
         'comprender', 'servir', 'sacar', 'necesitar', 'mantener', 'resultar', 'leer', 'caer',
         'cambiar', 'presentar', 'crear', 'abrir', 'considerar', 'oír', 'terminar', 'permitir',
         'aparecer', 'conseguir', 'comenzar', 'explicar', 'nacer', 'reconocer', 'estudiar'],
    en: ['be', 'have', 'do', 'say', 'get', 'make', 'go', 'know', 'take', 'see', 'come', 'think',
         'look', 'want', 'give', 'use', 'find', 'tell', 'ask', 'work', 'seem', 'feel', 'try',
         'leave', 'call', 'keep', 'let', 'begin', 'help', 'show', 'hear', 'play', 'run', 'move',
         'like', 'live', 'believe', 'bring', 'happen', 'write', 'sit', 'stand', 'lose', 'pay',
         'meet', 'include', 'continue', 'set', 'learn', 'change', 'lead', 'understand', 'watch',
         'follow', 'stop', 'create', 'speak', 'read', 'spend', 'grow', 'open', 'walk', 'win',
         'teach', 'offer', 'remember', 'consider', 'appear', 'buy', 'serve', 'die', 'send',
         'expect', 'build', 'stay', 'fall', 'cut', 'reach', 'kill', 'raise', 'pass', 'sell'],
    ar: ['كان', 'قال', 'ذهب', 'جاء', 'عمل', 'رأى', 'أخذ', 'وجد', 'أعطى', 'عرف', 'فعل', 'جعل',
         'ترك', 'وضع', 'سمع', 'قرأ', 'كتب', 'فهم', 'حصل', 'طلب', 'بدأ', 'انتهى', 'ظهر', 'حدث']
  };

  return verbs[language] || verbs.es;
}

/**
 * Obtiene patrones de sustantivos comunes según el idioma
 * @param {string} language - Código del idioma
 * @returns {Array} - Array de sustantivos comunes
 */
function getCommonNouns(language) {
  const nouns = {
    es: ['persona', 'año', 'tiempo', 'día', 'cosa', 'hombre', 'mujer', 'niño', 'país', 'parte',
         'casa', 'mundo', 'vida', 'mano', 'lugar', 'trabajo', 'caso', 'forma', 'grupo', 'número',
         'problema', 'agua', 'punto', 'momento', 'sistema', 'ciudad', 'mesa', 'libro', 'coche',
         'idea', 'familia', 'madre', 'padre', 'hijo', 'cuerpo', 'pueblo', 'palabra', 'ejemplo',
         'manera', 'razón', 'gobierno', 'empresa', 'servicio', 'hijo', 'precio', 'derecho', 'dato',
         'cuenta', 'estado', 'pregunta', 'programa', 'resultado', 'desarrollo', 'proceso', 'modelo'],
    en: ['time', 'person', 'year', 'way', 'day', 'thing', 'man', 'world', 'life', 'hand', 'part',
         'child', 'eye', 'woman', 'place', 'work', 'week', 'case', 'point', 'government', 'company',
         'number', 'group', 'problem', 'fact', 'water', 'room', 'mother', 'area', 'money', 'story',
         'result', 'morning', 'lot', 'right', 'study', 'book', 'word', 'business', 'issue', 'side',
         'kind', 'head', 'house', 'service', 'friend', 'father', 'power', 'hour', 'game', 'line',
         'end', 'member', 'law', 'car', 'city', 'community', 'name', 'president', 'team', 'minute'],
    ar: ['شخص', 'وقت', 'يوم', 'عام', 'بيت', 'عمل', 'مكان', 'حياة', 'رجل', 'امرأة', 'طفل', 'عالم',
         'بلد', 'مدينة', 'حكومة', 'كتاب', 'ماء', 'يد', 'عين', 'رأس', 'جزء', 'طريقة', 'مشكلة']
  };

  return nouns[language] || nouns.es;
}