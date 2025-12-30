document.addEventListener('DOMContentLoaded', () => {
    const openDashboardBtn = document.getElementById('open-dashboard');
    openDashboardBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
});