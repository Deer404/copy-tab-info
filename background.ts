import type { PlasmoCSConfig } from "plasmo"

import {
  COMMANDS,
  storage,
  STORE_KEYS,
  type OptionType
} from "~constant/index"
import {
  formatCustomTabInfo,
  formatFullTabInfo,
  formatMarkdownTabInfo,
  getTabInfoFromTab
} from "~utils/tab-format"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

function handleCommand(command: string) {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tab = tabs[0]
    const tabInfo = getTabInfoFromTab(tab)

    if (tab?.id == null || !tabInfo || tabInfo.protocol.startsWith("chrome")) {
      return
    }

    let text = ""
    switch (command) {
      case COMMANDS.COPY_TAB_INFO:
        text = formatFullTabInfo(tabInfo)
        break
      case COMMANDS.COPY_TAB_INFO_MARKDOWN:
        text = formatMarkdownTabInfo(tabInfo)
        break
      case COMMANDS.COPY_TAB_INFO_CUSTOM:
        text = formatCustomTabInfo(
          tabInfo,
          await storage.get<Partial<OptionType>>(STORE_KEYS)
        )
        break
      default:
        return
    }

    copyTextToClipboard(tab.id, text)
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
