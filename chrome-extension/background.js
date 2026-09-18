chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "send-to-docvoice",
    title: "Send to DocVoice",
    contexts: ["selection"]
  });
  chrome.contextMenus.create({
    id: "listen-with-docvoice",
    title: "Listen with DocVoice",
    contexts: ["selection"]
  });
});
