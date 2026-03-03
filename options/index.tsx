import React, { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import "../css/index.css"

import { Button } from "~components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~components/ui/card"
import {
  COMMANDS,
  DefaultOptions,
  NoSetText,
  STORE_KEYS,
  type OptionType
} from "~constant/index"
import { resolveCustomOptions } from "~utils/tab-format"

export default function Options() {
  const [shortcuts, setShortcuts] = useState<Record<string, string>>(
    Object.fromEntries(Object.values(COMMANDS).map((cmd) => [cmd, NoSetText]))
  )
  const [customOptions, setCustomOptions] = useStorage(
    STORE_KEYS,
    DefaultOptions
  )

  const [unsavedChanges, setUnsavedChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState("")

  useEffect(() => {
    chrome.commands.getAll((commands) => {
      const updatedShortcuts: Record<string, string> = Object.fromEntries(
        Object.values(COMMANDS).map((cmd) => [cmd, NoSetText])
      )
      commands.forEach((command) => {
        if (command.name in updatedShortcuts) {
          updatedShortcuts[command.name] = command.shortcut || NoSetText
        }
      })
      setShortcuts(updatedShortcuts)
    })
  }, [])

  const openShortcutSettings = () => {
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" })
  }

  const resolvedOptions = resolveCustomOptions(customOptions)

  const handleCustomOptionChange = (option: keyof OptionType) => {
    const newOptions = {
      ...resolvedOptions,
      [option]: !resolvedOptions[option]
    }
    setCustomOptions(newOptions)
    setUnsavedChanges(true)
    setSaveStatus("")
  }

  const saveCustomOptions = () => {
    setUnsavedChanges(false)
    setSaveStatus("Saved successfully!")
    setTimeout(() => setSaveStatus(""), 2000)
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="mb-8 text-center text-3xl font-semibold text-neutral-900">
          CopyTab Options
        </h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Keyboard Shortcuts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 space-y-4">
              {Object.entries(shortcuts).map(([key, value]) => (
                <div key={key}>
                  <p className="text-sm font-medium text-neutral-500">
                    {key
                      .replace(/-/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-neutral-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <Button onClick={openShortcutSettings} className="w-full" size="lg">
              Change Shortcuts
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Custom Format Options</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-neutral-700">
              Select the elements you want to include in your custom format:
            </p>
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Object.keys(resolvedOptions).map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    checked={resolvedOptions[option as keyof OptionType]}
                    onChange={() =>
                      handleCustomOptionChange(option as keyof OptionType)
                    }
                    className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-300"
                  />
                  <span className="capitalize">{option}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <Button
                onClick={saveCustomOptions}
                disabled={!unsavedChanges}
                variant={unsavedChanges ? "default" : "secondary"}
                className="min-w-[140px]">
                {unsavedChanges ? "Save Changes" : "No Changes to Save"}
              </Button>
              {saveStatus && (
                <span className="text-sm font-medium text-emerald-700">
                  {saveStatus}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About CopyTab</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-neutral-700">
              CopyTab allows you to quickly copy your current tab's information.
              Use the keyboard shortcuts to copy the information in full URL,
              Markdown format, or custom format.
            </p>
            <a
              href="https://github.com/Deer404/copy-tab-info"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-neutral-800 underline underline-offset-2 hover:text-neutral-600">
              View GitHub Repository
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
