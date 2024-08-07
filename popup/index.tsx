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
        className={`w-full flex flex-row justify-center items-center gap-2 ${
          copied
            ? "bg-green-500"
            : "bg-gradient-to-r from-blue-500 to-purple-600"
        } text-white border-none py-2 px-3 rounded cursor-pointer transition-all duration-300 hover:opacity-90 mb-2`}>
        <span className="block">{copied ? "Copied!" : "Copy"}</span>
        <span className="text-xs block opacity-80">{shortcuts.copy}</span>
      </button>
      <button
        onClick={copyAsMarkdown}
        className={`w-full flex flex-row justify-center items-center gap-2 ${
          copiedMarkdown
            ? "bg-green-500"
            : "bg-gradient-to-r from-purple-500 to-indigo-600"
        } text-white border-none py-2 px-3 rounded cursor-pointer transition-all duration-300 hover:opacity-90 mb-2`}>
        <span className="block">
          {copiedMarkdown ? "Markdown Copied!" : "Copy as Markdown"}
        </span>
        <span className="text-xs block opacity-80">
          {shortcuts.markdown !== NoSet && shortcuts.markdown}
        </span>
      </button>
      <div className="text-center mt-4">
        <button
          onClick={openOptionsPage}
          className="text-blue-600 hover:text-blue-800 underline cursor-pointer">
          Customize Shortcuts
        </button>
      </div>
    </div>
  )
}
