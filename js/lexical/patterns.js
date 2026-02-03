// js/lexical/patterns.js - Patrones mejorados para análisis léxico de documentos

/**
 * Obtiene los pronombres personales según el idioma
 * @param {string} language - Código del idioma
 * @returns {Array} - Array de pronombres
 */
function getPersonalPronouns(language) {
  const pronouns = {
    es: ['yo', 'tú', 'usted', 'él', 'ella', 'ello', 'nosotros', 'nosotras', 'vosotros', 'vosotras', 
         'ustedes', 'ellos', 'ellas', 'me', 'te', 'se', 'le', 'la', 'lo', 'nos', 'os', 'les', 'las', 'los',
         'mí', 'ti', 'sí', 'conmigo', 'contigo', 'consigo', 'mío', 'tuyo', 'suyo', 'nuestro', 'vuestro',
         'míos', 'tuyos', 'suyos', 'nuestros', 'vuestros', 'mía', 'tuya', 'suya', 'nuestra', 'vuestra',
         'mías', 'tuyas', 'suyas', 'nuestras', 'vuestras'],
    en: ['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
         'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs',
         'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'yourselves', 'themselves',
         'this', 'that', 'these', 'those', 'who', 'whom', 'whose', 'which', 'what'],
    ar: ['أنا', 'أنت', 'أنتِ', 'هو', 'هي', 'نحن', 'أنتم', 'أنتن', 'هم', 'هن',
         'ي', 'ك', 'ه', 'ها', 'نا', 'كم', 'كن', 'هم', 'هن']
  };

  return pronouns[language] || pronouns.es;
}

/**
 * Obtiene palabras comunes (stopwords) según el idioma - AMPLIADO
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
         'menos', 'nuevo', 'encontrar', 'algo', 'solo', 'salir', 'volver', 'tomar',
         'conocer', 'vivir', 'sentir', 'tratar', 'mirar', 'contar', 'empezar', 'esperar',
         'buscar', 'existir', 'entrar', 'trabajar', 'escribir', 'perder', 'producir', 'ocurrir',
         'ante', 'bajo', 'cabe', 'contra', 'durante', 'mediante', 'según', 'tras', 'versus', 'vía',
         'cual', 'cuales', 'cuyo', 'cuya', 'cuyos', 'cuyas', 'quien', 'quienes',
         'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas', 'aquel', 'aquella', 'aquellos', 'aquellas',
         'mí', 'ti', 'él', 'ella', 'nosotros', 'vosotros', 'ellos', 'ellas', 'usted', 'ustedes',
         'sido', 'siendo', 'son', 'somos', 'soy', 'eres', 'es', 'era', 'éramos', 'eran', 'fueron', 'fue',
         'ha', 'han', 'has', 'había', 'habían', 'habíamos', 'he', 'hemos', 'hubiera', 'hubieran',
         'tiene', 'tienen', 'tienes', 'tenía', 'teníamos', 'tenían', 'tuvo', 'tuvieron', 'tuvimos',
         'puede', 'pueden', 'puedes', 'podía', 'podían', 'pudo', 'pudieron', 'podrá', 'podrán',
         'va', 'van', 'vas', 'iba', 'iban', 'íbamos', 'fue', 'fueron', 'fuimos', 'irá', 'irán',
         'dice', 'dicen', 'dices', 'decía', 'decían', 'dijo', 'dijeron', 'dirá', 'dirán',
         'hace', 'hacen', 'haces', 'hacía', 'hacían', 'hizo', 'hicieron', 'hará', 'harán',
         'los', 'las', 'unos', 'unas', 'del', 'al'],
    en: ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on',
         'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we',
         'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
         'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when',
         'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into',
         'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now',
         'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two',
         'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any',
         'these', 'give', 'day', 'most', 'us', 'is', 'was', 'are', 'been', 'has', 'had', 'were',
         'said', 'did', 'having', 'may', 'should', 'am', 'being', 'does', 'done', 'doing',
         'would', 'could', 'should', 'might', 'must', 'shall', 'can', 'will',
         'very', 'through', 'before', 'where', 'too', 'why', 'such', 'each', 'own', 'since',
         'during', 'against', 'between', 'under', 'above', 'both', 'until', 'while', 'across',
         'within', 'without', 'toward', 'towards', 'upon', 'among', 'amongst', 'around',
         'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'themselves',
         'another', 'much', 'many', 'few', 'several', 'every', 'either', 'neither'],
    ar: ['في', 'من', 'على', 'إلى', 'هذا', 'هذه', 'ذلك', 'التي', 'الذي', 'أن', 'لا', 'ما', 'قد',
         'كان', 'يكون', 'لم', 'إن', 'كل', 'عن', 'أو', 'هل', 'له', 'بعد', 'عند', 'غير', 'بين',
         'كما', 'حتى', 'منذ', 'قبل', 'خلال', 'بدون', 'مع', 'ضد', 'نحو', 'فوق', 'تحت',
         'هنا', 'هناك', 'الآن', 'دائما', 'أبدا', 'قط', 'أيضا', 'كذلك', 'فقط', 'جدا',
         'ثم', 'بعدئذ', 'حينئذ', 'اليوم', 'غدا', 'أمس', 'حين', 'عندما', 'بينما']
  };

  return stopwords[language] || stopwords.es;
}

/**
 * Obtiene títulos y prefijos comunes de nombres de personas
 * @param {string} language - Código del idioma
 * @returns {Array} - Array de títulos
 */
function getPersonTitles(language) {
  const titles = {
    es: ['sr', 'sra', 'srta', 'don', 'doña', 'dr', 'dra', 'prof', 'profa', 'ing', 'lic', 'arq',
         'señor', 'señora', 'señorita', 'doctor', 'doctora', 'profesor', 'profesora',
         'ingeniero', 'ingeniera', 'licenciado', 'licenciada', 'arquitecto', 'arquitecta',
         'capitán', 'coronel', 'general', 'teniente', 'sargento', 'padre', 'fray', 'hermano',
         'presidente', 'vicepresidente', 'ministro', 'ministra', 'alcalde', 'alcaldesa',
         'hermana', 'sor', 'san', 'santo', 'santa', 'beato', 'beata', 'papa', 'obispo',
         'arzobispo', 'cardenal', 'diácono', 'monseñor', 'reverendísimo', 'reverendo',
         'maestro', 'maestra', 'inspector', 'inspectora', 'director', 'directora',
         'subdirector', 'subdirectora', 'coordinador', 'coordinadora', 'jefe', 'jefa',
         'gerente', 'subgerente', 'decano', 'decana', 'rector', 'rectora', 'canciller'],
    en: ['mr', 'mrs', 'ms', 'miss', 'dr', 'prof', 'sir', 'lord', 'lady', 'rev', 'father',
         'mister', 'doctor', 'professor', 'captain', 'colonel', 'general', 'lieutenant',
         'sergeant', 'president', 'vice', 'minister', 'mayor', 'judge', 'senator', 'governor',
         'brother', 'sister', 'saint', 'st', 'reverend', 'bishop', 'archbishop', 'cardinal',
         'deacon', 'monsignor', 'master', 'inspector', 'director', 'dean', 'chancellor'],
    ar: ['السيد', 'السيدة', 'الآنسة', 'الدكتور', 'الدكتورة', 'الأستاذ', 'الأستاذة',
         'المهندس', 'المهندسة', 'الشيخ', 'الشيخة']
  };

  return titles[language] || titles.es;
}

/**
 * Obtiene nombres propios comunes por idioma
 * @param {string} language - Código del idioma
 * @returns {Array} - Array de nombres comunes
 */
function getCommonFirstNames(language) {
  const names = {
    es: ['juan', 'maría', 'josé', 'ana', 'pedro', 'luis', 'carmen', 'carlos', 'laura', 'miguel',
         'antonio', 'isabel', 'francisco', 'rosa', 'javier', 'marta', 'manuel', 'teresa', 'david',
         'elena', 'daniel', 'patricia', 'jorge', 'lucía', 'rafael', 'cristina', 'alejandro', 'beatriz',
         'fernando', 'silvia', 'andrés', 'mónica', 'alberto', 'raquel', 'pablo', 'pilar', 'sergio',
         'angeles', 'roberto', 'mercedes', 'ramón', 'dolores', 'enrique', 'amparo', 'ricardo', 'victoria',
         'gabriel', 'margarita', 'eduardo', 'julia', 'raúl', 'catalina', 'mario', 'gloria', 'diego',
         'clara', 'oscar', 'irene', 'samuel', 'alma', 'santiago', 'andrea', 'emilio', 'paula',
         'nicolás', 'natalia', 'adrián', 'sofía', 'mateo', 'valentina', 'lucas', 'camila', 'martín',
         'isabella', 'leonardo', 'daniela', 'sebastián', 'gabriela', 'matías', 'valeria',
         'jesús', 'guadalupe', 'rodrigo', 'fernanda', 'ángel', 'mariana', 'arturo', 'carolina',
         'hugo', 'adriana', 'gerardo', 'diana', 'mauricio', 'sandra', 'jaime', 'leticia',
         'ignacio', 'verónica', 'héctor', 'claudia', 'omar', 'susana', 'gustavo', 'lorena',
         'felipe', 'rocío', 'ramiro', 'cecilia', 'armando', 'eugenia', 'julio', 'olivia',
         'esteban', 'carmen', 'víctor', 'alicia', 'julio', 'luz', 'ernesto', 'esperanza'],
    en: ['james', 'john', 'robert', 'michael', 'william', 'david', 'richard', 'joseph', 'thomas',
         'charles', 'christopher', 'daniel', 'matthew', 'anthony', 'mark', 'donald', 'steven',
         'paul', 'andrew', 'joshua', 'kenneth', 'kevin', 'brian', 'george', 'edward', 'ronald',
         'timothy', 'jason', 'jeffrey', 'ryan', 'jacob', 'gary', 'nicholas', 'eric', 'jonathan',
         'mary', 'patricia', 'jennifer', 'linda', 'barbara', 'elizabeth', 'susan', 'jessica',
         'sarah', 'karen', 'nancy', 'lisa', 'betty', 'margaret', 'sandra', 'ashley', 'dorothy',
         'kimberly', 'emily', 'donna', 'michelle', 'carol', 'amanda', 'melissa', 'deborah',
         'stephanie', 'rebecca', 'sharon', 'laura', 'cynthia', 'kathleen', 'amy', 'shirley',
         'angela', 'helen', 'anna', 'brenda', 'pamela', 'nicole', 'emma', 'samantha', 'katherine',
         'sophia', 'olivia', 'ava', 'isabella', 'mia', 'charlotte', 'amelia', 'harper', 'evelyn',
         'benjamin', 'alexander', 'mason', 'ethan', 'noah', 'lucas', 'liam', 'oliver', 'elijah'],
    ar: ['محمد', 'أحمد', 'علي', 'حسن', 'حسين', 'عمر', 'خالد', 'يوسف', 'عبدالله', 'إبراهيم',
         'فاطمة', 'عائشة', 'خديجة', 'زينب', 'مريم', 'سارة', 'نور', 'ليلى', 'هدى', 'سلمى']
  };

  return names[language] || names.es;
}

/**
 * Obtiene apellidos comunes por idioma
 * @param {string} language - Código del idioma
 * @returns {Array} - Array de apellidos comunes
 */
function getCommonLastNames(language) {
  const surnames = {
    es: ['garcía', 'rodríguez', 'gonzález', 'fernández', 'lópez', 'martínez', 'sánchez', 'pérez',
         'gómez', 'martín', 'jiménez', 'ruiz', 'hernández', 'díaz', 'moreno', 'muñoz', 'álvarez',
         'romero', 'alonso', 'gutiérrez', 'navarro', 'torres', 'domínguez', 'vázquez', 'ramos',
         'gil', 'ramírez', 'serrano', 'blanco', 'suárez', 'molina', 'castro', 'ortega', 'rubio',
         'marín', 'sanz', 'iglesias', 'nuñez', 'medina', 'garrido', 'cortés', 'castillo', 'santos',
         'lozano', 'guerrero', 'cano', 'prieto', 'méndez', 'cruz', 'gallego', 'vidal', 'león',
         'herrera', 'peña', 'flores', 'cabrera', 'campos', 'vega', 'fuentes', 'carrasco', 'reyes',
         'delgado', 'aguilar', 'jimenez', 'morales', 'ortiz', 'rojas', 'roman', 'vargas', 'mendoza',
         'silva', 'castro', 'guzman', 'velasquez', 'acosta', 'herrera', 'santiago', 'mora',
         'contreras', 'luna', 'rios', 'montoya', 'valencia', 'figueroa', 'ochoa', 'parra'],
    en: ['smith', 'johnson', 'williams', 'brown', 'jones', 'garcia', 'miller', 'davis', 'rodriguez',
         'martinez', 'hernandez', 'lopez', 'gonzalez', 'wilson', 'anderson', 'thomas', 'taylor',
         'moore', 'jackson', 'martin', 'lee', 'perez', 'thompson', 'white', 'harris', 'sanchez',
         'clark', 'ramirez', 'lewis', 'robinson', 'walker', 'young', 'allen', 'king', 'wright',
         'scott', 'torres', 'nguyen', 'hill', 'flores', 'green', 'adams', 'nelson', 'baker',
         'hall', 'rivera', 'campbell', 'mitchell', 'carter', 'roberts', 'gomez', 'phillips',
         'evans', 'turner', 'diaz', 'parker', 'cruz', 'edwards', 'collins', 'reyes', 'stewart',
         'morris', 'morales', 'murphy', 'cook', 'rogers', 'morgan', 'peterson', 'cooper', 'reed',
         'bailey', 'bell', 'gomez', 'kelly', 'howard', 'ward', 'cox', 'diaz', 'richardson'],
    ar: ['العلي', 'المحمد', 'الأحمد', 'الحسن', 'الحسين', 'العمر', 'الخالد', 'اليوسف']
  };

  return surnames[language] || surnames.es;
}

/**
 * Palabras que NO son nombres de personas (lugares, organizaciones, etc.)
 * @param {string} language - Código del idioma
 * @returns {Array} - Array de palabras a excluir
 */
function getNonPersonNames(language) {
  const nonNames = {
    es: ['españa', 'madrid', 'barcelona', 'méxico', 'argentina', 'colombia', 'chile', 'perú',
         'venezuela', 'uruguay', 'paraguay', 'bolivia', 'ecuador', 'guatemala', 'honduras',
         'américa', 'europa', 'asia', 'áfrica', 'oceanía', 'atlántico', 'pacífico', 'caribe',
         'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre',
         'octubre', 'noviembre', 'diciembre', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes',
         'sábado', 'domingo', 'dios', 'cristo', 'jesús', 'virgen', 'san', 'santa', 'iglesia',
         // Palabras comunes que no son nombres
         'libro', 'libros', 'cuentos', 'cuento', 'mágicos', 'mágico', 'colección', 'índice',
         'pequeña', 'pequeño', 'luciérnaga', 'iluminó', 'bosque', 'página', 'páginas',
         'dragón', 'temia', 'fuego', 'biblioteca', 'flotante', 'reloj', 'detenia', 'sirena',
         'lago', 'capítulo', 'sección', 'parte', 'título', 'autor', 'autora', 'editorial',
         'historia', 'personaje', 'personajes', 'escena', 'acto', 'final', 'inicio', 'prólogo',
         'epílogo', 'contenido', 'resumen', 'introducción', 'conclusión', 'apéndice', 'anexo',
         'nota', 'notas', 'referencia', 'referencias', 'bibliografía', 'glosario', 'prefacio',
         'dedicatoria', 'agradecimientos', 'ilustración', 'ilustraciones', 'figura', 'figuras',
         'tabla', 'tablas', 'gráfico', 'gráficos', 'imagen', 'imágenes', 'foto', 'fotos',
         'príncipe', 'princesa', 'rey', 'reina', 'reino', 'castillo', 'palacio', 'torre',
         'montaña', 'montañas', 'río', 'ríos', 'valle', 'valles', 'ciudad', 'ciudades',
         'pueblo', 'pueblos', 'aldea', 'aldeas', 'villa', 'villas', 'capital', 'nación',
         'país', 'países', 'continente', 'continentes', 'océano', 'océanos', 'mar', 'mares',
         'isla', 'islas', 'península', 'cabo', 'bahía', 'puerto', 'costa', 'playa', 'desierto',
         'selva', 'jungla', 'pradera', 'llanura', 'meseta', 'cordillera', 'volcán', 'cueva',
         'norte', 'sur', 'este', 'oeste', 'arriba', 'abajo', 'derecha', 'izquierda',
         'primero', 'segundo', 'tercero', 'cuarto', 'quinto', 'sexto', 'séptimo', 'octavo',
         'noveno', 'décimo', 'último', 'penúltimo', 'anterior', 'siguiente', 'próximo'],
    en: ['america', 'europe', 'asia', 'africa', 'australia', 'canada', 'mexico', 'england',
         'france', 'germany', 'spain', 'italy', 'china', 'japan', 'india', 'brazil', 'russia',
         'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september',
         'october', 'november', 'december', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday',
         'saturday', 'sunday', 'god', 'christ', 'jesus', 'lord', 'church', 'saint',
         // Common words that are not names
         'book', 'books', 'story', 'stories', 'magical', 'magic', 'collection', 'index',
         'small', 'little', 'firefly', 'illuminated', 'forest', 'page', 'pages',
         'dragon', 'feared', 'fire', 'library', 'floating', 'clock', 'stopped', 'mermaid',
         'lake', 'chapter', 'section', 'part', 'title', 'author', 'publisher', 'history',
         'character', 'characters', 'scene', 'act', 'final', 'beginning', 'prologue',
         'epilogue', 'content', 'summary', 'introduction', 'conclusion', 'appendix',
         'note', 'notes', 'reference', 'references', 'bibliography', 'glossary', 'preface',
         'dedication', 'acknowledgments', 'illustration', 'illustrations', 'figure', 'figures',
         'table', 'tables', 'graph', 'graphs', 'image', 'images', 'photo', 'photos',
         'prince', 'princess', 'king', 'queen', 'kingdom', 'castle', 'palace', 'tower',
         'mountain', 'mountains', 'river', 'rivers', 'valley', 'valleys', 'city', 'cities',
         'town', 'towns', 'village', 'villages', 'capital', 'nation', 'country', 'countries',
         'continent', 'continents', 'ocean', 'oceans', 'sea', 'seas', 'island', 'islands',
         'north', 'south', 'east', 'west', 'first', 'second', 'third', 'fourth', 'fifth'],
    ar: ['الله', 'مصر', 'السعودية', 'الإمارات', 'الأردن', 'سوريا', 'العراق', 'لبنان',
         'كتاب', 'قصة', 'قصص', 'مجموعة', 'صفحة', 'فصل', 'جزء', 'عنوان', 'مؤلف']
  };

  return nonNames[language] || nonNames.es;
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
  if (word.length === 0) return false;
  return word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase();
}

/**
 * Detecta si una palabra es un nombre de persona con lógica mejorada
 * @param {string} word - Palabra a verificar
 * @param {string} language - Idioma
 * @param {string} previousWord - Palabra anterior (contexto)
 * @returns {boolean} - true si es probable que sea nombre de persona
 */
function isLikelyPersonName(word, language, previousWord = '') {
  const cleanedWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()¿?¡!"""''«»]/g, '');
  const lowerWord = cleanedWord.toLowerCase();
  
  // Verificar si no está en mayúscula inicial
  if (!isCapitalized(cleanedWord)) return false;
  
  // Verificar longitud mínima (nombres muy cortos son poco comunes)
  if (cleanedWord.length < 3) return false;
  
  // Verificar si es una palabra común que no es nombre (stopwords)
  const stopwords = getStopWords(language);
  if (stopwords.includes(lowerWord)) return false;
  
  // Verificar si es un lugar, mes, día, u otra palabra común que no es nombre
  const nonNames = getNonPersonNames(language);
  if (nonNames.includes(lowerWord)) return false;
  
  // Verificar si tiene un título antes (Sr., Dr., etc.) - ALTA CONFIANZA
  const titles = getPersonTitles(language);
  const cleanedPrevWord = previousWord.toLowerCase().replace(/\./g, '');
  if (previousWord && titles.includes(cleanedPrevWord)) {
    return true;
  }
  
  // Verificar si está en la lista de nombres comunes - ALTA CONFIANZA
  const firstNames = getCommonFirstNames(language);
  if (firstNames.includes(lowerWord)) {
    return true;
  }
  
  // Verificar si está en la lista de apellidos comunes - ALTA CONFIANZA
  const lastNames = getCommonLastNames(language);
  if (lastNames.includes(lowerWord)) {
    return true;
  }
  
  // Si no cumple ninguno de los criterios anteriores, NO es un nombre
  return false;
}

/**
 * Limpia una palabra de puntuación
 * @param {string} word - Palabra a limpiar
 * @returns {string} - Palabra limpia
 */
function cleanWord(word) {
  return word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()¿?¡!"""''«»\[\]]/g, '').toLowerCase();
}

/**
 * Obtiene patrones de verbos comunes según el idioma - AMPLIADO
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
         'aparecer', 'conseguir', 'comenzar', 'explicar', 'nacer', 'reconocer', 'estudiar',
         'alcanzar', 'nadar', 'cantar', 'bailar', 'correr', 'caminar', 'jugar', 'dormir', 'despertar',
         'comer', 'beber', 'cocinar', 'comprar', 'vender', 'pagar', 'gastar', 'ahorrar', 'ganar',
         'aprender', 'enseñar', 'limpiar', 'ordenar', 'guardar', 'tirar', 'coger', 'soltar',
         'cerrar', 'subir', 'bajar', 'partir', 'viajar', 'conducir', 'manejar', 'volar', 'bucear',
         'escalar', 'trepar', 'levantar', 'sentar', 'acostar', 'parar', 'mover', 'empujar', 'jalar',
         'arrastrar', 'cargar', 'tocar', 'agarrar', 'apretar', 'aflojar', 'atar', 'desatar', 'cortar',
         'pegar', 'unir', 'separar', 'romper', 'reparar', 'construir', 'destruir', 'pintar', 'dibujar',
         'borrar', 'escuchar', 'observar', 'notar', 'percibir', 'oler', 'probar', 'saborear',
         'imaginar', 'soñar', 'recordar', 'olvidar', 'memorizar', 'entender', 'ignorar'],
    en: ['be', 'have', 'do', 'say', 'get', 'make', 'go', 'know', 'take', 'see', 'come', 'think',
         'look', 'want', 'give', 'use', 'find', 'tell', 'ask', 'work', 'seem', 'feel', 'try',
         'leave', 'call', 'keep', 'let', 'begin', 'help', 'show', 'hear', 'play', 'run', 'move',
         'like', 'live', 'believe', 'bring', 'happen', 'write', 'sit', 'stand', 'lose', 'pay',
         'meet', 'include', 'continue', 'set', 'learn', 'change', 'lead', 'understand', 'watch',
         'follow', 'stop', 'create', 'speak', 'read', 'spend', 'grow', 'open', 'walk', 'win',
         'teach', 'offer', 'remember', 'consider', 'appear', 'buy', 'serve', 'die', 'send',
         'expect', 'build', 'stay', 'fall', 'cut', 'reach', 'kill', 'raise', 'pass', 'sell',
         'decide', 'return', 'explain', 'hope', 'develop', 'carry', 'break', 'receive', 'agree',
         'support', 'hit', 'produce', 'eat', 'cover', 'catch', 'draw', 'choose', 'cause', 'point',
         'allow', 'remain', 'suggest', 'express', 'accept', 'plan', 'wear', 'share', 'arrive',
         'settle', 'enjoy', 'tend', 'dance', 'sing', 'laugh', 'cry', 'smile', 'sleep',
         'wake', 'drink', 'cook', 'clean', 'wash', 'drive', 'ride', 'fly', 'swim', 'climb', 'jump'],
    ar: ['كان', 'قال', 'ذهب', 'جاء', 'عمل', 'رأى', 'أخذ', 'وجد', 'أعطى', 'عرف', 'فعل', 'جعل',
         'ترك', 'وضع', 'سمع', 'قرأ', 'كتب', 'فهم', 'حصل', 'طلب', 'بدأ', 'انتهى', 'ظهر', 'حدث',
         'أكل', 'شرب', 'نام', 'قام', 'جلس', 'وقف', 'مشى', 'ركض', 'سبح', 'طار', 'لعب', 'غنى']
  };

  return verbs[language] || verbs.es;
}

/**
 * Obtiene patrones de sustantivos comunes según el idioma - AMPLIADO
 * @param {string} language - Código del idioma
 * @returns {Array} - Array de sustantivos comunes
 */
function getCommonNouns(language) {
  const nouns = {
    es: ['persona', 'año', 'tiempo', 'día', 'cosa', 'hombre', 'mujer', 'niño', 'país', 'parte',
         'casa', 'mundo', 'vida', 'mano', 'lugar', 'trabajo', 'caso', 'forma', 'grupo', 'número',
         'problema', 'agua', 'punto', 'momento', 'sistema', 'ciudad', 'mesa', 'libro', 'coche',
         'idea', 'familia', 'madre', 'padre', 'hijo', 'cuerpo', 'pueblo', 'palabra', 'ejemplo',
         'manera', 'razón', 'gobierno', 'empresa', 'servicio', 'precio', 'derecho', 'dato',
         'cuenta', 'estado', 'pregunta', 'programa', 'resultado', 'desarrollo', 'proceso', 'modelo',
         'amor', 'muerte', 'guerra', 'paz', 'verdad', 'mentira', 'bien', 'mal', 'cielo', 'tierra',
         'mar', 'río', 'montaña', 'valle', 'bosque', 'árbol', 'flor', 'planta', 'animal', 'perro',
         'gato', 'pájaro', 'pez', 'caballo', 'vaca', 'cerdo', 'oveja', 'pollo', 'león', 'tigre',
         'oso', 'lobo', 'serpiente', 'insecto', 'mariposa', 'abeja', 'hormiga', 'araña', 'mosca',
         'cabeza', 'cara', 'ojo', 'oreja', 'nariz', 'boca', 'diente', 'lengua', 'cuello', 'hombro',
         'brazo', 'dedo', 'pecho', 'espalda', 'pierna', 'pie', 'corazón', 'sangre', 'hueso',
         'comida', 'pan', 'carne', 'pescado', 'fruta', 'verdura', 'leche', 'queso', 'huevo', 'arroz',
         'puerta', 'ventana', 'pared', 'techo', 'suelo', 'escalera', 'habitación', 'cocina',
         'baño', 'sala', 'comedor', 'dormitorio', 'jardín', 'calle', 'camino', 'carretera', 'puente',
         'edificio', 'torre', 'castillo', 'iglesia', 'templo', 'museo', 'teatro', 'cine', 'hospital',
         'escuela', 'universidad', 'biblioteca', 'oficina', 'tienda', 'mercado', 'restaurante', 'hotel',
         'dinero', 'oro', 'plata', 'metal', 'piedra', 'madera', 'papel', 'tela', 'ropa', 'vestido',
         'camisa', 'pantalón', 'zapato', 'sombrero', 'reloj', 'teléfono', 'ordenador', 'tren',
         'avión', 'barco', 'bicicleta', 'música', 'canción', 'danza', 'arte', 'pintura', 'escultura'],
    en: ['time', 'person', 'year', 'way', 'day', 'thing', 'man', 'world', 'life', 'hand', 'part',
         'child', 'eye', 'woman', 'place', 'work', 'week', 'case', 'point', 'government', 'company',
         'number', 'group', 'problem', 'fact', 'water', 'room', 'mother', 'area', 'money', 'story',
         'result', 'morning', 'lot', 'right', 'study', 'book', 'word', 'business', 'issue', 'side',
         'kind', 'head', 'house', 'service', 'friend', 'father', 'power', 'hour', 'game', 'line',
         'end', 'member', 'law', 'car', 'city', 'community', 'name', 'president', 'team', 'minute',
         'idea', 'body', 'information', 'back', 'parent', 'face', 'others', 'level', 'office', 'door',
         'health', 'death', 'war', 'peace', 'truth', 'lie', 'good', 'evil', 'sky', 'earth', 'sea',
         'river', 'mountain', 'valley', 'forest', 'tree', 'flower', 'plant', 'animal', 'dog', 'cat',
         'bird', 'fish', 'horse', 'cow', 'pig', 'sheep', 'chicken', 'lion', 'tiger', 'bear', 'wolf',
         'face', 'ear', 'nose', 'mouth', 'tooth', 'tongue', 'neck', 'shoulder', 'finger', 'chest',
         'blood', 'bone', 'food', 'bread', 'meat', 'fruit', 'vegetable', 'milk', 'cheese', 'egg',
         'window', 'wall', 'roof', 'floor', 'stair', 'kitchen', 'bathroom', 'living', 'garden',
         'street', 'road', 'bridge', 'building', 'tower', 'castle', 'church', 'temple', 'museum',
         'school', 'university', 'library', 'store', 'market', 'restaurant', 'hotel'],
    ar: ['شخص', 'وقت', 'يوم', 'عام', 'بيت', 'عمل', 'مكان', 'حياة', 'رجل', 'امرأة', 'طفل', 'عالم',
         'بلد', 'مدينة', 'حكومة', 'كتاب', 'ماء', 'يد', 'عين', 'رأس', 'جزء', 'طريقة', 'مشكلة',
         'أرض', 'سماء', 'بحر', 'نهر', 'جبل', 'شجرة', 'زهرة', 'حيوان', 'طعام', 'خبز', 'لحم']
  };

  return nouns[language] || nouns.es;
}

/**
 * Normaliza texto árabe (opcional, para mejor análisis)
 * @param {string} text - Texto árabe
 * @returns {string} - Texto normalizado
 */
function normalizeArabicText(text) {
  // Normalizar hamza y alif
  text = text.replace(/[أإآ]/g, 'ا');
  // Normalizar alif maqsura
  text = text.replace(/ى/g, 'ي');
  // Normalizar ta marbuta
  text = text.replace(/ة/g, 'ه');
  return text;
}