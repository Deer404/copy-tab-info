import React, { useEffect, useState } from "react"

import "./style.css"

const Options = () => {
  const [shortcuts, setShortcuts] = useState({
    "copy-tab-info": "Not set",
    "copy-tab-info-markdown": "Not set"
  })

  useEffect(() => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-8">
          CopyTab Options
        </h1>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 bg-indigo-600">
            <h2 className="text-xl font-semibold text-white">
              Keyboard Shortcuts
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Copy tab information
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {shortcuts["copy-tab-info"]}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Copy tab information as Markdown
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {shortcuts["copy-tab-info-markdown"]}
                </p>
              </div>
            </div>
            <button
              onClick={openShortcutSettings}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Change Shortcuts
            </button>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-800">
            <h2 className="text-xl font-semibold text-white">About CopyTab</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              CopyTab allows you to quickly copy your current tab's information.
              Use the keyboard shortcuts to copy the information in plain text
              or Markdown format.
            </p>
            <a
              href="https://github.com/Deer404/copy-tab-info"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 font-medium">
              View GitHub Repository
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Options
