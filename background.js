// Initialize default settings on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['blockedSites', 'timerDuration'], (result) => {
    const defaults = {
      blockedSites: !result.blockedSites ? ['youtube.com', 'x.com', 'linkedin.com'] : result.blockedSites,
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

    const url = new URL(details.url);
    
    // Don't block our own extension pages
    if (url.protocol === 'chrome-extension:') {
      return;
    }

    chrome.storage.local.get(['blockedSites', 'unlockedSites'], (result) => {
      const blockedSites = result.blockedSites || [];
      const unlockedSites = result.unlockedSites || {};

      const matchedSite = blockedSites.find(site => url.hostname.includes(site));

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

        chrome.storage.local.get('unlockedSites', (result) => {
            const unlockedSites = result.unlockedSites || {};
            const unlockedUntil = new Date().getTime() + durationMinutes * 60 * 1000;
            unlockedSites[site] = { unlockedUntil };
            
            chrome.storage.local.set({ unlockedSites }, () => {
                // Redirect the tab to the original URL
                chrome.tabs.update(tabId, { url: redirectUrl });
            });
        });
    } else if (message.action === 'reblockSite') {
        // This message comes from the timer when it expires
        const tab = sender.tab;
        if (tab) {
             const blockerUrl = chrome.runtime.getURL('pages/block.html');
             const redirectUrl = `${blockerUrl}?redirect=${encodeURIComponent(tab.url)}`;
             chrome.tabs.update(tab.id, { url: redirectUrl });
        }
    }
});
