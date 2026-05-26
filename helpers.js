/* =========================================================
   helpers.js — Чистые утилиты AI Annotator
   Зависит от: state.js
   ========================================================= */

/* -------------------------------------------------------
   DOM-хелперы позиционирования
   ------------------------------------------------------- */

/** Возвращает текущий скролл страницы */
function getScroll() {
  return {
    x: window.scrollX || window.pageXOffset,
    y: window.scrollY || window.pageYOffset,
  };
}

/**
 * Позиционирует overlay-рамку точно поверх element.
 * @param {HTMLElement} overlay
 * @param {DOMRect}     rect    — getBoundingClientRect()
 * @param {{x:number, y:number}} scroll
 */
function _positionOverlay(overlay, rect, scroll) {
  overlay.style.width   = `${rect.width}px`;
  overlay.style.height  = `${rect.height}px`;
  overlay.style.left    = `${rect.left + scroll.x}px`;
  overlay.style.top     = `${rect.top  + scroll.y}px`;
  overlay.style.display = 'block';
}

/**
 * Позиционирует лейбл тега над / под элементом.
 * @param {HTMLElement} label
 * @param {string}      tagName
 * @param {string}      idSuffix    — например '#main'
 * @param {string}      classSuffix — например '.wrapper'
 * @param {DOMRect}     rect
 * @param {{x,y}}       scroll
 * @param {string}      tagClass    — CSS-класс для части с тегом
 * @param {string}      dimClass    — CSS-класс для части с размерами
 */
function _positionLabel(label, tagName, idSuffix, classSuffix, rect, scroll, tagClass, dimClass) {
  label.innerHTML =
    `<span class="${tagClass}">${tagName}${idSuffix}${classSuffix}</span>` +
    `<span class="${dimClass}">${Math.round(rect.width)} × ${Math.round(rect.height)}</span>`;

  label.style.display = 'block';

  const lh = label.offsetHeight || 20;
  let top  = rect.top + scroll.y - lh - 5;
  if (top < scroll.y) top = rect.top + scroll.y + rect.height + 5;

  label.style.left = `${Math.max(scroll.x + 5, rect.left + scroll.x)}px`;
  label.style.top  = `${top}px`;
}

/**
 * Возвращает #id и .firstClass для элемента (без ai-selector-префикса).
 * @param {Element} element
 * @returns {{ idSuffix: string, classSuffix: string }}
 */
function _getElementSuffix(element) {
  const idSuffix = element.id ? `#${element.id}` : '';
  let classSuffix = '';
  if (element.classList?.length > 0) {
    const clean = Array.from(element.classList).filter(c => !c.startsWith('ai-selector'));
    if (clean.length > 0) classSuffix = `.${clean[0]}`;
  }
  return { idSuffix, classSuffix };
}

/**
 * Является ли элемент частью интерфейса расширения (оверлеем или Shadow DOM)?
 * @param {EventTarget} target
 * @returns {boolean}
 */
function _isExtensionEl(target) {
  if (!(target instanceof Element)) return false;
  return (
    target.classList.contains('ai-selector-hover-overlay')         ||
    target.classList.contains('ai-selector-label')                 ||
    target.classList.contains('ai-selector-persistent-overlay')    ||
    target.classList.contains('ai-selector-persistent-badge')      ||
    target.classList.contains('ai-selector-edit-hover-overlay')    ||
    target.classList.contains('ai-selector-edit-selected-overlay') ||
    target.classList.contains('ai-selector-edit-label')            ||
    target.classList.contains('ai-selector-drop-indicator')        ||
    (rootContainer != null && (target === rootContainer || rootContainer.contains(target)))
  );
}

/**
 * Создаёт div с указанным className, скрытый, и добавляет в document.body.
 * @param {string} className
 * @returns {HTMLDivElement}
 */
function _createOverlay(className) {
  const el = document.createElement('div');
  el.className     = className;
  el.style.display = 'none';
  document.body.appendChild(el);
  return el;
}

/* -------------------------------------------------------
   CSS-селекторы
   ------------------------------------------------------- */

/**
 * Генерирует уникальный CSS-селектор для элемента.
 * @param {Element} el
 * @returns {string}
 */
function getUniqueCssSelector(el) {
  if (!(el instanceof Element)) return '';

  // Быстрый путь: уникальный id
  if (el.id && document.querySelectorAll(`[id="${CSS.escape(el.id)}"]`).length === 1) {
    return `#${el.id}`;
  }

  const path = [];
  let cur = el;

  while (cur && cur.nodeType === Node.ELEMENT_NODE) {
    let seg = cur.nodeName.toLowerCase();

    if (cur.id && document.querySelectorAll(`[id="${CSS.escape(cur.id)}"]`).length === 1) {
      path.unshift(`#${cur.id}`);
      break;
    }

    // Добавляем классы (без ai-selector-*)
    if (cur.classList?.length > 0) {
      const cls = Array.from(cur.classList).filter(c => !c.startsWith('ai-selector'));
      if (cls.length) seg += '.' + cls.map(c => CSS.escape(c)).join('.');
    }

    // nth-of-type, если нужно
    const parent = cur.parentElement;
    if (parent) {
      const sameTag = Array.from(parent.children).filter(s => s.nodeName === cur.nodeName);
      if (sameTag.length > 1) seg += `:nth-of-type(${sameTag.indexOf(cur) + 1})`;
    }

    path.unshift(seg);
    cur = cur.parentElement;
  }

  return path.join(' > ');
}

/* -------------------------------------------------------
   Строковые утилиты
   ------------------------------------------------------- */

const _HTML_ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };

/**
 * Экранирует спецсимволы HTML.
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, m => _HTML_ESCAPE_MAP[m]);
}
