import { useEffect, useState } from "react"

import "./style.css"

const NotSet = "Not set"

export default function Popup() {
  const [tabInfo, setTabInfo] = useState({ title: "", url: "" })
  const [shortcut, setShortcut] = useState(NotSet)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        setTabInfo({
          title: tabs[0].title,
          url: tabs[0].url
        })
      }
    })

    chrome.commands.getAll((commands) => {
      const copyCommand = commands.find(
        (command) => command.name === "copy-tab-info"
      )
      if (copyCommand && copyCommand.shortcut) {
        setShortcut(copyCommand.shortcut)
      } else {
        setShortcut(NotSet)
      }
    })
  }, [])

  const copyToClipboard = () => {
    const text = `${tabInfo.title}\n${tabInfo.url}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // Reset after 2 seconds
    })
  }

  const openShortcutSettings = () => {
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" })
  }

  return (
    <div className="w-[300px] p-4 font-sans bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] rounded-lg shadow-md">
      <h2 className="text-center text-lg font-bold text-gray-800 mb-4">
        CopyTab
      </h2>
      <div className="bg-white bg-opacity-80 p-3 rounded mb-3">
        <p className="font-bold text-gray-800 mb-1 break-words">
          {tabInfo.title}
        </p>
        <p className="text-gray-600 break-all">{tabInfo.url}</p>
      </div>
      <button
        onClick={copyToClipboard}
        className={`w-full ${
          copied
            ? "bg-green-500"
            : "bg-gradient-to-r from-blue-500 to-purple-600"
        } text-white border-none py-2 px-3 rounded cursor-pointer transition-all duration-300 hover:opacity-90 mb-2`}>
        {copied ? "Copied!" : "Copy"}
      </button>
      <div className="text-sm text-gray-600 text-center">
        Shortcut: <span className="font-semibold">{shortcut}</span>
        {shortcut === NotSet && (
          <button
            onClick={openShortcutSettings}
            className="ml-2 text-blue-500 underline cursor-pointer">
            Set shortcut
          </button>
        )}
      </div>
    </div>
  )
}
