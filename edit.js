/* =========================================================
   edit.js — Улучшенный режим редактирования V2
   Боковая панель свойств, 8 resize-ручек, inline text,
   контекстное меню, трекинг изменений
   Зависит от: state.js, helpers.js, ui.js, annotations.js
   ========================================================= */

/* -------------------------------------------------------
   Переключение / запуск / остановка
   ------------------------------------------------------- */

function toggleEditMode() {
  if (isEditing) return;
  if (isInspecting) stopInspection();
  isEditMode ? stopEditMode() : startEditMode();
}

function startEditMode() {
  if (isEditMode || isEditing) return;
  isEditMode = true;

  document.addEventListener('mouseover',    handleEditMouseOver,  true);
  document.addEventListener('mousemove',    handleEditMouseMove,  true);
  document.addEventListener('click',        handleEditClick,      true);
  document.addEventListener('dblclick',     handleEditDblClick,   true);
  document.addEventListener('contextmenu',  handleEditContextMenu, true);
  document.addEventListener('keydown',      handleEditKeyDown,    true);

  document.body.style.cursor = 'cell';
  updateMasterPanelUI();
}

function stopEditMode(clearSelection = true) {
  if (!isEditMode) return;
  isEditMode = false;

  document.removeEventListener('mouseover',    handleEditMouseOver,   true);
  document.removeEventListener('mousemove',    handleEditMouseMove,   true);
  document.removeEventListener('click',        handleEditClick,       true);
  document.removeEventListener('dblclick',     handleEditDblClick,    true);
  document.removeEventListener('contextmenu',  handleEditContextMenu,  true);
  document.removeEventListener('keydown',      handleEditKeyDown,     true);

  document.body.style.cursor = 'default';

  if (editHoverOverlay) editHoverOverlay.style.display = 'none';
  if (editLabelOverlay) editLabelOverlay.style.display = 'none';
  if (clearSelection)   deselectEditElement();
  _hideContextMenu();
  _hideEditPropsPanel();

  updateMasterPanelUI();
}

/* -------------------------------------------------------
   Наведение (hover)
   ------------------------------------------------------- */

function handleEditMouseOver(e) {
  if (!isEditMode || isDragging || isResizing) return;
  if (_isExtensionEl(e.target)) {
    editHoverOverlay.style.display = 'none';
    editLabelOverlay.style.display = 'none';
    return;
  }
  if (e.target === document.documentElement || e.target === document.body) {
    editHoverOverlay.style.display = 'none';
    editLabelOverlay.style.display = 'none';
    return;
  }
  lastHoveredElement = e.target;
  _updateEditHoverOverlay(lastHoveredElement);
}

function handleEditMouseMove(e) {
  if (!isEditMode || !lastHoveredElement || isDragging || isResizing) return;
  _updateEditHoverOverlay(lastHoveredElement);
}

function _updateEditHoverOverlay(element) {
  if (!element || !editHoverOverlay || !editLabelOverlay) return;
  if (element === selectedEditElement) {
    editHoverOverlay.style.display = 'none';
    editLabelOverlay.style.display = 'none';
    return;
  }
  const rect   = element.getBoundingClientRect();
  const scroll = getScroll();
  _positionOverlay(editHoverOverlay, rect, scroll);
  const { idSuffix, classSuffix } = _getElementSuffix(element);
  _positionLabel(
    editLabelOverlay,
    element.tagName.toLowerCase(),
    idSuffix, classSuffix,
    rect, scroll,
    'ai-selector-edit-label-tag',
    'ai-selector-edit-label-dimensions'
  );
}

/* -------------------------------------------------------
   Клик — выделение элемента
   ------------------------------------------------------- */

function handleEditClick(e) {
  if (!isEditMode || isDragging || isResizing) return;
  if (rootContainer && (e.target === rootContainer || rootContainer.contains(e.target))) return;
  if (_isExtensionEl(e.target) && e.target !== editSelectedOverlay) return;

  // Клики по ресайз-ручкам — не десelectируем
  if (e.target.dataset && e.target.dataset.dir) return;

  // Клик по самому оверлею начинает drag — не сбрасываем выделение
  if (e.target === editSelectedOverlay) return;

  // Закрываем контекстное меню
  _hideContextMenu();

  e.preventDefault();
  e.stopPropagation();

  const el = lastHoveredElement || e.target;
  if (el) selectEditElement(el);
}

/* -------------------------------------------------------
   Двойной клик — inline text editing
   ------------------------------------------------------- */

function handleEditDblClick(e) {
  if (!isEditMode || isDragging) return;
  if (rootContainer && rootContainer.contains(e.target)) return;

  e.preventDefault();
  e.stopPropagation();

  const el = selectedEditElement || lastHoveredElement || e.target;
  if (!el) return;

  _startInlineTextEdit(el);
}

function _startInlineTextEdit(el) {
  // Проверяем, что элемент содержит только текст (нет дочерних элементов кроме inline)
  const isTextNode = el.childNodes.length === 0 ||
    Array.from(el.childNodes).every(n =>
      n.nodeType === Node.TEXT_NODE ||
      ['SPAN','B','I','STRONG','EM','A','BR','U','S','CODE'].includes(n.nodeName)
    );

  if (!isTextNode) {
    showToastNotification('Выберите текстовый элемент для редактирования');
    return;
  }

  // Сохраняем старый текст
  const oldText = el.textContent;

  stopEditMode(false); // Останавливаем edit-режим, но сохраняем выделение
  el.contentEditable = 'true';
  el.classList.add('ai-selector-inline-editing');
  el.focus();

  // Выделяем весь текст
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  showToastNotification('Редактирование текста. Enter — сохранить, Esc — отменить');

  function finishEdit(save) {
    el.removeEventListener('keydown', onKeyDown);
    el.removeEventListener('blur', onBlur);
    el.contentEditable = 'false';
    el.classList.remove('ai-selector-inline-editing');

    const newText = el.textContent;
    if (save && newText !== oldText) {
      _trackChange(
        getUniqueCssSelector(el),
        'textContent',
        oldText,
        newText
      );
      showToastNotification('Текст изменён');
    } else if (!save) {
      el.textContent = oldText;
    }

    // Перезапускаем edit-режим
    startEditMode();
    selectEditElement(el);
    _showEditPropsPanel(el);
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      finishEdit(true);
    }
    if (e.key === 'Escape') {
      finishEdit(false);
    }
  }

  function onBlur() {
    finishEdit(true);
  }

  el.addEventListener('keydown', onKeyDown);
  el.addEventListener('blur', onBlur, { once: true });
}

/* -------------------------------------------------------
   Правое контекстное меню
   ------------------------------------------------------- */

function handleEditContextMenu(e) {
  if (!isEditMode) return;
  if (rootContainer && rootContainer.contains(e.target)) return;

  e.preventDefault();
  e.stopPropagation();

  const el = selectedEditElement || lastHoveredElement || e.target;
  if (!el || el === document.body || el === document.documentElement) return;

  if (!selectedEditElement || selectedEditElement !== el) {
    selectEditElement(el);
  }

  _showContextMenu(e.clientX, e.clientY, el);
}

function _showContextMenu(x, y, el) {
  _hideContextMenu();

  if (!editContextMenu) return;

  editContextMenu.innerHTML = `
    <div class="ai-selector-context-item" id="ctx-text">✏️ Редактировать текст</div>
    <div class="ai-selector-context-item" id="ctx-clone">⧉ Клонировать</div>
    <div class="ai-selector-context-item" id="ctx-wrap">⬜ Обернуть в div</div>
    <div class="ai-selector-context-separator"></div>
    <div class="ai-selector-context-item" id="ctx-hide">👁 Скрыть</div>
    <div class="ai-selector-context-item danger" id="ctx-delete">🗑 Удалить</div>
  `;

  // Позиционируем
  editContextMenu.style.left    = `${x}px`;
  editContextMenu.style.top     = `${y}px`;
  editContextMenu.style.display = 'block';

  // Проверяем, не выходит ли меню за край
  requestAnimationFrame(() => {
    const r = editContextMenu.getBoundingClientRect();
    if (r.right  > window.innerWidth)  editContextMenu.style.left = `${x - r.width}px`;
    if (r.bottom > window.innerHeight) editContextMenu.style.top  = `${y - r.height}px`;
  });

  // Обработчики
  editContextMenu.querySelector('#ctx-text').addEventListener('click', (e) => {
    e.stopPropagation();
    _hideContextMenu();
    _startInlineTextEdit(el);
  });

  editContextMenu.querySelector('#ctx-clone').addEventListener('click', (e) => {
    e.stopPropagation();
    _hideContextMenu();
    const clone = el.cloneNode(true);
    el.parentNode.insertBefore(clone, el.nextSibling);
    _trackChange(getUniqueCssSelector(el), 'clone', '', 'cloned');
    showToastNotification('Элемент клонирован');
    selectEditElement(clone);
  });

  editContextMenu.querySelector('#ctx-wrap').addEventListener('click', (e) => {
    e.stopPropagation();
    _hideContextMenu();
    const wrapper = document.createElement('div');
    wrapper.style.display = 'contents';
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
    _trackChange(getUniqueCssSelector(el), 'wrap', '', 'wrapped in div');
    showToastNotification('Элемент обёрнут в div');
    selectEditElement(el);
  });

  editContextMenu.querySelector('#ctx-hide').addEventListener('click', (e) => {
    e.stopPropagation();
    _hideContextMenu();
    const oldVis = el.style.visibility || getComputedStyle(el).visibility;
    el.style.visibility = 'hidden';
    _trackChange(getUniqueCssSelector(el), 'visibility', oldVis, 'hidden');
    deselectEditElement();
    showToastNotification('Элемент скрыт');
  });

  editContextMenu.querySelector('#ctx-delete').addEventListener('click', (e) => {
    e.stopPropagation();
    _hideContextMenu();
    const selector = getUniqueCssSelector(el);
    _trackChange(selector, 'removed', 'exists', 'removed from DOM');
    deselectEditElement();
    el.remove();
    showToastNotification('Элемент удалён');
  });

  // Закрытие по клику вне меню
  setTimeout(() => {
    document.addEventListener('click', _hideContextMenu, { once: true, capture: true });
  }, 50);
}

function _hideContextMenu() {
  if (editContextMenu) editContextMenu.style.display = 'none';
}

/* -------------------------------------------------------
   Клавиатура
   ------------------------------------------------------- */

function handleEditKeyDown(e) {
  if (e.key === 'Escape') {
    _hideContextMenu();
    if (selectedEditElement) {
      deselectEditElement();
    } else {
      stopEditMode();
    }
  }
  // Стрелки — грубое перемещение
  if (selectedEditElement && !e.ctrlKey && !e.altKey) {
    const step = e.shiftKey ? 10 : 1;
    let moved = false;
    const pos = window.getComputedStyle(selectedEditElement).position;
    if (!['absolute', 'fixed', 'relative'].includes(pos)) {
      selectedEditElement.style.position = 'relative';
    }
    const cur = {
      left: parseFloat(selectedEditElement.style.left) || 0,
      top:  parseFloat(selectedEditElement.style.top)  || 0,
    };
    if (e.key === 'ArrowLeft')  { selectedEditElement.style.left = `${cur.left - step}px`; moved = true; }
    if (e.key === 'ArrowRight') { selectedEditElement.style.left = `${cur.left + step}px`; moved = true; }
    if (e.key === 'ArrowUp')    { selectedEditElement.style.top  = `${cur.top  - step}px`; moved = true; }
    if (e.key === 'ArrowDown')  { selectedEditElement.style.top  = `${cur.top  + step}px`; moved = true; }
    if (moved) {
      e.preventDefault();
      updateEditPositions();
      _syncPropsPanelPosition();
    }
  }
}

/* -------------------------------------------------------
   Выделение / снятие выделения
   ------------------------------------------------------- */

function selectEditElement(element) {
  if (!element) return;
  selectedEditElement = element;
  editElementSnapshot = _snapshotElement(element);

  if (editHoverOverlay) editHoverOverlay.style.display = 'none';
  if (editLabelOverlay) editLabelOverlay.style.display = 'none';

  updateEditPositions();
  setupDragAndDrop();
  _setupResizeHandles();
  _showEditPropsPanel(element);
}

function deselectEditElement() {
  selectedEditElement   = null;
  editElementSnapshot   = null;
  if (editSelectedOverlay) editSelectedOverlay.style.display = 'none';
  _hideEditPropsPanel();
}

function updateEditPositions() {
  if (!selectedEditElement || !editSelectedOverlay) return;
  _positionOverlay(editSelectedOverlay, selectedEditElement.getBoundingClientRect(), getScroll());
}

/* -------------------------------------------------------
   Drag-and-Drop
   ------------------------------------------------------- */

function setupDragAndDrop() {
  if (!editSelectedOverlay) return;
  editSelectedOverlay.onmousedown = startDrag;
}

function startDrag(e) {
  if (!selectedEditElement) return;
  // Не начинаем drag, если кликнули по ресайз-ручке
  if (e.target !== editSelectedOverlay) return;
  e.preventDefault();

  isDragging      = true;
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

  if (e.altKey) {
    if (dropIndicator) dropIndicator.style.display = 'none';
    dropTarget = null;
    return;
  }

  editSelectedOverlay.style.visibility = 'hidden';
  if (dropIndicator)    dropIndicator.style.visibility    = 'hidden';
  if (editHoverOverlay) editHoverOverlay.style.visibility = 'hidden';

  const target = document.elementFromPoint(e.clientX, e.clientY);

  editSelectedOverlay.style.visibility = '';
  if (dropIndicator)    dropIndicator.style.visibility    = '';
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
  _updateDropIndicator(e.clientX, e.clientY, target, scroll);
}

function _updateDropIndicator(mx, my, target, scroll) {
  if (!dropIndicator) return;

  const tr = target.getBoundingClientRect();
  const dL = Math.abs(mx - tr.left);
  const dR = Math.abs(mx - tr.right);
  const dT = Math.abs(my - tr.top);
  const dB = Math.abs(my - tr.bottom);
  const min = Math.min(dL, dR, dT, dB);

  if (min === dL) {
    dropPosition = 'left';
    dropIndicator.className     = 'ai-selector-drop-indicator vertical';
    dropIndicator.style.left    = `${tr.left  + scroll.x - 2}px`;
    dropIndicator.style.top     = `${tr.top   + scroll.y}px`;
    dropIndicator.style.height  = `${tr.height}px`;
    dropIndicator.style.width   = '';
  } else if (min === dR) {
    dropPosition = 'right';
    dropIndicator.className     = 'ai-selector-drop-indicator vertical';
    dropIndicator.style.left    = `${tr.right + scroll.x - 2}px`;
    dropIndicator.style.top     = `${tr.top   + scroll.y}px`;
    dropIndicator.style.height  = `${tr.height}px`;
    dropIndicator.style.width   = '';
  } else if (min === dT) {
    dropPosition = 'top';
    dropIndicator.className     = 'ai-selector-drop-indicator horizontal';
    dropIndicator.style.left    = `${tr.left  + scroll.x}px`;
    dropIndicator.style.top     = `${tr.top   + scroll.y - 2}px`;
    dropIndicator.style.width   = `${tr.width}px`;
    dropIndicator.style.height  = '';
  } else {
    dropPosition = 'bottom';
    dropIndicator.className     = 'ai-selector-drop-indicator horizontal';
    dropIndicator.style.left    = `${tr.left   + scroll.x}px`;
    dropIndicator.style.top     = `${tr.bottom + scroll.y - 2}px`;
    dropIndicator.style.width   = `${tr.width}px`;
    dropIndicator.style.height  = '';
  }

  dropIndicator.style.display = 'block';
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
    const oldParent   = selectedEditElement.parentNode;
    const oldSelector = getUniqueCssSelector(selectedEditElement);
    const parent      = dropTarget.parentNode;
    if (parent) {
      selectedEditElement.style.position = '';
      selectedEditElement.style.left     = '';
      selectedEditElement.style.top      = '';
      const ref = (dropPosition === 'top' || dropPosition === 'left')
        ? dropTarget
        : dropTarget.nextSibling;
      parent.insertBefore(selectedEditElement, ref);
      _trackChange(oldSelector, 'position-in-dom',
        `child of ${getUniqueCssSelector(oldParent)}`,
        `child of ${getUniqueCssSelector(parent)}`
      );
      showToastNotification('Элемент перенесён в DOM');
    }
  } else if (selectedEditElement && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
    const old = {
      left: selectedEditElement.style.left,
      top:  selectedEditElement.style.top,
    };
    const pos = window.getComputedStyle(selectedEditElement).position;
    if (!['absolute', 'fixed', 'relative'].includes(pos)) {
      selectedEditElement.style.position = 'relative';
    }
    const newLeft = `${(parseFloat(selectedEditElement.style.left) || 0) + dx}px`;
    const newTop  = `${(parseFloat(selectedEditElement.style.top)  || 0) + dy}px`;
    selectedEditElement.style.left = newLeft;
    selectedEditElement.style.top  = newTop;
    _trackChange(getUniqueCssSelector(selectedEditElement), 'left', old.left || '0px', newLeft);
    _trackChange(getUniqueCssSelector(selectedEditElement), 'top',  old.top  || '0px', newTop);
    showToastNotification('Элемент зафиксирован на месте');
  }

  updateEditPositions();
  scheduleUpdatePositions();
  _syncPropsPanelPosition();
  dropTarget = null;
}

/* -------------------------------------------------------
   8 Resize-ручек
   ------------------------------------------------------- */

const RESIZE_DIRS = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

function _setupResizeHandles() {
  if (!editSelectedOverlay) return;

  // Удаляем старые ручки
  editSelectedOverlay.querySelectorAll('.ai-selector-resize-handle').forEach(h => h.remove());

  // Создаём 8 ручек
  RESIZE_DIRS.forEach(dir => {
    const handle = document.createElement('div');
    handle.className       = 'ai-selector-resize-handle';
    handle.dataset.dir     = dir;
    handle.addEventListener('mousedown', (e) => startResize(e, dir), true);
    editSelectedOverlay.appendChild(handle);
  });
}

function startResize(e, dir) {
  if (!selectedEditElement) return;
  e.preventDefault();
  e.stopPropagation();

  isResizing      = true;
  resizeDirection = dir;
  dragStartMouseX = e.clientX;
  dragStartMouseY = e.clientY;

  const rect = selectedEditElement.getBoundingClientRect();
  resizeStartWidth  = rect.width;
  resizeStartHeight = rect.height;
  resizeStartLeft   = parseFloat(selectedEditElement.style.left) || 0;
  resizeStartTop    = parseFloat(selectedEditElement.style.top)  || 0;

  window.addEventListener('mousemove', resizeMove, true);
  window.addEventListener('mouseup',   resizeEnd,  true);
}

function resizeMove(e) {
  if (!isResizing || !selectedEditElement) return;
  e.preventDefault();
  e.stopPropagation();

  const dx = e.clientX - dragStartMouseX;
  const dy = e.clientY - dragStartMouseY;

  let newW = resizeStartWidth;
  let newH = resizeStartHeight;
  let newL = resizeStartLeft;
  let newT = resizeStartTop;

  const dir = resizeDirection;

  // Ширина
  if (dir.includes('e')) newW = Math.max(15, resizeStartWidth + dx);
  if (dir.includes('w')) {
    newW = Math.max(15, resizeStartWidth - dx);
    newL = resizeStartLeft + (resizeStartWidth - newW);
  }

  // Высота
  if (dir.includes('s')) newH = Math.max(15, resizeStartHeight + dy);
  if (dir.includes('n')) {
    newH = Math.max(15, resizeStartHeight - dy);
    newT = resizeStartTop + (resizeStartHeight - newH);
  }

  const pos = window.getComputedStyle(selectedEditElement).position;
  if (!['absolute', 'fixed', 'relative'].includes(pos)) {
    selectedEditElement.style.position = 'relative';
  }

  selectedEditElement.style.width     = `${newW}px`;
  selectedEditElement.style.height    = `${newH}px`;
  selectedEditElement.style.maxWidth  = 'none';
  selectedEditElement.style.maxHeight = 'none';

  if (dir.includes('w')) selectedEditElement.style.left = `${newL}px`;
  if (dir.includes('n')) selectedEditElement.style.top  = `${newT}px`;

  updateEditPositions();
  _syncPropsPanelPosition();
}

function resizeEnd() {
  if (!isResizing) return;
  isResizing = false;

  window.removeEventListener('mousemove', resizeMove, true);
  window.removeEventListener('mouseup',   resizeEnd,  true);

  if (selectedEditElement) {
    const rect = selectedEditElement.getBoundingClientRect();
    _trackChange(getUniqueCssSelector(selectedEditElement), 'width',
      `${resizeStartWidth}px`, `${Math.round(rect.width)}px`);
    _trackChange(getUniqueCssSelector(selectedEditElement), 'height',
      `${resizeStartHeight}px`, `${Math.round(rect.height)}px`);
  }

  showToastNotification('Размеры изменены');
  updateEditPositions();
  scheduleUpdatePositions();
  _syncPropsPanelValues();
}

/* -------------------------------------------------------
   Edit Properties Panel
   ------------------------------------------------------- */

function _showEditPropsPanel(el) {
  if (!shadowRoot) return;
  const panel = shadowRoot.querySelector('.edit-props-panel');
  if (!panel) return;

  panel.classList.add('visible');
  _fillPropsPanelValues(el);
}

function _hideEditPropsPanel() {
  if (!shadowRoot) return;
  const panel = shadowRoot.querySelector('.edit-props-panel');
  if (panel) panel.classList.remove('visible');
}

/** Заполняет поля панели актуальными значениями CSS элемента */
function _fillPropsPanelValues(el) {
  if (!shadowRoot || !el) return;

  const cs = window.getComputedStyle(el);
  const rect = el.getBoundingClientRect();

  // Размер/позиция
  _setEpInput('ep-width',  `${Math.round(rect.width)}`);
  _setEpInput('ep-height', `${Math.round(rect.height)}`);
  _setEpInput('ep-left',   el.style.left   ? parseFloat(el.style.left).toFixed(0)   : '0');
  _setEpInput('ep-top',    el.style.top    ? parseFloat(el.style.top).toFixed(0)    : '0');

  // Типографика
  _setEpInput('ep-font-size',   parseFloat(cs.fontSize).toFixed(0));
  _setEpInput('ep-line-height', cs.lineHeight !== 'normal' ? parseFloat(cs.lineHeight).toFixed(1) : '');
  _setEpSelect('ep-font-weight', cs.fontWeight);
  _setEpAlignActive(cs.textAlign);

  // Текст
  const hasText = el.childNodes.length > 0 &&
    Array.from(el.childNodes).some(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
  const textSection = shadowRoot.getElementById('ep-text-section');
  if (textSection) {
    textSection.style.display = hasText ? '' : 'none';
    if (hasText) {
      const ta = shadowRoot.getElementById('ep-text-value');
      if (ta) ta.value = el.textContent.trim();
    }
  }

  // Цвета
  _setEpColor('ep-color',      'ep-color-hex',      rgbToHex(cs.color));
  _setEpColor('ep-bg-color',   'ep-bg-color-hex',   rgbToHex(cs.backgroundColor));

  // Скругление + прозрачность
  _setEpInput('ep-border-radius', parseFloat(cs.borderRadius).toFixed(0));
  const opacitySlider = shadowRoot.getElementById('ep-opacity');
  const opacityVal    = shadowRoot.getElementById('ep-opacity-val');
  if (opacitySlider) opacitySlider.value = Math.round(parseFloat(cs.opacity) * 100);
  if (opacityVal)    opacityVal.textContent = `${Math.round(parseFloat(cs.opacity) * 100)}%`;

  // Padding / Margin
  _setEpInput('ep-pt', parseFloat(cs.paddingTop).toFixed(0));
  _setEpInput('ep-pr', parseFloat(cs.paddingRight).toFixed(0));
  _setEpInput('ep-pb', parseFloat(cs.paddingBottom).toFixed(0));
  _setEpInput('ep-pl', parseFloat(cs.paddingLeft).toFixed(0));

  _setEpInput('ep-mt', parseFloat(cs.marginTop).toFixed(0));
  _setEpInput('ep-mr', parseFloat(cs.marginRight).toFixed(0));
  _setEpInput('ep-mb', parseFloat(cs.marginBottom).toFixed(0));
  _setEpInput('ep-ml', parseFloat(cs.marginLeft).toFixed(0));

  // Селектор
  const selEl = shadowRoot.querySelector('.ep-selector');
  if (selEl) {
    const sel = getUniqueCssSelector(el);
    selEl.textContent = sel.length > 28 ? '…' + sel.slice(-26) : sel;
    selEl.title = sel;
  }

  // Счётчик изменений
  _updateChangesCounter();
}

function _syncPropsPanelValues() {
  if (selectedEditElement) _fillPropsPanelValues(selectedEditElement);
}

function _syncPropsPanelPosition() {
  // Панель position:fixed, она не нуждается в синхронизации позиции,
  // но обновим значения размеров/позиций в полях
  if (selectedEditElement) {
    const rect = selectedEditElement.getBoundingClientRect();
    _setEpInput('ep-width',  `${Math.round(rect.width)}`);
    _setEpInput('ep-height', `${Math.round(rect.height)}`);
    _setEpInput('ep-left',   selectedEditElement.style.left   ? parseFloat(selectedEditElement.style.left).toFixed(0)   : '0');
    _setEpInput('ep-top',    selectedEditElement.style.top    ? parseFloat(selectedEditElement.style.top).toFixed(0)    : '0');
  }
}

// Хелперы установки значений в панель
function _setEpInput(id, value) {
  const el = shadowRoot && shadowRoot.getElementById(id);
  if (el) el.value = value;
}

function _setEpSelect(id, value) {
  const el = shadowRoot && shadowRoot.getElementById(id);
  if (!el) return;
  // Нормализуем font-weight
  const fw = String(parseInt(value) || value);
  for (const opt of el.options) {
    if (opt.value === fw) { el.value = fw; return; }
  }
  el.value = value;
}

function _setEpAlignActive(align) {
  if (!shadowRoot) return;
  shadowRoot.querySelectorAll('.ep-align-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.align === align);
  });
}

function _setEpColor(swatchId, hexId, hex) {
  if (!shadowRoot) return;
  const sw = shadowRoot.getElementById(swatchId);
  const hx = shadowRoot.getElementById(hexId);
  if (sw) sw.style.background = hex || 'transparent';
  if (hx) hx.value = hex || '';
  const inp = sw && sw.querySelector('input[type="color"]');
  if (inp && hex) { try { inp.value = hex; } catch(e) {} }
}

/** Регистрирует обработчики всех полей Properties Panel */
function _bindPropsPanelEvents() {
  if (!shadowRoot) return;

  // ---- Размер / Позиция ----
  _onEpNumberChange('ep-width', v => {
    if (selectedEditElement) {
      _applyStyleChange(selectedEditElement, 'width', `${v}px`);
    }
  });
  _onEpNumberChange('ep-height', v => {
    if (selectedEditElement) {
      _applyStyleChange(selectedEditElement, 'height', `${v}px`);
      selectedEditElement.style.maxHeight = 'none';
    }
  });
  _onEpNumberChange('ep-left', v => {
    if (selectedEditElement) {
      const pos = window.getComputedStyle(selectedEditElement).position;
      if (!['absolute','fixed','relative'].includes(pos)) selectedEditElement.style.position = 'relative';
      _applyStyleChange(selectedEditElement, 'left', `${v}px`);
    }
  });
  _onEpNumberChange('ep-top', v => {
    if (selectedEditElement) {
      const pos = window.getComputedStyle(selectedEditElement).position;
      if (!['absolute','fixed','relative'].includes(pos)) selectedEditElement.style.position = 'relative';
      _applyStyleChange(selectedEditElement, 'top', `${v}px`);
    }
  });

  // ---- Типографика ----
  _onEpNumberChange('ep-font-size', v => {
    if (selectedEditElement) _applyStyleChange(selectedEditElement, 'fontSize', `${v}px`);
  });
  _onEpNumberChange('ep-line-height', v => {
    if (selectedEditElement) _applyStyleChange(selectedEditElement, 'lineHeight', `${v}`);
  });

  const fwSel = shadowRoot.getElementById('ep-font-weight');
  if (fwSel) fwSel.addEventListener('change', () => {
    if (selectedEditElement) _applyStyleChange(selectedEditElement, 'fontWeight', fwSel.value);
  });

  shadowRoot.querySelectorAll('.ep-align-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!selectedEditElement) return;
      _applyStyleChange(selectedEditElement, 'textAlign', btn.dataset.align);
      _setEpAlignActive(btn.dataset.align);
    });
  });

  // ---- Текст ----
  const textTa = shadowRoot.getElementById('ep-text-value');
  if (textTa) {
    let textTimer = null;
    textTa.addEventListener('input', () => {
      clearTimeout(textTimer);
      textTimer = setTimeout(() => {
        if (!selectedEditElement) return;
        const old = selectedEditElement.textContent;
        selectedEditElement.textContent = textTa.value;
        _trackChange(getUniqueCssSelector(selectedEditElement), 'textContent', old, textTa.value);
      }, 400);
    });
  }

  // ---- Цвет текста ----
  _bindColorPair('ep-color', 'ep-color-hex', 'color');

  // ---- Цвет фона ----
  _bindColorPair('ep-bg-color', 'ep-bg-color-hex', 'backgroundColor');

  // ---- Border Radius ----
  _onEpNumberChange('ep-border-radius', v => {
    if (selectedEditElement) _applyStyleChange(selectedEditElement, 'borderRadius', `${v}px`);
  });

  // ---- Opacity ----
  const opSl  = shadowRoot.getElementById('ep-opacity');
  const opVal = shadowRoot.getElementById('ep-opacity-val');
  if (opSl) opSl.addEventListener('input', () => {
    const v = opSl.value;
    if (opVal) opVal.textContent = `${v}%`;
    if (selectedEditElement) _applyStyleChange(selectedEditElement, 'opacity', `${v / 100}`);
  });

  // ---- Padding ----
  ['pt','pr','pb','pl'].forEach((side, i) => {
    const props = ['paddingTop','paddingRight','paddingBottom','paddingLeft'];
    _onEpNumberChange(`ep-${side}`, v => {
      if (selectedEditElement) _applyStyleChange(selectedEditElement, props[i], `${v}px`);
    });
  });

  // ---- Margin ----
  ['mt','mr','mb','ml'].forEach((side, i) => {
    const props = ['marginTop','marginRight','marginBottom','marginLeft'];
    _onEpNumberChange(`ep-${side}`, v => {
      if (selectedEditElement) _applyStyleChange(selectedEditElement, props[i], `${v}px`);
    });
  });

  // ---- Кнопка «Копировать изменения» ----
  const copyBtn = shadowRoot.getElementById('ep-copy-changes');
  if (copyBtn) copyBtn.addEventListener('click', copyEditChangesPrompt);

  // ---- Кнопка закрытия панели ----
  const closeBtn = shadowRoot.querySelector('.ep-close');
  if (closeBtn) closeBtn.addEventListener('click', () => {
    deselectEditElement();
  });
}

/** Подписывает числовое поле на изменение */
function _onEpNumberChange(id, callback) {
  if (!shadowRoot) return;
  const el = shadowRoot.getElementById(id);
  if (!el) return;
  let timer = null;
  const handler = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const v = parseFloat(el.value);
      if (!isNaN(v)) callback(v);
      updateEditPositions();
      scheduleUpdatePositions();
    }, 200);
  };
  el.addEventListener('input',  handler);
  el.addEventListener('change', handler);
}

/** Подписывает пару color-picker + hex-input */
function _bindColorPair(swatchId, hexId, cssProp) {
  if (!shadowRoot) return;
  const sw  = shadowRoot.getElementById(swatchId);
  const hx  = shadowRoot.getElementById(hexId);
  const inp = sw && sw.querySelector('input[type="color"]');

  if (inp) inp.addEventListener('input', () => {
    const hex = inp.value;
    if (sw)  sw.style.background = hex;
    if (hx)  hx.value = hex;
    if (selectedEditElement) _applyStyleChange(selectedEditElement, cssProp, hex);
  });

  if (hx) hx.addEventListener('input', () => {
    const v = hx.value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(v)) {
      if (sw)  sw.style.background = v;
      if (inp) { try { inp.value = v; } catch(e) {} }
      if (selectedEditElement) _applyStyleChange(selectedEditElement, cssProp, v);
    }
  });
}

/** Применяет стиль и записывает изменение */
function _applyStyleChange(el, cssProp, value) {
  if (!el) return;
  const old = el.style[cssProp] || window.getComputedStyle(el)[cssProp];
  el.style[cssProp] = value;
  _trackChange(getUniqueCssSelector(el), cssProp, old, value);
  updateEditPositions();
  scheduleUpdatePositions();
}

/* -------------------------------------------------------
   Трекинг изменений
   ------------------------------------------------------- */

function _snapshotElement(el) {
  if (!el) return null;
  const cs = window.getComputedStyle(el);
  return {
    selector:    getUniqueCssSelector(el),
    textContent: el.textContent,
    styles: {
      width:        cs.width,
      height:       cs.height,
      color:        cs.color,
      backgroundColor: cs.backgroundColor,
      fontSize:     cs.fontSize,
      fontWeight:   cs.fontWeight,
      textAlign:    cs.textAlign,
      padding:      cs.padding,
      margin:       cs.margin,
      opacity:      cs.opacity,
      borderRadius: cs.borderRadius,
    }
  };
}

function _trackChange(selector, property, oldValue, newValue) {
  if (oldValue === newValue) return;
  // Проверяем, есть ли уже такое изменение (обновляем newValue)
  const existing = editChangesLog.find(c => c.selector === selector && c.property === property);
  if (existing) {
    existing.newValue = newValue;
  } else {
    editChangesLog.push({ selector, property, oldValue, newValue });
  }
  _updateChangesCounter();
}

function _updateChangesCounter() {
  if (!shadowRoot) return;
  const badge = shadowRoot.getElementById('ep-changes-count');
  if (badge) badge.textContent = editChangesLog.length;
  const copyBtn = shadowRoot.getElementById('ep-copy-changes');
  if (copyBtn) copyBtn.disabled = editChangesLog.length === 0;
}

/** Генерирует промпт изменений и копирует в буфер обмена */
async function copyEditChangesPrompt() {
  if (!editChangesLog.length) return;

  let prompt = `URL: ${window.location.href}\n\n`;
  prompt += `📝 ИЗМЕНЕНИЯ ЭЛЕМЕНТОВ (внесены через AI Annotator):\n`;
  prompt += `Всего изменений: ${editChangesLog.length}\n\n`;

  // Группируем по селектору
  const bySelector = {};
  editChangesLog.forEach(c => {
    if (!bySelector[c.selector]) bySelector[c.selector] = [];
    bySelector[c.selector].push(c);
  });

  Object.entries(bySelector).forEach(([sel, changes], i) => {
    const el = document.querySelector(sel);
    const tag = el ? el.tagName.toLowerCase() : '?';
    prompt += `${i + 1}. Элемент: \`${sel}\` (${tag})\n`;
    changes.forEach(c => {
      prompt += `   • ${c.property}: "${c.oldValue}" → "${c.newValue}"\n`;
    });
    if (el) {
      const html = el.outerHTML;
      const snippet = html.length > 800
        ? html.substring(0, 600) + '\n  <!-- [обрезано] -->\n' + html.substring(html.length - 200)
        : html;
      prompt += `   HTML сейчас:\n\`\`\`html\n${snippet}\n\`\`\`\n`;
    }
    prompt += '\n';
  });

  prompt += `\nЗадача: Перенести эти изменения в исходный код сайта так, чтобы они стали постоянными.`;

  try {
    await navigator.clipboard.writeText(prompt.trim());
    showToastNotification(`Изменения скопированы! (${editChangesLog.length} шт.)`);
    const btn = shadowRoot?.getElementById('ep-copy-changes');
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = '<span>✅</span> Скопировано!';
      btn.style.background = 'linear-gradient(135deg,rgba(16,185,129,0.3),rgba(5,150,105,0.3))';
      btn.style.borderColor = '#10b981';
      btn.style.color = '#34d399';
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.style.color = '';
      }, 1500);
    }
  } catch(err) {
    console.error('AI Annotator: ошибка копирования', err);
    alert('Не удалось скопировать. Предоставьте разрешение буфера обмена.');
  }
}

/* -------------------------------------------------------
   Вспомогательные функции
   ------------------------------------------------------- */

/** Конвертирует rgb(r,g,b) в #rrggbb */
function rgbToHex(rgb) {
  if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '';
  const m = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!m) return rgb.startsWith('#') ? rgb : '';
  return '#' + [m[1], m[2], m[3]].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
}
