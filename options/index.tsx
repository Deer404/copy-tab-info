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
import { cn } from "~utils/cn"
import { resolveCustomOptions } from "~utils/tab-format"

const optionLabels: Record<keyof OptionType, string> = {
  title: "Title",
  hostname: "Domain",
  pathname: "Path",
  hash: "Hash",
  params: "Query",
  protocol: "Protocol"
}

const commandLabels: Record<string, string> = {
  [COMMANDS.COPY_TAB_INFO]: "Copy Full URL",
  [COMMANDS.COPY_TAB_INFO_MARKDOWN]: "Copy Markdown Link",
  [COMMANDS.COPY_TAB_INFO_CUSTOM]: "Copy Custom Format"
}

const commandDescriptions: Record<string, string> = {
  [COMMANDS.COPY_TAB_INFO]: "Title + full URL",
  [COMMANDS.COPY_TAB_INFO_MARKDOWN]: "[Title](URL)",
  [COMMANDS.COPY_TAB_INFO_CUSTOM]: "Use selected fields below"
}

function formatCommandLabel(key: string) {
  return (
    commandLabels[key] ||
    key.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
  )
}

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
  const selectedOptionCount =
    Object.values(resolvedOptions).filter(Boolean).length

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
    <div className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            CopyTab Options
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Customize shortcuts and your copy format.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Keyboard Shortcuts</CardTitle>
              <span className="text-xs text-muted-foreground">
                {selectedOptionCount}/6 fields enabled
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              These shortcuts trigger instant copy actions from any tab.
            </p>
          </CardHeader>
          <CardContent>
            <div className="mb-6 space-y-3">
              {Object.entries(shortcuts).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold">
                      {formatCommandLabel(key)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {commandDescriptions[key] || "Custom command"}
                    </p>
                  </div>
                  <span className="rounded border bg-muted px-2 py-1 font-mono text-xs font-medium text-foreground">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <Button onClick={openShortcutSettings} className="w-full" size="lg">
              Change Shortcuts
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Custom Format Options</CardTitle>
              <span className="text-xs text-muted-foreground">
                Flexible output
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Select the elements you want in your custom copied text.
            </p>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Object.keys(resolvedOptions).map((option) => (
                <label
                  key={option}
                  className={cn(
                    "flex cursor-pointer select-none items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                    resolvedOptions[option as keyof OptionType]
                      ? "border-primary bg-accent text-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-accent"
                  )}>
                  <input
                    type="checkbox"
                    checked={resolvedOptions[option as keyof OptionType]}
                    onChange={() =>
                      handleCustomOptionChange(option as keyof OptionType)
                    }
                    className="h-4 w-4 rounded border-input accent-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  />
                  <span>{optionLabels[option as keyof OptionType]}</span>
                </label>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                onClick={saveCustomOptions}
                disabled={!unsavedChanges}
                variant={unsavedChanges ? "default" : "secondary"}
                className="min-w-[140px]">
                {unsavedChanges ? "Save Changes" : "All Changes Saved"}
              </Button>
              <span
                className={cn(
                  "text-sm font-medium",
                  saveStatus ? "text-emerald-600" : "text-muted-foreground"
                )}>
                {saveStatus ||
                  (unsavedChanges
                    ? "You have unsaved updates."
                    : "Settings are synced locally.")}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About CopyTab</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              CopyTab allows you to quickly copy your current tab's information.
              Use the keyboard shortcuts to copy the information in full URL,
              Markdown format, or custom format.
            </p>
            <a
              href="https://github.com/Deer404/copy-tab-info"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium underline underline-offset-2 hover:text-foreground">
              View GitHub Repository
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
