// Listen for extension icon click to toggle Focus Mode
chrome.action.onClicked.addListener(() => {
  chrome.storage.local.get("focusModeEnabled", (result) => {
    const newStatus = !result.focusModeEnabled;
    chrome.storage.local.set({ focusModeEnabled: newStatus }, () => {
      updateIcon(newStatus);
    });
  });
});

// Listen for navigation events and block sites if Focus Mode is enabled
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  checkAndBlockSite(details);
});

function updateIcon(enabled) {
  const iconPaths = enabled
    ? {
      "16": "icons/icon16-off.png",
      "32": "icons/icon32-off.png",
      "48": "icons/icon48-off.png",
      "128": "icons/icon128-off.png"
    }
    : {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    };

  chrome.action.setIcon({ path: iconPaths });
}

// Check if a site should be blocked
function checkAndBlockSite(details) {
  // Ignore non-HTTP URLs or missing URLs
  if (!details.url || !details.url.startsWith("http")) return;

  try {
    const url = new URL(details.url);
    const hostname = url.hostname;

    chrome.storage.local.get(["focusModeEnabled", "blockedWebsites"], (result) => {
      if (!result.focusModeEnabled) return; // Exit if Focus Mode is off

      const blockedWebsites = result.blockedWebsites || [];

      for (const website of blockedWebsites) {
        if (website.startsWith('*.')) {
          const domainSuffix = website.substring(2);
          if (hostname === domainSuffix || hostname.endsWith('.' + domainSuffix)) {
            chrome.tabs.update(details.tabId, {
              url: chrome.runtime.getURL("html/blocked.html"),
            });
            break;
          }
        }
        else {
          const pattern = new RegExp(`^(www\\.)?${website.replace(/\./g, "\\.")}$`);
          if (pattern.test(hostname)) {
            chrome.tabs.update(details.tabId, {
              url: chrome.runtime.getURL("html/blocked.html"),
            });
            break;
          }
        }
      }
    });
  } catch (e) {
    console.error("Invalid URL encountered:", details.url, e);
  }
}

