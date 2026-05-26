/* background.js — Глобальное управление состоянием расширения AI Annotator */

const DEFAULT_STATE = false;

chrome.runtime.onStartup?.addListener(() => {
  chrome.storage.local.get(['isExtensionGlobalActive'], (result) => {
    if (typeof result.isExtensionGlobalActive !== 'boolean') {
      chrome.storage.local.set({ isExtensionGlobalActive: DEFAULT_STATE });
    } else {
      updateIcon(result.isExtensionGlobalActive);
    }
  });
});

chrome.runtime.onInstalled?.addListener(() => {
  chrome.storage.local.set({ isExtensionGlobalActive: DEFAULT_STATE });
  updateIcon(DEFAULT_STATE);
});

chrome.action.onClicked.addListener(async (tab) => {
  const { isExtensionGlobalActive } = await chrome.storage.local.get('isExtensionGlobalActive');
  const next = !isExtensionGlobalActive;

  await chrome.storage.local.set({ isExtensionGlobalActive: next });
  updateIcon(next);

  if (next) {
    notifyAllTabs({ action: 'start-inspect' });
  } else {
    notifyAllTabs({ action: 'global-deactivate' });
  }
});

/*
  Слушаем изменения вкладок:
  1) Если поменялся URL (SPA навигация)
  2) Если страница полностью загрузилась
*/
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === 'complete') {
    if (tab.url && !tab.url.startsWith('chrome://')) {
      chrome.storage.local.get(['isExtensionGlobalActive'], (result) => {
        if (result.isExtensionGlobalActive) {
          chrome.tabs.sendMessage(tabId, { action: 'spa-navigate' }).catch(() => {});
        }
      });
    }
  }
});

/* ------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------ */

function updateIcon(isActive) {
  const title = isActive
    ? 'AI Annotator — Активен (кликните для выключения)'
    : 'AI Annotator — Выключен (кликните для включения)';
  chrome.action.setTitle({ title });
}

async function notifyAllTabs(message) {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.id && tab.url && !tab.url.startsWith('chrome://')) {
      try {
        await chrome.tabs.sendMessage(tab.id, message);
      } catch (e) {
        // Если контент-скрипт еще не инжектирован (вкладка открыта до установки)
        if (message.action === 'start-inspect') {
          try {
            const result = await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => typeof isInspecting !== 'undefined'
            });
            if (result && result[0] && !result[0].result) {
              await injectContentScriptsIntoTab(tab.id);
            }
          } catch(err) {
            // вкладка недоступна
          }
        }
      }
    }
  }
}

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
  }
}
