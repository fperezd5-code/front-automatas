// js/lexical/results.js - Visualización de resultados para análisis de documentos

/**
 * Muestra los resultados del análisis en la página
 * @param {object} results - Resultados del análisis
 */
function displayResults(results) {
  console.log('Mostrando resultados...', results);
  
  const resultsSection = document.getElementById('results-section');
  if (!resultsSection) {
    console.error('No se encontró la sección de resultados');
    return;
  }

  // Mostrar la sección de resultados
  resultsSection.classList.remove('hidden');

  // Renderizar cada componente
  renderStatistics(results.statistics);
  renderMostFrequent(results.mostFrequent);
  renderLeastFrequent(results.leastFrequent);
  renderPronouns(results.pronouns);
  renderPersonNames(results.personNames);
  renderNouns(results.nouns);
  renderVerbs(results.verbs);
  renderAdditionalClassifications(results.additionalClassifications);

  console.log('Resultados mostrados correctamente');
}

/**
 * Renderiza las estadísticas generales
 * @param {object} statistics - Estadísticas
 */
function renderStatistics(statistics) {
  document.getElementById('total-words').textContent = statistics.totalWords;
  document.getElementById('unique-words').textContent = statistics.uniqueWords;
  document.getElementById('total-chars').textContent = statistics.totalCharacters;
  document.getElementById('total-lines').textContent = statistics.totalLines;
}

/**
 * Renderiza las palabras más frecuentes
 * @param {Array} words - Palabras más frecuentes
 */
function renderMostFrequent(words) {
  const container = document.getElementById('most-frequent');
  if (!container) return;

  if (words.length === 0) {
    container.innerHTML = '<p class="text-muted">No se encontraron palabras frecuentes</p>';
    return;
  }

  let html = '<div class="frequency-list">';
  words.forEach((item, index) => {
    html += `
      <div class="frequency-item">
        <span class="rank">${index + 1}.</span>
        <span class="word">${escapeHtml(item.word)}</span>
        <span class="count badge bg-primary">${item.count}</span>
      </div>
    `;
  });
  html += '</div>';

  container.innerHTML = html;
}

/**
 * Renderiza las palabras menos frecuentes
 * @param {Array} words - Palabras menos frecuentes
 */
function renderLeastFrequent(words) {
  const container = document.getElementById('least-frequent');
  if (!container) return;

  if (words.length === 0) {
    container.innerHTML = '<p class="text-muted">No se encontraron palabras</p>';
    return;
  }

  let html = '<div class="frequency-list">';
  words.forEach((item, index) => {
    html += `
      <div class="frequency-item">
        <span class="rank">${index + 1}.</span>
        <span class="word">${escapeHtml(item.word)}</span>
        <span class="count badge bg-secondary">${item.count}</span>
      </div>
    `;
  });
  html += '</div>';

  container.innerHTML = html;
}

/**
 * Renderiza los pronombres personales
 * @param {Array} pronouns - Pronombres encontrados
 */
function renderPronouns(pronouns) {
  const container = document.getElementById('pronouns');
  if (!container) return;

  if (pronouns.length === 0) {
    container.innerHTML = '<p class="text-muted">No se encontraron pronombres personales</p>';
    return;
  }

  let html = '';
  pronouns.forEach(item => {
    html += `
      <span class="word-badge">
        ${escapeHtml(item.word)} 
        <span class="badge bg-info">${item.count}</span>
      </span>
    `;
  });

  container.innerHTML = html;
}

/**
 * Renderiza los nombres de personas
 * @param {Array} names - Nombres encontrados
 */
function renderPersonNames(names) {
  const container = document.getElementById('person-names');
  if (!container) return;

  if (names.length === 0) {
    container.innerHTML = '<p class="text-muted">No se encontraron nombres de personas</p>';
    return;
  }

  let html = '';
  names.forEach(name => {
    html += `<span class="word-badge">${escapeHtml(name)}</span>`;
  });

  container.innerHTML = html;
}

/**
 * Renderiza los sustantivos
 * @param {Array} nouns - Sustantivos encontrados
 */
function renderNouns(nouns) {
  const container = document.getElementById('nouns');
  if (!container) return;

  if (nouns.length === 0) {
    container.innerHTML = '<p class="text-muted">No se encontraron sustantivos</p>';
    return;
  }

  let html = '';
  nouns.forEach(item => {
    html += `
      <span class="word-badge">
        ${escapeHtml(item.word)} 
        <span class="badge bg-success">${item.count}</span>
      </span>
    `;
  });

  container.innerHTML = html;
}

/**
 * Renderiza los verbos
 * @param {Array} verbs - Verbos encontrados
 */
function renderVerbs(verbs) {
  const container = document.getElementById('verbs');
  if (!container) return;

  if (verbs.length === 0) {
    container.innerHTML = '<p class="text-muted">No se encontraron verbos</p>';
    return;
  }

  let html = '';
  verbs.forEach(item => {
    html += `
      <span class="word-badge">
        ${escapeHtml(item.word)} 
        <span class="badge bg-warning">${item.count}</span>
      </span>
    `;
  });

  container.innerHTML = html;
}

/**
 * Renderiza las clasificaciones adicionales
 * @param {object} classifications - Clasificaciones
 */
function renderAdditionalClassifications(classifications) {
  const container = document.getElementById('additional-classifications');
  if (!container) return;

  const dist = classifications.wordLengthDistribution;

  const html = `
    <div class="classification-item">
      <span class="label">Palabras cortas (≤3 letras):</span>
      <span class="value badge bg-info">${dist.short}</span>
    </div>
    <div class="classification-item">
      <span class="label">Palabras medianas (4-7 letras):</span>
      <span class="value badge bg-primary">${dist.medium}</span>
    </div>
    <div class="classification-item">
      <span class="label">Palabras largas (>7 letras):</span>
      <span class="value badge bg-success">${dist.long}</span>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Descarga los resultados como TXT
 */
function downloadResultsWrapper() {
  if (!analysisResults) {
    showAlert('No hay resultados para descargar', 'warning');
    return;
  }

  const content = generateTextResults(analysisResults);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const fileName = `analisis_${analysisResults.fileName}_${timestamp}.txt`;
  
  downloadTextFile(content, fileName);
  showAlert('Archivo descargado exitosamente', 'success');
}

/**
 * Genera el contenido en formato texto
 * @param {object} results - Resultados del análisis
 * @returns {string} - Contenido formateado
 */
function generateTextResults(results) {
  let text = '';
  
  text += '='.repeat(80) + '\n';
  text += '                    RESULTADOS DEL ANÁLISIS LÉXICO\n';
  text += '='.repeat(80) + '\n\n';
  
  text += `Archivo: ${results.fileName}\n`;
  text += `Idioma: ${results.languageName}\n`;
  text += `Fecha de análisis: ${formatDateTime(results.processDate)}\n\n`;
  
  text += '-'.repeat(80) + '\n';
  text += 'ESTADÍSTICAS GENERALES\n';
  text += '-'.repeat(80) + '\n';
  text += `Total de palabras:      ${results.statistics.totalWords}\n`;
  text += `Palabras únicas:        ${results.statistics.uniqueWords}\n`;
  text += `Total de caracteres:    ${results.statistics.totalCharacters}\n`;
  text += `Total de líneas:        ${results.statistics.totalLines}\n\n`;
  
  text += '-'.repeat(80) + '\n';
  text += 'PALABRAS MÁS FRECUENTES\n';
  text += '-'.repeat(80) + '\n';
  results.mostFrequent.forEach((item, index) => {
    text += `${index + 1}. ${item.word} (${item.count} veces)\n`;
  });
  text += '\n';
  
  text += '-'.repeat(80) + '\n';
  text += 'PALABRAS MENOS FRECUENTES\n';
  text += '-'.repeat(80) + '\n';
  results.leastFrequent.forEach((item, index) => {
    text += `${index + 1}. ${item.word} (${item.count} veces)\n`;
  });
  text += '\n';
  
  text += '-'.repeat(80) + '\n';
  text += 'PRONOMBRES PERSONALES\n';
  text += '-'.repeat(80) + '\n';
  if (results.pronouns.length > 0) {
    results.pronouns.forEach(item => {
      text += `${item.word}: ${item.count} veces\n`;
    });
  } else {
    text += 'No se encontraron pronombres personales\n';
  }
  text += '\n';
  
  text += '-'.repeat(80) + '\n';
  text += 'NOMBRES DE PERSONAS\n';
  text += '-'.repeat(80) + '\n';
  if (results.personNames.length > 0) {
    text += results.personNames.join(', ') + '\n';
  } else {
    text += 'No se encontraron nombres de personas\n';
  }
  text += '\n';
  
  text += '-'.repeat(80) + '\n';
  text += 'SUSTANTIVOS (FORMA RAÍZ)\n';
  text += '-'.repeat(80) + '\n';
  if (results.nouns.length > 0) {
    results.nouns.forEach(item => {
      text += `${item.word}: ${item.count} veces\n`;
    });
  } else {
    text += 'No se encontraron sustantivos\n';
  }
  text += '\n';
  
  text += '-'.repeat(80) + '\n';
  text += 'VERBOS (FORMA RAÍZ)\n';
  text += '-'.repeat(80) + '\n';
  if (results.verbs.length > 0) {
    results.verbs.forEach(item => {
      text += `${item.word}: ${item.count} veces\n`;
    });
  } else {
    text += 'No se encontraron verbos\n';
  }
  text += '\n';
  
  text += '-'.repeat(80) + '\n';
  text += 'DISTRIBUCIÓN POR LONGITUD DE PALABRAS\n';
  text += '-'.repeat(80) + '\n';
  const dist = results.additionalClassifications.wordLengthDistribution;
  text += `Palabras cortas (≤3 letras):    ${dist.short}\n`;
  text += `Palabras medianas (4-7 letras):  ${dist.medium}\n`;
  text += `Palabras largas (>7 letras):     ${dist.long}\n\n`;
  
  text += '='.repeat(80) + '\n';
  text += 'FIN DEL REPORTE\n';
  text += '='.repeat(80) + '\n';
  
  return text;
}

/**
 * Abre el modal para enviar por email
 */
function openEmailModal() {
  if (!analysisResults) {
    showAlert('No hay resultados para enviar', 'warning');
    return;
  }

  const modalHtml = `
    <div class="modal fade" id="emailModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-envelope me-2"></i>Enviar Resultados por Email
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="recipient-email" class="form-label">Email del destinatario</label>
              <input type="email" class="form-control" id="recipient-email" 
                     placeholder="ejemplo@correo.com" required>
            </div>
            <div class="mb-3">
              <label for="email-subject" class="form-label">Asunto (opcional)</label>
              <input type="text" class="form-control" id="email-subject" 
                     value="Resultados del Análisis Léxico - ${analysisResults.fileName}">
            </div>
            <div class="mb-3">
              <label for="email-message" class="form-label">Mensaje adicional (opcional)</label>
              <textarea class="form-control" id="email-message" rows="3" 
                        placeholder="Adjunto los resultados del análisis..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" onclick="sendAnalysisEmail()">
              <i class="fas fa-paper-plane me-2"></i>Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remover modal anterior si existe
  const oldModal = document.getElementById('emailModal');
  if (oldModal) {
    oldModal.remove();
  }

  // Agregar nuevo modal
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Mostrar modal
  const modal = new bootstrap.Modal(document.getElementById('emailModal'));
  modal.show();
}

/**
 * Envía los resultados por email
 */
async function sendAnalysisEmail() {
  const email = document.getElementById('recipient-email').value.trim();
  const subject = document.getElementById('email-subject').value.trim();
  const message = document.getElementById('email-message').value.trim();

  if (!email) {
    showAlert('Por favor ingrese un email válido', 'warning');
    return;
  }

  if (!isValidEmail(email)) {
    showAlert('El formato del email no es válido', 'danger');
    return;
  }

  showLoading();

  try {
    // Generar contenido del email
    const emailContent = generateTextResults(analysisResults);

    // Preparar datos para enviar
    const emailData = {
      to: email,
      subject: subject || `Resultados del Análisis Léxico - ${analysisResults.fileName}`,
      message: message || 'Adjunto encontrará los resultados del análisis léxico.',
      attachment: {
        filename: `analisis_${analysisResults.fileName}.txt`,
        content: emailContent
      },
      analysisData: {
        fileName: analysisResults.fileName,
        language: analysisResults.languageName,
        totalWords: analysisResults.statistics.totalWords,
        uniqueWords: analysisResults.statistics.uniqueWords
      }
    };

    // Llamar a la API para enviar el email
    const response = await sendEmail(emailData);

    hideLoading();

    if (response.success) {
      showAlert('Email enviado exitosamente', 'success');
      
      // Cerrar modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('emailModal'));
      if (modal) {
        modal.hide();
      }
    } else {
      showAlert('Error al enviar el email: ' + (response.message || 'Error desconocido'), 'danger');
    }

  } catch (error) {
    hideLoading();
    console.error('Error enviando email:', error);
    showAlert('Error al enviar el email. Por favor intente nuevamente.', 'danger');
  }
}

/**
 * Escapa HTML para prevenir XSS
 * @param {string} text - Texto a escapar
 * @returns {string} - Texto escapado
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

const fileInput = document.getElementById('fileInput');
const containerA = document.getElementById('containerA');
const containerB = document.getElementById('containerB');

fileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return console.log('No file selected');
    const reader = new FileReader();
    reader.onload = () => {
        const text = reader.result;
        console.log('File content:', text); // verifica que llegue el texto
        // ejemplo de parseo simple: separar por líneas y llenar contenedores
        const lines = text.split(/\r?\n/);
        containerA.textContent = lines[0] || '';
        containerB.textContent = lines.slice(1).join('\n') || '';
    };
    reader.onerror = (err) => console.error('FileReader error', err);
    reader.readAsText(file, 'UTF-8');
});