const DEFAULT_LIMIT = 10;

async function checkTabCount() {
  const data = await chrome.storage.local.get(['maxTabs']);
  const maxTabs = data.maxTabs || DEFAULT_LIMIT;
  const tabs = await chrome.tabs.query({});

  if (tabs.length >= maxTabs) {
    chrome.action.setBadgeText({ text: "MAX" });
    chrome.action.setBadgeBackgroundColor({ color: "#FF0000" }); // Red when at or over limit
  } else {
    chrome.action.setBadgeText({ text: tabs.length.toString() });
    chrome.action.setBadgeBackgroundColor({ color: "#4688F1" }); // Blue otherwise
  }
}

// Check when a new tab is created
chrome.tabs.onCreated.addListener(async (tab) => {
  const data = await chrome.storage.local.get(['maxTabs']);
  const maxTabs = data.maxTabs || DEFAULT_LIMIT;
  const tabs = await chrome.tabs.query({});

  // If we have more tabs than the limit, remove the newly created one
  if (tabs.length > maxTabs) {
    chrome.tabs.remove(tab.id);
  }
  
  checkTabCount();
});

// Update badge when a tab is closed
chrome.tabs.onRemoved.addListener(() => {
  checkTabCount();
});

// Listen for updates from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateBadge") {
    checkTabCount();
  }
});

// Initial check when the extension loads
checkTabCount();