chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
    if (info.status !== 'complete') return;

    var allowed = /^(http|https)\:\/\/(|\w+\.)drake\.bz\/my\/additional\-events/.test(tab.url);
    var popupFile = allowed ? 'popup_mydrake.html' : 'popup_other.html';

    chrome.action.setPopup({ popup: popupFile, tabId: tab.id });
});