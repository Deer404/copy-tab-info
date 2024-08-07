import React, { useEffect, useState } from "react"

import "../css/index.css"

import { DefaultOptions, storage, STORE_KEYS } from "~constant/index"

const Options = () => {
  const [shortcuts, setShortcuts] = useState({
    "copy-tab-info": "Not set",
    "copy-tab-info-no-params": "Not set",
    "copy-tab-info-markdown": "Not set",
    "copy-tab-info-custom": "Not set"
  })

  const [customOptions, setCustomOptions] = useState(DefaultOptions)

  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState("")

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
    const result = storage.get<object>(STORE_KEYS).then((result) => {
      const res = result ?? DefaultOptions

      if (res) {
        setCustomOptions({ ...customOptions, ...res })
      }
    })
  }, [])

  const openShortcutSettings = () => {
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" })
  }

  const handleCustomOptionChange = (option) => {
    const newOptions = { ...customOptions, [option]: !customOptions[option] }
    setCustomOptions(newOptions)
    setUnsavedChanges(true)
    setSaveStatus("")
  }

  const saveCustomOptions = async () => {
    await storage.set(STORE_KEYS, customOptions)
    setUnsavedChanges(false)
    setSaveStatus("Saved successfully!")
    setTimeout(() => setSaveStatus(""), 2000)
  }

  console.log("customOptions", customOptions)

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
              {Object.entries(shortcuts).map(([key, value]) => (
                <div key={key}>
                  <p className="text-sm font-medium text-gray-500">
                    {key
                      .replace(/-/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={openShortcutSettings}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Change Shortcuts
            </button>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 bg-teal-600">
            <h2 className="text-xl font-semibold text-white">
              Custom Format Options
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              Select the elements you want to include in your custom format:
            </p>
            <div className="flex gap-4 mb-6">
              {Object.keys(customOptions).map((option) => (
                <label
                  key={option}
                  className="flex items-center bg-gray-100 p-3 rounded-lg">
                  <input
                    type="checkbox"
                    checked={customOptions[option]}
                    onChange={() => handleCustomOptionChange(option)}
                    className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-gray-700 capitalize">
                    {option}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={saveCustomOptions}
                disabled={!unsavedChanges}
                className={`${
                  unsavedChanges
                    ? "bg-teal-600 hover:bg-teal-700"
                    : "bg-gray-400 cursor-not-allowed"
                } text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}>
                {unsavedChanges ? "Save Changes" : "No Changes to Save"}
              </button>
              {saveStatus && (
                <span className="text-green-600 font-medium">{saveStatus}</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-800">
            <h2 className="text-xl font-semibold text-white">About CopyTab</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              CopyTab allows you to quickly copy your current tab's information.
              Use the keyboard shortcuts to copy the information in full URL,
              URL without parameters, Markdown format, or custom format.
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
