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

        const update = () => {
            const newExpiresIn = expiresIn - Date.now();
            updateTimer(newExpiresIn, timeEl, overlay);
        };

        update();
        timerInterval = setInterval(update, 1000);
    };

    const updateTimer = (milliseconds, timeEl, overlay) => {
        if (milliseconds <= 0) {
            timeEl.textContent = '00:00';
            clearInterval(timerInterval);
            overlay.remove();
        } else {
            const totalSeconds = Math.floor(milliseconds / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            timeEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    };

    const currentHostname = window.location.hostname;
    const site = currentHostname.replace(/^(www\.)?/, '');

    chrome.runtime.sendMessage({ action: 'getTimerState', site: site }, (response) => {
        if (response && response.unlockedUntil) {
            createTimerOverlay(response.unlockedUntil);
        }
    });

    // Listen for timer updates from the background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'timerUpdate' && message.site === site) {
            if (message.unlockedUntil) {
                createTimerOverlay(message.unlockedUntil);
            } else {
                // If the timer is cleared, remove the overlay
                const overlay = document.getElementById('locked-in-timer-overlay');
                if (overlay) {
                    overlay.remove();
                    clearInterval(timerInterval);
                }
            }
        }
    });
})();
