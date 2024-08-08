import type { PlasmoCSConfig } from "plasmo"

import {
  ACTION_TYPES,
  COMMANDS,
  DefaultOptions,
  storage,
  STORE_KEYS,
  type OptionType
} from "~constant/index"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

function handleCommand(command: string) {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
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
          const options = await storage.get<OptionType>(STORE_KEYS)
          let result = []
          if (options.protocol) result.push(`${tabInfo.protocol}//`)
          if (options.hostname) result.push(tabInfo.hostname)
          if (options.pathname) result.push(tabInfo.pathname)
          if (options.hash) result.push(tabInfo.hash)
          if (options.params && tabInfo.hash !== "") result.push(tabInfo.params)
          if (options.title) text = `${tabInfo.title}\n${result.join("")}`
          else text = `${result.join("")}`
          copyTextToClipboard(tabs[0].id, text)
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
