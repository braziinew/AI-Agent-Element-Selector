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
        <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
          <h4 class="master-title" id="master-panel-title">🧠 AI Annotator</h4>
          <div style="display:flex; align-items:center; gap:8px;">
            <div class="settings-dropdown">
              <button class="btn-settings" id="btn-settings" title="Настройки">⚙️</button>
              <div class="settings-popover" id="settings-popover">
                <div class="settings-group">
                  <label for="prompt-verbosity">Детализация ИИ:</label>
                  <select id="prompt-verbosity" class="verbosity-select">
                    <option value="minimal">Мин.</option>
                    <option value="brief">Кратко</option>
                    <option value="normal" selected>Обычно</option>
                    <option value="extended">Расширенно</option>
                  </select>
                </div>
                <div class="settings-group">
                  <label for="annotation-placement">Позиция стикера:</label>
                  <select id="annotation-placement" class="verbosity-select">
                    <option value="click" selected>По клику</option>
                    <option value="side">Сбоку</option>
                  </select>
                </div>
              </div>
            </div>
            <button class="btn-close-master" id="btn-unload" title="Закрыть и очистить всё">&times;</button>
          </div>
        </div>
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

      <div class="master-actions-vertical">
        <button class="btn-undo-redo" id="btn-undo" title="Отменить последнее действие (Ctrl+Z)" disabled>
          ↩ <span class="label">Отменить</span>
        </button>
        <button class="btn-undo-redo" id="btn-redo" title="Повторить отменённое (Ctrl+Y)" disabled>
          <span class="label">Повторить</span> ↪
        </button>
        <button class="btn btn-secondary" id="btn-clear-all" disabled>Очистить всё</button>
        <button class="btn-copy-agent" id="btn-copy-all" disabled>
          <span>📋</span> Скопировать всё агенту <span class="copy-agent-count" id="copy-all-count">0</span>
        </button>
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
  const verbositySelect = shadowRoot.getElementById('prompt-verbosity');
  const placementSelect = shadowRoot.getElementById('annotation-placement');
  const btnSettings = shadowRoot.getElementById('btn-settings');
  const popover = shadowRoot.getElementById('settings-popover');

  // Управление открытием/закрытием настроек
  if (btnSettings && popover) {
    btnSettings.addEventListener('click', (e) => {
      e.stopPropagation();
      popover.classList.toggle('show');
    });
    // Закрытие по клику вне поповера
    document.addEventListener('click', (e) => {
      if (popover.classList.contains('show') && !e.composedPath().includes(popover) && !e.composedPath().includes(btnSettings)) {
        popover.classList.remove('show');
      }
    });
  }

  // Восстановление настроек
  try {
    chrome.storage.local.get(['ai_annotator_verbosity', 'ai_annotator_placement'], (res) => {
      if (res.ai_annotator_verbosity && verbositySelect) {
        verbositySelect.value = res.ai_annotator_verbosity;
      }
      if (res.ai_annotator_placement && placementSelect) {
        placementSelect.value = res.ai_annotator_placement;
      }
      // Сохраняем в глобальную переменную для быстрого доступа из annotations.js
      window.aiSettings = {
        placement: res.ai_annotator_placement || 'click'
      };
    });
  } catch (e) {
    console.warn('AI Annotator: ошибка загрузки настроек', e);
  }

  // Сохранение настроек при изменении
  if (verbositySelect) {
    verbositySelect.addEventListener('change', (e) => {
      chrome.storage.local.set({ ai_annotator_verbosity: e.target.value });
    });
  }
  if (placementSelect) {
    placementSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      window.aiSettings = { ...window.aiSettings, placement: val };
      chrome.storage.local.set({ ai_annotator_placement: val });
      if (typeof scheduleUpdatePositions === 'function') scheduleUpdatePositions();
    });
  }

  shadowRoot.getElementById('btn-toggle-inspect').addEventListener('click', toggleInspection);
  shadowRoot.getElementById('btn-toggle-edit').addEventListener('click', toggleEditMode);
  shadowRoot.getElementById('btn-toggle-templates').addEventListener('click', toggleTemplatesPanel);
  shadowRoot.getElementById('btn-clear-all').addEventListener('click', clearAllAnnotations);
  shadowRoot.getElementById('btn-copy-all').addEventListener('click', copyAllPrompt);
  shadowRoot.getElementById('btn-unload').addEventListener('click', unloadAnnotator);
  
  shadowRoot.getElementById('btn-undo').addEventListener('click', () => { if (typeof performUndo === 'function') performUndo(); });
  shadowRoot.getElementById('btn-redo').addEventListener('click', () => { if (typeof performRedo === 'function') performRedo(); });

  // Инициализируем Properties Panel
  _bindPropsPanelEvents();

  // Инициализация дополнительных обработчиков (Sub-inspection)
  if (typeof initSubInspectionListeners === 'function') {
    initSubInspectionListeners();
  }

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
  if (typeof deinitSubInspectionListeners === 'function') {
    deinitSubInspectionListeners();
  }
  clearAllAnnotations();

  window.removeEventListener('scroll', scheduleUpdatePositions);
  window.removeEventListener('resize', scheduleUpdatePositions);

  if (rootContainer) {
    rootContainer.remove();
    rootContainer = null;
    shadowRoot    = null;
  }
  isEditing = false;
  
  // Отключаем глобальное состояние
  if (chrome && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ isExtensionGlobalActive: false });
  }
}

/* -------------------------------------------------------
   Обновление UI Master Panel
   ------------------------------------------------------- */

function updateMasterPanelUI() {
  if (!shadowRoot) return;

  // Счётчик в заголовке
  const titleEl = shadowRoot.getElementById('master-panel-title');
  if (titleEl) {
    const editCount = window.editChangesLog ? window.editChangesLog.length : 0;
    
    let html = `🧠 AI Annotator ` +
      `<span title="Аннотации" style="font-size:11px;background:rgba(255,255,255,.12);` +
      `padding:2px 6px;border-radius:20px;margin-left:6px;font-weight:700;color:#fff;">${annotations.length}</span>`;
      
    if (editCount > 0) {
      html += `<span title="Внесенные правки" style="font-size:11px;background:rgba(245,158,11,0.2);` +
      `padding:2px 6px;border-radius:20px;margin-left:4px;font-weight:700;color:#fbbf24;">${editCount}</span>`;
    }
    
    titleEl.innerHTML = html;
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
  const countEl  = shadowRoot.getElementById('copy-all-count');
  const clearBtn = shadowRoot.getElementById('btn-clear-all');
  
  const totalItems = annotations.length + (window.editChangesLog?.length || 0) + (window.insertedTemplates?.length || 0);
  const hasData = totalItems > 0;
  
  if (copyBtn)  { 
    copyBtn.disabled  = !hasData; 
    if (countEl) countEl.textContent = totalItems;
  }
  if (clearBtn) { clearBtn.disabled = !hasData; }
  
  if (typeof _updateUndoRedoBtns === 'function') _updateUndoRedoBtns();
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
  // Сначала сохраним текущее состояние, чтобы учесть последние правки
  if (typeof saveAnnotatorState === 'function') saveAnnotatorState();

  try {
    const allData = await chrome.storage.local.get(null);
    const prefix = 'ai-annotator-v2:';
    const keys = Object.keys(allData).filter(k => k.startsWith(prefix));
    
    if (keys.length === 0) return;

    let prompt = '';

    // Вспомогательная функция для сокращения HTML (normal)
    const getShortHtml = (html) => {
      if (!html || html.length <= 400) return html;
      const m = html.match(/^<([a-zA-Z0-9\-]+)[^>]*>/);
      if (m) {
        const tag = m[1];
        return `${m[0]}\n  <!-- ... [внутренний HTML скрыт для краткости] ... -->\n</${tag}>`;
      }
      return html.substring(0, 200) + '...';
    };

    /**
     * Строит структурное резюме элемента для minimal-режима.
     * Возвращает строку вида: <tag.class#id> (WxH) | дети: 3 | текст: "..."
     * Даёт агенту контекст без полного HTML.
     */
    const getElementSummary = (html) => {
      if (!html) return '';
      const m = html.match(/^<([a-zA-Z0-9\-]+)([^>]*)>/);
      if (!m) return html.substring(0, 80);

      const tag = m[1].toLowerCase();
      const attrs = m[2];

      // Извлекаем id
      const idMatch = attrs.match(/\bid\s*=\s*["']([^"']+)["']/i);
      const id = idMatch ? `#${idMatch[1]}` : '';

      // Извлекаем классы (без ai-selector-*)
      const classMatch = attrs.match(/\bclass\s*=\s*["']([^"']+)["']/i);
      let cls = '';
      if (classMatch) {
        const clean = classMatch[1].split(/\s+/).filter(c => c && !c.startsWith('ai-selector'));
        if (clean.length) cls = '.' + clean.slice(0, 3).join('.');
      }

      // Размеры — из data-атрибутов или стилей (если есть)
      const styleMatch = attrs.match(/\bstyle\s*=\s*["']([^"']+)["']/i);
      let dims = '';
      if (styleMatch) {
        const wMatch = styleMatch[1].match(/width\s*:\s*([^;]+)/i);
        const hMatch = styleMatch[1].match(/height\s*:\s*([^;]+)/i);
        if (wMatch || hMatch) dims = ` (${wMatch ? wMatch[1].trim() : '?'}×${hMatch ? hMatch[1].trim() : '?'})`;
      }

      // Количество дочерних элементов
      const childMatch = html.match(/<\/[a-zA-Z0-9\-]+>/g);
      const childCount = childMatch ? childMatch.length - 1 : 0;
      const childInfo = childCount > 0 ? ` | дети: ${childCount}` : '';

      // Краткий текст (до 60 символов)
      const textContent = html.replace(/<[^>]*>/g, '').trim().substring(0, 60);
      const textInfo = textContent ? ` | текст: "${textContent}${textContent.length >= 60 ? '…' : ''}"` : '';

      return `<${tag}${cls}${id}>${dims}${childInfo}${textInfo}`;
    };

    let totalAnns = 0;
    let totalEdits = 0;
    let totalTpls = 0;
    const verbosity = shadowRoot?.getElementById('prompt-verbosity')?.value || 'normal';
    const isMinimal = verbosity === 'minimal';

    keys.forEach((key) => {
      const data = allData[key];
      const pageUrl = data.url || key.replace(prefix, '');
      const hasAnns = data.annotations && data.annotations.length > 0;
      const hasEdits = data.editChanges && data.editChanges.length > 0;
      const hasTpls = data.insertedTemplates && data.insertedTemplates.length > 0;

      if (!hasAnns && !hasEdits && !hasTpls) return;

      if (isMinimal) {
        prompt += `📄 ${pageUrl}\n`;
      } else {
        prompt += `=================================================\n`;
        prompt += `СТРАНИЦА: ${pageUrl}\n`;
        prompt += `=================================================\n\n`;
      }

      // 1. АННОТАЦИИ
      if (hasAnns) {
        totalAnns += data.annotations.length;
        prompt += isMinimal ? `📌 ` : `📌 АННОТАЦИИ И ВОПРОСЫ:\n`;
        data.annotations.forEach((ann, i) => {
          const text = ann.text.trim() || 'Посмотри на этот элемент.';
          if (isMinimal) {
            const summary = getElementSummary(ann.html);
            prompt += `${i + 1}. ${summary} — \`${ann.selector}\`\n   → ${text}\n`;
          } else {
            prompt += `${i + 1}. Селектор: \`${ann.selector}\`\n   Запрос пользователя: ${text}\n`;
            if (verbosity === 'extended' || verbosity === 'normal') {
              const htmlToUse = verbosity === 'extended' ? ann.html : getShortHtml(ann.html);
              prompt += `   HTML элемента:\n\`\`\`html\n${htmlToUse}\n\`\`\`\n\n`;
            } else {
              prompt += `\n`;
            }
          }
        });
        if (isMinimal) prompt += `\n`;
      }

      // 2. РЕДАКТИРОВАНИЕ
      if (hasEdits) {
        totalEdits += data.editChanges.length;
        prompt += isMinimal ? `📝 ` : `📝 ВНЕСЕННЫЕ ПРАВКИ (перенеси эти изменения в код):\n`;
        const bySelector = {};
        data.editChanges.forEach(c => { if (!bySelector[c.selector]) bySelector[c.selector]=[]; bySelector[c.selector].push(c); });

        let editCounter = 1;
        Object.entries(bySelector).forEach(([sel, changes]) => {
          const el = document.querySelector(sel);
          if (isMinimal) {
            const summary = el ? getElementSummary(el.outerHTML) : '';
            prompt += `${editCounter++}. ${summary ? summary + ' ' : ''}\`${sel}\`\n`;
            changes.forEach(c => {
              if (c.property === 'textContent') {
                const shortVal = c.newValue.length > 40 ? c.newValue.substring(0, 40) + '…' : c.newValue;
                prompt += `   • текст → "${shortVal}"\n`;
              } else {
                prompt += `   • ${c.property}: "${c.oldValue}" → "${c.newValue}"\n`;
              }
            });
          } else {
            prompt += `${editCounter++}. Элемент: \`${sel}\`\n`;
            changes.forEach(c => {
              if (c.property === 'textContent') {
                prompt += '   • Изменен текст на: ' + (c.newValue.includes('\\n') ? '\\n```\\n' + c.newValue + '\\n```' : '"' + c.newValue + '"') + '\\n';
              } else {
                prompt += `   • ${c.property}: "${c.oldValue}" → "${c.newValue}"\n`;
              }
            });
            if (el && (verbosity === 'extended' || verbosity === 'normal')) {
              const htmlToUse = verbosity === 'extended' ? el.outerHTML : getShortHtml(el.outerHTML);
              prompt += `   HTML (текущее состояние):\n\`\`\`html\n${htmlToUse}\n\`\`\`\n`;
            }
          }
          prompt += '\n';
        });
      }

      // 3. ШАБЛОНЫ
      if (hasTpls) {
        totalTpls += data.insertedTemplates.length;
        if (isMinimal) {
          prompt += `📐 НОВЫЕ БЛОКИ:\n`;
          data.insertedTemplates.forEach((t, i) => {
            prompt += `${i + 1}. "${t.label}" → \`${t.selector}\`\n`;
          });
        } else {
          prompt += `📐 НОВЫЕ БЛОКИ (Wireframes):\nЯ добавил на страницу схематичные блоки-плейсхолдеры. Твоя задача по ним:\n1. Удали из кода временные плейсхолдеры (элементы с классом \`ai-selector-template-block\`).\n2. Реализуй каждый из описанных ниже блоков как полноценный HTML/CSS-компонент в стиле проекта.\n3. Убедись, что новые компоненты визуально вписываются в существующий дизайн.\n\n`;
          data.insertedTemplates.forEach((t, i) => {
            prompt += `${i + 1}. Блок: **${t.label}**\n   Вставить в/внутрь: \`${t.selector}\`\n\n`;
          });
        }
      }
      
      prompt += `\n`;
    });

    if (totalAnns === 0 && totalEdits === 0 && totalTpls === 0) {
      showToastNotification('Нет данных для копирования!');
      return;
    }

    if (isMinimal) {
      prompt += `Внеси указанные изменения. Выводи только изменённые участки кода.`;
    } else {
      prompt += `Твоя задача: Внеси указанные изменения в код проекта для всех перечисленных страниц. Сделай только необходимые diff-ы или измененные участки кода, не выводи весь файл целиком.`;
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(prompt.trim());
      } else {
        throw new Error("navigator.clipboard API not available");
      }
    } catch (clipboardError) {
      console.warn("Clipboard API failed, trying fallback:", clipboardError);
      const textArea = document.createElement("textarea");
      textArea.value = prompt.trim();
      // Ensure the textarea is not visible but part of the document
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand('copy');
        if (!successful) throw new Error("execCommand copy failed");
      } catch (err) {
        throw err;
      } finally {
        document.body.removeChild(textArea);
      }
    }
    showToastNotification('Глобальный промпт скопирован!');

    const btn = shadowRoot?.getElementById('btn-copy-all');
    if (btn) {
      const origHtml = btn.innerHTML;
      btn.innerHTML        = '<span>✅</span> Скопировано!';
      btn.style.background = 'linear-gradient(135deg,#10b981,#059669)';
      setTimeout(() => {
        btn.innerHTML = origHtml;
        btn.style.background = '';
        updateMasterPanelUI();
      }, 1500);
    }
  } catch (err) {
    console.error('AI Annotator: не удалось скопировать глобально:', err);
    alert('Не удалось скопировать. Предоставьте разрешение буфера обмена.');
  }
}


