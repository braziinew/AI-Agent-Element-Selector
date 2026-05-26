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
