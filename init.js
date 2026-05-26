/* =========================================================
   init.js — Точка входа AI Annotator
   Зависит от всех остальных модулей.
   ========================================================= */

// Предотвращение двойной инициализации (если скрипт случайно инжектирован дважды)
if (!window.__AI_ANNOTATOR_INIT) {
window.__AI_ANNOTATOR_INIT = true;

/**
 * Главная функция инициализации / восстановления.
 * Если контент-скрипт уже запущен, а DOM был заменён (SPA-переход),
 * всё пересоздаётся заново.
 */
async function initAnnotator() {
  const alreadyAlive = rootContainer && document.body && document.body.contains(rootContainer);
  if (alreadyAlive) {
    // Просто обновим UI для верности
    updateMasterPanelUI();
    scheduleUpdatePositions();
    return;
  }

  // Если document.body еще не существует (например, слишком ранний вызов)
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', initAnnotator, { once: true });
    return;
  }

  // --- DOM пропал (переход между страницами). Сбрасываем все ссылки. ---
  _resetDomReferences();

  createRootContainer();        // ui.js
  createOverlayElements();      // annotations.js
  await loadAnnotatorState();   // persist.js — восстановит аннотации для нового URL (асинхронно)
  updateMasterPanelUI();        // ui.js
  scheduleUpdatePositions();    // annotations.js
}

/** Сбрасывает ВСЕ DOM-ссылки, чтобы create-функции заново отрисовали элементы */
function _resetDomReferences() {
  rootContainer        = null;
  shadowRoot           = null;
  hoverOverlay         = null;
  labelOverlay         = null;
  editHoverOverlay     = null;
  editLabelOverlay     = null;
  editSelectedOverlay  = null;
  dropIndicator        = null;
  editContextMenu      = null;

  // Аннотации тоже потеряли свои element-ссылки — перепривяжем в loadAnnotatorState
  if (Array.isArray(annotations)) {
    annotations.forEach(ann => { ann.element = null; });
  }
}

/** Полное выключение расширения по команде снаружи (popup / background) */
function _deinitAnnotator() {
  try { unloadAnnotator(); } catch (e) {}
}

/* =========================================================
   Триггеры запуска
   ========================================================= */

// 1. Контент-скрипт сам загрузился (document_start). Если расширение активно — стартуем.
chrome.storage.local.get(['isExtensionGlobalActive'], (result) => {
  if (result.isExtensionGlobalActive) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAnnotator);
    } else {
      initAnnotator();
    }
  }
});

// 2. Сообщения от popup / background
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'start-inspect') {
    chrome.storage.local.set({ isExtensionGlobalActive: true });
    initAnnotator();
  }
  if (request.action === 'global-deactivate') {
    chrome.storage.local.set({ isExtensionGlobalActive: false });
    _deinitAnnotator();
  }
  if (request.action === 'spa-navigate') {
    // Небольшая задержка, чтобы сайт успел отрисовать новую страницу
    setTimeout(() => {
      chrome.storage.local.get(['isExtensionGlobalActive'], (result) => {
        if (result.isExtensionGlobalActive) {
          if (!rootContainer || !document.body || !document.body.contains(rootContainer)) {
            _resetDomReferences();
            initAnnotator();
          } else {
            loadAnnotatorState().then(() => {
              updateMasterPanelUI();
              scheduleUpdatePositions();
            });
          }
        }
      });
    }, 400);
  }
});

// 3. Горячая клавиша Ctrl + Shift + S — toggle
window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.code === 'KeyS') {
    e.preventDefault();
    chrome.storage.local.get(['isExtensionGlobalActive'], (result) => {
      const next = !result.isExtensionGlobalActive;
      chrome.storage.local.set({ isExtensionGlobalActive: next });
      if (next) {
        initAnnotator();
        if (typeof toggleInspection === 'function' && !isInspecting) toggleInspection();
      } else {
        _deinitAnnotator();
      }
    });
  }
});

} // end window.__AI_ANNOTATOR_INIT check
