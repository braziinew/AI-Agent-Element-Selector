/* =========================================================
   inspect.js — Режим инспектирования (выбор элементов)
   Зависит от: state.js, helpers.js, ui.js, annotations.js
   ========================================================= */

/* -------------------------------------------------------
   Переключение / запуск / остановка
   ------------------------------------------------------- */

function toggleInspection() {
  if (isEditing) return;          // Нельзя переключать во время ввода аннотации
  if (isEditMode) stopEditMode(); // Выходим из режима редактирования, если он был активен
  isInspecting ? stopInspection() : startInspection();
}

function startInspection() {
  if (isInspecting || isEditing) return;
  isInspecting = true;

  document.addEventListener('mouseover', handleMouseOver,    true);
  document.addEventListener('mousemove', handleMouseMove,    true);
  document.addEventListener('click',     handleElementClick, true);
  document.addEventListener('keydown',   handleKeyDown,      true);

  document.body.style.cursor = 'crosshair';
  updateMasterPanelUI();
}

function stopInspection(removeHoverOverlays = true) {
  if (!isInspecting) return;
  isInspecting = false;

  document.removeEventListener('mouseover', handleMouseOver,    true);
  document.removeEventListener('mousemove', handleMouseMove,    true);
  document.removeEventListener('click',     handleElementClick, true);
  document.removeEventListener('keydown',   handleKeyDown,      true);

  document.body.style.cursor = 'default';

  if (removeHoverOverlays) {
    if (hoverOverlay) hoverOverlay.style.display = 'none';
    if (labelOverlay) labelOverlay.style.display = 'none';
  }

  updateMasterPanelUI();
}

/* -------------------------------------------------------
   Обработчики событий мыши
   ------------------------------------------------------- */

function handleMouseOver(e) {
  if (!isInspecting) return;

  if (_isExtensionEl(e.target)) {
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
  _updateInspectOverlay(lastHoveredElement);
}

function handleMouseMove(e) {
  if (!isInspecting || !lastHoveredElement) return;
  _updateInspectOverlay(lastHoveredElement);
}

/** Обновляет позицию рамки наведения и лейбла для инспектирования */
function _updateInspectOverlay(element) {
  if (!element) return;

  const rect   = element.getBoundingClientRect();
  const scroll = getScroll();

  _positionOverlay(hoverOverlay, rect, scroll);

  const { idSuffix, classSuffix } = _getElementSuffix(element);
  _positionLabel(
    labelOverlay,
    element.tagName.toLowerCase(),
    idSuffix, classSuffix,
    rect, scroll,
    'ai-selector-label-tag',
    'ai-selector-label-dimensions'
  );
}

/* -------------------------------------------------------
   Клик — добавление аннотации
   ------------------------------------------------------- */

function handleElementClick(e) {
  if (!isInspecting) return;
  if (rootContainer && (e.target === rootContainer || rootContainer.contains(e.target))) return;

  e.preventDefault();
  e.stopPropagation();

  const el = lastHoveredElement || e.target;
  if (el) addAnnotation(el);
}

/* -------------------------------------------------------
   Клавиатура
   ------------------------------------------------------- */

function handleKeyDown(e) {
  if (e.key === 'Escape') stopInspection();
}

/* -------------------------------------------------------
   Суб-инспектирование (при зажатом CTRL в режиме редактирования)
   ------------------------------------------------------- */

function initSubInspectionListeners() {
  document.addEventListener('mouseover', _handleSubMouseOver, true);
  document.addEventListener('mousemove', _handleSubMouseMove, true);
  document.addEventListener('click', _handleSubClick, true);
  document.addEventListener('keyup', _handleSubKeyUp, true);
}

function deinitSubInspectionListeners() {
  document.removeEventListener('mouseover', _handleSubMouseOver, true);
  document.removeEventListener('mousemove', _handleSubMouseMove, true);
  document.removeEventListener('click', _handleSubClick, true);
  document.removeEventListener('keyup', _handleSubKeyUp, true);
  _stopSubInspecting();
}

function _stopSubInspecting() {
  if (isSubInspecting) {
    isSubInspecting = false;
    document.body.style.cursor = 'default';
    if (hoverOverlay) hoverOverlay.style.display = 'none';
    if (labelOverlay) labelOverlay.style.display = 'none';
  }
}

function _handleSubKeyUp(e) {
  if (e.key === 'Control' && isSubInspecting) {
    _stopSubInspecting();
  }
}

function _handleSubMouseOver(e) {
  if (isEditing && e.ctrlKey) {
    if (!isSubInspecting) {
      isSubInspecting = true;
      document.body.style.cursor = 'crosshair';
    }
  } else if (isSubInspecting && !e.ctrlKey) {
    _stopSubInspecting();
    return;
  }

  if (!isSubInspecting) return;

  if (_isExtensionEl(e.target)) {
    if (hoverOverlay) hoverOverlay.style.display = 'none';
    if (labelOverlay) labelOverlay.style.display = 'none';
    return;
  }

  if (e.target === document.documentElement || e.target === document.body) {
    if (hoverOverlay) hoverOverlay.style.display = 'none';
    if (labelOverlay) labelOverlay.style.display = 'none';
    return;
  }

  lastHoveredElement = e.target;
  _updateInspectOverlay(lastHoveredElement);
}

function _handleSubMouseMove(e) {
  if (isEditing && e.ctrlKey && !isSubInspecting) {
    isSubInspecting = true;
    document.body.style.cursor = 'crosshair';
  } else if (isSubInspecting && !e.ctrlKey) {
    _stopSubInspecting();
    return;
  }

  if (!isSubInspecting || !lastHoveredElement) return;
  _updateInspectOverlay(lastHoveredElement);
}

function _handleSubClick(e) {
  if (!isSubInspecting) return;
  if (rootContainer && (e.target === rootContainer || rootContainer.contains(e.target))) return;

  e.preventDefault();
  e.stopPropagation();

  const el = lastHoveredElement || e.target;
  if (el) {
    const activeAnn = annotations.find(a => !a.minimized);
    if (activeAnn) {
      const textarea = shadowRoot?.getElementById(`txt-${activeAnn.id}`);
      if (textarea) {
        const selector = getUniqueCssSelector(el);
        const insertion = `\`${selector}\``;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + insertion + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + insertion.length;
        activeAnn.text = textarea.value;
        textarea.focus();
        if (typeof showToastNotification === 'function') {
          showToastNotification(`Добавлен элемент: ${selector}`);
        }
      }
    }
  }
}

