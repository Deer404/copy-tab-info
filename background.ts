import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

chrome.commands.onCommand.addListener((command) => {
  if (command === "copy-tab-info") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        const tabInfo = {
          title: tabs[0].title,
          url: new URL(tabs[0].url ?? "").href
        }
        const text = `${tabInfo.title}\n${tabInfo.url}`

        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: (copyText) => {
            navigator.clipboard
              .writeText(copyText)
              .then(() => console.log("Text copied to clipboard"))
              .catch((err) => console.error("Failed to copy text: ", err))
          },
          args: [text]
        })
      }
    })
  }
})
