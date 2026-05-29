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
 * Сохраняет текущее состояние: аннотации, изменения стилей, editChangesLog, шаблоны.
 * Вызывается при каждом изменении. Работает в фоне (не ждем завершения).
 */
function saveAnnotatorState() {
  try {
    // Собираем применённые стили из editChangesLog
    const appliedStyles = {};
    const skipProps = ['textContent', 'clone', 'removed', 'wrap', 'position-in-dom'];
    if (window.editChangesLog) {
      editChangesLog.forEach(c => {
        if (skipProps.includes(c.property)) return;
        if (!appliedStyles[c.selector]) appliedStyles[c.selector] = {};
        appliedStyles[c.selector][c.property] = c.newValue;
      });
    }

    // Определяем текущий режим детализации для оптимизации хранения
    const currentVerbosity = (typeof shadowRoot !== 'undefined' && shadowRoot)
      ? shadowRoot.getElementById('prompt-verbosity')?.value || 'normal'
      : 'normal';

    const data = {
      url: window.location.href, // сохраняем URL для удобства при копировании
      editChanges: window.editChangesLog || [],
      appliedStyles,
      annotations: (window.annotations || []).map(a => {
        const rawHtml = a.html || '';
        let savedHtml;
        if (currentVerbosity === 'minimal') {
          // В минимальном режиме сохраняем только открывающий тег (для getElementSummary)
          const tagMatch = rawHtml.match(/^<[^>]+>/);
          savedHtml = tagMatch ? tagMatch[0] : rawHtml.substring(0, 120);
        } else {
          savedHtml = rawHtml.substring(0, 3000);
        }
        return {
          selector: a.selector,
          text: a.text,
          tagName: a.tagName,
          html: savedHtml,
          clickCoords: a.clickCoords,
        };
      }),
      insertedTemplates: (window.insertedTemplates || []).map(t => ({
        id: t.id,
        label: t.label,
        selector: t.selector
      })),
      ts: Date.now(),
    };

    chrome.storage.local.set({ [_getPageKey()]: data });
  } catch (e) {
    console.warn('AI Annotator: ошибка сохранения состояния', e);
  }
}

/**
 * Загружает и восстанавливает состояние из chrome.storage.local.
 * Асинхронная функция.
 */
async function loadAnnotatorState() {
  try {
    const key = _getPageKey();
    const result = await chrome.storage.local.get(key);
    const data = result[key];
    
    if (!data) return;

    if (Date.now() - data.ts > _PERSIST_MAX_AGE) {
      chrome.storage.local.remove(key);
      return;
    }

    let restored = false;

    // 1. Восстанавливаем лог изменений (для промпта)
    if (Array.isArray(data.editChanges) && data.editChanges.length) {
      window.editChangesLog = data.editChanges;
      if (typeof _updateChangesCounter === 'function') _updateChangesCounter();
      restored = true;
    }

    // 1.5 Восстанавливаем информацию о вставленных шаблонах (для промпта)
    if (Array.isArray(data.insertedTemplates) && data.insertedTemplates.length) {
      window.insertedTemplates = data.insertedTemplates;
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
          if (window.annotations.some(a => a.element === el)) return;

          const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
          const ann = {
            id,
            element:  el,
            selector: annData.selector,
            tagName:  annData.tagName || el.tagName.toLowerCase(),
            html:     annData.html || el.outerHTML,
            text:     annData.text || '',
            minimized: true,
            clickCoords: annData.clickCoords || null,
          };
          window.annotations.push(ann);
          if (typeof createStickyNote === 'function' && window.shadowRoot) createStickyNote(ann);
          restored = true;
        } catch (e) {}
      });
    }

    if (restored && window.shadowRoot) {
      if (typeof scheduleUpdatePositions === 'function') scheduleUpdatePositions();
      if (typeof updateMasterPanelUI === 'function') updateMasterPanelUI();
      if (typeof _updateCopyAgentBtn === 'function') _updateCopyAgentBtn();
      if (typeof showToastNotification === 'function') {
        const anns = window.annotations ? window.annotations.length : 0;
        const edits = window.editChangesLog ? window.editChangesLog.length : 0;
        showToastNotification(`Восстановлено ${anns ? anns + ' аннот.' : ''} ${edits ? '+ ' + edits + ' изм.' : ''}`);
      }
    }

  } catch (e) {
    console.warn('AI Annotator: ошибка загрузки состояния', e);
  }
}

/** Очищает сохранённое состояние для текущей страницы */
function clearAnnotatorState() {
  try { chrome.storage.local.remove(_getPageKey()); } catch (e) {}
}

/** 
 * Очищает ВСЕ сохранённые страницы (глобально)
 */
async function clearAllGlobalState() {
  try {
    const allData = await chrome.storage.local.get(null);
    const keysToRemove = Object.keys(allData).filter(k => k.startsWith(_PERSIST_PREFIX));
    if (keysToRemove.length > 0) {
      await chrome.storage.local.remove(keysToRemove);
    }
  } catch (e) {
    console.warn('AI Annotator: ошибка глобальной очистки', e);
  }
}
