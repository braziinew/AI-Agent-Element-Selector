/* =========================================================
   ui.js — Shadow DOM, Master Panel, Toast, Копирование промпта
   Зависит от: state.js, helpers.js
   ========================================================= */

/* -------------------------------------------------------
   Создание Shadow DOM и Master Panel
   ------------------------------------------------------- */

function createRootContainer() {
  if (rootContainer) return;

  rootContainer = document.createElement('div');
  rootContainer.id = 'ai-agent-selector-root';
  document.body.appendChild(rootContainer);

  shadowRoot = rootContainer.attachShadow({ mode: 'open' });

  // Подключаем shadow.css
  const styleLink = document.createElement('link');
  styleLink.rel  = 'stylesheet';
  styleLink.href = chrome.runtime.getURL('shadow.css');
  shadowRoot.appendChild(styleLink);

  // Обёртка + разметка панели
  const wrapper = document.createElement('div');
  wrapper.className = 'shadow-wrapper';
  wrapper.innerHTML = `
    <div class="master-panel">
      <div class="master-header">
        <h4 class="master-title" id="master-panel-title">🧠 AI Annotator</h4>
        <button class="btn-close-master" id="btn-unload" title="Закрыть и очистить всё">&times;</button>
      </div>

      <div class="status-indicator">
        <div class="status-dot" id="inspect-status-dot"></div>
        <span id="inspect-status-text">Выбор отключён</span>
      </div>

      <div class="mode-buttons-grid">
        <button class="btn-toggle-inspect" id="btn-toggle-inspect">
          <span>🔍</span> Аннотация
        </button>
        <button class="btn-toggle-edit" id="btn-toggle-edit">
          <span>🏗️</span> Редактировать
        </button>
        <button class="btn-toggle-templates btn-template-row" id="btn-toggle-templates">
          <span>📐</span> Шаблоны
        </button>
      </div>

      <div class="master-actions">
        <button class="btn btn-secondary" id="btn-clear-all" disabled>Очистить</button>
        <button class="btn btn-primary"   id="btn-copy-all"  disabled>Скопировать всё (0)</button>
      </div>
    </div>

    <!-- Edit Properties Panel -->
    <div class="edit-props-panel">
      <div class="ep-header">
        <div>
          <div class="ep-title">⚙️ Свойства</div>
          <div class="ep-selector" title=""></div>
        </div>
        <button class="ep-close" title="Закрыть">✕</button>
      </div>

      <!-- Позиция и размер -->
      <div class="ep-section">
        <div class="ep-section-title">Размер и позиция</div>
        <div class="ep-field">
          <span class="ep-label">Ширина</span>
          <div class="ep-input-unit">
            <input id="ep-width" type="number" class="ep-input" min="0" step="1" placeholder="auto">
            <span class="ep-unit">px</span>
          </div>
        </div>
        <div class="ep-field">
          <span class="ep-label">Высота</span>
          <div class="ep-input-unit">
            <input id="ep-height" type="number" class="ep-input" min="0" step="1" placeholder="auto">
            <span class="ep-unit">px</span>
          </div>
        </div>
        <div class="ep-field">
          <span class="ep-label">Left</span>
          <div class="ep-input-unit">
            <input id="ep-left" type="number" class="ep-input" step="1" placeholder="0">
            <span class="ep-unit">px</span>
          </div>
        </div>
        <div class="ep-field">
          <span class="ep-label">Top</span>
          <div class="ep-input-unit">
            <input id="ep-top" type="number" class="ep-input" step="1" placeholder="0">
            <span class="ep-unit">px</span>
          </div>
        </div>
      </div>

      <!-- Текст -->
      <div class="ep-section" id="ep-text-section">
        <div class="ep-section-title">Текст</div>
        <textarea id="ep-text-value" class="ep-textarea" placeholder="Текст элемента..."></textarea>
        <div class="ep-hint">💡 Двойной клик на элемент — редактировать прямо на странице</div>
      </div>

      <!-- Типографика -->
      <div class="ep-section">
        <div class="ep-section-title">Типографика</div>
        <div class="ep-field">
          <span class="ep-label">Размер</span>
          <div class="ep-input-unit">
            <input id="ep-font-size" type="number" class="ep-input" min="6" max="200" step="1">
            <span class="ep-unit">px</span>
          </div>
        </div>
        <div class="ep-field">
          <span class="ep-label">Насыщ.</span>
          <select id="ep-font-weight" class="ep-select">
            <option value="100">Thin 100</option>
            <option value="200">Extra Light 200</option>
            <option value="300">Light 300</option>
            <option value="400">Normal 400</option>
            <option value="500">Medium 500</option>
            <option value="600">Semi Bold 600</option>
            <option value="700">Bold 700</option>
            <option value="800">Extra Bold 800</option>
            <option value="900">Black 900</option>
          </select>
        </div>
        <div class="ep-field">
          <span class="ep-label">Высота</span>
          <div class="ep-input-unit">
            <input id="ep-line-height" type="number" class="ep-input" min="0.5" max="5" step="0.1" placeholder="1.5">
            <span class="ep-unit">em</span>
          </div>
        </div>
        <div class="ep-field">
          <span class="ep-label">Выравн.</span>
          <div class="ep-align-group">
            <button class="ep-align-btn" data-align="left"   title="По левому краю">≡</button>
            <button class="ep-align-btn" data-align="center" title="По центру">≣</button>
            <button class="ep-align-btn" data-align="right"  title="По правому краю">≡</button>
            <button class="ep-align-btn" data-align="justify" title="По ширине">☰</button>
          </div>
        </div>
        <div class="ep-field">
          <span class="ep-label">Цвет</span>
          <div class="ep-color-wrap">
            <div class="ep-color-swatch" id="ep-color">
              <input type="color" value="#000000">
            </div>
            <input type="text" id="ep-color-hex" class="ep-color-hex" placeholder="#rrggbb" maxlength="7">
          </div>
        </div>
      </div>

      <!-- Фон и форма -->
      <div class="ep-section">
        <div class="ep-section-title">Фон и форма</div>
        <div class="ep-field">
          <span class="ep-label">Фон</span>
          <div class="ep-color-wrap">
            <div class="ep-color-swatch" id="ep-bg-color">
              <input type="color" value="#ffffff">
            </div>
            <input type="text" id="ep-bg-color-hex" class="ep-color-hex" placeholder="#rrggbb" maxlength="7">
          </div>
        </div>
        <div class="ep-field">
          <span class="ep-label">Радиус</span>
          <div class="ep-input-unit">
            <input id="ep-border-radius" type="number" class="ep-input" min="0" max="999" step="1">
            <span class="ep-unit">px</span>
          </div>
        </div>
        <div class="ep-field">
          <span class="ep-label">Прозр.</span>
          <input type="range" id="ep-opacity" class="ep-slider" min="0" max="100" step="1" value="100">
          <span id="ep-opacity-val" style="font-size:10px;color:#6b7280;min-width:28px;text-align:right;">100%</span>
        </div>
      </div>

      <!-- Padding -->
      <div class="ep-section">
        <div class="ep-section-title">Padding (внутренний отступ)</div>
        <div style="display:flex;flex-direction:column;gap:0;">
          <div style="display:flex;justify-content:center;margin-bottom:3px;">
            <div class="ep-input-unit" style="width:60px">
              <input id="ep-pt" type="number" min="0" step="1" placeholder="0">
              <span class="ep-unit">px</span>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
            <div class="ep-input-unit" style="width:60px">
              <input id="ep-pl" type="number" min="0" step="1" placeholder="0">
              <span class="ep-unit">px</span>
            </div>
            <div style="flex:1;display:flex;align-items:center;justify-content:center;">
              <div style="width:30px;height:20px;border:1px dashed rgba(99,102,241,0.3);border-radius:3px;"></div>
            </div>
            <div class="ep-input-unit" style="width:60px">
              <input id="ep-pr" type="number" min="0" step="1" placeholder="0">
              <span class="ep-unit">px</span>
            </div>
          </div>
          <div style="display:flex;justify-content:center;margin-top:3px;">
            <div class="ep-input-unit" style="width:60px">
              <input id="ep-pb" type="number" min="0" step="1" placeholder="0">
              <span class="ep-unit">px</span>
            </div>
          </div>
          <div class="ep-4side-labels" style="margin-top:2px;font-size:8.5px;color:#374151;display:grid;grid-template-columns:1fr 1fr 1fr;text-align:center;">
            <span style="visibility:hidden">—</span>
            <span style="text-align:center">↑ Top</span>
            <span style="visibility:hidden">—</span>
            <span>← Left</span>
            <span style="visibility:hidden">—</span>
            <span style="text-align:right">Right →</span>
            <span style="visibility:hidden">—</span>
            <span style="text-align:center">↓ Bottom</span>
            <span style="visibility:hidden">—</span>
          </div>
        </div>
      </div>

      <!-- Margin -->
      <div class="ep-section">
        <div class="ep-section-title">Margin (внешний отступ)</div>
        <div style="display:flex;flex-direction:column;gap:0;">
          <div style="display:flex;justify-content:center;margin-bottom:3px;">
            <div class="ep-input-unit" style="width:60px">
              <input id="ep-mt" type="number" min="0" step="1" placeholder="0">
              <span class="ep-unit">px</span>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
            <div class="ep-input-unit" style="width:60px">
              <input id="ep-ml" type="number" min="0" step="1" placeholder="0">
              <span class="ep-unit">px</span>
            </div>
            <div style="flex:1;display:flex;align-items:center;justify-content:center;">
              <div style="width:30px;height:20px;border:1px solid rgba(245,158,11,0.3);border-radius:3px;background:rgba(245,158,11,0.05);"></div>
            </div>
            <div class="ep-input-unit" style="width:60px">
              <input id="ep-mr" type="number" min="0" step="1" placeholder="0">
              <span class="ep-unit">px</span>
            </div>
          </div>
          <div style="display:flex;justify-content:center;margin-top:3px;">
            <div class="ep-input-unit" style="width:60px">
              <input id="ep-mb" type="number" min="0" step="1" placeholder="0">
              <span class="ep-unit">px</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Кнопка «Копировать изменения агенту» -->
      <div class="ep-section">
        <button class="ep-copy-btn" id="ep-copy-changes" disabled>
          <span>📋</span> Скопировать изменения агенту
          <span class="ep-changes-badge" id="ep-changes-count">0</span>
        </button>
      </div>
    </div>

    <!-- Templates Panel (содержимое заполняется в templates.js) -->
    <div class="templates-panel"></div>
  `;
  shadowRoot.appendChild(wrapper);

  // Привязываем основные обработчики
  shadowRoot.getElementById('btn-toggle-inspect').addEventListener('click', toggleInspection);
  shadowRoot.getElementById('btn-toggle-edit').addEventListener('click', toggleEditMode);
  shadowRoot.getElementById('btn-toggle-templates').addEventListener('click', toggleTemplatesPanel);
  shadowRoot.getElementById('btn-clear-all').addEventListener('click', clearAllAnnotations);
  shadowRoot.getElementById('btn-copy-all').addEventListener('click', copyAllPrompt);
  shadowRoot.getElementById('btn-unload').addEventListener('click', unloadAnnotator);

  // Инициализируем Properties Panel
  _bindPropsPanelEvents();

  // Строим Templates Panel
  buildTemplatesPanel();

  window.addEventListener('scroll', scheduleUpdatePositions, { passive: true });
  window.addEventListener('resize', scheduleUpdatePositions, { passive: true });
}

/** Полная выгрузка расширения со страницы */
function unloadAnnotator() {
  stopInspection(true);
  stopEditMode(true);
  if (isTemplateMode) _cancelInsertMode();
  clearAllAnnotations();

  window.removeEventListener('scroll', scheduleUpdatePositions);
  window.removeEventListener('resize', scheduleUpdatePositions);

  if (rootContainer) {
    rootContainer.remove();
    rootContainer = null;
    shadowRoot    = null;
  }
  isEditing = false;
}

/* -------------------------------------------------------
   Обновление UI Master Panel
   ------------------------------------------------------- */

function updateMasterPanelUI() {
  if (!shadowRoot) return;

  // Счётчик в заголовке
  const titleEl = shadowRoot.getElementById('master-panel-title');
  if (titleEl) {
    titleEl.innerHTML =
      `🧠 AI Annotator <span style="font-size:11px;background:rgba(255,255,255,.12);` +
      `padding:2px 6px;border-radius:20px;margin-left:6px;font-weight:700;">${annotations.length}</span>`;
  }

  const dot       = shadowRoot.getElementById('inspect-status-dot');
  const text      = shadowRoot.getElementById('inspect-status-text');
  const toggleBtn = shadowRoot.getElementById('btn-toggle-inspect');
  const editBtn   = shadowRoot.getElementById('btn-toggle-edit');
  const tplBtn    = shadowRoot.getElementById('btn-toggle-templates');

  const tplPanelVisible = shadowRoot.querySelector('.templates-panel')?.classList.contains('visible');

  if (isEditing) {
    dot?.setAttribute('class', 'status-dot editing');
    if (text)      text.textContent = 'Ввод комментария...';
    if (toggleBtn) { toggleBtn.disabled = true;  toggleBtn.className = 'btn-toggle-inspect'; toggleBtn.innerHTML = '<span>🔍</span> Аннотация'; }
    if (editBtn)   { editBtn.disabled   = true;  editBtn.className   = 'btn-toggle-edit';    editBtn.innerHTML   = '<span>🏗️</span> Редактировать'; }
    if (tplBtn)    { tplBtn.disabled    = true;  tplBtn.className    = 'btn-toggle-templates btn-template-row'; tplBtn.innerHTML = '<span>📐</span> Шаблоны'; }

  } else if (isTemplateMode) {
    dot?.setAttribute('class', 'status-dot template-mode');
    if (text)      text.textContent = 'Выберите контейнер для шаблона...';
    if (toggleBtn) { toggleBtn.disabled = false; toggleBtn.className = 'btn-toggle-inspect';                                              toggleBtn.innerHTML = '<span>🔍</span> Аннотация'; }
    if (editBtn)   { editBtn.disabled   = false; editBtn.className   = 'btn-toggle-edit';                                                 editBtn.innerHTML   = '<span>🏗️</span> Редактировать'; }
    if (tplBtn)    { tplBtn.disabled    = false; tplBtn.className    = `btn-toggle-templates btn-template-row${tplPanelVisible ? ' active' : ''}`; tplBtn.innerHTML = tplPanelVisible ? '<span>⏹</span> Шаблоны' : '<span>📐</span> Шаблоны'; }

  } else if (isInspecting) {
    dot?.setAttribute('class', 'status-dot active');
    if (text)      text.textContent = 'Выбор активен (кликните на элемент)';
    if (toggleBtn) { toggleBtn.disabled = false; toggleBtn.className = 'btn-toggle-inspect active'; toggleBtn.innerHTML = '<span>⏹</span> Стоп'; }
    if (editBtn)   { editBtn.disabled   = false; editBtn.className   = 'btn-toggle-edit';           editBtn.innerHTML   = '<span>🏗️</span> Редактировать'; }
    if (tplBtn)    { tplBtn.disabled    = false; tplBtn.className    = `btn-toggle-templates btn-template-row${tplPanelVisible ? ' active' : ''}`; tplBtn.innerHTML = tplPanelVisible ? '<span>⏹</span> Шаблоны' : '<span>📐</span> Шаблоны'; }

  } else if (isEditMode) {
    dot?.setAttribute('class', 'status-dot editing');
    if (text)      text.textContent = 'Режим редактирования: выберите элемент';
    if (toggleBtn) { toggleBtn.disabled = false; toggleBtn.className = 'btn-toggle-inspect';                                              toggleBtn.innerHTML = '<span>🔍</span> Аннотация'; }
    if (editBtn)   { editBtn.disabled   = false; editBtn.className   = 'btn-toggle-edit active';                                          editBtn.innerHTML   = '<span>⏹</span> Стоп'; }
    if (tplBtn)    { tplBtn.disabled    = false; tplBtn.className    = `btn-toggle-templates btn-template-row${tplPanelVisible ? ' active' : ''}`; tplBtn.innerHTML = tplPanelVisible ? '<span>⏹</span> Шаблоны' : '<span>📐</span> Шаблоны'; }

  } else {
    dot?.setAttribute('class', 'status-dot');
    if (text)      text.textContent = 'Выбор отключён';
    if (toggleBtn) { toggleBtn.disabled = false; toggleBtn.className = 'btn-toggle-inspect'; toggleBtn.innerHTML = '<span>🔍</span> Аннотация'; }
    if (editBtn)   { editBtn.disabled   = false; editBtn.className   = 'btn-toggle-edit';    editBtn.innerHTML   = '<span>🏗️</span> Редактировать'; }
    if (tplBtn)    { tplBtn.disabled    = false; tplBtn.className    = `btn-toggle-templates btn-template-row${tplPanelVisible ? ' active' : ''}`; tplBtn.innerHTML = tplPanelVisible ? '<span>⏹</span> Шаблоны' : '<span>📐</span> Шаблоны'; }
  }

  const copyBtn  = shadowRoot.getElementById('btn-copy-all');
  const clearBtn = shadowRoot.getElementById('btn-clear-all');
  const hasAnns  = annotations.length > 0;
  if (copyBtn)  { copyBtn.disabled  = !hasAnns; copyBtn.innerHTML = `<span>📋</span> Скопировать всё (${annotations.length})`; }
  if (clearBtn) { clearBtn.disabled = !hasAnns; }
}

/* -------------------------------------------------------
   Toast-уведомления
   ------------------------------------------------------- */

function showToastNotification(message) {
  if (!shadowRoot) return;

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `<span>🎉</span> ${message}`;
  shadowRoot.querySelector('.shadow-wrapper').appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity .3s ease-out';
    toast.style.opacity    = '0';
    setTimeout(() => toast.remove(), 300);
  }, 1200);
}

/* -------------------------------------------------------
   Копирование промпта (аннотации)
   ------------------------------------------------------- */

async function copyAllPrompt() {
  if (!annotations.length) return;

  let prompt = `URL: ${window.location.href}\n\n`;

  annotations.forEach((ann, i) => {
    const text = ann.text.trim() || 'Без комментариев.';
    let html   = ann.html;

    if (html.length > 2500) {
      const m = html.match(/^<[a-zA-Z0-9\-]+[^>]*>/);
      if (m) {
        const tag = m[0].match(/^<([a-zA-Z0-9\-]+)/)[1];
        html = `${m[0]}\n  <!-- [HTML truncated (${ann.html.length} chars)] -->\n</${tag}>`;
      } else {
        html = html.substring(0, 1000) + '\n  <!-- [HTML truncated] -->\n' + html.substring(html.length - 500);
      }
    }

    prompt += `${i + 1}. Селектор: \`${ann.selector}\`\n` +
              `Комментарий: ${text}\n` +
              `HTML:\n\`\`\`html\n${html}\n\`\`\`\n\n`;
  });

  try {
    await navigator.clipboard.writeText(prompt.trim());
    showToastNotification('Промпт скопирован в буфер обмена!');

    const btn = shadowRoot?.getElementById('btn-copy-all');
    if (btn) {
      btn.innerHTML        = '<span>✅</span> Скопировано!';
      btn.style.background = 'linear-gradient(135deg,#10b981,#059669)';
      setTimeout(updateMasterPanelUI, 1200);
    }
  } catch (err) {
    console.error('AI Annotator: не удалось скопировать:', err);
    alert('Не удалось скопировать. Предоставьте разрешение буфера обмена.');
  }
}
