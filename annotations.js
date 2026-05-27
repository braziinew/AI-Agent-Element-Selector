/* =========================================================
   annotations.js — Логика аннотаций и обновление оверлеев
   Зависит от: state.js, helpers.js, ui.js
   ========================================================= */

/* -------------------------------------------------------
   Создание оверлей-элементов во внешнем DOM
   ------------------------------------------------------- */

function createOverlayElements() {
  hoverOverlay     = hoverOverlay     || _createOverlay('ai-selector-hover-overlay');
  labelOverlay     = labelOverlay     || _createOverlay('ai-selector-label');
  editHoverOverlay = editHoverOverlay || _createOverlay('ai-selector-edit-hover-overlay');
  editLabelOverlay = editLabelOverlay || _createOverlay('ai-selector-edit-label');
  dropIndicator    = dropIndicator    || _createOverlay('ai-selector-drop-indicator');

  // Оверлей выделенного элемента (8 resize-ручек добавляются динамически в edit.js)
  if (!editSelectedOverlay) {
    editSelectedOverlay = _createOverlay('ai-selector-edit-selected-overlay');
  }

  // Контекстное меню
  if (!editContextMenu) {
    editContextMenu = document.createElement('div');
    editContextMenu.className    = 'ai-selector-context-menu';
    editContextMenu.style.display = 'none';
    document.body.appendChild(editContextMenu);
  }
}

/* -------------------------------------------------------
   RAF-троттлинг updatePositions
   ------------------------------------------------------- */

/** Планирует updatePositions через requestAnimationFrame (не чаще 1 раза за кадр) */
function scheduleUpdatePositions() {
  if (rafScheduled) return;
  rafScheduled = true;
  requestAnimationFrame(() => {
    rafScheduled = false;
    updatePositions();
  });
}

/* -------------------------------------------------------
   Добавление / удаление аннотаций
   ------------------------------------------------------- */

/**
 * Добавляет новую аннотацию для указанного элемента.
 * Создаёт стикер в Shadow DOM и переключает в режим ввода.
 * @param {Element} element
 */
function addAnnotation(element, clickCoords = null) {
  if (annotations.some(a => a.element === element)) return;

  const id  = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  const ann = {
    id,
    element,
    selector:  getUniqueCssSelector(element),
    tagName:   element.tagName.toLowerCase(),
    html:      element.outerHTML,
    text:      '',
    minimized: false,
    clickCoords,
  };

  annotations.push(ann);
  isEditing = true;
  stopInspection(true);
  createStickyNote(ann);
  updateMasterPanelUI();
  scheduleUpdatePositions();

  // Фокус на textarea нового стикера
  setTimeout(() => {
    shadowRoot?.getElementById(`ai-note-${id}`)
              ?.querySelector('.note-textarea')
              ?.focus();
  }, 100);
}

/**
 * Создаёт Sticky Note в Shadow DOM для переданной аннотации.
 * @param {{ id:string, selector:string, tagName:string }} ann
 */
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
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { 
      e.preventDefault(); 
      saveAndCollapseAnnotation(ann.id); 
    } else if (e.key === 'Escape') { 
      e.preventDefault(); 
      deleteAnnotation(ann.id); 
    }
  });
  textarea.addEventListener('blur', () => {
    // Небольшая задержка: чтобы успел сработать клик по кнопке «Удалить»
    setTimeout(() => {
      // Если мы вернули фокус полю (например, при клике с зажатым ALT) — не закрываем
      if (shadowRoot && shadowRoot.activeElement === textarea) return;
      // Если зажат ALT (режим выбора) — не закрываем
      if (typeof isSubInspecting !== 'undefined' && isSubInspecting) return;
      
      // Иначе сворачиваем
      if (annotations.some(a => a.id === ann.id)) saveAndCollapseAnnotation(ann.id);
    }, 200);
  });

  note.querySelector('.btn-note-done').addEventListener('click',   (e) => { e.stopPropagation(); saveAndCollapseAnnotation(ann.id); });
  note.querySelector('.btn-note-delete').addEventListener('click', (e) => { e.stopPropagation(); deleteAnnotation(ann.id); });

  shadowRoot.querySelector('.shadow-wrapper').appendChild(note);
}

/**
 * Разворачивает свёрнутый стикер для редактирования (клик по пину).
 * @param {string} id
 */
function editAndExpandAnnotation(id) {
  const ann = annotations.find(a => a.id === id);
  if (!ann) return;

  // Сворачиваем остальные открытые стикеры
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

/**
 * Сворачивает стикер и возобновляет инспектирование.
 * @param {string} id
 */
function saveAndCollapseAnnotation(id) {
  const ann = annotations.find(a => a.id === id);
  if (!ann || ann.minimized) return;

  ann.minimized = true;

  const badge = document.getElementById(`ai-badge-${id}`);
  if (badge) { badge.classList.add('minimized'); badge.title = 'Развернуть аннотацию'; }

  shadowRoot?.getElementById(`ai-note-${id}`)?.classList.add('minimized');

  isEditing = false;
  startInspection();
  scheduleUpdatePositions();
  updateMasterPanelUI();
}

/**
 * Удаляет аннотацию по id.
 * @param {string} id
 */
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

/** Удаляет все аннотации, правки и очищает глобальное хранилище всех страниц */
async function clearAllAnnotations() {
  annotations.forEach(ann => {
    document.getElementById(`ai-overlay-${ann.id}`)?.remove();
    document.getElementById(`ai-badge-${ann.id}`)?.remove();
    shadowRoot?.getElementById(`ai-note-${ann.id}`)?.remove();
  });
  
  annotations = [];
  window.editChangesLog = [];
  window.insertedTemplates = [];
  
  if (typeof clearAllGlobalState === 'function') {
    await clearAllGlobalState();
  }

  isEditing = false;
  if (typeof stopEditMode === 'function') stopEditMode();

  if (rootContainer) startInspection();
  updateMasterPanelUI();
  
  if (typeof showToastNotification === 'function') {
    showToastNotification('Все правки на всех страницах очищены!');
  }
}

/* -------------------------------------------------------
   Обновление позиций всех оверлеев и стикеров
   ------------------------------------------------------- */

/** Синхронизирует позиции всех рамок, пинов и стикеров со страницей */
function updatePositions() {
  if (!rootContainer || !shadowRoot) return;

  if (selectedEditElement) updateEditPositions();

  const scroll = getScroll();

  annotations.forEach((ann, index) => {
    const el = ann.element;
    if (!el || !document.body.contains(el)) { hideAnnotationVisuals(ann.id); return; }

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) { hideAnnotationVisuals(ann.id); return; }

    // -- Рамка (persistent-overlay) --
    let overlay = document.getElementById(`ai-overlay-${ann.id}`);
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id        = `ai-overlay-${ann.id}`;
      overlay.className = 'ai-selector-persistent-overlay';
      document.body.appendChild(overlay);
    }

    // -- Пин (persistent-badge) --
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

    badge.textContent   = `${index + 1}`;
    const placement = (window.aiSettings && window.aiSettings.placement) ? window.aiSettings.placement : 'click';

    if (placement === 'click' && ann.clickCoords) {
      badge.style.left    = `${ann.clickCoords.x - 8}px`;
      badge.style.top     = `${ann.clickCoords.y - 12}px`;
    } else {
      badge.style.left    = `${rect.left + scroll.x - 8}px`;
      badge.style.top     = `${rect.top  + scroll.y - 12}px`;
    }
    badge.style.display = 'flex';
    badge.classList.toggle('minimized', ann.minimized);
    badge.title = ann.minimized ? 'Развернуть аннотацию' : 'Свернуть аннотацию';

    // -- Стикер (Shadow DOM) --
    const note = shadowRoot.getElementById(`ai-note-${ann.id}`);
    if (note) {
      note.classList.toggle('minimized', ann.minimized);
      if (!ann.minimized) {
        note.style.display = 'flex';

        const noteW = 260;
        let left, top;
        const placement = (window.aiSettings && window.aiSettings.placement) ? window.aiSettings.placement : 'click';

        if (placement === 'click' && ann.clickCoords) {
          left = ann.clickCoords.x + 10;
          top = ann.clickCoords.y;
          
          if (left - scroll.x + noteW > window.innerWidth) {
            left = ann.clickCoords.x - noteW - 10;
          }
        } else {
          left = rect.left + scroll.x + rect.width + 10;
          top  = rect.top  + scroll.y;

          // Не влезает справа → пробуем слева
          if (rect.left + rect.width + 10 + noteW > window.innerWidth) {
            left = rect.left + scroll.x - noteW - 10;
          }
          // Не влезает слева → ставим снизу (как было изначально)
          if (left < scroll.x) {
            left = Math.max(scroll.x + 10, rect.left + scroll.x);
            top  = rect.top + scroll.y + rect.height + 10;
          }
        }

        note.style.left = `${left}px`;
        note.style.top  = `${top}px`;
      }

      const badgeEl = note.querySelector('.note-badge');
      if (badgeEl) badgeEl.textContent = `#${index + 1}`;
    }
  });
}

/**
 * Скрывает все визуальные элементы аннотации (рамку, пин, стикер).
 * @param {string} id
 */
function hideAnnotationVisuals(id) {
  const ov = document.getElementById(`ai-overlay-${id}`);
  const bv = document.getElementById(`ai-badge-${id}`);
  if (ov) ov.style.display = 'none';
  if (bv) bv.style.display = 'none';

  const note = shadowRoot?.getElementById(`ai-note-${id}`);
  if (note) note.style.display = 'none';
}
