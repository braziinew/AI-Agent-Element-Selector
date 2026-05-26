/* =========================================================
   init.js — Точка входа AI Annotator
   Зависит от всех остальных модулей.
   ========================================================= */

/* Флаг "патч History API уже применён" — нужен только один раз за жизнь страницы */
let _historyPatched = false;

/**
 * Главная функция инициализации / восстановления.
 * Если контент-скрипт уже запущен, а DOM был заменён (SPA-переход),
 * всё пересоздаётся заново.
 */
function initAnnotator() {
  const alreadyAlive = rootContainer && document.body.contains(rootContainer);
  if (alreadyAlive) {
    // Просто обновим UI для верности
    updateMasterPanelUI();
    scheduleUpdatePositions();
    return;
  }

  // --- DOM пропал (переход между страницами). Сбрасываем все ссылки. ---
  _resetDomReferences();

  createRootContainer();        // ui.js
  createOverlayElements();      // annotations.js
  loadAnnotatorState();         // persist.js — восстановит аннотации для нового URL
  updateMasterPanelUI();        // ui.js
  scheduleUpdatePositions();    // annotations.js

  // --- Трекируем навигацию (History API / hash) — навесить один раз ---
  if (!_historyPatched) {
    _historyPatched = true;
    patchHistoryAndHash();
  }
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

/**
 * Перехватывает History API и hashchange.
 * При ЛЮБОЙ навигации (pushState / replaceState / popstate / hashchange)
 * проверяет, не вычистил ли сайт наш DOM, и пересоздаёт при необходимости.
 */
function patchHistoryAndHash() {
  const origPush    = history.pushState;
  const origReplace = history.replaceState;

  const onNav = () => {
    // Небольшая задержка, чтобы сайт успел отрисовать новую страницу
    setTimeout(() => {
      // Если rootContainer вычистили — пересоздаём всё; иначе просто обновляем state
      if (!rootContainer || !document.body.contains(rootContainer)) {
        _resetDomReferences();
        initAnnotator();
      } else {
        loadAnnotatorState();
        scheduleUpdatePositions();
      }
    }, 400);
  };

  history.pushState = function (...args) {
    origPush.apply(this, args);
    onNav();
  };
  history.replaceState = function (...args) {
    origReplace.apply(this, args);
    onNav();
  };

  window.addEventListener('popstate', onNav);
  window.addEventListener('hashchange', onNav);
}

/** Полное выключение расширения по команде снаружи (popup / background) */
function _deinitAnnotator() {
  try { unloadAnnotator(); } catch (e) {}
  _historyPatched = false; // сбрасываем, чтобы при следующем включении заново привязать
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

// 2. Сообщение от popup / background
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'start-inspect') {
    chrome.storage.local.set({ isExtensionGlobalActive: true });
    initAnnotator();
  }
  if (request.action === 'global-deactivate') {
    chrome.storage.local.set({ isExtensionGlobalActive: false });
    _deinitAnnotator();
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
