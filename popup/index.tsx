import { useEffect, useState } from "react"

import "./style.css"

const NoSet = "Not set"
export default function Popup() {
  const [tabInfo, setTabInfo] = useState({ title: "", url: "" })
  const [copied, setCopied] = useState(false)
  const [copiedMarkdown, setCopiedMarkdown] = useState(false)
  const [shortcuts, setShortcuts] = useState({
    copy: NoSet,
    markdown: NoSet
  })

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
      const updatedShortcuts = { ...shortcuts }
      commands.forEach((command) => {
        if (command.name === "copy-tab-info") {
          updatedShortcuts.copy = command.shortcut || NoSet
        } else if (command.name === "copy-tab-info-markdown") {
          updatedShortcuts.markdown = command.shortcut || NoSet
        }
      })
      setShortcuts(updatedShortcuts)
    })
  }, [])

  const copyToClipboard = () => {
    const text = `${tabInfo.title}\n${tabInfo.url}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const copyAsMarkdown = () => {
    const markdownText = `[${tabInfo.title}](${tabInfo.url})`
    navigator.clipboard.writeText(markdownText).then(() => {
      setCopiedMarkdown(true)
      setTimeout(() => setCopiedMarkdown(false), 2000)
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
      <button
        onClick={copyToClipboard}
        className={`w-full flex justify-center items-center gap-2 ${
          copied
            ? "bg-green-500"
            : "bg-gradient-to-r from-blue-400 to-indigo-500"
        } text-white border-none py-2.5 px-4 rounded-md cursor-pointer transition-all duration-300 hover:opacity-90 mb-3 shadow-sm`}>
        <span className="font-medium">{copied ? "Copied!" : "Copy"}</span>
        {shortcuts.copy !== NoSet && (
          <span className="text-xs bg-white bg-opacity-20 px-1.5 py-0.5 rounded">
            {shortcuts.copy}
          </span>
        )}
      </button>
      <button
        onClick={copyAsMarkdown}
        className={`w-full flex justify-center items-center gap-2 ${
          copiedMarkdown
            ? "bg-green-500"
            : "bg-gradient-to-r from-purple-400 to-pink-500"
        } text-white border-none py-2.5 px-4 rounded-md cursor-pointer transition-all duration-300 hover:opacity-90 mb-3 shadow-sm`}>
        <span className="font-medium">
          {copiedMarkdown ? "Markdown Copied!" : "Copy as Markdown"}
        </span>
        {shortcuts.markdown !== NoSet && (
          <span className="text-xs bg-white bg-opacity-20 px-1.5 py-0.5 rounded">
            {shortcuts.markdown}
          </span>
        )}
      </button>
      <div className="text-center mt-2">
        <button
          onClick={openOptionsPage}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          Customize Shortcuts
        </button>
      </div>
    </div>
  )
}
