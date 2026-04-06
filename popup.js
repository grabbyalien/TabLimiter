document.addEventListener('DOMContentLoaded', () => {
  const limitInput = document.getElementById('limit');
  const saveButton = document.getElementById('save');
  const lockDurationSelect = document.getElementById('lockDuration');
  const lockButton = document.getElementById('lock');
  const statusDiv = document.getElementById('status');

  function updateUIState(isLocked, lockUntil) {
    if (isLocked) {
      limitInput.disabled = true;
      saveButton.disabled = true;
      lockDurationSelect.disabled = true;
      lockButton.disabled = true;
      
      saveButton.style.opacity = '0.5';
      lockButton.style.opacity = '0.5';
      
      const untilDate = new Date(lockUntil);
      statusDiv.textContent = `Locked until ${untilDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
      statusDiv.style.color = '#ff4444';
    } else {
      limitInput.disabled = false;
      saveButton.disabled = false;
      lockDurationSelect.disabled = false;
      lockButton.disabled = false;
      
      saveButton.style.opacity = '1';
      lockButton.style.opacity = '1';
      
      statusDiv.textContent = '';
    }
  }

  // Load the current limit and lock state from storage
  chrome.storage.local.get(['maxTabs', 'lockUntil'], (result) => {
    limitInput.value = result.maxTabs || 10;
    
    const now = Date.now();
    if (result.lockUntil && result.lockUntil > now) {
      updateUIState(true, result.lockUntil);
    } else if (result.lockUntil && result.lockUntil <= now) {
      // Lock expired, clear it
      chrome.storage.local.remove('lockUntil');
      updateUIState(false);
    } else {
      updateUIState(false);
    }
  });

  // Save the new limit to storage
  saveButton.addEventListener('click', () => {
    chrome.storage.local.get(['lockUntil'], (result) => {
      if (result.lockUntil && result.lockUntil > Date.now()) {
        statusDiv.textContent = 'Limit is currently locked!';
        statusDiv.style.color = '#dc3545';
        return;
      }
      
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

  // Lock the limit
  lockButton.addEventListener('click', () => {
    chrome.storage.local.get(['lockUntil'], (result) => {
      if (result.lockUntil && result.lockUntil > Date.now()) {
        statusDiv.textContent = 'Limit is already locked!';
        statusDiv.style.color = '#dc3545';
        return;
      }

      const newLimit = parseInt(limitInput.value, 10);
      const hours = parseInt(lockDurationSelect.value, 10);
      
      if (newLimit > 0) {
        const lockUntil = Date.now() + (hours * 60 * 60 * 1000);
        
        chrome.storage.local.set({ 
          maxTabs: newLimit,
          lockUntil: lockUntil
        }, () => {
          updateUIState(true, lockUntil);
          chrome.runtime.sendMessage({ action: "updateBadge" });
        });
      } else {
        statusDiv.textContent = 'Please enter a valid number (1 or more).';
        statusDiv.style.color = '#dc3545';
      }
    });
  });
});