import { useEffect, useState } from "react"

import "../css/index.css"

const NoSet = "Not set"

export default function Popup() {
  const [tabInfo, setTabInfo] = useState({
    title: "",
    url: "",
    urlNoParams: "",
    protocol: ""
  })
  const [copied, setCopied] = useState({
    full: false,
    noParams: false,
    markdown: false,
    custom: false
  })
  const [shortcuts, setShortcuts] = useState({
    copy: NoSet,
    copyNoParams: NoSet,
    markdown: NoSet,
    custom: NoSet
  })

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        const url = new URL(tabs[0].url)
        setTabInfo({
          title: tabs[0].title,
          url: url.href,
          urlNoParams: `${url.origin}${url.pathname}`,
          protocol: url.protocol
        })
      }
    })

    chrome.commands.getAll((commands) => {
      const updatedShortcuts = { ...shortcuts }
      commands.forEach((command) => {
        if (command.name === "copy-tab-info")
          updatedShortcuts.copy = command.shortcut || NoSet
        else if (command.name === "copy-tab-info-no-params")
          updatedShortcuts.copyNoParams = command.shortcut || NoSet
        else if (command.name === "copy-tab-info-markdown")
          updatedShortcuts.markdown = command.shortcut || NoSet
        else if (command.name === "copy-tab-info-custom")
          updatedShortcuts.custom = command.shortcut || NoSet
      })
      setShortcuts(updatedShortcuts)
    })
  }, [])

  const copyToClipboard = (type) => {
    let text = ""
    if (type === "full") text = `${tabInfo.title}\n${tabInfo.url}`
    else if (type === "noParams")
      text = `${tabInfo.title}\n${tabInfo.urlNoParams}`
    else if (type === "markdown") text = `[${tabInfo.title}](${tabInfo.url})`
    else if (type === "custom") {
      if (tabInfo.protocol.startsWith("chrome")) return
      chrome.runtime.sendMessage({ action: "copyCustomFormat" }, (response) => {
        if (response && response.success) {
          setCopied({ ...copied, custom: true })
          setTimeout(
            () => setCopied((prev) => ({ ...prev, custom: false })),
            2000
          )
        } else {
          console.error("Failed to copy custom format:", response?.error)
        }
      })
      return
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied({ ...copied, [type]: true })
        setTimeout(
          () => setCopied((prev) => ({ ...prev, [type]: false })),
          2000
        )
      })
      .catch((err) => {
        console.error("Failed to copy to clipboard:", err)
      })
  }

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage()
  }

  return (
    <div className="w-[300px] p-4 font-sans bg-gradient-to-br from-[#e0eafc] to-[#cfdef3] rounded-lg shadow-lg">
      <h2 className="text-center text-xl font-bold text-gray-800 mb-4">
        CopyTab
      </h2>
      <div className="bg-white bg-opacity-90 p-3 rounded-md shadow-sm mb-4">
        <p className="font-bold text-gray-800 mb-1 break-words">
          {tabInfo.title}
        </p>
        <p className="text-gray-600 text-sm break-all">{tabInfo.url}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <CopyButton
          onClick={() => copyToClipboard("full")}
          copied={copied.full}
          shortcut={shortcuts.copy}
          label="Full URL"
          color="from-blue-400 to-indigo-500"
        />
        <CopyButton
          onClick={() => copyToClipboard("noParams")}
          copied={copied.noParams}
          shortcut={shortcuts.copyNoParams}
          label="No Params"
          color="from-purple-400 to-pink-500"
        />
        <CopyButton
          onClick={() => copyToClipboard("markdown")}
          copied={copied.markdown}
          shortcut={shortcuts.markdown}
          label="Markdown"
          color="from-yellow-400 to-orange-500"
        />
        <CopyButton
          disabled={tabInfo.protocol.startsWith("chrome:")}
          onClick={() => copyToClipboard("custom")}
          copied={copied.custom}
          shortcut={shortcuts.custom}
          label="Custom"
          color="from-teal-400 to-cyan-500"
        />
      </div>
      <div className="text-center mt-2">
        <button
          onClick={openOptionsPage}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          Customize Options
        </button>
      </div>
    </div>
  )
}

function CopyButton({
  onClick,
  copied,
  shortcut,
  label,
  color,
  disabled = false
}) {
  const buttonClass = `flex flex-col justify-center items-center p-2 ${
    copied ? "bg-green-500" : `bg-gradient-to-r ${color}`
  } text-white rounded-md transition-all duration-300 hover:opacity-90`
  const diasbledClass =
    "flex flex-col justify-center items-center p-2 cursor-not-allowed bg-gray-400 rounded-md p-2 text-white"
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={disabled ? diasbledClass : buttonClass}>
      <span className="font-medium text-sm">{copied ? "Copied!" : label}</span>
      {shortcut !== NoSet && (
        <span className="text-xs bg-white bg-opacity-20 px-1.5 py-0.5 rounded mt-1">
          {shortcut}
        </span>
      )}
    </button>
  )
}
