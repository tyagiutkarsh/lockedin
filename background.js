let allowedNavigations = {};

// Initialize default settings on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['blockedSites', 'timerDuration'], (result) => {
    const defaults = {
      blockedSites: !result.blockedSites ? ['youtube.com', 'x.com', 'linkedin.com', 'twitter.com'] : result.blockedSites,
      timerDuration: !result.timerDuration ? 10 : result.timerDuration,
    };
    chrome.storage.local.set(defaults);
  });
});

// The core blocking logic
chrome.webNavigation.onBeforeNavigate.addListener(
  (details) => {
    // Skip frames, only react to main page navigation
    if (details.frameId !== 0) {
      return;
    }

    // Check if this navigation is on the temporary whitelist
    if (allowedNavigations[details.tabId] === details.url) {
        delete allowedNavigations[details.tabId];
        return;
    }

    const url = new URL(details.url);
    
    // Don't block our own extension pages
    if (url.protocol === 'chrome-extension:') {
      return;
    }

    chrome.storage.local.get(['blockedSites', 'unlockedSites'], (result) => {
      const blockedSites = result.blockedSites || [];
      const unlockedSites = result.unlockedSites || {};

      const matchedSite = blockedSites.find(site => url.hostname === site || url.hostname.endsWith('.' + site));

      if (matchedSite) {
        const siteData = unlockedSites[matchedSite];
        const isUnlocked = siteData && new Date().getTime() < siteData.unlockedUntil;

        if (!isUnlocked) {
          const blockerUrl = chrome.runtime.getURL('pages/block.html');
          const redirectUrl = `${blockerUrl}?redirect=${encodeURIComponent(details.url)}`;
          
          chrome.tabs.update(details.tabId, { url: redirectUrl });
        }
      }
    });
  },
  {
    url: [{ schemes: ['http', 'https'] }],
  }
);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'unlockAndRedirect') {
        const { site, durationMinutes, redirectUrl } = message;
        const tabId = sender.tab.id;

        allowedNavigations[tabId] = redirectUrl;

        chrome.storage.local.get('unlockedSites', (result) => {
            const unlockedSites = result.unlockedSites || {};
            const unlockedUntil = new Date().getTime() + durationMinutes * 60 * 1000;
            unlockedSites[site] = { unlockedUntil };
            
            chrome.storage.local.set({ unlockedSites }, () => {
                // Create an alarm to re-block the site when the timer expires
                chrome.alarms.create(site, { when: unlockedUntil });

                // Notify all tabs of the site to update their timers
                chrome.tabs.query({ url: [`*://${site}/*`, `*://*.${site}/*`] }, (tabs) => {
                    tabs.forEach(tab => {
                        chrome.tabs.sendMessage(tab.id, { action: 'timerUpdate', site: site, unlockedUntil: unlockedUntil });
                    });
                });

                chrome.tabs.update(tabId, { url: redirectUrl });
            });
        });
        return true; // Indicates that the response is sent asynchronously
    } else if (message.action === 'getTimerState') {
        const { site } = message;
        chrome.storage.local.get('unlockedSites', (result) => {
            const unlockedSites = result.unlockedSites || {};
            const siteData = unlockedSites[site];
            if (siteData && siteData.unlockedUntil) {
                const expiresIn = siteData.unlockedUntil - Date.now();
                if (expiresIn > 0) {
                    sendResponse({ unlockedUntil: siteData.unlockedUntil });
                } else {
                    sendResponse({ unlockedUntil: null });
                }
            } else {
                sendResponse({ unlockedUntil: null });
            }
        });
        return true; // Required for async sendResponse
    }
});

// Handle alarm event to re-block sites
chrome.alarms.onAlarm.addListener((alarm) => {
    const site = alarm.name;
    chrome.storage.local.get('unlockedSites', (result) => {
        const unlockedSites = result.unlockedSites || {};
        if (unlockedSites[site]) {
            delete unlockedSites[site];
            chrome.storage.local.set({ unlockedSites }, () => {
                // Find all tabs for the site and re-block them
                chrome.tabs.query({ url: `*://${site}/*` }, (tabs) => {
                    const blockerUrl = chrome.runtime.getURL('pages/block.html');
                    tabs.forEach(tab => {
                        const redirectUrl = `${blockerUrl}?redirect=${encodeURIComponent(tab.url)}`;
                        chrome.tabs.update(tab.id, { url: redirectUrl });
                    });
                });
                 chrome.tabs.query({ url: `*://*.${site}/*` }, (tabs) => {
                    const blockerUrl = chrome.runtime.getURL('pages/block.html');
                    tabs.forEach(tab => {
                        const redirectUrl = `${blockerUrl}?redirect=${encodeURIComponent(tab.url)}`;
                        chrome.tabs.update(tab.id, { url: redirectUrl });
                    });
                });
            });
        }
    });
});