import type { PlasmoCSConfig } from "plasmo"

import { ACTION_TYPES, COMMANDS, DefaultOptions } from "~constant/index"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

function handleCommand(command: string) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      const url = new URL(tabs[0].url ?? "")
      if (url.protocol.startsWith("chrome")) {
        return
      }
      const tabInfo = {
        title: tabs[0].title,
        url: url.href,
        urlNoParams: `${url.origin}${url.pathname}`,
        hostname: url.hostname,
        pathname: url.pathname,
        hash: url.hash,
        params: url.search,
        protocol: url.protocol
      }

      let text = ""
      switch (command) {
        case COMMANDS.COPY_TAB_INFO:
          text = `${tabInfo.title}\n${tabInfo.url}`
          break
        case COMMANDS.COPY_TAB_INFO_NO_PARAMS:
          text = `${tabInfo.title}\n${tabInfo.urlNoParams}`
          break
        case COMMANDS.COPY_TAB_INFO_MARKDOWN:
          text = `[${tabInfo.title}](${tabInfo.url})`
          break
        case COMMANDS.COPY_TAB_INFO_CUSTOM:
          chrome.storage.sync.get("customOptions", (result) => {
            if (chrome.runtime.lastError) {
              console.error(
                "Failed to retrieve custom options: ",
                chrome.runtime.lastError
              )
              return
            }
            const customOptions = result.customOptions || DefaultOptions
            const parts = []
            if (customOptions.protocol) parts.push(`${tabInfo.protocol}//`)
            if (customOptions.hostname) parts.push(tabInfo.hostname)
            if (customOptions.pathname) parts.push(tabInfo.pathname)
            if (customOptions.hash) parts.push(tabInfo.hash)
            if (customOptions.params && tabInfo.hash !== "")
              parts.push(tabInfo.params)

            text = `${tabInfo.title}\n${parts.join("")}`
            copyTextToClipboard(tabs[0].id, text)
          })
          return // Exit early since this is asynchronous
        default:
          return
      }
      copyTextToClipboard(tabs[0].id, text)
    }
  })
}

chrome.commands.onCommand.addListener(handleCommand)

function copyTextToClipboard(tabId: number, text: string) {
  if (!text) {
    return
  }
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      func: (copyText) => {
        const textArea = document.createElement("textarea")
        textArea.value = copyText
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
      },
      args: [text]
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error(
          "Script execution failed: " + chrome.runtime.lastError.message
        )
      }
    }
  )
}

// Handle messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === ACTION_TYPES.COPY_TAB_CUSTOM) {
    handleCommand(COMMANDS.COPY_TAB_INFO_CUSTOM)
    setTimeout(() => {
      sendResponse({ success: true })
    }, 100)
    return true // Indicates that we will send a response asynchronously
  }
})
