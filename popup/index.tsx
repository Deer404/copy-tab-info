import { useEffect, useState } from "react"

import "./style.css"

export default function Popup() {
  const [tabInfo, setTabInfo] = useState({ title: "", url: "" })
  const [shortcut, setShortcut] = useState("")

  useEffect(() => {
    // 获取当前标签信息
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        setTabInfo({
          title: tabs[0].title,
          url: tabs[0].url // 使用完整的 URL
        })
      }
    })

    // 获取当前快捷键设置
    chrome.commands.getAll((commands) => {
      const copyCommand = commands.find(
        (command) => command.name === "copy-tab-info"
      )
      if (copyCommand && copyCommand.shortcut) {
        setShortcut(copyCommand.shortcut)
      } else {
        setShortcut("Not set")
      }
    })
  }, [])

  const copyToClipboard = () => {
    const text = `${tabInfo.title}\n${tabInfo.url}`
    navigator.clipboard.writeText(text)
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
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none py-2 px-3 rounded cursor-pointer transition-opacity duration-300 hover:opacity-90 mb-2">
        Copy
      </button>
      <p className="text-sm text-gray-600 text-center">
        Shortcut: <span className="font-semibold">{shortcut}</span>
      </p>
    </div>
  )
}
