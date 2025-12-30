document.addEventListener('DOMContentLoaded', () => {
    const reasonInput = document.getElementById('reason');
    const form = document.getElementById('intention-form');
    const siteNameSpan = document.getElementById('site-name');

    // 1. Get redirect URL from query params
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect');

    if (redirectUrl) {
        try {
            const url = new URL(redirectUrl);
            // 2. Display hostname
            siteNameSpan.textContent = url.hostname;
        } catch (e) {
            siteNameSpan.textContent = 'the requested site';
        }
    }

    // 3. Add event listener to form
    form.addEventListener('submit', (event) => {
        // 4a. Prevent default submission
        event.preventDefault();

        // 4b. Get reason
        const reason = reasonInput.value.trim();
        if (!reason) {
            // Optional: Add a small visual cue that reason is required
            reasonInput.style.borderColor = 'red';
            return;
        }

        // 4c. Get timer duration from storage
        chrome.storage.local.get(['timerDuration', 'usageData'], (result) => {
            const duration = result.timerDuration || 10; // Default to 10 mins
            const usageData = result.usageData || [];

            const hostname = new URL(redirectUrl).hostname;
            const matchedSite = hostname.split('.').slice(-2).join('.'); // Get main domain

            // 4d. Save usage data
            usageData.push({
                url: hostname,
                reason: reason,
                timestamp: new Date().getTime(),
                duration: duration 
            });

            chrome.storage.local.set({ usageData });
            
            // 4e. Message background to unlock site
            chrome.runtime.sendMessage({
                action: 'unlockSite',
                site: matchedSite,
                durationMinutes: duration
            }, (response) => {
                if (response && response.unlocked) {
                    // 4f. Redirect to original URL
                    window.location.href = redirectUrl;
                }
            });
        });
    });
});
