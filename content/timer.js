(() => {
    let timerInterval;

    const createTimerOverlay = (expiresIn) => {
        // Avoid creating multiple timers
        if (document.getElementById('locked-in-timer-overlay')) {
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'locked-in-timer-overlay';
        
        const timeEl = document.createElement('span');
        timeEl.className = 'time';
        overlay.appendChild(timeEl);
        
        document.body.appendChild(overlay);

        updateTimer(expiresIn, timeEl, overlay);

        timerInterval = setInterval(() => {
            const newExpiresIn = expiresIn - Date.now();
            updateTimer(newExpiresIn, timeEl, overlay);
        }, 1000);
    };

    const updateTimer = (milliseconds, timeEl, overlay) => {
        if (milliseconds <= 0) {
            timeEl.textContent = '00:00';
            clearInterval(timerInterval);
            // Inform background script to re-block
            chrome.runtime.sendMessage({ action: 'reblockSite' });
            overlay.remove();
        } else {
            const totalSeconds = Math.floor(milliseconds / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            timeEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    };

    const currentHostname = window.location.hostname;
    const matchedSite = currentHostname.split('.').slice(-2).join('.');
    
    chrome.storage.local.get('unlockedSites', (result) => {
        const unlockedSites = result.unlockedSites || {};
        const siteData = unlockedSites[matchedSite];

        if (siteData && siteData.unlockedUntil) {
            const expiresIn = siteData.unlockedUntil - Date.now();
            if (expiresIn > 0) {
                createTimerOverlay(siteData.unlockedUntil);
            }
        }
    });
})();
