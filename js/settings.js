document.addEventListener("DOMContentLoaded", function() {
  const blockedWebsitesTextarea = document.getElementById("focusmodeBlockedWebsites");
  const saveButton = document.getElementById("focusmodeSaveWebsites");

  chrome.storage.local.get(["blockedWebsites"], function(result) {
    const blockedWebsites = result.blockedWebsites || [];
    blockedWebsitesTextarea.value = blockedWebsites.join("\n");
  });

  saveButton.addEventListener("click", function() {
    const blockedWebsites = blockedWebsitesTextarea.value
      .split("\n")
      .map(website => website.trim())
      .filter(website => website !== "");

    chrome.storage.local.set({ blockedWebsites }, function() {
      alert("Blocked websites saved!");
    });
  });
});

