document.addEventListener('DOMContentLoaded', () => {
  const limitInput = document.getElementById('limit');
  const saveButton = document.getElementById('save');
  const statusDiv = document.getElementById('status');

  // Load the current limit from storage
  chrome.storage.local.get(['maxTabs'], (result) => {
    limitInput.value = result.maxTabs || 10;
  });

  // Save the new limit to storage
  saveButton.addEventListener('click', () => {
    const newLimit = parseInt(limitInput.value, 10);
    
    if (newLimit > 0) {
      chrome.storage.local.set({ maxTabs: newLimit }, () => {
        // Show success message
        statusDiv.textContent = 'Saved successfully!';
        statusDiv.style.color = '#28a745';
        
        setTimeout(() => { 
          statusDiv.textContent = ''; 
        }, 2000);
        
        // Tell the background script to update the badge
        chrome.runtime.sendMessage({ action: "updateBadge" });
      });
    } else {
      statusDiv.textContent = 'Please enter a valid number (1 or more).';
      statusDiv.style.color = '#dc3545';
    }
  });
});