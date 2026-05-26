/* popup.js — переключатель глобального состояния расширения */

const statusEl   = document.getElementById('status-text');
const toggleBtn  = document.getElementById('toggle-btn');

/** Обновляет текст и стили кнопки */
function render(isActive) {
  if (isActive) {
    statusEl.classList.remove('off');
    statusEl.querySelector('span:last-child').textContent = 'Активно';

    toggleBtn.classList.remove('off');
    toggleBtn.classList.add('on');
    toggleBtn.innerHTML = '<span>⏹</span> Выключить Annotator';
  } else {
    statusEl.classList.add('off');
    statusEl.querySelector('span:last-child').textContent = 'Выключено';

    toggleBtn.classList.remove('on');
    toggleBtn.classList.add('off');
    toggleBtn.innerHTML = '<span>🔍</span> Включить Annotator';
  }
}

// --- Инициализация: показываем текущее состояние ---
chrome.storage.local.get(['isExtensionGlobalActive'], (result) => {
  render(!!result.isExtensionGlobalActive);
});

// --- Клик по кнопке — toggle ---
toggleBtn.addEventListener('click', async () => {
  const { isExtensionGlobalActive } = await chrome.storage.local.get('isExtensionGlobalActive');
  const next = !isExtensionGlobalActive;

  await chrome.storage.local.set({ isExtensionGlobalActive: next });
  render(next);

  // Если включаем — пробуем инжектировать на текущую вкладку (если background ещё не успел)
  if (next) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await chrome.tabs.sendMessage(tab.id, { action: 'start-inspect' });
      }
    } catch (e) {
      // вкладка без контент-скрипта — background.js сделает inject сам
    }
  } else {
    // Отправляем всем «выключить»
    try {
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (tab.id) chrome.tabs.sendMessage(tab.id, { action: 'global-deactivate' });
      }
    } catch (e) {}
  }
});
