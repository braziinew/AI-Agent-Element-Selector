/* =========================================================
   edit.js — Режим редактирования V3
   Панель свойств скрыта по умолчанию, snap-линии,
   fix автовыбора, undo/redo интеграция
   ========================================================= */

const SNAP_THRESHOLD = 6; // px — порог примагничивания

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

  _ensureSnapLines();

  document.addEventListener('mouseover',   handleEditMouseOver,  true);
  document.addEventListener('mousemove',   handleEditMouseMove,  true);
  document.addEventListener('click',       handleEditClick,      true);
  document.addEventListener('dblclick',    handleEditDblClick,   true);
  document.addEventListener('contextmenu', handleEditContextMenu, true);
  document.addEventListener('keydown',     handleEditKeyDown,    true);

  document.body.style.cursor = 'cell';
  updateMasterPanelUI();
}

function stopEditMode(clearSelection = true) {
  if (!isEditMode) return;
  isEditMode = false;

  document.removeEventListener('mouseover',   handleEditMouseOver,   true);
  document.removeEventListener('mousemove',   handleEditMouseMove,   true);
  document.removeEventListener('click',       handleEditClick,       true);
  document.removeEventListener('dblclick',    handleEditDblClick,    true);
  document.removeEventListener('contextmenu', handleEditContextMenu,  true);
  document.removeEventListener('keydown',     handleEditKeyDown,     true);

  document.body.style.cursor = 'default';

  if (editHoverOverlay) editHoverOverlay.style.display = 'none';
  if (editLabelOverlay) editLabelOverlay.style.display = 'none';
  if (clearSelection)   deselectEditElement();
  _hideContextMenu();
  _hideSnapLines();

  updateMasterPanelUI();
}

/* -------------------------------------------------------
   Snap-линии
   ------------------------------------------------------- */

function _ensureSnapLines() {
  if (!snapLineH) {
    snapLineH = document.createElement('div');
    snapLineH.className = 'ai-selector-snap-line horizontal';
    document.body.appendChild(snapLineH);
  }
  if (!snapLineV) {
    snapLineV = document.createElement('div');
    snapLineV.className = 'ai-selector-snap-line vertical';
    document.body.appendChild(snapLineV);
  }
}

function _hideSnapLines() {
  if (snapLineH) { snapLineH.classList.remove('visible'); }
  if (snapLineV) { snapLineV.classList.remove('visible'); }
  currentSnapX = null;
  currentSnapY = null;
}

/** Собирает bounding rects соседних элементов для snap */
function _collectSnapSentinels() {
  snapSentinels = [];
  const scroll = getScroll();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Берём только «существенные» элементы — блочные, видимые
  const all = document.querySelectorAll('div,section,article,main,header,footer,nav,aside,p,h1,h2,h3,img,button,a,ul,li');
  for (const el of all) {
    if (el === selectedEditElement || _isExtensionEl(el)) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 15 || rect.height < 15) continue;
    if (rect.right < 0 || rect.left > vw || rect.bottom < 0 || rect.top > vh) continue;
    snapSentinels.push(rect);
    if (snapSentinels.length >= 80) break;
  }
}

/**
 * Вычисляет snap-корректировки dx/dy и позиционирует snap-линии.
 * @returns {{ dx: number, dy: number }}
 */
function _applySnap(rawDx, rawDy) {
  if (!snapSentinels.length || !dragStartElRect) return { dx: rawDx, dy: rawDy };

  const scroll = getScroll();
  const elL  = dragStartElRect.left + rawDx;
  const elT  = dragStartElRect.top  + rawDy;
  const elR  = elL + dragStartElRect.width;
  const elB  = elT + dragStartElRect.height;
  const elCX = elL + dragStartElRect.width  / 2;
  const elCY = elT + dragStartElRect.height / 2;

  let snapX = null, snapY = null;
  let bestDx = SNAP_THRESHOLD + 1, bestDy = SNAP_THRESHOLD + 1;
  let adjDx = rawDx, adjDy = rawDy;

  for (const rect of snapSentinels) {
    const rCX = rect.left + rect.width  / 2;
    const rCY = rect.top  + rect.height / 2;

    // Вертикальные оси (X snap)
    const xPairs = [
      [elL, rect.left], [elL, rect.right],
      [elR, rect.left], [elR, rect.right],
      [elCX, rCX],
    ];
    for (const [a, b] of xPairs) {
      const d = Math.abs(a - b);
      if (d < SNAP_THRESHOLD && d < bestDx) {
        bestDx = d;
        adjDx  = rawDx + (b - a);
        snapX  = b + scroll.x;
      }
    }

    // Горизонтальные оси (Y snap)
    const yPairs = [
      [elT, rect.top], [elT, rect.bottom],
      [elB, rect.top], [elB, rect.bottom],
      [elCY, rCY],
    ];
    for (const [a, b] of yPairs) {
      const d = Math.abs(a - b);
      if (d < SNAP_THRESHOLD && d < bestDy) {
        bestDy = d;
        adjDy  = rawDy + (b - a);
        snapY  = b + scroll.y;
      }
    }
  }

  // Обновляем snap-линии
  _ensureSnapLines();

  if (snapX !== null) {
    snapLineV.style.left = `${snapX}px`;
    snapLineV.className = 'ai-selector-snap-line vertical visible';
  } else {
    snapLineV.classList.remove('visible');
  }

  if (snapY !== null) {
    snapLineH.style.top = `${snapY}px`;
    snapLineH.className = 'ai-selector-snap-line horizontal visible';
  } else {
    snapLineH.classList.remove('visible');
  }

  currentSnapX = snapX;
  currentSnapY = snapY;

  return { dx: adjDx, dy: adjDy };
}

/* -------------------------------------------------------
   Наведение — FIX: не перехватываем, если элемент выделен
   ------------------------------------------------------- */

function handleEditMouseOver(e) {
  if (!isEditMode || isDragging || isResizing) return;

  // Если элемент уже выделен — не показываем hover overlay (чтобы не мешать работе с панелью)
  if (selectedEditElement) {
    editHoverOverlay.style.display = 'none';
    editLabelOverlay.style.display = 'none';
    return;
  }

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
  if (selectedEditElement) return; // Заморожен на выделенном элементе
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
  _positionLabel(editLabelOverlay, element.tagName.toLowerCase(), idSuffix, classSuffix, rect, scroll,
    'ai-selector-edit-label-tag', 'ai-selector-edit-label-dimensions');
}

/* -------------------------------------------------------
   Клик — выделение элемента
   ------------------------------------------------------- */

function handleEditClick(e) {
  if (!isEditMode || isDragging || isResizing) return;
  if (rootContainer && (e.target === rootContainer || rootContainer.contains(e.target))) return;

  // Клик по ресайз-ручке или тоглу панели — не обрабатываем
  if (e.target.dataset && e.target.dataset.dir) return;
  if (e.target.classList && e.target.classList.contains('ai-selector-props-toggle')) return;

  // Клик по overlay начинает drag
  if (e.target === editSelectedOverlay) return;

  _hideContextMenu();

  // Если уже выделен этот же элемент — снимаем выделение
  if (selectedEditElement && !_isExtensionEl(e.target)) {
    const clickedIsSelected = (e.target === selectedEditElement || selectedEditElement.contains(e.target));
    if (!clickedIsSelected) {
      // Кликнули на другой элемент — переключаем
      e.preventDefault();
      e.stopPropagation();
      const el = e.target;
      if (el && el !== document.body && el !== document.documentElement) {
        selectEditElement(el);
      } else {
        deselectEditElement();
      }
      return;
    }
  }

  if (!_isExtensionEl(e.target)) {
    e.preventDefault();
    e.stopPropagation();
    const el = lastHoveredElement || e.target;
    if (el && el !== document.body && el !== document.documentElement) selectEditElement(el);
  }
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
  const isTextNode = el.childNodes.length === 0 ||
    Array.from(el.childNodes).every(n =>
      n.nodeType === Node.TEXT_NODE ||
      ['SPAN','B','I','STRONG','EM','A','BR','U','S','CODE'].includes(n.nodeName)
    );

  if (!isTextNode) {
    showToastNotification('Выберите текстовый элемент');
    return;
  }

  const oldText = el.textContent;
  stopEditMode(false);
  el.contentEditable = 'true';
  el.classList.add('ai-selector-inline-editing');
  el.focus();

  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  showToastNotification('✏️ Редактирование текста. Enter — сохранить, Esc — отменить');

  function finishEdit(save) {
    el.removeEventListener('keydown', onKeyDown);
    el.removeEventListener('blur',    onBlur);
    el.contentEditable = 'false';
    el.classList.remove('ai-selector-inline-editing');

    const newText = el.textContent;
    if (save && newText !== oldText) {
      pushUndo({ type: 'text', el, oldText, newText });
      _trackChange(getUniqueCssSelector(el), 'textContent', oldText, newText);
      showToastNotification('Текст изменён');
    } else if (!save) {
      el.textContent = oldText;
    }

    startEditMode();
    selectEditElement(el);
    if (isPropsPanelOpen) _showEditPropsPanel(el);
  }

  function onKeyDown(ev) {
    if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); finishEdit(true);  }
    if (ev.key === 'Escape')                                         finishEdit(false);
  }

  function onBlur() { finishEdit(true); }

  el.addEventListener('keydown', onKeyDown);
  el.addEventListener('blur',    onBlur, { once: true });
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

  if (!selectedEditElement || selectedEditElement !== el) selectEditElement(el);
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

  editContextMenu.style.left    = `${x}px`;
  editContextMenu.style.top     = `${y}px`;
  editContextMenu.style.display = 'block';

  requestAnimationFrame(() => {
    const r = editContextMenu.getBoundingClientRect();
    if (r.right  > window.innerWidth)  editContextMenu.style.left = `${x - r.width}px`;
    if (r.bottom > window.innerHeight) editContextMenu.style.top  = `${y - r.height}px`;
  });

  editContextMenu.querySelector('#ctx-text').addEventListener('click', ev => {
    ev.stopPropagation(); _hideContextMenu(); _startInlineTextEdit(el);
  });

  editContextMenu.querySelector('#ctx-clone').addEventListener('click', ev => {
    ev.stopPropagation(); _hideContextMenu();
    const clone = el.cloneNode(true);
    el.parentNode.insertBefore(clone, el.nextSibling);
    pushUndo({ type: 'clone', clone, original: el });
    _trackChange(getUniqueCssSelector(el), 'clone', '', 'cloned');
    showToastNotification('Элемент клонирован');
    selectEditElement(clone);
    saveAnnotatorState();
  });

  editContextMenu.querySelector('#ctx-wrap').addEventListener('click', ev => {
    ev.stopPropagation(); _hideContextMenu();
    const wrapper = document.createElement('div');
    wrapper.style.display = 'contents';
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
    _trackChange(getUniqueCssSelector(el), 'wrap', '', 'wrapped in div');
    showToastNotification('Элемент обёрнут в div');
    selectEditElement(el);
    saveAnnotatorState();
  });

  editContextMenu.querySelector('#ctx-hide').addEventListener('click', ev => {
    ev.stopPropagation(); _hideContextMenu();
    const oldVis = el.style.visibility || '';
    pushUndo({ type: 'visibility', el, oldVal: oldVis });
    el.style.visibility = 'hidden';
    _trackChange(getUniqueCssSelector(el), 'visibility', oldVis, 'hidden');
    deselectEditElement();
    showToastNotification('Элемент скрыт');
    saveAnnotatorState();
  });

  editContextMenu.querySelector('#ctx-delete').addEventListener('click', ev => {
    ev.stopPropagation(); _hideContextMenu();
    const parent = el.parentNode;
    const next   = el.nextSibling;
    pushUndo({ type: 'delete', el, parent, next });
    _trackChange(getUniqueCssSelector(el), 'removed', 'exists', 'removed from DOM');
    deselectEditElement();
    el.remove();
    showToastNotification('Элемент удалён');
    saveAnnotatorState();
  });

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
  // Undo / Redo глобально
  if (e.ctrlKey && e.code === 'KeyZ' && !e.shiftKey) { e.preventDefault(); performUndo(); return; }
  if (e.ctrlKey && (e.code === 'KeyY' || (e.shiftKey && e.code === 'KeyZ'))) { e.preventDefault(); performRedo(); return; }

  if (e.key === 'Escape') {
    _hideContextMenu();
    if (selectedEditElement) deselectEditElement();
    else stopEditMode();
    return;
  }

  // Стрелки — перемещение на 1px (Shift = 10px)
  if (selectedEditElement && !e.ctrlKey && !e.altKey && !e.metaKey) {
    const arrows = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
    if (!arrows.includes(e.key)) return;
    const step = e.shiftKey ? 10 : 1;
    e.preventDefault();

    const pos = window.getComputedStyle(selectedEditElement).position;
    if (!['absolute','fixed','relative'].includes(pos)) selectedEditElement.style.position = 'relative';

    const oldL = parseFloat(selectedEditElement.style.left) || 0;
    const oldT = parseFloat(selectedEditElement.style.top)  || 0;
    let newL = oldL, newT = oldT;

    if (e.key === 'ArrowLeft')  newL -= step;
    if (e.key === 'ArrowRight') newL += step;
    if (e.key === 'ArrowUp')    newT -= step;
    if (e.key === 'ArrowDown')  newT += step;

    if (newL !== oldL) {
      selectedEditElement.style.left = `${newL}px`;
      pushUndo({ type: 'style', el: selectedEditElement, property: 'left', oldVal: `${oldL}px`, newVal: `${newL}px` });
    }
    if (newT !== oldT) {
      selectedEditElement.style.top = `${newT}px`;
      pushUndo({ type: 'style', el: selectedEditElement, property: 'top', oldVal: `${oldT}px`, newVal: `${newT}px` });
    }
    updateEditPositions();
    _syncPropsPanelPosition();
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

  // Панель свойств: открываем только если она была открыта ранее
  if (isPropsPanelOpen) {
    _showEditPropsPanel(element);
  } else {
    _updatePropsPanelToggleBtn();
  }
}

function deselectEditElement() {
  selectedEditElement = null;
  editElementSnapshot = null;
  if (editSelectedOverlay) editSelectedOverlay.style.display = 'none';
  // Панель прячем только если пользователь не зафиксировал её открытой
  if (isPropsPanelOpen) _hideEditPropsPanel();
}

function updateEditPositions() {
  if (!selectedEditElement || !editSelectedOverlay) return;
  _positionOverlay(editSelectedOverlay, selectedEditElement.getBoundingClientRect(), getScroll());
}

/* -------------------------------------------------------
   Drag-and-Drop с Snap
   ------------------------------------------------------- */

function setupDragAndDrop() {
  if (!editSelectedOverlay) return;
  editSelectedOverlay.onmousedown = startDrag;
}

function startDrag(e) {
  if (!selectedEditElement) return;
  if (e.target !== editSelectedOverlay) return; // Ресайз-ручки и тоггл-кнопка обрабатываются отдельно
  e.preventDefault();

  isDragging      = true;
  dragStartMouseX = e.clientX;
  dragStartMouseY = e.clientY;

  const rect = selectedEditElement.getBoundingClientRect();
  dragStartElRect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };

  // Собираем sentinels для snap
  _collectSnapSentinels();

  selectedEditElement.classList.add('ai-selector-dragged-element');
  window.addEventListener('mousemove', dragMove, true);
  window.addEventListener('mouseup',   dragEnd,  true);
}

function dragMove(e) {
  if (!isDragging || !selectedEditElement) return;
  e.preventDefault();

  const rawDx = e.clientX - dragStartMouseX;
  const rawDy = e.clientY - dragStartMouseY;
  const scroll = getScroll();

  // Alt — свободное позиционирование без snap
  const { dx, dy } = e.altKey ? { dx: rawDx, dy: rawDy } : _applySnap(rawDx, rawDy);

  if (e.altKey) _hideSnapLines();

  // Двигаем оверлей
  editSelectedOverlay.style.left = `${dragStartElRect.left + scroll.x + dx}px`;
  editSelectedOverlay.style.top  = `${dragStartElRect.top  + scroll.y + dy}px`;

  // Ищем drop-target (только если не Alt)
  if (!e.altKey) {
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
    } else {
      dropTarget = target;
      _updateDropIndicator(e.clientX, e.clientY, target, scroll);
    }
  } else {
    if (dropIndicator) dropIndicator.style.display = 'none';
    dropTarget = null;
  }
}

function _updateDropIndicator(mx, my, target, scroll) {
  if (!dropIndicator) return;
  const tr  = target.getBoundingClientRect();
  const dL  = Math.abs(mx - tr.left), dR = Math.abs(mx - tr.right);
  const dT  = Math.abs(my - tr.top),  dB = Math.abs(my - tr.bottom);
  const min = Math.min(dL, dR, dT, dB);

  if (min === dL)      { dropPosition = 'left';   dropIndicator.className = 'ai-selector-drop-indicator vertical';   dropIndicator.style.left = `${tr.left+scroll.x-2}px`; dropIndicator.style.top = `${tr.top+scroll.y}px`; dropIndicator.style.height = `${tr.height}px`; dropIndicator.style.width = ''; }
  else if (min === dR) { dropPosition = 'right';  dropIndicator.className = 'ai-selector-drop-indicator vertical';   dropIndicator.style.left = `${tr.right+scroll.x-2}px`; dropIndicator.style.top = `${tr.top+scroll.y}px`; dropIndicator.style.height = `${tr.height}px`; dropIndicator.style.width = ''; }
  else if (min === dT) { dropPosition = 'top';    dropIndicator.className = 'ai-selector-drop-indicator horizontal'; dropIndicator.style.left = `${tr.left+scroll.x}px`; dropIndicator.style.top = `${tr.top+scroll.y-2}px`; dropIndicator.style.width = `${tr.width}px`; dropIndicator.style.height = ''; }
  else                 { dropPosition = 'bottom'; dropIndicator.className = 'ai-selector-drop-indicator horizontal'; dropIndicator.style.left = `${tr.left+scroll.x}px`; dropIndicator.style.top = `${tr.bottom+scroll.y-2}px`; dropIndicator.style.width = `${tr.width}px`; dropIndicator.style.height = ''; }

  dropIndicator.style.display = 'block';
}

function dragEnd(e) {
  if (!isDragging) return;
  isDragging = false;

  window.removeEventListener('mousemove', dragMove, true);
  window.removeEventListener('mouseup',   dragEnd,  true);

  selectedEditElement?.classList.remove('ai-selector-dragged-element');
  if (dropIndicator) dropIndicator.style.display = 'none';
  _hideSnapLines();

  const rawDx = e.clientX - dragStartMouseX;
  const rawDy = e.clientY - dragStartMouseY;
  const { dx, dy } = e.altKey ? { dx: rawDx, dy: rawDy } : _applySnap(rawDx, rawDy);
  _hideSnapLines();

  if (dropTarget && selectedEditElement && !e.altKey) {
    const oldParent = selectedEditElement.parentNode;
    const oldNext   = selectedEditElement.nextSibling;
    const parent    = dropTarget.parentNode;
    if (parent) {
      selectedEditElement.style.position = '';
      selectedEditElement.style.left     = '';
      selectedEditElement.style.top      = '';
      const ref = (dropPosition === 'top' || dropPosition === 'left') ? dropTarget : dropTarget.nextSibling;
      parent.insertBefore(selectedEditElement, ref);
      pushUndo({ type: 'move-dom', el: selectedEditElement, oldParent, oldNext, newParent: parent, newNext: ref });
      _trackChange(getUniqueCssSelector(selectedEditElement), 'position-in-dom',
        `child of ${getUniqueCssSelector(oldParent)}`, `child of ${getUniqueCssSelector(parent)}`);
      showToastNotification('Элемент перенесён в DOM');
    }
  } else if (selectedEditElement && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
    const pos = window.getComputedStyle(selectedEditElement).position;
    if (!['absolute','fixed','relative'].includes(pos)) selectedEditElement.style.position = 'relative';

    const oldL = selectedEditElement.style.left || '0px';
    const oldT = selectedEditElement.style.top  || '0px';
    const newL = `${(parseFloat(oldL) || 0) + dx}px`;
    const newT = `${(parseFloat(oldT) || 0) + dy}px`;

    selectedEditElement.style.left = newL;
    selectedEditElement.style.top  = newT;
    pushUndo({ type: 'style', el: selectedEditElement, property: 'left', oldVal: oldL, newVal: newL });
    pushUndo({ type: 'style', el: selectedEditElement, property: 'top',  oldVal: oldT, newVal: newT });
    _trackChange(getUniqueCssSelector(selectedEditElement), 'left', oldL, newL);
    _trackChange(getUniqueCssSelector(selectedEditElement), 'top',  oldT, newT);
    showToastNotification('Элемент перемещён');
  }

  updateEditPositions();
  scheduleUpdatePositions();
  _syncPropsPanelPosition();
  saveAnnotatorState();
  dropTarget = null;
}

/* -------------------------------------------------------
   8 Resize-ручек
   ------------------------------------------------------- */

const RESIZE_DIRS = ['nw','n','ne','e','se','s','sw','w'];

function _setupResizeHandles() {
  if (!editSelectedOverlay) return;

  // Удаляем старые ручки и кнопку
  editSelectedOverlay.querySelectorAll('.ai-selector-resize-handle,.ai-selector-props-toggle').forEach(h => h.remove());

  // Кнопка-тоггл панели свойств (сверху по центру)
  const propsToggle = document.createElement('button');
  propsToggle.className = `ai-selector-props-toggle${isPropsPanelOpen ? ' open' : ''}`;
  propsToggle.id = 'ai-props-toggle-btn';
  propsToggle.innerHTML = isPropsPanelOpen ? '⚙️ Свойства ▲' : '⚙️ Свойства';
  propsToggle.title = 'Открыть/закрыть панель свойств';
  propsToggle.addEventListener('mousedown', e => e.stopPropagation()); // не начинаем drag
  propsToggle.addEventListener('click', e => {
    e.stopPropagation();
    _togglePropsPanel();
  });
  editSelectedOverlay.appendChild(propsToggle);

  // 8 resize-ручек
  RESIZE_DIRS.forEach(dir => {
    const handle = document.createElement('div');
    handle.className   = 'ai-selector-resize-handle';
    handle.dataset.dir = dir;
    handle.addEventListener('mousedown', ev => startResize(ev, dir), true);
    editSelectedOverlay.appendChild(handle);
  });
}

function _togglePropsPanel() {
  if (isPropsPanelOpen) {
    isPropsPanelOpen = false;
    _hideEditPropsPanel();
  } else {
    isPropsPanelOpen = true;
    if (selectedEditElement) _showEditPropsPanel(selectedEditElement);
  }
  _updatePropsPanelToggleBtn();
}

function _updatePropsPanelToggleBtn() {
  const btn = editSelectedOverlay && editSelectedOverlay.querySelector('.ai-selector-props-toggle');
  if (!btn) return;
  btn.innerHTML = isPropsPanelOpen ? '⚙️ Свойства ▲' : '⚙️ Свойства';
  btn.classList.toggle('open', isPropsPanelOpen);
}

/* -------------------------------------------------------
   Resize с 8 направлениями
   ------------------------------------------------------- */

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
  const dir = resizeDirection;

  let newW = resizeStartWidth, newH = resizeStartHeight;
  let newL = resizeStartLeft,  newT = resizeStartTop;

  if (dir.includes('e')) newW = Math.max(15, resizeStartWidth  + dx);
  if (dir.includes('w')) { newW = Math.max(15, resizeStartWidth - dx); newL = resizeStartLeft + (resizeStartWidth - newW); }
  if (dir.includes('s')) newH = Math.max(15, resizeStartHeight + dy);
  if (dir.includes('n')) { newH = Math.max(15, resizeStartHeight - dy); newT = resizeStartTop + (resizeStartHeight - newH); }

  const pos = window.getComputedStyle(selectedEditElement).position;
  if (!['absolute','fixed','relative'].includes(pos)) selectedEditElement.style.position = 'relative';

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
    pushUndo({ type: 'style', el: selectedEditElement, property: 'width',  oldVal: `${resizeStartWidth}px`,  newVal: `${Math.round(rect.width)}px` });
    pushUndo({ type: 'style', el: selectedEditElement, property: 'height', oldVal: `${resizeStartHeight}px`, newVal: `${Math.round(rect.height)}px` });
    _trackChange(getUniqueCssSelector(selectedEditElement), 'width',  `${resizeStartWidth}px`,  `${Math.round(rect.width)}px`);
    _trackChange(getUniqueCssSelector(selectedEditElement), 'height', `${resizeStartHeight}px`, `${Math.round(rect.height)}px`);
  }

  showToastNotification('Размеры изменены');
  updateEditPositions();
  scheduleUpdatePositions();
  _syncPropsPanelValues();
  saveAnnotatorState();
}

/* -------------------------------------------------------
   Edit Properties Panel — управление
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

function _fillPropsPanelValues(el) {
  if (!shadowRoot || !el) return;
  const cs   = window.getComputedStyle(el);
  const rect = el.getBoundingClientRect();

  _setEpInput('ep-width',   `${Math.round(rect.width)}`);
  _setEpInput('ep-height',  `${Math.round(rect.height)}`);
  _setEpInput('ep-left',    el.style.left   ? parseFloat(el.style.left).toFixed(0)   : '0');
  _setEpInput('ep-top',     el.style.top    ? parseFloat(el.style.top).toFixed(0)    : '0');
  _setEpInput('ep-font-size',   parseFloat(cs.fontSize).toFixed(0));
  _setEpInput('ep-line-height', cs.lineHeight !== 'normal' ? parseFloat(cs.lineHeight).toFixed(1) : '');
  _setEpSelect('ep-font-weight', cs.fontWeight);
  _setEpAlignActive(cs.textAlign);

  const hasText = Array.from(el.childNodes).some(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
  const textSection = shadowRoot.getElementById('ep-text-section');
  if (textSection) {
    textSection.style.display = hasText ? '' : 'none';
    if (hasText) { const ta = shadowRoot.getElementById('ep-text-value'); if (ta) ta.value = el.textContent.trim(); }
  }

  _setEpColor('ep-color',    'ep-color-hex',    rgbToHex(cs.color));
  _setEpColor('ep-bg-color', 'ep-bg-color-hex', rgbToHex(cs.backgroundColor));
  _setEpInput('ep-border-radius', parseFloat(cs.borderRadius).toFixed(0));

  const opSl  = shadowRoot.getElementById('ep-opacity');
  const opVal = shadowRoot.getElementById('ep-opacity-val');
  if (opSl)  opSl.value = Math.round(parseFloat(cs.opacity) * 100);
  if (opVal) opVal.textContent = `${Math.round(parseFloat(cs.opacity) * 100)}%`;

  _setEpInput('ep-pt', parseFloat(cs.paddingTop).toFixed(0));
  _setEpInput('ep-pr', parseFloat(cs.paddingRight).toFixed(0));
  _setEpInput('ep-pb', parseFloat(cs.paddingBottom).toFixed(0));
  _setEpInput('ep-pl', parseFloat(cs.paddingLeft).toFixed(0));
  _setEpInput('ep-mt', parseFloat(cs.marginTop).toFixed(0));
  _setEpInput('ep-mr', parseFloat(cs.marginRight).toFixed(0));
  _setEpInput('ep-mb', parseFloat(cs.marginBottom).toFixed(0));
  _setEpInput('ep-ml', parseFloat(cs.marginLeft).toFixed(0));

  const selEl = shadowRoot.querySelector('.ep-selector');
  if (selEl) { const sel = getUniqueCssSelector(el); selEl.textContent = sel.length > 26 ? '…'+sel.slice(-24) : sel; selEl.title = sel; }
  _updateChangesCounter();
}

function _syncPropsPanelValues() {
  if (selectedEditElement && isPropsPanelOpen) _fillPropsPanelValues(selectedEditElement);
}

function _syncPropsPanelPosition() {
  if (!selectedEditElement || !isPropsPanelOpen) return;
  const rect = selectedEditElement.getBoundingClientRect();
  _setEpInput('ep-width',  `${Math.round(rect.width)}`);
  _setEpInput('ep-height', `${Math.round(rect.height)}`);
  _setEpInput('ep-left',   selectedEditElement.style.left  ? parseFloat(selectedEditElement.style.left).toFixed(0)  : '0');
  _setEpInput('ep-top',    selectedEditElement.style.top   ? parseFloat(selectedEditElement.style.top).toFixed(0)   : '0');
}

function _setEpInput(id, value) {
  const el = shadowRoot && shadowRoot.getElementById(id);
  if (el) el.value = value;
}

function _setEpSelect(id, value) {
  const el = shadowRoot && shadowRoot.getElementById(id);
  if (!el) return;
  const fw = String(parseInt(value) || value);
  for (const opt of el.options) { if (opt.value === fw) { el.value = fw; return; } }
  el.value = value;
}

function _setEpAlignActive(align) {
  if (!shadowRoot) return;
  shadowRoot.querySelectorAll('.ep-align-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.align === align));
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

function _bindPropsPanelEvents() {
  if (!shadowRoot) return;

  _onEpNumberChange('ep-width',  v => { if (selectedEditElement) _applyStyleChange(selectedEditElement, 'width', `${v}px`); });
  _onEpNumberChange('ep-height', v => { if (selectedEditElement) { _applyStyleChange(selectedEditElement, 'height', `${v}px`); selectedEditElement.style.maxHeight = 'none'; } });
  _onEpNumberChange('ep-left',   v => { if (selectedEditElement) { const pos = window.getComputedStyle(selectedEditElement).position; if (!['absolute','fixed','relative'].includes(pos)) selectedEditElement.style.position='relative'; _applyStyleChange(selectedEditElement,'left',`${v}px`); } });
  _onEpNumberChange('ep-top',    v => { if (selectedEditElement) { const pos = window.getComputedStyle(selectedEditElement).position; if (!['absolute','fixed','relative'].includes(pos)) selectedEditElement.style.position='relative'; _applyStyleChange(selectedEditElement,'top',`${v}px`); } });
  _onEpNumberChange('ep-font-size',   v => { if (selectedEditElement) _applyStyleChange(selectedEditElement, 'fontSize', `${v}px`); });
  _onEpNumberChange('ep-line-height', v => { if (selectedEditElement) _applyStyleChange(selectedEditElement, 'lineHeight', `${v}`); });

  const fwSel = shadowRoot.getElementById('ep-font-weight');
  if (fwSel) fwSel.addEventListener('change', () => { if (selectedEditElement) _applyStyleChange(selectedEditElement, 'fontWeight', fwSel.value); });

  shadowRoot.querySelectorAll('.ep-align-btn').forEach(btn => {
    btn.addEventListener('click', () => { if (!selectedEditElement) return; _applyStyleChange(selectedEditElement, 'textAlign', btn.dataset.align); _setEpAlignActive(btn.dataset.align); });
  });

  const textTa = shadowRoot.getElementById('ep-text-value');
  if (textTa) {
    let textTimer = null;
    textTa.addEventListener('input', () => {
      clearTimeout(textTimer);
      textTimer = setTimeout(() => {
        if (!selectedEditElement) return;
        const old = selectedEditElement.textContent;
        selectedEditElement.textContent = textTa.value;
        pushUndo({ type: 'text', el: selectedEditElement, oldText: old, newText: textTa.value });
        _trackChange(getUniqueCssSelector(selectedEditElement), 'textContent', old, textTa.value);
      }, 500);
    });
  }

  _bindColorPair('ep-color',    'ep-color-hex',    'color');
  _bindColorPair('ep-bg-color', 'ep-bg-color-hex', 'backgroundColor');

  _onEpNumberChange('ep-border-radius', v => { if (selectedEditElement) _applyStyleChange(selectedEditElement, 'borderRadius', `${v}px`); });

  const opSl = shadowRoot.getElementById('ep-opacity'), opVal = shadowRoot.getElementById('ep-opacity-val');
  if (opSl) opSl.addEventListener('input', () => {
    if (opVal) opVal.textContent = `${opSl.value}%`;
    if (selectedEditElement) _applyStyleChange(selectedEditElement, 'opacity', `${opSl.value/100}`);
  });

  ['pt','pr','pb','pl'].forEach((s,i) => _onEpNumberChange(`ep-${s}`, v => { if (selectedEditElement) _applyStyleChange(selectedEditElement, ['paddingTop','paddingRight','paddingBottom','paddingLeft'][i], `${v}px`); }));
  ['mt','mr','mb','ml'].forEach((s,i) => _onEpNumberChange(`ep-${s}`, v => { if (selectedEditElement) _applyStyleChange(selectedEditElement, ['marginTop','marginRight','marginBottom','marginLeft'][i], `${v}px`); }));

  const copyBtn = shadowRoot.getElementById('ep-copy-changes');
  if (copyBtn) copyBtn.addEventListener('click', copyEditChangesPrompt);

  const closeBtn = shadowRoot.querySelector('.ep-close');
  if (closeBtn) closeBtn.addEventListener('click', () => {
    isPropsPanelOpen = false;
    _hideEditPropsPanel();
    _updatePropsPanelToggleBtn();
  });
}

function _onEpNumberChange(id, callback) {
  if (!shadowRoot) return;
  const el = shadowRoot.getElementById(id);
  if (!el) return;
  let timer = null;
  const handler = () => { clearTimeout(timer); timer = setTimeout(() => { const v = parseFloat(el.value); if (!isNaN(v)) callback(v); updateEditPositions(); scheduleUpdatePositions(); }, 200); };
  el.addEventListener('input',  handler);
  el.addEventListener('change', handler);
}

function _bindColorPair(swatchId, hexId, cssProp) {
  if (!shadowRoot) return;
  const sw = shadowRoot.getElementById(swatchId), hx = shadowRoot.getElementById(hexId);
  const inp = sw && sw.querySelector('input[type="color"]');
  if (inp) inp.addEventListener('input', () => {
    if (sw) sw.style.background = inp.value;
    if (hx) hx.value = inp.value;
    if (selectedEditElement) _applyStyleChange(selectedEditElement, cssProp, inp.value);
  });
  if (hx) hx.addEventListener('input', () => {
    const v = hx.value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(v)) {
      if (sw) sw.style.background = v;
      if (inp) { try { inp.value = v; } catch(e) {} }
      if (selectedEditElement) _applyStyleChange(selectedEditElement, cssProp, v);
    }
  });
}

function _applyStyleChange(el, cssProp, value) {
  if (!el) return;
  const old = el.style[cssProp] || '';
  el.style[cssProp] = value;
  pushUndo({ type: 'style', el, property: cssProp, oldVal: old, newVal: value });
  _trackChange(getUniqueCssSelector(el), cssProp, old || window.getComputedStyle(el)[cssProp], value);
  updateEditPositions();
  scheduleUpdatePositions();
  saveAnnotatorState();
}

/* -------------------------------------------------------
   Трекинг изменений
   ------------------------------------------------------- */

function _snapshotElement(el) {
  if (!el) return null;
  const cs = window.getComputedStyle(el);
  return { selector: getUniqueCssSelector(el), textContent: el.textContent, styles: { width: cs.width, height: cs.height, color: cs.color, backgroundColor: cs.backgroundColor, fontSize: cs.fontSize } };
}

function _trackChange(selector, property, oldValue, newValue) {
  if (oldValue === newValue) return;
  const existing = editChangesLog.find(c => c.selector === selector && c.property === property);
  if (existing) { existing.newValue = newValue; }
  else           { editChangesLog.push({ selector, property, oldValue, newValue }); }
  _updateChangesCounter();
  _updateCopyAgentBtn();
}

function _updateChangesCounter() {
  if (!shadowRoot) return;
  const badge = shadowRoot.getElementById('ep-changes-count');
  if (badge) badge.textContent = editChangesLog.length;
  const copyBtn = shadowRoot.getElementById('ep-copy-changes');
  if (copyBtn) copyBtn.disabled = editChangesLog.length === 0;
}

async function copyEditChangesPrompt() {
  if (!editChangesLog.length) return;

  let prompt = `URL: ${window.location.href}\n\n📝 ИЗМЕНЕНИЯ ЭЛЕМЕНТОВ:\n`;
  const bySelector = {};
  editChangesLog.forEach(c => { if (!bySelector[c.selector]) bySelector[c.selector]=[]; bySelector[c.selector].push(c); });

  Object.entries(bySelector).forEach(([sel, changes], i) => {
    const el = document.querySelector(sel);
    prompt += `${i+1}. \`${sel}\` (${el ? el.tagName.toLowerCase() : '?'})\n`;
    changes.forEach(c => { prompt += `   • ${c.property}: "${c.oldValue}" → "${c.newValue}"\n`; });
    if (el) {
      const html = el.outerHTML;
      prompt += `   HTML:\n\`\`\`html\n${html.length > 800 ? html.substring(0,600)+'...' : html}\n\`\`\`\n`;
    }
    prompt += '\n';
  });

  prompt += '\nЗадача: Перенести эти изменения в исходный код.';

  try {
    await navigator.clipboard.writeText(prompt.trim());
    showToastNotification(`Изменения скопированы (${editChangesLog.length} шт.)`);
  } catch(err) { alert('Ошибка копирования'); }
}

/* -------------------------------------------------------
   Вспомогательные функции
   ------------------------------------------------------- */

function rgbToHex(rgb) {
  if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '';
  const m = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!m) return rgb.startsWith('#') ? rgb : '';
  return '#' + [m[1],m[2],m[3]].map(x => parseInt(x).toString(16).padStart(2,'0')).join('');
}
