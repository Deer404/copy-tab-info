import iconImage from "data-base64:~assets/icon.png"
import type { PlasmoCSConfig } from "plasmo"

import { DefaultOptions } from "~constant/custom"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

function handleCommand(command: string) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      const url = new URL(tabs[0].url ?? "")
      if (url.protocol.startsWith("chrome:")) {
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
      if (command === "copy-tab-info") {
        text = `${tabInfo.title}\n${tabInfo.url}`
      } else if (command === "copy-tab-info-no-params") {
        text = `${tabInfo.title}\n${tabInfo.urlNoParams}`
      } else if (command === "copy-tab-info-markdown") {
        text = `[${tabInfo.title}](${tabInfo.url})`
      } else if (command === "copy-tab-info-custom") {
        chrome.storage.sync.get("customOptions", (result) => {
          const customOptions = result.customOptions || DefaultOptions

          const parts = []
          if (customOptions.protocol) parts.push(`${tabInfo.protocol}//`)
          if (customOptions.hostname) parts.push(tabInfo.hostname)
          if (customOptions.pathname) parts.push(tabInfo.pathname)
          if (customOptions.hash) parts.push(tabInfo.hash)
          if (customOptions.params && url.hash != "") parts.push(tabInfo.params)

          text = `${tabInfo.title}\n${parts.join("")}`

          copyTextToClipboard(tabs[0].id, text)
        })
      } else {
        return
      }

      copyTextToClipboard(tabs[0].id, text)
    }
  })
}

chrome.commands.onCommand.addListener(handleCommand)

function copyTextToClipboard(tabId: number, text: string) {
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

// 处理来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "copyCustomFormat") {
    handleCommand("copy-tab-info-custom")
    // 延迟发送响应，给予足够的时间执行复制操作
    setTimeout(() => {
      sendResponse({ success: true })
    }, 100)
    return true // 表示我们会异步发送响应
  }
})
