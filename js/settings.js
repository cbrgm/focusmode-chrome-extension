document.addEventListener('DOMContentLoaded', () => {
  const blockedWebsitesTextarea = document.getElementById(
    'focusmodeBlockedWebsites'
  );
  const saveButton = document.getElementById('focusmodeSaveWebsites');

  const feedbackMessage = document.createElement('p');
  feedbackMessage.style.fontSize = '14px';
  feedbackMessage.style.marginTop = '10px';
  feedbackMessage.style.display = 'none';
  saveButton.insertAdjacentElement('afterend', feedbackMessage);

  // Load stored blocked websites
  chrome.storage.local.get('blockedWebsites', (result) => {
    blockedWebsitesTextarea.value = (result.blockedWebsites || []).join('\n');
  });

  saveButton.addEventListener('click', () => {
    const rawEntries = blockedWebsitesTextarea.value
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '');

    const { validDomains, invalidEntries } = processEntries(rawEntries);

    if (invalidEntries.length) {
      showFeedbackMessage('Some entries are invalid. Please check.', 'red');
      return;
    }

    // Save cleaned domains
    chrome.storage.local.set({ blockedWebsites: validDomains }, () => {
      blockedWebsitesTextarea.value = validDomains.join('\n');
      showFeedbackMessage('Entries applied and sorted.', 'green');
    });
  });

  function processEntries(entries) {
    const validDomains = new Set();
    const invalidEntries = [];

    entries.forEach((entry) => {
      const domain = extractDomain(entry);
      domain ? validDomains.add(domain) : invalidEntries.push(entry);
    });

    return { validDomains: [...validDomains].sort(), invalidEntries };
  }

  function extractDomain(url) {
    if (url.startsWith('*.')) {
      const domain = url.substring(2);
      if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
        return url;
      }
      return null;
    }

    try {
      const formattedUrl = url.startsWith('http') ? url : 'http://' + url;
      const hostname = new URL(formattedUrl).hostname.replace(/^www\./, '');
      return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(hostname) ? hostname : null;
    } catch {
      return null;
    }
  }

  function showFeedbackMessage(message, color) {
    feedbackMessage.textContent = message;
    feedbackMessage.style.color = color;
    feedbackMessage.style.display = 'block';
  }
});
