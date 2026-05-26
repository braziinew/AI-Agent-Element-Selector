/* =========================================================
   AI Annotator — content.js (V5 Optimized)
   ========================================================= */

// --- СОСТОЯНИЕ ---
let isInspecting = false;
let isEditing    = false;
let isEditMode   = false;
let isDragging   = false;
let isResizing   = false;

let selectedEditElement = null;
let lastHoveredElement  = null;
let dropTarget          = null;
let dropPosition        = null; // 'top' | 'bottom' | 'left' | 'right'

let dragStartMouseX  = 0;
let dragStartMouseY  = 0;
let dragStartElRect  = null;
let resizeStartWidth = 0;
let resizeStartHeight= 0;

/** @type {Array<{id:string, element:Element, selector:string, tagName:string, html:string, text:string, minimized:boolean}>} */
let annotations = [];

// --- DOM-ЭЛЕМЕНТЫ ---
let hoverOverlay        = null;
let labelOverlay        = null;
let editHoverOverlay    = null;
let editSelectedOverlay = null;
let editLabelOverlay    = null;
let dropIndicator       = null;
let rootContainer       = null;
let shadowRoot          = null;

// requestAnimationFrame throttle для updatePositions
let rafScheduled = false;

/* =========================================================
   ИНИЦИАЛИЗАЦИЯ
   ========================================================= */

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'start-inspect') {
    initAnnotator();
  }
});

window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.code === 'KeyS') {
    e.preventDefault();
    initAnnotator();
    toggleInspection();
  }
});

function initAnnotator() {
  createRootContainer();
  createOverlayElements();
  if (!isEditing) startInspection();
  updateMasterPanelUI();
  scheduleUpdatePositions();
}

/* =========================================================
   SHADOW DOM
   ========================================================= */

function createRootContainer() {
  if (rootContainer) return;

  rootContainer = document.createElement('div');
  rootContainer.id = 'ai-agent-selector-root';
  document.body.appendChild(rootContainer);

  shadowRoot = rootContainer.attachShadow({ mode: 'open' });

  // Загружаем shadow.css из файлов расширения
  const styleLink = document.createElement('link');
  styleLink.rel  = 'stylesheet';
  styleLink.href = chrome.runtime.getURL('shadow.css');
  shadowRoot.appendChild(styleLink);

  // Создаём обёртку и панель
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

      <div style="display:flex;gap:8px;margin-bottom:4px;">
        <button class="btn-toggle-inspect" id="btn-toggle-inspect" style="flex:1;padding:8px 4px !important;">
          <span>🔍</span> Аннотация
        </button>
        <button class="btn-toggle-edit" id="btn-toggle-edit" style="flex:1;padding:8px 4px !important;">
          <span>🏗️</span> Редактировать
        </button>
      </div>

      <div class="master-actions">
        <button class="btn btn-secondary" id="btn-clear-all" disabled>Очистить</button>
        <button class="btn btn-primary"   id="btn-copy-all"  disabled>Скопировать всё (0)</button>
      </div>
    </div>
  `;
  shadowRoot.appendChild(wrapper);

  // Обработчики кнопок
  shadowRoot.getElementById('btn-toggle-inspect').addEventListener('click', toggleInspection);
  shadowRoot.getElementById('btn-toggle-edit').addEventListener('click', toggleEditMode);
  shadowRoot.getElementById('btn-clear-all').addEventListener('click', clearAllAnnotations);
  shadowRoot.getElementById('btn-copy-all').addEventListener('click', copyAllPrompt);
  shadowRoot.getElementById('btn-unload').addEventListener('click', unloadAnnotator);

  window.addEventListener('scroll', scheduleUpdatePositions, { passive: true });
  window.addEventListener('resize', scheduleUpdatePositions, { passive: true });
}

function unloadAnnotator() {
  stopInspection(true);
  stopEditMode(true);
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

/* =========================================================
   ОВЕРЛЕИ (внешний DOM)
   ========================================================= */

function createOverlayElements() {
  hoverOverlay     = hoverOverlay     || _createOverlay('ai-selector-hover-overlay');
  labelOverlay     = labelOverlay     || _createOverlay('ai-selector-label');
  editHoverOverlay = editHoverOverlay || _createOverlay('ai-selector-edit-hover-overlay');
  editLabelOverlay = editLabelOverlay || _createOverlay('ai-selector-edit-label');
  dropIndicator    = dropIndicator    || _createOverlay('ai-selector-drop-indicator');

  if (!editSelectedOverlay) {
    editSelectedOverlay = _createOverlay('ai-selector-edit-selected-overlay');
    const handle = document.createElement('div');
    handle.className = 'ai-selector-resize-handle';
    handle.title     = 'Изменить размеры элемента';
    handle.addEventListener('mousedown', startResize);
    editSelectedOverlay.appendChild(handle);
  }
}

/** Создаёт div с className, скрытый, добавляет в body */
function _createOverlay(className) {
  const el = document.createElement('div');
  el.className    = className;
  el.style.display = 'none';
  document.body.appendChild(el);
  return el;
}

/* =========================================================
   ХЕЛПЕРЫ
   ========================================================= */

/** Текущий скролл страницы */
function getScroll() {
  return {
    x: window.scrollX || window.pageXOffset,
    y: window.scrollY || window.pageYOffset,
  };
}

/**
 * Позиционирует оверлей-рамку поверх element.
 * @param {HTMLElement} overlay  - элемент-рамка
 * @param {DOMRect}     rect     - getBoundingClientRect()
 * @param {{x,y}}       scroll
 */
function _positionOverlay(overlay, rect, scroll) {
  overlay.style.width  = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
  overlay.style.left   = `${rect.left + scroll.x}px`;
  overlay.style.top    = `${rect.top  + scroll.y}px`;
  overlay.style.display = 'block';
}

/**
 * Позиционирует лейбл тега над/под элементом.
 * @param {HTMLElement} label
 * @param {string}      tagName
 * @param {string}      idSuffix
 * @param {string}      classSuffix
 * @param {DOMRect}     rect
 * @param {{x,y}}       scroll
 * @param {string}      tagClass       - CSS-класс для тега
 * @param {string}      dimClass       - CSS-класс для размеров
 */
function _positionLabel(label, tagName, idSuffix, classSuffix, rect, scroll, tagClass, dimClass) {
  label.innerHTML = `<span class="${tagClass}">${tagName}${idSuffix}${classSuffix}</span>` +
                    `<span class="${dimClass}">${Math.round(rect.width)} × ${Math.round(rect.height)}</span>`;
  label.style.display = 'block';

  const lh = label.offsetHeight || 20;
  let top  = rect.top + scroll.y - lh - 5;
  if (top < scroll.y) top = rect.top + scroll.y + rect.height + 5;

  label.style.left = `${Math.max(scroll.x + 5, rect.left + scroll.x)}px`;
  label.style.top  = `${top}px`;
}

/** Возвращает #id и .firstClass для элемента (без ai-selector-префикса) */
function _getElementSuffix(element) {
  const idSuffix = element.id ? `#${element.id}` : '';
  let classSuffix = '';
  if (element.classList?.length > 0) {
    const clean = Array.from(element.classList).filter(c => !c.startsWith('ai-selector'));
    if (clean.length > 0) classSuffix = `.${clean[0]}`;
  }
  return { idSuffix, classSuffix };
}

/** Является ли элемент служебным элементом расширения */
function _isExtensionEl(target) {
  return (
    target.classList.contains('ai-selector-hover-overlay') ||
    target.classList.contains('ai-selector-label') ||
    target.classList.contains('ai-selector-persistent-overlay') ||
    target.classList.contains('ai-selector-persistent-badge') ||
    target.classList.contains('ai-selector-edit-hover-overlay') ||
    target.classList.contains('ai-selector-edit-selected-overlay') ||
    target.classList.contains('ai-selector-edit-label') ||
    target.classList.contains('ai-selector-drop-indicator') ||
    (rootContainer && (target === rootContainer || rootContainer.contains(target)))
  );
}

/* =========================================================
   RAF-ТРОТТЛИНГ updatePositions
   ========================================================= */

function scheduleUpdatePositions() {
  if (rafScheduled) return;
  rafScheduled = true;
  requestAnimationFrame(() => {
    rafScheduled = false;
    updatePositions();
  });
}

/* =========================================================
   РЕЖИМ ИНСПЕКТИРОВАНИЯ
   ========================================================= */

function toggleInspection() {
  if (isEditing) return;
  if (isEditMode) stopEditMode();
  isInspecting ? stopInspection() : startInspection();
}

function startInspection() {
  if (isInspecting || isEditing) return;
  isInspecting = true;
  document.addEventListener('mouseover', handleMouseOver, true);
  document.addEventListener('mousemove', handleMouseMove, true);
  document.addEventListener('click',     handleElementClick, true);
  document.addEventListener('keydown',   handleKeyDown, true);
  document.body.style.cursor = 'crosshair';
  updateMasterPanelUI();
}

function stopInspection(removeHoverOverlays = true) {
  if (!isInspecting) return;
  isInspecting = false;
  document.removeEventListener('mouseover', handleMouseOver, true);
  document.removeEventListener('mousemove', handleMouseMove, true);
  document.removeEventListener('click',     handleElementClick, true);
  document.removeEventListener('keydown',   handleKeyDown, true);
  document.body.style.cursor = 'default';
  if (removeHoverOverlays) {
    if (hoverOverlay)  hoverOverlay.style.display  = 'none';
    if (labelOverlay)  labelOverlay.style.display  = 'none';
  }
  updateMasterPanelUI();
}

function handleMouseOver(e) {
  if (!isInspecting) return;
  if (_isExtensionEl(e.target)) { hoverOverlay.style.display = 'none'; labelOverlay.style.display = 'none'; return; }
  if (e.target === document.documentElement || e.target === document.body) { hoverOverlay.style.display = 'none'; labelOverlay.style.display = 'none'; return; }
  lastHoveredElement = e.target;
  _updateInspectOverlay(lastHoveredElement);
}

function handleMouseMove(e) {
  if (!isInspecting || !lastHoveredElement) return;
  _updateInspectOverlay(lastHoveredElement);
}

function _updateInspectOverlay(element) {
  if (!element) return;
  const rect   = element.getBoundingClientRect();
  const scroll = getScroll();
  _positionOverlay(hoverOverlay, rect, scroll);
  const { idSuffix, classSuffix } = _getElementSuffix(element);
  _positionLabel(labelOverlay, element.tagName.toLowerCase(), idSuffix, classSuffix,
    rect, scroll, 'ai-selector-label-tag', 'ai-selector-label-dimensions');
}

function handleElementClick(e) {
  if (!isInspecting) return;
  if (rootContainer && (e.target === rootContainer || rootContainer.contains(e.target))) return;
  e.preventDefault();
  e.stopPropagation();
  const el = lastHoveredElement || e.target;
  if (el) addAnnotation(el);
}

function handleKeyDown(e) {
  if (e.key === 'Escape') stopInspection();
}

/* =========================================================
   АННОТАЦИИ
   ========================================================= */

function addAnnotation(element) {
  if (annotations.some(a => a.element === element)) return;

  const id  = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  const ann = {
    id,
    element,
    selector: getUniqueCssSelector(element),
    tagName:  element.tagName.toLowerCase(),
    html:     element.outerHTML,
    text:     '',
    minimized: false,
  };

  annotations.push(ann);
  isEditing = true;
  stopInspection(true);
  createStickyNote(ann);
  updateMasterPanelUI();
  scheduleUpdatePositions();

  setTimeout(() => {
    const note = shadowRoot?.getElementById(`ai-note-${id}`);
    note?.querySelector('.note-textarea')?.focus();
  }, 100);
}

function createStickyNote(ann) {
  if (!shadowRoot) return;

  const note = document.createElement('div');
  note.id        = `ai-note-${ann.id}`;
  note.className = 'sticky-note';
  note.innerHTML = `
    <div class="note-header">
      <div class="note-title-container">
        <span class="note-badge">#</span>
        <span class="note-tag" title="${escapeHtml(ann.selector)}">${escapeHtml(ann.tagName)}: ${escapeHtml(ann.selector)}</span>
      </div>
      <div class="note-controls">
        <button class="btn-note-action btn-note-done"   id="btn-done-${ann.id}" title="Готово (свернуть)">✓</button>
        <button class="btn-note-action btn-note-delete" id="btn-del-${ann.id}"  title="Удалить аннотацию">&times;</button>
      </div>
    </div>
    <div class="note-body">
      <textarea class="note-textarea" id="txt-${ann.id}" placeholder="Инструкция для ИИ..."></textarea>
    </div>
  `;

  const textarea = note.querySelector('.note-textarea');
  textarea.addEventListener('input',   (e) => { ann.text = e.target.value; });
  textarea.addEventListener('keydown', (e) => { if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); saveAndCollapseAnnotation(ann.id); } });
  textarea.addEventListener('blur',    ()  => { setTimeout(() => { if (annotations.some(a => a.id === ann.id)) saveAndCollapseAnnotation(ann.id); }, 150); });

  note.querySelector('.btn-note-done').addEventListener('click',   (e) => { e.stopPropagation(); saveAndCollapseAnnotation(ann.id); });
  note.querySelector('.btn-note-delete').addEventListener('click', (e) => { e.stopPropagation(); deleteAnnotation(ann.id); });

  shadowRoot.querySelector('.shadow-wrapper').appendChild(note);
}

function editAndExpandAnnotation(id) {
  const ann = annotations.find(a => a.id === id);
  if (!ann) return;

  annotations.forEach(a => { if (a.id !== id && !a.minimized) saveAndCollapseAnnotation(a.id); });

  ann.minimized = false;
  const badge = document.getElementById(`ai-badge-${id}`);
  if (badge) { badge.classList.remove('minimized'); badge.title = 'Свернуть аннотацию'; }

  const note = shadowRoot?.getElementById(`ai-note-${id}`);
  if (note) {
    note.classList.remove('minimized');
    note.style.display = 'flex';
    setTimeout(() => note.querySelector('.note-textarea')?.focus(), 50);
  }

  isEditing = true;
  stopInspection(true);
  scheduleUpdatePositions();
  updateMasterPanelUI();
}

function saveAndCollapseAnnotation(id) {
  const ann = annotations.find(a => a.id === id);
  if (!ann || ann.minimized) return;

  ann.minimized = true;
  const badge = document.getElementById(`ai-badge-${id}`);
  if (badge) { badge.classList.add('minimized'); badge.title = 'Развернуть аннотацию'; }

  const note = shadowRoot?.getElementById(`ai-note-${id}`);
  if (note) note.classList.add('minimized');

  isEditing = false;
  startInspection();
  scheduleUpdatePositions();
  updateMasterPanelUI();
}

function deleteAnnotation(id) {
  const index = annotations.findIndex(a => a.id === id);
  if (index === -1) return;

  const wasOpen = !annotations[index].minimized;

  document.getElementById(`ai-overlay-${id}`)?.remove();
  document.getElementById(`ai-badge-${id}`)?.remove();
  shadowRoot?.getElementById(`ai-note-${id}`)?.remove();

  annotations.splice(index, 1);

  if (wasOpen) { isEditing = false; startInspection(); }
  updateMasterPanelUI();
  scheduleUpdatePositions();
}

function clearAllAnnotations() {
  annotations.forEach(ann => {
    document.getElementById(`ai-overlay-${ann.id}`)?.remove();
    document.getElementById(`ai-badge-${ann.id}`)?.remove();
    shadowRoot?.getElementById(`ai-note-${ann.id}`)?.remove();
  });
  annotations = [];
  isEditing   = false;
  if (rootContainer) startInspection();
  updateMasterPanelUI();
}

/* =========================================================
   ОБНОВЛЕНИЕ ПОЗИЦИЙ ВСЕХ ОВЕРЛЕЕВ
   ========================================================= */

function updatePositions() {
  if (!rootContainer || !shadowRoot) return;

  if (selectedEditElement) updateEditPositions();

  const scroll = getScroll();

  annotations.forEach((ann, index) => {
    const el = ann.element;
    if (!el || !document.body.contains(el)) { hideAnnotationVisuals(ann.id); return; }

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) { hideAnnotationVisuals(ann.id); return; }

    // Рамка
    let overlay = document.getElementById(`ai-overlay-${ann.id}`);
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id        = `ai-overlay-${ann.id}`;
      overlay.className = 'ai-selector-persistent-overlay';
      document.body.appendChild(overlay);
    }

    // Пин
    let badge = document.getElementById(`ai-badge-${ann.id}`);
    if (!badge) {
      badge = document.createElement('div');
      badge.id        = `ai-badge-${ann.id}`;
      badge.className = 'ai-selector-persistent-badge';
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        ann.minimized ? editAndExpandAnnotation(ann.id) : saveAndCollapseAnnotation(ann.id);
      });
      document.body.appendChild(badge);
    }

    _positionOverlay(overlay, rect, scroll);

    badge.textContent     = `${index + 1}`;
    badge.style.left      = `${rect.left + scroll.x - 8}px`;
    badge.style.top       = `${rect.top  + scroll.y - 12}px`;
    badge.style.display   = 'flex';
    badge.classList.toggle('minimized', ann.minimized);
    badge.title = ann.minimized ? 'Развернуть аннотацию' : 'Свернуть аннотацию';

    // Стикер
    const note = shadowRoot.getElementById(`ai-note-${ann.id}`);
    if (note) {
      note.classList.toggle('minimized', ann.minimized);
      if (!ann.minimized) {
        note.style.display = 'flex';
        const nw = 260;
        let left = rect.left + scroll.x + rect.width + 10;
        let top  = rect.top  + scroll.y;
        if (rect.left + rect.width + 10 + nw > window.innerWidth) left = rect.left + scroll.x - nw - 10;
        if (left < scroll.x) { left = Math.max(scroll.x + 10, rect.left + scroll.x); top = rect.top + scroll.y + rect.height + 10; }
        note.style.left = `${left}px`;
        note.style.top  = `${top}px`;
      }
      const badgeEl = note.querySelector('.note-badge');
      if (badgeEl) badgeEl.textContent = `#${index + 1}`;
    }
  });
}

function hideAnnotationVisuals(id) {
  const ov = document.getElementById(`ai-overlay-${id}`);
  const bv = document.getElementById(`ai-badge-${id}`);
  if (ov) ov.style.display = 'none';
  if (bv) bv.style.display = 'none';
  shadowRoot?.getElementById(`ai-note-${id}`)?.style && (shadowRoot.getElementById(`ai-note-${id}`).style.display = 'none');
}

/* =========================================================
   MASTER PANEL UI
   ========================================================= */

function updateMasterPanelUI() {
  if (!shadowRoot) return;

  const titleEl = shadowRoot.getElementById('master-panel-title');
  if (titleEl) {
    titleEl.innerHTML = `🧠 AI Annotator <span style="font-size:11px;background:rgba(255,255,255,.12);padding:2px 6px;border-radius:20px;margin-left:6px;font-weight:700;">${annotations.length}</span>`;
  }

  const dot       = shadowRoot.getElementById('inspect-status-dot');
  const text      = shadowRoot.getElementById('inspect-status-text');
  const toggleBtn = shadowRoot.getElementById('btn-toggle-inspect');
  const editBtn   = shadowRoot.getElementById('btn-toggle-edit');

  if (isEditing) {
    dot?.setAttribute('class', 'status-dot editing');
    if (text) text.textContent = 'Ввод комментария...';
    if (toggleBtn) { toggleBtn.disabled = true;  toggleBtn.className = 'btn-toggle-inspect'; toggleBtn.innerHTML = '<span>🔍</span> Аннотация'; }
    if (editBtn)   { editBtn.disabled   = true;  editBtn.className   = 'btn-toggle-edit';    editBtn.innerHTML   = '<span>🏗️</span> Редактировать'; }
  } else if (isInspecting) {
    dot?.setAttribute('class', 'status-dot active');
    if (text) text.textContent = 'Выбор активен (кликните на элемент)';
    if (toggleBtn) { toggleBtn.disabled = false; toggleBtn.className = 'btn-toggle-inspect active'; toggleBtn.innerHTML = '<span>⏹</span> Стоп'; }
    if (editBtn)   { editBtn.disabled   = false; editBtn.className   = 'btn-toggle-edit';           editBtn.innerHTML   = '<span>🏗️</span> Редактировать'; }
  } else if (isEditMode) {
    dot?.setAttribute('class', 'status-dot editing');
    if (text) text.textContent = 'Режим перемещения: выберите элемент';
    if (toggleBtn) { toggleBtn.disabled = false; toggleBtn.className = 'btn-toggle-inspect';        toggleBtn.innerHTML = '<span>🔍</span> Аннотация'; }
    if (editBtn)   { editBtn.disabled   = false; editBtn.className   = 'btn-toggle-edit active';    editBtn.innerHTML   = '<span>⏹</span> Стоп'; }
  } else {
    dot?.setAttribute('class', 'status-dot');
    if (text) text.textContent = 'Выбор отключён';
    if (toggleBtn) { toggleBtn.disabled = false; toggleBtn.className = 'btn-toggle-inspect'; toggleBtn.innerHTML = '<span>🔍</span> Аннотация'; }
    if (editBtn)   { editBtn.disabled   = false; editBtn.className   = 'btn-toggle-edit';    editBtn.innerHTML   = '<span>🏗️</span> Редактировать'; }
  }

  const copyBtn  = shadowRoot.getElementById('btn-copy-all');
  const clearBtn = shadowRoot.getElementById('btn-clear-all');
  const hasAnns  = annotations.length > 0;
  if (copyBtn)  { copyBtn.disabled  = !hasAnns; copyBtn.innerHTML = `<span>📋</span> Скопировать всё (${annotations.length})`; }
  if (clearBtn) { clearBtn.disabled = !hasAnns; }
}

/* =========================================================
   TOAST
   ========================================================= */

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
  }, 1000);
}

/* =========================================================
   КОПИРОВАНИЕ ПРОМПТА
   ========================================================= */

async function copyAllPrompt() {
  if (!annotations.length) return;

  let prompt = `URL: ${window.location.href}\n\n`;
  annotations.forEach((ann, i) => {
    const text = ann.text.trim() || 'Без комментариев.';
    let   html = ann.html;
    if (html.length > 2500) {
      const m = html.match(/^<[a-zA-Z0-9\-]+[^>]*>/);
      if (m) {
        const tag = m[0].match(/^<([a-zA-Z0-9\-]+)/)[1];
        html = `${m[0]}\n  <!-- [HTML truncated (${ann.html.length} chars)] -->\n</${tag}>`;
      } else {
        html = html.substring(0, 1000) + '\n  <!-- [HTML truncated] -->\n' + html.substring(html.length - 500);
      }
    }
    prompt += `${i + 1}. Селектор: \`${ann.selector}\`\nКомментарий: ${text}\nHTML:\n\`\`\`html\n${html}\n\`\`\`\n\n`;
  });

  try {
    await navigator.clipboard.writeText(prompt.trim());
    showToastNotification('Промпт скопирован в буфер обмена!');
    const btn = shadowRoot.getElementById('btn-copy-all');
    if (btn) {
      btn.innerHTML = '<span>✅</span> Скопировано!';
      btn.style.background = 'linear-gradient(135deg,#10b981,#059669)';
      setTimeout(updateMasterPanelUI, 1200);
    }
  } catch (err) {
    console.error('Не удалось скопировать:', err);
    alert('Не удалось скопировать. Предоставьте разрешение буфера обмена.');
  }
}

/* =========================================================
   РЕЖИМ РЕДАКТИРОВАНИЯ (перемещение + ресайз)
   ========================================================= */

function toggleEditMode() {
  if (isEditing) return;
  if (isInspecting) stopInspection();
  isEditMode ? stopEditMode() : startEditMode();
}

function startEditMode() {
  if (isEditMode || isEditing) return;
  isEditMode = true;
  document.addEventListener('mouseover', handleEditMouseOver, true);
  document.addEventListener('mousemove', handleEditMouseMove, true);
  document.addEventListener('click',     handleEditClick, true);
  document.addEventListener('keydown',   handleEditKeyDown, true);
  document.body.style.cursor = 'cell';
  updateMasterPanelUI();
}

function stopEditMode(clearSelection = true) {
  if (!isEditMode) return;
  isEditMode = false;
  document.removeEventListener('mouseover', handleEditMouseOver, true);
  document.removeEventListener('mousemove', handleEditMouseMove, true);
  document.removeEventListener('click',     handleEditClick, true);
  document.removeEventListener('keydown',   handleEditKeyDown, true);
  document.body.style.cursor = 'default';
  if (editHoverOverlay) editHoverOverlay.style.display = 'none';
  if (editLabelOverlay) editLabelOverlay.style.display = 'none';
  if (clearSelection) deselectEditElement();
  updateMasterPanelUI();
}

// --- Наведение ---
function handleEditMouseOver(e) {
  if (!isEditMode || isDragging) return;
  if (_isExtensionEl(e.target)) { editHoverOverlay.style.display = 'none'; editLabelOverlay.style.display = 'none'; return; }
  if (e.target === document.documentElement || e.target === document.body) { editHoverOverlay.style.display = 'none'; editLabelOverlay.style.display = 'none'; return; }
  lastHoveredElement = e.target;
  _updateEditHoverOverlay(lastHoveredElement);
}

function handleEditMouseMove(e) {
  if (!isEditMode || !lastHoveredElement || isDragging) return;
  _updateEditHoverOverlay(lastHoveredElement);
}

function _updateEditHoverOverlay(element) {
  if (!element || !editHoverOverlay || !editLabelOverlay) return;
  if (element === selectedEditElement) { editHoverOverlay.style.display = 'none'; editLabelOverlay.style.display = 'none'; return; }

  const rect   = element.getBoundingClientRect();
  const scroll = getScroll();
  _positionOverlay(editHoverOverlay, rect, scroll);
  const { idSuffix, classSuffix } = _getElementSuffix(element);
  _positionLabel(editLabelOverlay, element.tagName.toLowerCase(), idSuffix, classSuffix,
    rect, scroll, 'ai-selector-edit-label-tag', 'ai-selector-edit-label-dimensions');
}

// --- Клик и выделение ---
function handleEditClick(e) {
  if (!isEditMode || isDragging) return;
  if (rootContainer && (e.target === rootContainer || rootContainer.contains(e.target))) return;
  e.preventDefault();
  e.stopPropagation();
  if (e.target === editSelectedOverlay) return;
  const el = lastHoveredElement || e.target;
  if (el) selectEditElement(el);
}

function handleEditKeyDown(e) {
  if (e.key === 'Escape') {
    selectedEditElement ? deselectEditElement() : stopEditMode();
  }
}

function selectEditElement(element) {
  if (!element) return;
  selectedEditElement = element;
  if (editHoverOverlay) editHoverOverlay.style.display = 'none';
  if (editLabelOverlay) editLabelOverlay.style.display = 'none';
  updateEditPositions();
  setupDragAndDrop();
}

function deselectEditElement() {
  selectedEditElement = null;
  if (editSelectedOverlay) editSelectedOverlay.style.display = 'none';
}

function updateEditPositions() {
  if (!selectedEditElement || !editSelectedOverlay) return;
  const rect   = selectedEditElement.getBoundingClientRect();
  const scroll = getScroll();
  _positionOverlay(editSelectedOverlay, rect, scroll);
}

/* =========================================================
   DRAG AND DROP
   ========================================================= */

function setupDragAndDrop() {
  if (!editSelectedOverlay) return;
  editSelectedOverlay.onmousedown = startDrag;
}

function startDrag(e) {
  if (!selectedEditElement) return;
  e.preventDefault();

  isDragging     = true;
  dragStartMouseX = e.clientX;
  dragStartMouseY = e.clientY;

  const rect = selectedEditElement.getBoundingClientRect();
  dragStartElRect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };

  selectedEditElement.classList.add('ai-selector-dragged-element');
  window.addEventListener('mousemove', dragMove, true);
  window.addEventListener('mouseup',   dragEnd,  true);
}

function dragMove(e) {
  if (!isDragging || !selectedEditElement) return;
  e.preventDefault();

  const dx     = e.clientX - dragStartMouseX;
  const dy     = e.clientY - dragStartMouseY;
  const scroll = getScroll();

  editSelectedOverlay.style.left = `${dragStartElRect.left + scroll.x + dx}px`;
  editSelectedOverlay.style.top  = `${dragStartElRect.top  + scroll.y + dy}px`;

  // Свободное позиционирование (Alt)
  if (e.altKey) {
    if (dropIndicator) dropIndicator.style.display = 'none';
    dropTarget = null;
    return;
  }

  // Временно скрываем служебные оверлеи, чтобы elementFromPoint видел реальную страницу
  editSelectedOverlay.style.visibility = 'hidden';
  if (dropIndicator)    dropIndicator.style.visibility = 'hidden';
  if (editHoverOverlay) editHoverOverlay.style.visibility = 'hidden';

  let target = document.elementFromPoint(e.clientX, e.clientY);

  editSelectedOverlay.style.visibility = '';
  if (dropIndicator)    dropIndicator.style.visibility = '';
  if (editHoverOverlay) editHoverOverlay.style.visibility = '';

  if (!target ||
      target === selectedEditElement ||
      selectedEditElement.contains(target) ||
      (rootContainer && (target === rootContainer || rootContainer.contains(target))) ||
      target === document.documentElement ||
      target === document.body) {
    if (dropIndicator) dropIndicator.style.display = 'none';
    dropTarget = null;
    return;
  }

  dropTarget = target;
  const tr   = target.getBoundingClientRect();
  const dL   = Math.abs(e.clientX - tr.left);
  const dR   = Math.abs(e.clientX - tr.right);
  const dT   = Math.abs(e.clientY - tr.top);
  const dB   = Math.abs(e.clientY - tr.bottom);
  const min  = Math.min(dL, dR, dT, dB);

  if (!dropIndicator) return;

  if (min === dL) {
    dropPosition = 'left';
    dropIndicator.className     = 'ai-selector-drop-indicator vertical';
    dropIndicator.style.left    = `${tr.left + scroll.x - 2}px`;
    dropIndicator.style.top     = `${tr.top  + scroll.y}px`;
    dropIndicator.style.height  = `${tr.height}px`;
    dropIndicator.style.width   = '';
    dropIndicator.style.display = 'block';
  } else if (min === dR) {
    dropPosition = 'right';
    dropIndicator.className     = 'ai-selector-drop-indicator vertical';
    dropIndicator.style.left    = `${tr.right + scroll.x - 2}px`;
    dropIndicator.style.top     = `${tr.top   + scroll.y}px`;
    dropIndicator.style.height  = `${tr.height}px`;
    dropIndicator.style.width   = '';
    dropIndicator.style.display = 'block';
  } else if (min === dT) {
    dropPosition = 'top';
    dropIndicator.className     = 'ai-selector-drop-indicator horizontal';
    dropIndicator.style.left    = `${tr.left + scroll.x}px`;
    dropIndicator.style.top     = `${tr.top  + scroll.y - 2}px`;
    dropIndicator.style.width   = `${tr.width}px`;
    dropIndicator.style.height  = '';
    dropIndicator.style.display = 'block';
  } else {
    dropPosition = 'bottom';
    dropIndicator.className     = 'ai-selector-drop-indicator horizontal';
    dropIndicator.style.left    = `${tr.left   + scroll.x}px`;
    dropIndicator.style.top     = `${tr.bottom + scroll.y - 2}px`;
    dropIndicator.style.width   = `${tr.width}px`;
    dropIndicator.style.height  = '';
    dropIndicator.style.display = 'block';
  }
}

function dragEnd(e) {
  if (!isDragging) return;
  isDragging = false;

  window.removeEventListener('mousemove', dragMove, true);
  window.removeEventListener('mouseup',   dragEnd,  true);

  selectedEditElement?.classList.remove('ai-selector-dragged-element');
  if (dropIndicator) dropIndicator.style.display = 'none';

  const dx = e.clientX - dragStartMouseX;
  const dy = e.clientY - dragStartMouseY;

  if (dropTarget && selectedEditElement && !e.altKey) {
    // Snap-вставка в DOM
    const parent = dropTarget.parentNode;
    if (parent) {
      selectedEditElement.style.position = '';
      selectedEditElement.style.left     = '';
      selectedEditElement.style.top      = '';
      const ref = (dropPosition === 'top' || dropPosition === 'left') ? dropTarget : dropTarget.nextSibling;
      parent.insertBefore(selectedEditElement, ref);
      showToastNotification('Элемент перенесён в DOM');
    }
  } else if (selectedEditElement) {
    // Свободное позиционирование
    const curPos = window.getComputedStyle(selectedEditElement).position;
    if (!['absolute', 'fixed', 'relative'].includes(curPos)) selectedEditElement.style.position = 'relative';
    selectedEditElement.style.left = `${(parseFloat(selectedEditElement.style.left) || 0) + dx}px`;
    selectedEditElement.style.top  = `${(parseFloat(selectedEditElement.style.top)  || 0) + dy}px`;
    showToastNotification('Элемент зафиксирован на месте');
  }

  updateEditPositions();
  scheduleUpdatePositions();
  dropTarget = null;
}

/* =========================================================
   RESIZE
   ========================================================= */

function startResize(e) {
  if (!selectedEditElement) return;
  e.preventDefault();
  e.stopPropagation();

  isResizing      = true;
  dragStartMouseX = e.clientX;
  dragStartMouseY = e.clientY;

  const rect = selectedEditElement.getBoundingClientRect();
  resizeStartWidth  = rect.width;
  resizeStartHeight = rect.height;

  window.addEventListener('mousemove', resizeMove, true);
  window.addEventListener('mouseup',   resizeEnd,  true);
}

function resizeMove(e) {
  if (!isResizing || !selectedEditElement) return;
  e.preventDefault();
  e.stopPropagation();

  const dx = e.clientX - dragStartMouseX;
  const dy = e.clientY - dragStartMouseY;

  selectedEditElement.style.width     = `${Math.max(15, resizeStartWidth  + dx)}px`;
  selectedEditElement.style.height    = `${Math.max(15, resizeStartHeight + dy)}px`;
  selectedEditElement.style.maxWidth  = 'none';
  selectedEditElement.style.maxHeight = 'none';

  updateEditPositions();
}

function resizeEnd() {
  if (!isResizing) return;
  isResizing = false;
  window.removeEventListener('mousemove', resizeMove, true);
  window.removeEventListener('mouseup',   resizeEnd,  true);
  showToastNotification('Размеры элемента изменены');
  updateEditPositions();
  scheduleUpdatePositions();
}

/* =========================================================
   УТИЛИТЫ
   ========================================================= */

function getUniqueCssSelector(el) {
  if (!(el instanceof Element)) return '';
  if (el.id && document.querySelectorAll(`[id="${CSS.escape(el.id)}"]`).length === 1) return `#${el.id}`;

  const path = [];
  let cur = el;

  while (cur && cur.nodeType === Node.ELEMENT_NODE) {
    let seg = cur.nodeName.toLowerCase();
    if (cur.id && document.querySelectorAll(`[id="${CSS.escape(cur.id)}"]`).length === 1) {
      path.unshift(`#${cur.id}`);
      break;
    }
    if (cur.classList?.length > 0) {
      const cls = Array.from(cur.classList).filter(c => !c.startsWith('ai-selector'));
      if (cls.length) seg += '.' + cls.map(c => CSS.escape(c)).join('.');
    }
    const parent = cur.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(s => s.nodeName === cur.nodeName);
      if (siblings.length > 1) seg += `:nth-of-type(${siblings.indexOf(cur) + 1})`;
    }
    path.unshift(seg);
    cur = cur.parentElement;
  }

  return path.join(' > ');
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[m]));
}
