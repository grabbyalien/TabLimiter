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
    
    // Show a message on the active tab
    const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTabs.length > 0) {
      chrome.scripting.executeScript({
        target: { tabId: activeTabs[0].id },
        func: () => {
          // Create the toast element
          const toast = document.createElement('div');
          toast.textContent = "Maximum tab limit reached!";
          
          // Style the toast
          toast.style.position = 'fixed';
          toast.style.top = '20px';
          toast.style.left = '50%';
          toast.style.transform = 'translateX(-50%)';
          toast.style.backgroundColor = '#ff4444';
          toast.style.color = 'white';
          toast.style.padding = '12px 24px';
          toast.style.borderRadius = '8px';
          toast.style.zIndex = '2147483647'; // Max z-index
          toast.style.fontFamily = 'system-ui, -apple-system, sans-serif';
          toast.style.fontSize = '16px';
          toast.style.fontWeight = '500';
          toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          toast.style.transition = 'opacity 0.3s ease-in-out';
          toast.style.pointerEvents = 'none'; // Don't block clicks
          
          document.body.appendChild(toast);
          
          // Fade out and remove after 3 seconds
          setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
          }, 3000);
        }
      }).catch(err => console.log("Could not inject script (likely a restricted page):", err));
    }
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