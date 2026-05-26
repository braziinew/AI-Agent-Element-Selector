/* background.js — Глобальное управление состоянием расширения AI Annotator */

// По умолчанию расширение выключено
const DEFAULT_STATE = false;

/*
  При старте браузера/установке расширения убеждаемся, что флаг есть.
  Если storage пуст — ставим false.
*/
chrome.runtime.onStartup?.addListener(() => {
  chrome.storage.local.get(['isExtensionGlobalActive'], (result) => {
    if (typeof result.isExtensionGlobalActive !== 'boolean') {
      chrome.storage.local.set({ isExtensionGlobalActive: DEFAULT_STATE });
    }
  });
});

chrome.runtime.onInstalled?.addListener(() => {
  chrome.storage.local.set({ isExtensionGlobalActive: DEFAULT_STATE });
});

/*
  При клике на иконку расширения — toggle глобального состояния.
  Не показываем popup; управляем всё через chrome.action API.
*/
chrome.action.onClicked.addListener(async (tab) => {
  const { isExtensionGlobalActive } = await chrome.storage.local.get('isExtensionGlobalActive');
  const next = !isExtensionGlobalActive;

  await chrome.storage.local.set({ isExtensionGlobalActive: next });
  updateIcon(next);

  if (next) {
    // ВКЛ: инжектируем (или перезапускаем) контент-скрипты на подходящих вкладках
    injectAllContentScripts();
  } else {
    // ВЫКЛ: отправляем сообщение «stop-everything» всем контент-скриптам
    notifyAllTabs({ action: 'global-deactivate' });
  }
});

/*
  Когда открывается новая вкладка или страница завершает загрузку —
  если расширение глобально активно, инжектируем контент-скрипты.
*/
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    chrome.storage.local.get(['isExtensionGlobalActive'], (result) => {
      if (result.isExtensionGlobalActive) {
        injectContentScriptsIntoTab(tabId);
      }
    });
  }
});

/* ------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------ */

/** Обновляет иконку и tooltip в зависимости от состояния. */
function updateIcon(isActive) {
  const title = isActive
    ? 'AI Annotator — Активен (кликните для выключения)'
    : 'AI Annotator — Выключен (кликните для включения)';
  chrome.action.setTitle({ title });
  // Можно добавить setIcon с разными цветами, если есть ресурсы
}

/** Инжектирует набор файлов в указанную вкладку. */
async function injectContentScriptsIntoTab(tabId) {
  const files = {
    css: ['content.css'],
    js: [
      'state.js',
      'helpers.js',
      'undo.js',
      'persist.js',
      'ui.js',
      'annotations.js',
      'inspect.js',
      'edit.js',
      'templates.js',
      'init.js'
    ]
  };
  try {
    await chrome.scripting.insertCSS({ target: { tabId }, files: files.css });
    await chrome.scripting.executeScript({ target: { tabId }, files: files.js });
  } catch (err) {
    // Может быть «frame does not exist» при быстром закрытии вкладки — игнорируем
  }
}

/** Инжектирует во все подходящие вкладки. */
async function injectAllContentScripts() {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.id && tab.url && !tab.url.startsWith('chrome://')) {
      await injectContentScriptsIntoTab(tab.id);
    }
  }
}

/** Рассылает сообщение всем контент-скриптам во всех вкладках. */
async function notifyAllTabs(message) {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.id) {
      try {
        chrome.tabs.sendMessage(tab.id, message);
      } catch (e) {
        // вкладка без нашего контент-скрипта — нормально
      }
    }
  }
}
