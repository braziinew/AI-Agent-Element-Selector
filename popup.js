document.getElementById('start-inspect').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;
    
    // Отправляем сообщение контент-скрипту для запуска инспектирования
    await chrome.tabs.sendMessage(tab.id, { action: "start-inspect" });
    
    // Закрываем всплывающее окно, чтобы пользователь сразу мог взаимодействовать со страницей
    window.close();
  } catch (error) {
    console.error("Ошибка при отправке сообщения в content script:", error);
    alert("Не удалось запустить выбор на этой странице. Убедитесь, что это не служебная страница Chrome (например, chrome://) и обновите страницу.");
  }
});
