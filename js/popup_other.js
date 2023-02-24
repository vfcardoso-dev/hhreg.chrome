document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("mydrake").addEventListener("click", () => {
        chrome.tabs.create({url: 'https://drake.bz/my', active: true});
    });
});