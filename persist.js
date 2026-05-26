/* =========================================================
   persist.js — Сохранение/восстановление состояния между загрузками страниц
   Зависит от: state.js, helpers.js, annotations.js
   ========================================================= */

const _PERSIST_PREFIX = 'ai-annotator-v2:';
const _PERSIST_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 дней

function _getPageKey() {
  return _PERSIST_PREFIX + location.origin + location.pathname;
}

/**
 * Сохраняет текущее состояние: аннотации, изменения стилей, editChangesLog.
 * Вызывается при каждом изменении.
 */
function saveAnnotatorState() {
  try {
    // Собираем применённые стили из editChangesLog
    const appliedStyles = {};
    const skipProps = ['textContent', 'clone', 'removed', 'wrap', 'position-in-dom'];
    editChangesLog.forEach(c => {
      if (skipProps.includes(c.property)) return;
      if (!appliedStyles[c.selector]) appliedStyles[c.selector] = {};
      appliedStyles[c.selector][c.property] = c.newValue;
    });

    const data = {
      editChanges: editChangesLog,
      appliedStyles,
      annotations: annotations.map(a => ({
        selector: a.selector,
        text: a.text,
        tagName: a.tagName,
        html: (a.html || '').substring(0, 3000),
      })),
      ts: Date.now(),
    };

    localStorage.setItem(_getPageKey(), JSON.stringify(data));
  } catch (e) {
    console.warn('AI Annotator: ошибка сохранения состояния', e);
  }
}

/**
 * Загружает и восстанавливает состояние из localStorage.
 * Должна вызываться после готовности DOM.
 */
function loadAnnotatorState() {
  try {
    const raw = localStorage.getItem(_getPageKey());
    if (!raw) return;

    const data = JSON.parse(raw);
    if (!data || Date.now() - data.ts > _PERSIST_MAX_AGE) {
      localStorage.removeItem(_getPageKey());
      return;
    }

    let restored = false;

    // 1. Восстанавливаем лог изменений (для промпта)
    if (Array.isArray(data.editChanges) && data.editChanges.length) {
      editChangesLog = data.editChanges;
      _updateChangesCounter();
      restored = true;
    }

    // 2. Применяем сохранённые стили к элементам
    if (data.appliedStyles && typeof data.appliedStyles === 'object') {
      Object.entries(data.appliedStyles).forEach(([sel, styles]) => {
        try {
          const el = document.querySelector(sel);
          if (el) {
            Object.entries(styles).forEach(([prop, val]) => {
              el.style[prop] = val;
            });
          }
        } catch (e) {}
      });
    }

    // 3. Восстанавливаем аннотации (свёрнутые)
    if (Array.isArray(data.annotations) && data.annotations.length) {
      data.annotations.forEach(annData => {
        try {
          const el = document.querySelector(annData.selector);
          if (!el) return;
          if (annotations.some(a => a.element === el)) return;

          const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
          const ann = {
            id,
            element:  el,
            selector: annData.selector,
            tagName:  annData.tagName || el.tagName.toLowerCase(),
            html:     annData.html || el.outerHTML,
            text:     annData.text || '',
            minimized: true,
          };
          annotations.push(ann);
          if (shadowRoot) createStickyNote(ann);
          restored = true;
        } catch (e) {}
      });
    }

    if (restored && shadowRoot) {
      scheduleUpdatePositions();
      updateMasterPanelUI();
      _updateCopyAgentBtn();
      showToastNotification(`Восстановлено ${annotations.length ? annotations.length + ' аннотаций' : ''}${editChangesLog.length ? ' + изменения' : ''}`);
    }

  } catch (e) {
    console.warn('AI Annotator: ошибка загрузки состояния', e);
  }
}

/** Очищает сохранённое состояние для текущей страницы */
function clearAnnotatorState() {
  try { localStorage.removeItem(_getPageKey()); } catch (e) {}
}
