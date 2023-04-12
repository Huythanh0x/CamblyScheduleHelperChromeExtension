chrome.runtime.onInstalled.addListener(function () {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon192x192.png",
    title: "From huythanh0x with love",
    message: "xxxx yyyy zzz ooo uuu iii ",
  });
});

chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
  if (message.message === "navigate_to_dashboard") {
    let loginUrl = "https://www.cambly.com/student/login?lang=en";

    chrome.tabs.create({ url: loginUrl });
  } else if (message.message == "navigate_to_favourite_tutor") {
    let tutorUrl = message.tutorUrl;
    chrome.tabs.create({ url: tutorUrl });
  }
});