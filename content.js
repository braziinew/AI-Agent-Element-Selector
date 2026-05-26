// Внедряемые стили для Shadow DOM (совпадают с shadow.css V4)
const SHADOW_CSS = `
:host {
  all: initial;
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2147483640;
}

.shadow-wrapper * {
  box-sizing: border-box;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.shadow-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* --- MASTER CONTROL PANEL --- */
.master-panel {
  position: fixed !important;
  bottom: 24px !important;
  right: 24px !important;
  width: 300px !important;
  background: rgba(15, 23, 42, 0.9) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 12px !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3) !important;
  padding: 12px 14px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 10px !important;
  z-index: 2147483647 !important;
  pointer-events: auto !important;
  animation: slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.master-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
  padding-bottom: 6px !important;
}

.master-title {
  margin: 0 !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  background: linear-gradient(135deg, #ffffff, #c7d2fe) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  display: flex !important;
  align-items: center;
}

.status-indicator {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  font-size: 11px !important;
  color: #9ca3af !important;
}

.status-dot {
  width: 8px !important;
  height: 8px !important;
  border-radius: 50px !important;
  background-color: #ef4444 !important;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.4) !important;
  transition: all 0.3s ease !important;
}

.status-dot.active {
  background-color: #10b981 !important;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5) !important;
}

.status-dot.editing {
  background-color: #f59e0b !important;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.5) !important;
  animation: pulse 1.5s infinite alternate !important;
}

@keyframes pulse {
  from { opacity: 0.6; }
  to { opacity: 1; }
}

.btn-toggle-inspect {
  width: 100% !important;
  background: rgba(99, 102, 241, 0.12) !important;
  border: 1px dashed rgba(99, 102, 241, 0.4) !important;
  color: #a5b4fc !important;
  padding: 8px !important;
  border-radius: 6px !important;
  font-size: 12px !important;
  font-weight: 550 !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6px !important;
  transition: all 0.2s !important;
}

.btn-toggle-inspect:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.22) !important;
  border-color: #6366f1 !important;
  color: #ffffff !important;
}

.btn-toggle-inspect.active {
  background: linear-gradient(135deg, #6366f1, #4f46e5) !important;
  border: none !important;
  color: #ffffff !important;
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3) !important;
}

.btn-toggle-inspect:disabled {
  background: rgba(255, 255, 255, 0.03) !important;
  border-color: rgba(255, 255, 255, 0.05) !important;
  color: #4b5563 !important;
  cursor: not-allowed !important;
}

.master-actions {
  display: flex !important;
  gap: 6px !important;
}

.btn {
  padding: 8px 10px !important;
  border-radius: 6px !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 4px !important;
  border: none !important;
}

.btn-primary {
  flex-grow: 2 !important;
  background: linear-gradient(135deg, #10b981, #059669) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2) !important;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857) !important;
}

.btn-primary:disabled {
  background: rgba(255, 255, 255, 0.05) !important;
  color: #4b5563 !important;
  cursor: not-allowed !important;
  box-shadow: none !important;
}

.btn-secondary {
  flex-grow: 1 !important;
  background: transparent !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  color: #cbd5e1 !important;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05) !important;
  color: #ffffff !important;
}

.btn-secondary:disabled {
  color: #4b5563 !important;
  border-color: rgba(255, 255, 255, 0.05) !important;
  cursor: not-allowed !important;
}

.btn-close-master {
  background: transparent !important;
  border: none !important;
  color: #9ca3af !important;
  font-size: 16px !important;
  cursor: pointer !important;
  padding: 2px !important;
  border-radius: 4px !important;
  line-height: 1 !important;
  transition: all 0.2s !important;
}

.btn-close-master:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #ffffff !important;
}

/* --- STICKY NOTES --- */
.sticky-note {
  position: absolute !important;
  width: 260px !important;
  background: rgba(15, 23, 42, 0.95) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border: 1.5px solid rgba(16, 185, 129, 0.5) !important;
  border-radius: 10px !important;
  box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.5) !important;
  padding: 8px 10px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 6px !important;
  z-index: 2147483642 !important;
  pointer-events: auto !important;
  animation: noteFadeIn 0.15s ease-out !important;
}

.sticky-note.minimized {
  display: none !important;
}

@keyframes noteFadeIn {
  from { opacity: 0; transform: scale(0.95) translateY(-5px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.note-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
  padding-bottom: 4px !important;
}

.note-title-container {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  max-width: 70% !important;
}

.note-badge {
  background: #10b981 !important;
  color: white !important;
  font-size: 9px !important;
  font-weight: 800 !important;
  padding: 1px 5px !important;
  border-radius: 20px !important;
}

.note-tag {
  font-size: 10px !important;
  font-weight: 550 !important;
  color: #38bdf8 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

.note-controls {
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
}

.btn-note-action {
  background: transparent !important;
  border: none !important;
  color: #9ca3af !important;
  font-size: 13px !important;
  cursor: pointer !important;
  padding: 2px !important;
  border-radius: 4px !important;
  line-height: 1 !important;
  transition: all 0.15s !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center;
}

.btn-note-action:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #ffffff !important;
}

.btn-note-done {
  color: #10b981 !important;
  font-weight: bold !important;
}

.btn-note-done:hover {
  background: rgba(16, 185, 129, 0.15) !important;
  color: #34d399 !important;
}

.btn-note-delete:hover {
  background: rgba(239, 68, 68, 0.15) !important;
  color: #ef4444 !important;
}

.note-body {
  margin: 0 !important;
}

.note-textarea {
  width: 100% !important;
  background: rgba(30, 41, 59, 0.3) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 5px !important;
  padding: 6px !important;
  font-size: 12px !important;
  color: #f3f4f6 !important;
  resize: vertical !important;
  min-height: 50px !important;
  max-height: 150px !important;
  transition: all 0.2s !important;
}

.note-textarea:focus {
  outline: none !important;
  border-color: #10b981 !important;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important;
}

.note-textarea::placeholder {
  color: #555c68 !important;
}

/* --- TOAST NOTIFICATIONS --- */
.toast-notification {
  position: fixed !important;
  bottom: 110px !important;
  right: 24px !important;
  background: rgba(16, 185, 129, 0.95) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
  padding: 8px 14px !important;
  border-radius: 6px !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  z-index: 2147483647 !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3) !important;
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  pointer-events: auto !important;
  animation: slideInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

@keyframes slideInUp {
  from { transform: translateY(80px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* --- РЕЖИМ РЕДАКТИРОВАНИЯ И ПЕРЕМЕЩЕНИЯ --- */

/* Кнопка "Редактировать" в Master Panel */
.btn-toggle-edit {
  width: 100% !important;
  background: rgba(245, 158, 11, 0.12) !important;
  border: 1px dashed rgba(245, 158, 11, 0.4) !important;
  color: #fbd38d !important;
  padding: 8px !important;
  border-radius: 6px !important;
  font-size: 12px !important;
  font-weight: 550 !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6px !important;
  transition: all 0.2s !important;
}

.btn-toggle-edit:hover:not(:disabled) {
  background: rgba(245, 158, 11, 0.22) !important;
  border-color: #f59e0b !important;
  color: #ffffff !important;
}

.btn-toggle-edit.active {
  background: linear-gradient(135deg, #f59e0b, #d97706) !important;
  border: none !important;
  color: #ffffff !important;
  box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3) !important;
}

.btn-toggle-edit:disabled {
  background: rgba(255, 255, 255, 0.03) !important;
  border-color: rgba(255, 255, 255, 0.05) !important;
  color: #4b5563 !important;
  cursor: not-allowed !important;
}
`;

// Состояние расширения
let isInspecting = false;
let isEditing = false;
let isEditMode = false; // Режим перемещения/редактирования элементов
let selectedEditElement = null; // Выделенный элемент для перемещения
let isDragging = false; // Флаг процесса drag-and-drop
let dragStartMouseX = 0;
let dragStartMouseY = 0;
let dragStartElRect = null;
let dropTarget = null;
let dropPosition = null; // 'before' | 'after'

let annotations = []; // массив объектов { id, element, selector, tagName, html, text, minimized }
let lastHoveredElement = null;

// Элементы в основном DOM (подсветка при наведении)
let hoverOverlay = null;
let labelOverlay = null;
let editHoverOverlay = null;
let editSelectedOverlay = null;
let editLabelOverlay = null;
let dropIndicator = null;

// Элементы Shadow DOM
let rootContainer = null;
let shadowRoot = null;

// Инициализация по сигналу от всплывающего окна (popup)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "start-inspect") {
    initAnnotator();
  }
});

// Глобальное сочетание клавиш Ctrl+Shift+S для быстрого переключения инспектора
window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.code === 'KeyS') {
    e.preventDefault();
    initAnnotator();
    toggleInspection();
  }
});

// Инициализация расширения на странице
function initAnnotator() {
  createRootContainer();
  createOverlayElements();
  
  if (!isEditing) {
    startInspection();
  }
  
  updateMasterPanelUI();
  updatePositions();
}

// Создание контейнера для Shadow DOM
function createRootContainer() {
  if (rootContainer) return;

  rootContainer = document.createElement('div');
  rootContainer.id = 'ai-agent-selector-root';
  document.body.appendChild(rootContainer);

  shadowRoot = rootContainer.attachShadow({ mode: 'open' });

  // Внедряем стили
  const styleEl = document.createElement('style');
  styleEl.textContent = SHADOW_CSS;
  shadowRoot.appendChild(styleEl);

  // Создаем обертку
  const wrapper = document.createElement('div');
  wrapper.className = 'shadow-wrapper';

  // Рендерим Master Panel
  wrapper.innerHTML = `
    <div class="master-panel">
      <div class="master-header">
        <h4 class="master-title" id="master-panel-title">🧠 AI Annotator</h4>
        <button class="btn-close-master" id="btn-unload" title="Закрыть и очистить все">&times;</button>
      </div>
      
      <div class="status-indicator">
        <div class="status-dot" id="inspect-status-dot"></div>
        <span id="inspect-status-text">Выбор отключен</span>
      </div>

      <div style="display: flex; gap: 8px; margin-bottom: 4px;">
        <button class="btn-toggle-inspect" id="btn-toggle-inspect" style="flex: 1; padding: 8px 4px !important;">
          <span>🔍</span> Аннотация
        </button>
        <button class="btn-toggle-edit" id="btn-toggle-edit" style="flex: 1; padding: 8px 4px !important;">
          <span>🏗️</span> Редактировать
        </button>
      </div>

      <div class="master-actions">
        <button class="btn btn-secondary" id="btn-clear-all" disabled>Очистить</button>
        <button class="btn btn-primary" id="btn-copy-all" disabled>Скопировать всё (0)</button>
      </div>
    </div>
  `;

  shadowRoot.appendChild(wrapper);

  // Вешаем обработчики на элементы Master Panel
  shadowRoot.getElementById('btn-toggle-inspect').addEventListener('click', toggleInspection);
  shadowRoot.getElementById('btn-toggle-edit').addEventListener('click', toggleEditMode);
  shadowRoot.getElementById('btn-clear-all').addEventListener('click', clearAllAnnotations);
  shadowRoot.getElementById('btn-copy-all').addEventListener('click', copyAllPrompt);
  shadowRoot.getElementById('btn-unload').addEventListener('click', unloadAnnotator);

  // Отслеживаем изменения скролла и размера окна для автопересчета координат
  window.addEventListener('scroll', updatePositions, { passive: true });
  window.addEventListener('resize', updatePositions, { passive: true });
}

// Удаление расширения со страницы (выгрузка)
function unloadAnnotator() {
  stopInspection(true);
  stopEditMode(true);
  clearAllAnnotations();

  window.removeEventListener('scroll', updatePositions);
  window.removeEventListener('resize', updatePositions);

  if (rootContainer) {
    rootContainer.remove();
    rootContainer = null;
    shadowRoot = null;
  }
  isEditing = false;
}

// Создание элементов подсветки наведения во внешнем DOM
function createOverlayElements() {
  if (!hoverOverlay) {
    hoverOverlay = document.createElement('div');
    hoverOverlay.className = 'ai-selector-hover-overlay';
    hoverOverlay.style.display = 'none';
    document.body.appendChild(hoverOverlay);
  }

  if (!labelOverlay) {
    labelOverlay = document.createElement('div');
    labelOverlay.className = 'ai-selector-label';
    labelOverlay.style.display = 'none';
    document.body.appendChild(labelOverlay);
  }

  if (!editHoverOverlay) {
    editHoverOverlay = document.createElement('div');
    editHoverOverlay.className = 'ai-selector-edit-hover-overlay';
    editHoverOverlay.style.display = 'none';
    document.body.appendChild(editHoverOverlay);
  }

  if (!editSelectedOverlay) {
    editSelectedOverlay = document.createElement('div');
    editSelectedOverlay.className = 'ai-selector-edit-selected-overlay';
    editSelectedOverlay.style.display = 'none';
    document.body.appendChild(editSelectedOverlay);
  }

  if (!editLabelOverlay) {
    editLabelOverlay = document.createElement('div');
    editLabelOverlay.className = 'ai-selector-edit-label';
    editLabelOverlay.style.display = 'none';
    document.body.appendChild(editLabelOverlay);
  }

  if (!dropIndicator) {
    dropIndicator = document.createElement('div');
    dropIndicator.className = 'ai-selector-drop-indicator';
    dropIndicator.style.display = 'none';
    document.body.appendChild(dropIndicator);
  }
}

// Переключение режима выбора элементов
function toggleInspection() {
  if (isEditing) return; // Нельзя переключить вручную во время редактирования
  
  if (isEditMode) {
    stopEditMode();
  }

  if (isInspecting) {
    stopInspection();
  } else {
    startInspection();
  }
}

// Запуск инспектора
function startInspection() {
  if (isInspecting || isEditing) return;
  isInspecting = true;

  document.addEventListener('mouseover', handleMouseOver, true);
  document.addEventListener('mousemove', handleMouseMove, true);
  document.addEventListener('click', handleElementClick, true);
  document.addEventListener('keydown', handleKeyDown, true);

  document.body.style.cursor = 'crosshair';

  updateMasterPanelUI();
}

// Остановка инспектора
function stopInspection(removeHoverOverlays = true) {
  if (!isInspecting) return;
  isInspecting = false;

  document.removeEventListener('mouseover', handleMouseOver, true);
  document.removeEventListener('mousemove', handleMouseMove, true);
  document.removeEventListener('click', handleElementClick, true);
  document.removeEventListener('keydown', handleKeyDown, true);

  document.body.style.cursor = 'default';

  if (removeHoverOverlays) {
    if (hoverOverlay) hoverOverlay.style.display = 'none';
    if (labelOverlay) labelOverlay.style.display = 'none';
  }

  updateMasterPanelUI();
}

// Переключение режима редактирования (перемещения) элементов
function toggleEditMode() {
  if (isEditing) return; // Нельзя во время ввода аннотаций
  
  if (isInspecting) {
    stopInspection();
  }

  if (isEditMode) {
    stopEditMode();
  } else {
    startEditMode();
  }
}

// Запуск режима редактирования
function startEditMode() {
  if (isEditMode || isEditing) return;
  isEditMode = true;

  document.addEventListener('mouseover', handleEditMouseOver, true);
  document.addEventListener('mousemove', handleEditMouseMove, true);
  document.addEventListener('click', handleEditClick, true);
  document.addEventListener('keydown', handleEditKeyDown, true);

  document.body.style.cursor = 'cell';

  updateMasterPanelUI();
}

// Остановка режима редактирования
function stopEditMode(clearSelection = true) {
  if (!isEditMode) return;
  isEditMode = false;

  document.removeEventListener('mouseover', handleEditMouseOver, true);
  document.removeEventListener('mousemove', handleEditMouseMove, true);
  document.removeEventListener('click', handleEditClick, true);
  document.removeEventListener('keydown', handleEditKeyDown, true);

  document.body.style.cursor = 'default';

  if (editHoverOverlay) editHoverOverlay.style.display = 'none';
  if (editLabelOverlay) editLabelOverlay.style.display = 'none';

  if (clearSelection) {
    deselectEditElement();
  }

  updateMasterPanelUI();
}

// Обновление кнопок и статусов в Master Panel
function updateMasterPanelUI() {
  if (!shadowRoot) return;

  const titleEl = shadowRoot.getElementById('master-panel-title');
  if (titleEl) {
    titleEl.innerHTML = `🧠 AI Annotator <span style="font-size: 11px; background: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 20px; margin-left: 6px; font-weight: 700;">${annotations.length}</span>`;
  }

  const dot = shadowRoot.getElementById('inspect-status-dot');
  const text = shadowRoot.getElementById('inspect-status-text');
  const toggleBtn = shadowRoot.getElementById('btn-toggle-inspect');
  const editBtn = shadowRoot.getElementById('btn-toggle-edit');

  if (isEditing) {
    if (dot) { dot.className = 'status-dot editing'; }
    if (text) { text.textContent = 'Ввод комментария...'; }
    if (toggleBtn) {
      toggleBtn.disabled = true;
      toggleBtn.className = 'btn-toggle-inspect';
      toggleBtn.innerHTML = '<span>🔍</span> Аннотация';
    }
    if (editBtn) {
      editBtn.disabled = true;
      editBtn.className = 'btn-toggle-edit';
      editBtn.innerHTML = '<span>🏗️</span> Редактировать';
    }
  } else if (isInspecting) {
    if (dot) { dot.className = 'status-dot active'; }
    if (text) { text.textContent = 'Выбор активен (кликните на элемент)'; }
    if (toggleBtn) {
      toggleBtn.disabled = false;
      toggleBtn.className = 'btn-toggle-inspect active';
      toggleBtn.innerHTML = '<span>⏹</span> Стоп';
    }
    if (editBtn) {
      editBtn.disabled = false;
      editBtn.className = 'btn-toggle-edit';
      editBtn.innerHTML = '<span>🏗️</span> Редактировать';
    }
  } else if (isEditMode) {
    if (dot) { dot.className = 'status-dot editing'; }
    if (text) { text.textContent = 'Режим перемещения: выберите элемент'; }
    if (toggleBtn) {
      toggleBtn.disabled = false;
      toggleBtn.className = 'btn-toggle-inspect';
      toggleBtn.innerHTML = '<span>🔍</span> Аннотация';
    }
    if (editBtn) {
      editBtn.disabled = false;
      editBtn.className = 'btn-toggle-edit active';
      editBtn.innerHTML = '<span>⏹</span> Стоп';
    }
  } else {
    if (dot) { dot.className = 'status-dot'; }
    if (text) { text.textContent = 'Выбор отключен'; }
    if (toggleBtn) {
      toggleBtn.disabled = false;
      toggleBtn.className = 'btn-toggle-inspect';
      toggleBtn.innerHTML = '<span>🔍</span> Аннотация';
    }
    if (editBtn) {
      editBtn.disabled = false;
      editBtn.className = 'btn-toggle-edit';
      editBtn.innerHTML = '<span>🏗️</span> Редактировать';
    }
  }

  const copyBtn = shadowRoot.getElementById('btn-copy-all');
  const clearBtn = shadowRoot.getElementById('btn-clear-all');

  if (copyBtn) {
    copyBtn.disabled = annotations.length === 0;
    copyBtn.innerHTML = `<span>📋</span> Скопировать всё (${annotations.length})`;
  }
  if (clearBtn) {
    clearBtn.disabled = annotations.length === 0;
  }
}

// Обработка движения мыши при наведении на элементы
function handleMouseOver(e) {
  if (!isInspecting) return;

  // Игнорируем наши служебные элементы подсветки во внешнем DOM
  if (e.target.classList.contains('ai-selector-hover-overlay') || 
      e.target.classList.contains('ai-selector-label') ||
      e.target.classList.contains('ai-selector-persistent-overlay') ||
      e.target.classList.contains('ai-selector-persistent-badge')) {
    return;
  }

  // Игнорируем элементы внутри Shadow DOM
  if (rootContainer && (e.target === rootContainer || rootContainer.contains(e.target))) {
    hoverOverlay.style.display = 'none';
    labelOverlay.style.display = 'none';
    return;
  }

  if (e.target === document.documentElement || e.target === document.body) {
    hoverOverlay.style.display = 'none';
    labelOverlay.style.display = 'none';
    return;
  }

  lastHoveredElement = e.target;
  updateOverlayPosition(lastHoveredElement);
}

function handleMouseMove(e) {
  if (!isInspecting || !lastHoveredElement) return;
  updateOverlayPosition(lastHoveredElement);
}

// Обновление положения временной рамки выбора
function updateOverlayPosition(element) {
  if (!element) return;
  const rect = element.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  hoverOverlay.style.width = `${rect.width}px`;
  hoverOverlay.style.height = `${rect.height}px`;
  hoverOverlay.style.left = `${rect.left + scrollX}px`;
  hoverOverlay.style.top = `${rect.top + scrollY}px`;
  hoverOverlay.style.display = 'block';

  const tagName = element.tagName.toLowerCase();
  const idSuffix = element.id ? `#${element.id}` : '';
  
  let classSuffix = '';
  if (element.classList && element.classList.length > 0) {
    const cleanClasses = Array.from(element.classList).filter(c => !c.startsWith('ai-selector'));
    if (cleanClasses.length > 0) {
      classSuffix = `.${cleanClasses[0]}`;
    }
  }

  labelOverlay.innerHTML = `<span class="ai-selector-label-tag">${tagName}${idSuffix}${classSuffix}</span><span class="ai-selector-label-dimensions">${Math.round(rect.width)} × ${Math.round(rect.height)}</span>`;
  
  labelOverlay.style.display = 'block';
  const labelHeight = labelOverlay.offsetHeight || 20;
  let labelTop = rect.top + scrollY - labelHeight - 5;
  if (labelTop < scrollY) {
    labelTop = rect.top + scrollY + rect.height + 5;
  }
  
  labelOverlay.style.left = `${Math.max(scrollX + 5, rect.left + scrollX)}px`;
  labelOverlay.style.top = `${labelTop}px`;
}

// Обработка клика по элементу
function handleElementClick(e) {
  if (!isInspecting) return;

  // Игнорируем клики по интерфейсу расширения
  if (rootContainer && (e.target === rootContainer || rootContainer.contains(e.target))) {
    return;
  }

  e.preventDefault();
  e.stopPropagation();

  const selectedElement = lastHoveredElement || e.target;
  if (selectedElement) {
    addAnnotation(selectedElement);
  }
}

function handleKeyDown(e) {
  if (e.key === 'Escape') {
    stopInspection();
  }
}

// Добавление новой аннотации
function addAnnotation(element) {
  if (annotations.some(ann => ann.element === element)) {
    return;
  }

  const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
  const selector = getUniqueCssSelector(element);
  const tagName = element.tagName.toLowerCase();
  const outerHTML = element.outerHTML;

  const annotation = {
    id,
    element,
    selector,
    tagName,
    html: outerHTML,
    text: '',
    minimized: false // Изначально развернут для ввода
  };

  annotations.push(annotation);

  // Входим в режим редактирования и ставим инспектор на паузу
  isEditing = true;
  stopInspection(true);

  // Создаем стикер для ввода в Shadow DOM
  createStickyNote(annotation);

  // Обновляем Master Panel
  updateMasterPanelUI();

  // Рассчитываем координаты элементов
  updatePositions();

  // Фокусируем textarea нового стикера
  setTimeout(() => {
    const noteEl = shadowRoot.getElementById(`ai-note-${id}`);
    if (noteEl) {
      const textarea = noteEl.querySelector('.note-textarea');
      if (textarea) textarea.focus();
    }
  }, 100);
}

// Создание элемента Sticky Note в Shadow DOM
function createStickyNote(annotation) {
  if (!shadowRoot) return;

  const note = document.createElement('div');
  note.id = `ai-note-${annotation.id}`;
  note.className = 'sticky-note';

  note.innerHTML = `
    <div class="note-header">
      <div class="note-title-container">
        <span class="note-badge">#</span>
        <span class="note-tag" title="${escapeHtml(annotation.selector)}">${escapeHtml(annotation.tagName)}: ${escapeHtml(annotation.selector)}</span>
      </div>
      <div class="note-controls">
        <button class="btn-note-action btn-note-done" id="btn-done-${annotation.id}" title="Готово (свернуть)">✓</button>
        <button class="btn-note-action btn-note-delete" id="btn-del-${annotation.id}" title="Удалить аннотацию">&times;</button>
      </div>
    </div>
    <div class="note-body">
      <textarea class="note-textarea" id="txt-${annotation.id}" placeholder="Инструкция для ИИ..."></textarea>
    </div>
  `;

  const textarea = note.querySelector('.note-textarea');

  // Отслеживаем ввод текста
  textarea.addEventListener('input', (e) => {
    annotation.text = e.target.value;
  });

  // Завершение по Ctrl+Enter
  textarea.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      saveAndCollapseAnnotation(annotation.id);
    }
  });

  // Завершение при потере фокуса (blur) с небольшой задержкой, чтобы успели отработать клики кнопок
  textarea.addEventListener('blur', () => {
    setTimeout(() => {
      // Проверяем, существует ли еще аннотация (ее могли удалить кнопкой delete)
      if (annotations.some(a => a.id === annotation.id)) {
        saveAndCollapseAnnotation(annotation.id);
      }
    }, 150);
  });

  // Завершение по кнопке Done (галочка ✓)
  note.querySelector('.btn-note-done').addEventListener('click', (e) => {
    e.stopPropagation();
    saveAndCollapseAnnotation(annotation.id);
  });

  // Удаление по кнопке Delete
  note.querySelector('.btn-note-delete').addEventListener('click', (e) => {
    e.stopPropagation();
    deleteAnnotation(annotation.id);
  });

  shadowRoot.querySelector('.shadow-wrapper').appendChild(note);
}

// Разворачивание стикера для редактирования (клик по круглому пину на странице)
function editAndExpandAnnotation(id) {
  const ann = annotations.find(a => a.id === id);
  if (ann) {
    // Сворачиваем любые другие открытые стикеры, если они есть
    annotations.forEach(a => {
      if (a.id !== id && !a.minimized) {
        saveAndCollapseAnnotation(a.id);
      }
    });

    ann.minimized = false;

    // Снимаем класс минимизации с пина во внешнем DOM
    const badge = document.getElementById(`ai-badge-${id}`);
    if (badge) {
      badge.classList.remove('minimized');
      badge.title = 'Свернуть аннотацию';
    }

    // Показываем стикер в Shadow DOM
    if (shadowRoot) {
      const note = shadowRoot.getElementById(`ai-note-${id}`);
      if (note) {
        note.classList.remove('minimized');
        note.style.display = 'flex';
        
        // Фокусируем textarea
        setTimeout(() => {
          const textarea = note.querySelector('.note-textarea');
          if (textarea) textarea.focus();
        }, 50);
      }
    }

    // Приостанавливаем выбор
    isEditing = true;
    stopInspection(true);

    updatePositions();
    updateMasterPanelUI();
  }
}

// Завершение редактирования и сворачивание стикера
function saveAndCollapseAnnotation(id) {
  const ann = annotations.find(a => a.id === id);
  if (ann && !ann.minimized) {
    ann.minimized = true;

    // Устанавливаем класс минимизации на пин во внешнем DOM
    const badge = document.getElementById(`ai-badge-${id}`);
    if (badge) {
      badge.classList.add('minimized');
      badge.title = 'Развернуть аннотацию';
    }

    // Скрываем стикер в Shadow DOM
    if (shadowRoot) {
      const note = shadowRoot.getElementById(`ai-note-${id}`);
      if (note) {
        note.classList.add('minimized');
      }
    }

    // Возобновляем выбор элементов
    isEditing = false;
    startInspection();

    updatePositions();
    updateMasterPanelUI();
  }
}

// Удаление отдельной аннотации
function deleteAnnotation(id) {
  const index = annotations.findIndex(ann => ann.id === id);
  if (index !== -1) {
    const wasEditingThis = !annotations[index].minimized;

    // Удаляем визуальные элементы во внешнем DOM
    const overlay = document.getElementById(`ai-overlay-${id}`);
    const badge = document.getElementById(`ai-badge-${id}`);
    if (overlay) overlay.remove();
    if (badge) badge.remove();

    // Удаляем стикер в Shadow DOM
    const note = shadowRoot.getElementById(`ai-note-${id}`);
    if (note) note.remove();

    // Удаляем из массива
    annotations.splice(index, 1);

    // Если удалили редактируемую в данный момент аннотацию, возвращаем выбор
    if (wasEditingThis) {
      isEditing = false;
      startInspection();
    }

    // Обновляем координаты и Master Panel
    updateMasterPanelUI();
    updatePositions();
  }
}

// Очистка всех аннотаций
function clearAllAnnotations() {
  annotations.forEach(ann => {
    const overlay = document.getElementById(`ai-overlay-${ann.id}`);
    const badge = document.getElementById(`ai-badge-${ann.id}`);
    if (overlay) overlay.remove();
    if (badge) badge.remove();

    const note = shadowRoot.getElementById(`ai-note-${ann.id}`);
    if (note) note.remove();
  });

  annotations = [];
  isEditing = false;
  
  if (rootContainer) {
    startInspection();
  }
  
  updateMasterPanelUI();
}

// Обновление положения ВСЕХ рамок подсветки и стикеров на странице
function updatePositions() {
  if (!rootContainer || !shadowRoot) return;

  if (selectedEditElement) {
    updateEditPositions();
  }

  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  annotations.forEach((ann, index) => {
    const el = ann.element;
    
    // Если элемент пропал из DOM
    if (!el || !document.body.contains(el)) {
      hideAnnotationVisuals(ann.id);
      return;
    }

    const rect = el.getBoundingClientRect();
    
    // Если элемент скрыт
    if (rect.width === 0 || rect.height === 0) {
      hideAnnotationVisuals(ann.id);
      return;
    }

    // --- 1. Работа с рамкой и бейджем во внешнем DOM ---
    let overlay = document.getElementById(`ai-overlay-${ann.id}`);
    let badge = document.getElementById(`ai-badge-${ann.id}`);

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = `ai-overlay-${ann.id}`;
      overlay.className = 'ai-selector-persistent-overlay';
      document.body.appendChild(overlay);
    }
    if (!badge) {
      badge = document.createElement('div');
      badge.id = `ai-badge-${ann.id}`;
      badge.className = 'ai-selector-persistent-badge';
      
      // Клик по круглому пину разворачивает стикер для редактирования
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        if (ann.minimized) {
          editAndExpandAnnotation(ann.id);
        } else {
          saveAndCollapseAnnotation(ann.id);
        }
      });
      
      document.body.appendChild(badge);
    }

    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.left = `${rect.left + scrollX}px`;
    overlay.style.top = `${rect.top + scrollY}px`;
    overlay.style.display = 'block';

    badge.textContent = `${index + 1}`;
    badge.style.left = `${rect.left + scrollX - 8}px`;
    badge.style.top = `${rect.top + scrollY - 12}px`;
    badge.style.display = 'flex';

    // Обновляем визуальный класс бейджа
    if (ann.minimized) {
      badge.classList.add('minimized');
      badge.title = 'Развернуть аннотацию';
    } else {
      badge.classList.remove('minimized');
      badge.title = 'Свернуть аннотацию';
    }

    // --- 2. Позиционирование плашки (Sticky Note) в Shadow DOM ---
    const note = shadowRoot.getElementById(`ai-note-${ann.id}`);
    if (note) {
      if (ann.minimized) {
        note.classList.add('minimized');
      } else {
        note.classList.remove('minimized');
        note.style.display = 'flex';
        
        const noteWidth = 260;
        // Пробуем поставить справа от элемента с отступом 10px
        let noteLeft = rect.left + scrollX + rect.width + 10;
        let noteTop = rect.top + scrollY;

        // Если справа выходит за экран
        if (rect.left + rect.width + 10 + noteWidth > window.innerWidth) {
          // Пробуем поставить слева от элемента
          noteLeft = rect.left + scrollX - noteWidth - 10;
        }

        // Если и слева выходит за экран, ставим под элементом
        if (noteLeft < scrollX) {
          noteLeft = Math.max(scrollX + 10, rect.left + scrollX);
          noteTop = rect.top + scrollY + rect.height + 10;
        }

        note.style.left = `${noteLeft}px`;
        note.style.top = `${noteTop}px`;
      }

      // Обновляем визуальный индекс в стикере
      const badgeEl = note.querySelector('.note-badge');
      if (badgeEl) {
        badgeEl.textContent = `#${index + 1}`;
      }
    }
  });
}

// Скрытие визуализаций для конкретного id
function hideAnnotationVisuals(id) {
  const overlay = document.getElementById(`ai-overlay-${id}`);
  const badge = document.getElementById(`ai-badge-${id}`);
  if (overlay) overlay.style.display = 'none';
  if (badge) badge.style.display = 'none';

  if (shadowRoot) {
    const note = shadowRoot.getElementById(`ai-note-${id}`);
    if (note) note.style.display = 'none';
  }
}

// Сборка и копирование Оптимизированного промпта (Минимум токенов)
async function copyAllPrompt() {
  if (annotations.length === 0) return;

  // Формируем супер-компактный промпт без "воды"
  let markdownPrompt = `URL: ${window.location.href}\n\n`;

  annotations.forEach((ann, index) => {
    const userText = ann.text.trim() || 'Без комментариев.';
    
    // Умная оптимизация HTML: если блок огромный, берем только его открывающий тег со всеми атрибутами
    let htmlContent = ann.html;
    if (htmlContent.length > 2500) {
      const match = htmlContent.match(/^<[a-zA-Z0-9\-]+[^>]*>/);
      if (match) {
        const openTag = match[0];
        const closeTagName = openTag.match(/^<([a-zA-Z0-9\-]+)/)[1];
        htmlContent = `${openTag}\n  <!-- [HTML truncated (original length: ${ann.html.length} chars) ...] -->\n</${closeTagName}>`;
      } else {
        htmlContent = htmlContent.substring(0, 1000) + '\n  <!-- [HTML truncated] -->\n' + htmlContent.substring(htmlContent.length - 500);
      }
    }

    markdownPrompt += `${index + 1}. Селектор: \`${ann.selector}\`
Комментарий: ${userText}
HTML:
\`\`\`html
${htmlContent}
\`\`\`

`;
  });

  // Убираем последний лишний перенос строки
  markdownPrompt = markdownPrompt.trim();

  try {
    await navigator.clipboard.writeText(markdownPrompt);
    
    // Отображаем Toast уведомление
    showToastNotification("Промпт скопирован в буфер обмена!");

    const copyBtn = shadowRoot.getElementById('btn-copy-all');
    if (copyBtn) {
      copyBtn.innerHTML = '<span>✅</span> Скопировано!';
      copyBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      setTimeout(() => {
        updateMasterPanelUI();
      }, 1200);
    }
  } catch (err) {
    console.error('Не удалось скопировать данные: ', err);
    alert('Не удалось скопировать. Предоставьте разрешение буфера обмена.');
  }
}

// Отображение всплывающего уведомления Toast в Shadow DOM
function showToastNotification(message) {
  if (!shadowRoot) return;

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `<span>🎉</span> ${message}`;
  shadowRoot.querySelector('.shadow-wrapper').appendChild(toast);
  
  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease-out';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 1000);
}

/* --- ОБРАБОТЧИКИ СОБЫТИЙ И МЕТОДЫ РЕЖИМА РЕДАКТИРОВАНИЯ --- */

// Обработка наведения мыши в режиме редактирования
function handleEditMouseOver(e) {
  if (!isEditMode || isDragging) return;

  // Игнорируем оверлеи и системные элементы расширения во внешнем DOM
  if (e.target.classList.contains('ai-selector-hover-overlay') || 
      e.target.classList.contains('ai-selector-label') ||
      e.target.classList.contains('ai-selector-persistent-overlay') ||
      e.target.classList.contains('ai-selector-persistent-badge') ||
      e.target.classList.contains('ai-selector-edit-hover-overlay') ||
      e.target.classList.contains('ai-selector-edit-selected-overlay') ||
      e.target.classList.contains('ai-selector-edit-label') ||
      e.target.classList.contains('ai-selector-drop-indicator')) {
    return;
  }

  // Игнорируем элементы внутри Shadow DOM
  if (rootContainer && (e.target === rootContainer || rootContainer.contains(e.target))) {
    if (editHoverOverlay) editHoverOverlay.style.display = 'none';
    if (editLabelOverlay) editLabelOverlay.style.display = 'none';
    return;
  }

  if (e.target === document.documentElement || e.target === document.body) {
    if (editHoverOverlay) editHoverOverlay.style.display = 'none';
    if (editLabelOverlay) editLabelOverlay.style.display = 'none';
    return;
  }

  lastHoveredElement = e.target;
  updateEditOverlayPosition(lastHoveredElement);
}

// Движение мыши в режиме редактирования
function handleEditMouseMove(e) {
  if (!isEditMode || !lastHoveredElement || isDragging) return;
  updateEditOverlayPosition(lastHoveredElement);
}

// Обновление положения рамки наведения в режиме редактирования
function updateEditOverlayPosition(element) {
  if (!element || !editHoverOverlay || !editLabelOverlay) return;

  // Если навели на уже выделенный элемент, скрываем рамку наведения
  if (element === selectedEditElement) {
    editHoverOverlay.style.display = 'none';
    editLabelOverlay.style.display = 'none';
    return;
  }

  const rect = element.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  editHoverOverlay.style.width = `${rect.width}px`;
  editHoverOverlay.style.height = `${rect.height}px`;
  editHoverOverlay.style.left = `${rect.left + scrollX}px`;
  editHoverOverlay.style.top = `${rect.top + scrollY}px`;
  editHoverOverlay.style.display = 'block';

  const tagName = element.tagName.toLowerCase();
  const idSuffix = element.id ? `#${element.id}` : '';
  
  let classSuffix = '';
  if (element.classList && element.classList.length > 0) {
    const cleanClasses = Array.from(element.classList).filter(c => !c.startsWith('ai-selector'));
    if (cleanClasses.length > 0) {
      classSuffix = `.${cleanClasses[0]}`;
    }
  }

  editLabelOverlay.innerHTML = `<span class="ai-selector-edit-label-tag">${tagName}${idSuffix}${classSuffix}</span><span class="ai-selector-edit-label-dimensions">${Math.round(rect.width)} × ${Math.round(rect.height)}</span>`;
  
  editLabelOverlay.style.display = 'block';
  const labelHeight = editLabelOverlay.offsetHeight || 20;
  let labelTop = rect.top + scrollY - labelHeight - 5;
  if (labelTop < scrollY) {
    labelTop = rect.top + scrollY + rect.height + 5;
  }
  
  editLabelOverlay.style.left = `${Math.max(scrollX + 5, rect.left + scrollX)}px`;
  editLabelOverlay.style.top = `${labelTop}px`;
}

// Обработка клика в режиме редактирования
function handleEditClick(e) {
  if (!isEditMode || isDragging) return;

  // Игнорируем клики по интерфейсу расширения
  if (rootContainer && (e.target === rootContainer || rootContainer.contains(e.target))) {
    return;
  }

  e.preventDefault();
  e.stopPropagation();

  // Если кликнули по самому оверлею выделения, не сбрасываем выделение (это начало drag)
  if (e.target === editSelectedOverlay) {
    return;
  }

  const clickedElement = lastHoveredElement || e.target;
  if (clickedElement) {
    selectEditElement(clickedElement);
  }
}

// Обработка нажатий клавиш в режиме редактирования
function handleEditKeyDown(e) {
  if (e.key === 'Escape') {
    if (selectedEditElement) {
      deselectEditElement();
    } else {
      stopEditMode();
    }
  }
}

// Выделение элемента для перемещения
function selectEditElement(element) {
  if (!element) return;
  selectedEditElement = element;

  // Скрываем рамку наведения
  if (editHoverOverlay) editHoverOverlay.style.display = 'none';
  if (editLabelOverlay) editLabelOverlay.style.display = 'none';

  // Обновляем оверлеи
  updateEditPositions();

  // Инициализируем drag-and-drop обработчики
  setupDragAndDrop();
}

// Снятие выделения с элемента
function deselectEditElement() {
  selectedEditElement = null;
  if (editSelectedOverlay) editSelectedOverlay.style.display = 'none';
}

// Обновление положения оверлея выделения
function updateEditPositions() {
  if (!selectedEditElement || !editSelectedOverlay) return;

  const rect = selectedEditElement.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  // Рамка выделения
  editSelectedOverlay.style.width = `${rect.width}px`;
  editSelectedOverlay.style.height = `${rect.height}px`;
  editSelectedOverlay.style.left = `${rect.left + scrollX}px`;
  editSelectedOverlay.style.top = `${rect.top + scrollY}px`;
  editSelectedOverlay.style.display = 'block';
}

/* --- DRAG AND DROP ПЕРЕМЕЩЕНИЕ --- */

// Настройка drag-and-drop событий
function setupDragAndDrop() {
  if (!editSelectedOverlay) return;
  editSelectedOverlay.onmousedown = startDrag;
}

// Начало перетаскивания
function startDrag(e) {
  if (!selectedEditElement) return;
  e.preventDefault();

  isDragging = true;
  dragStartMouseX = e.clientX;
  dragStartMouseY = e.clientY;

  const rect = selectedEditElement.getBoundingClientRect();
  dragStartElRect = {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height
  };

  // Визуально разгружаем элемент
  selectedEditElement.classList.add('ai-selector-dragged-element');

  window.addEventListener('mousemove', dragMove, true);
  window.addEventListener('mouseup', dragEnd, true);
}

// Процесс перемещения
function dragMove(e) {
  if (!isDragging || !selectedEditElement) return;
  e.preventDefault();

  const dx = e.clientX - dragStartMouseX;
  const dy = e.clientY - dragStartMouseY;

  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  // Двигаем оверлей выделения за курсором
  if (editSelectedOverlay) {
    editSelectedOverlay.style.left = `${dragStartElRect.left + scrollX + dx}px`;
    editSelectedOverlay.style.top = `${dragStartElRect.top + scrollY + dy}px`;
  }

  // Если зажат Alt, отключаем привязку (snapping) для свободного перемещения
  if (e.altKey) {
    if (dropIndicator) {
      dropIndicator.style.display = 'none';
    }
    dropTarget = null;
    return;
  }

  // Скрываем служебные оверлеи перед вызовом elementFromPoint
  const prevSelDisplay = editSelectedOverlay ? editSelectedOverlay.style.display : 'none';
  const prevIndDisplay = dropIndicator ? dropIndicator.style.display : 'none';
  const prevHoverDisplay = editHoverOverlay ? editHoverOverlay.style.display : 'none';

  if (editSelectedOverlay) editSelectedOverlay.style.display = 'none';
  if (dropIndicator) dropIndicator.style.display = 'none';
  if (editHoverOverlay) editHoverOverlay.style.display = 'none';

  let target = document.elementFromPoint(e.clientX, e.clientY);

  // Возвращаем видимость оверлеев
  if (editSelectedOverlay) editSelectedOverlay.style.display = prevSelDisplay;
  if (dropIndicator) dropIndicator.style.display = prevIndDisplay;
  if (editHoverOverlay) editHoverOverlay.style.display = prevHoverDisplay;

  if (!target) {
    if (dropIndicator) dropIndicator.style.display = 'none';
    dropTarget = null;
    return;
  }

  // Игнорируем перемещение в самого себя, своих детей, Shadow DOM и верхние элементы body/html
  if (target === selectedEditElement || selectedEditElement.contains(target) || 
      (rootContainer && (target === rootContainer || rootContainer.contains(target))) ||
      target === document.documentElement || target === document.body) {
    if (dropIndicator) dropIndicator.style.display = 'none';
    dropTarget = null;
    return;
  }

  dropTarget = target;

  const targetRect = target.getBoundingClientRect();
  
  // Рассчитываем расстояния от курсора до 4 граней целевого элемента
  const distLeft = Math.abs(e.clientX - targetRect.left);
  const distRight = Math.abs(e.clientX - targetRect.right);
  const distTop = Math.abs(e.clientY - targetRect.top);
  const distBottom = Math.abs(e.clientY - targetRect.bottom);

  const minDist = Math.min(distLeft, distRight, distTop, distBottom);

  if (minDist === distLeft) {
    dropPosition = 'left';
    if (dropIndicator) {
      dropIndicator.className = 'ai-selector-drop-indicator vertical';
      dropIndicator.style.left = `${targetRect.left + scrollX - 2}px`;
      dropIndicator.style.top = `${targetRect.top + scrollY}px`;
      dropIndicator.style.height = `${targetRect.height}px`;
      dropIndicator.style.display = 'block';
    }
  } else if (minDist === distRight) {
    dropPosition = 'right';
    if (dropIndicator) {
      dropIndicator.className = 'ai-selector-drop-indicator vertical';
      dropIndicator.style.left = `${targetRect.right + scrollX - 2}px`;
      dropIndicator.style.top = `${targetRect.top + scrollY}px`;
      dropIndicator.style.height = `${targetRect.height}px`;
      dropIndicator.style.display = 'block';
    }
  } else if (minDist === distTop) {
    dropPosition = 'top';
    if (dropIndicator) {
      dropIndicator.className = 'ai-selector-drop-indicator horizontal';
      dropIndicator.style.left = `${targetRect.left + scrollX}px`;
      dropIndicator.style.top = `${targetRect.top + scrollY - 2}px`;
      dropIndicator.style.width = `${targetRect.width}px`;
      dropIndicator.style.display = 'block';
    }
  } else {
    dropPosition = 'bottom';
    if (dropIndicator) {
      dropIndicator.className = 'ai-selector-drop-indicator horizontal';
      dropIndicator.style.left = `${targetRect.left + scrollX}px`;
      dropIndicator.style.top = `${targetRect.bottom + scrollY - 2}px`;
      dropIndicator.style.width = `${targetRect.width}px`;
      dropIndicator.style.display = 'block';
    }
  }
}

// Завершение перетаскивания
function dragEnd(e) {
  if (!isDragging) return;
  isDragging = false;

  window.removeEventListener('mousemove', dragMove, true);
  window.removeEventListener('mouseup', dragEnd, true);

  if (selectedEditElement) {
    selectedEditElement.classList.remove('ai-selector-dragged-element');
  }

  if (dropIndicator) {
    dropIndicator.style.display = 'none';
  }

  const dx = e.clientX - dragStartMouseX;
  const dy = e.clientY - dragStartMouseY;

  // Если Alt не зажат и есть цель прилипания (dropTarget)
  if (dropTarget && selectedEditElement && !e.altKey) {
    const parent = dropTarget.parentNode;
    if (parent) {
      // Сбрасываем относительное смещение, так как встраиваемся в поток
      selectedEditElement.style.position = '';
      selectedEditElement.style.left = '';
      selectedEditElement.style.top = '';

      if (dropPosition === 'top' || dropPosition === 'left') {
        parent.insertBefore(selectedEditElement, dropTarget);
      } else {
        parent.insertBefore(selectedEditElement, dropTarget.nextSibling);
      }
      showToastNotification("Элемент перенесен в DOM");
    }
  } else if (selectedEditElement) {
    // Свободное позиционирование (фиксация положения)
    const currentLeft = parseFloat(selectedEditElement.style.left) || 0;
    const currentTop = parseFloat(selectedEditElement.style.top) || 0;
    
    const currentPos = window.getComputedStyle(selectedEditElement).position;
    if (currentPos !== 'absolute' && currentPos !== 'fixed' && currentPos !== 'relative') {
      selectedEditElement.style.position = 'relative';
    }
    
    selectedEditElement.style.left = `${currentLeft + dx}px`;
    selectedEditElement.style.top = `${currentTop + dy}px`;
    
    showToastNotification("Элемент зафиксирован на месте");
  }

  // Обновляем оверлеи
  updateEditPositions();
  updatePositions();

  dropTarget = null;
}

// Генерация уникального CSS-селектора
function getUniqueCssSelector(el) {
  if (!(el instanceof Element)) return '';
  
  if (el.id && document.querySelectorAll(`[id="${CSS.escape(el.id)}"]`).length === 1) {
    return `#${el.id}`;
  }
  
  const path = [];
  let current = el;
  
  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let selector = current.nodeName.toLowerCase();
    
    if (current.id && document.querySelectorAll(`[id="${CSS.escape(current.id)}"]`).length === 1) {
      selector = `#${current.id}`;
      path.unshift(selector);
      break;
    } else {
      let className = '';
      if (current.classList && current.classList.length > 0) {
        const classes = Array.from(current.classList).filter(c => !c.startsWith('ai-selector'));
        if (classes.length > 0) {
          className = '.' + classes.map(c => CSS.escape(c)).join('.');
          selector += className;
        }
      }
      
      let parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children);
        const sameTagSiblings = siblings.filter(s => s.nodeName === current.nodeName);
        if (sameTagSiblings.length > 1) {
          const index = sameTagSiblings.indexOf(current) + 1;
          selector += `:nth-of-type(${index})`;
        }
      }
    }
    
    path.unshift(selector);
    current = current.parentElement;
  }
  
  return path.join(' > ');
}

// Экранирование спецсимволов HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
