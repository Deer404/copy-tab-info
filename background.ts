import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      const tabInfo = {
        title: tabs[0].title,
        url: new URL(tabs[0].url ?? "").href
      }

      let text: string

      if (command === "copy-tab-info") {
        text = `${tabInfo.title}\n${tabInfo.url}`
      } else if (command === "copy-tab-info-markdown") {
        text = `[${tabInfo.title}](${tabInfo.url})`
      } else {
        return // 如果不是我们定义的命令，直接返回
      }

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
})
