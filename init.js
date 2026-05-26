/* =========================================================
   init.js — Точка входа AI Annotator
   Загружается последним. Зависит от всех остальных модулей.
   ========================================================= */

/**
 * Главная функция инициализации расширения.
 * Безопасно вызывать повторно — всё создаётся только один раз.
 */
function initAnnotator() {
  createRootContainer();   // ui.js
  createOverlayElements(); // annotations.js
  loadAnnotatorState();    // persist.js (загрузка из localStorage)
  if (!isEditing) startInspection(); // inspect.js
  updateMasterPanelUI();   // ui.js
  scheduleUpdatePositions(); // annotations.js
}

// --- Запуск по сообщению от popup ---
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'start-inspect') {
    initAnnotator();
  }
});

// --- Глобальное сочетание клавиш Ctrl+Shift+S ---
window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.code === 'KeyS') {
    e.preventDefault();
    initAnnotator();
    toggleInspection(); // inspect.js
  }
});
