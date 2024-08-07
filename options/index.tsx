import React, { useEffect, useState } from "react"

import "./style.css" // 假设你有一个样式文件

const Options = () => {
  const [shortcuts, setShortcuts] = useState({
    "copy-tab-info": "Not set",
    "copy-tab-info-markdown": "Not set"
  })

  useEffect(() => {
    // 获取当前的快捷键设置
    chrome.commands.getAll((commands) => {
      const updatedShortcuts = { ...shortcuts }
      commands.forEach((command) => {
        if (command.name in updatedShortcuts) {
          updatedShortcuts[command.name] = command.shortcut || "Not set"
        }
      })
      setShortcuts(updatedShortcuts)
    })
  }, [])

  const openShortcutSettings = () => {
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" })
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">CopyTab Options</h1>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-semibold mb-4">Keyboard Shortcuts</h2>
        <div className="mb-4">
          <p className="mb-2">
            <strong>Copy tab information:</strong> {shortcuts["copy-tab-info"]}
          </p>
          <p className="mb-2">
            <strong>Copy tab information as Markdown:</strong>{" "}
            {shortcuts["copy-tab-info-markdown"]}
          </p>
        </div>
        <button
          onClick={openShortcutSettings}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Change Shortcuts
        </button>
      </div>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-semibold mb-4">About</h2>
        <p>
          CopyTab allows you to quickly copy your current tab's information. Use
          the keyboard shortcuts to copy the information in plain text or
          Markdown format.
        </p>
      </div>
    </div>
  )
}

export default Options
