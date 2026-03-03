import React, { useEffect, useState } from "react"

import "../css/index.css"

import { useStorage } from "@plasmohq/storage/hook"

import { Button } from "~components/ui/button"
import { Card, CardContent } from "~components/ui/card"
import { Tabs } from "~components/ui/tabs"
import {
  COMMANDS,
  DefaultOptions,
  NoSetText,
  STORE_KEYS,
  type OptionType
} from "~constant"
import {
  formatCustomTabInfo,
  formatFullTabInfo,
  formatMarkdownTabInfo,
  getTabInfoFromTab,
  resolveCustomOptions,
  type TabInfo
} from "~utils/tab-format"

const renderCommands = [COMMANDS.COPY_TAB_INFO, COMMANDS.COPY_TAB_INFO_MARKDOWN]

const EMPTY_TAB_INFO: TabInfo = {
  title: "",
  url: "",
  urlNoParams: "",
  protocol: "",
  hash: "",
  hostname: "",
  pathname: "",
  params: ""
}

const tabItems: Array<{ key: "full" | "custom"; label: string }> = [
  { key: "full", label: "Full URL" },
  { key: "custom", label: "Custom" }
]

const commandLabels = {
  [COMMANDS.COPY_TAB_INFO]: "Full URL",
  [COMMANDS.COPY_TAB_INFO_MARKDOWN]: "Markdown",
  [COMMANDS.COPY_TAB_INFO_CUSTOM]: "Copy Custom"
}

const commandVariants = {
  [COMMANDS.COPY_TAB_INFO]: "default",
  [COMMANDS.COPY_TAB_INFO_MARKDOWN]: "secondary",
  [COMMANDS.COPY_TAB_INFO_CUSTOM]: "default"
} as const

export default function Popup() {
  const [tabInfo, setTabInfo] = useState<TabInfo>(EMPTY_TAB_INFO)

  const [customOptions, setCustomOptions] = useStorage(
    STORE_KEYS,
    DefaultOptions
  )

  const [copied, setCopied] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.values(COMMANDS).map((cmd) => [cmd, false]))
  )

  const [shortcuts, setShortcuts] = useState<Record<string, string>>(
    Object.fromEntries(Object.values(COMMANDS).map((cmd) => [cmd, NoSetText]))
  )

  const [activeTab, setActiveTab] = useState<"full" | "custom">("full")
  const hasTabUrl = tabInfo.url.trim().length > 0

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      const info = getTabInfoFromTab(tab)
      if (info) {
        setTabInfo(info)
      }
    })

    chrome.commands.getAll((commands) => {
      const updatedShortcuts = Object.fromEntries(
        commands.map((cmd) => [cmd.name, cmd.shortcut || NoSetText])
      )
      setShortcuts(updatedShortcuts)
    })
  }, [])

  const copyToClipboard = (command: string) => {
    if (!hasTabUrl) {
      return
    }

    const texts = {
      [COMMANDS.COPY_TAB_INFO]: formatFullTabInfo(tabInfo),
      [COMMANDS.COPY_TAB_INFO_MARKDOWN]: formatMarkdownTabInfo(tabInfo),
      [COMMANDS.COPY_TAB_INFO_CUSTOM]: formatCustomTabInfo(tabInfo, customOptions)
    }

    navigator.clipboard
      .writeText(texts[command] || "")
      .then(() => updateCopiedState(command))
      .catch((err) => console.error("Failed to copy to clipboard:", err))
  }

  const updateCopiedState = (command: string) => {
    setCopied((prev) => ({ ...prev, [command]: true }))
    setTimeout(() => setCopied((prev) => ({ ...prev, [command]: false })), 2000)
  }

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage()
  }

  const handleCustomOptionChange = (key: keyof OptionType, value: boolean) => {
    setCustomOptions((prev) => ({ ...resolveCustomOptions(prev), [key]: value }))
    setActiveTab("custom")
  }

  const resolvedOptions = resolveCustomOptions(customOptions)
  const customPreviewText = formatCustomTabInfo(tabInfo, resolvedOptions, false)

  return (
    <div className="w-[300px] bg-neutral-50 p-4 text-neutral-900">
      <h2 className="mb-3 text-center text-lg font-semibold">CopyTab</h2>
      <Card className="mb-3">
        <CardContent className="space-y-3">
          <Tabs
            tabs={tabItems}
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as "full" | "custom")}
          />
          {activeTab === "full" ? (
            <>
              <p className="break-words text-sm font-semibold text-neutral-900">
                {tabInfo.title}
              </p>
              <p className="break-all text-xs text-neutral-600">{tabInfo.url}</p>
            </>
          ) : (
            <>
              <p className="break-words text-sm font-semibold text-neutral-900">
                {resolvedOptions.title ? tabInfo.title : ""}
              </p>
              <p className="break-all text-xs text-neutral-600">
                {customPreviewText}
              </p>
            </>
          )}
        </CardContent>
      </Card>
      <div className="mb-3 grid grid-cols-1 gap-2">
        {renderCommands.map((command) => (
          <CopyButton
            key={command}
            onClick={() => copyToClipboard(command)}
            copied={copied[command]}
            shortcut={shortcuts[command]}
            label={commandLabels[command] ?? "Copy"}
            variant={commandVariants[command] ?? "default"}
            disabled={!hasTabUrl}
          />
        ))}
      </div>
      {!hasTabUrl && (
        <p className="mb-3 text-center text-xs text-neutral-500">
          Open a valid tab URL to enable copying.
        </p>
      )}
      <CustomCopySection
        options={resolvedOptions}
        onChange={handleCustomOptionChange}
        onCopy={() => copyToClipboard(COMMANDS.COPY_TAB_INFO_CUSTOM)}
        copied={copied[COMMANDS.COPY_TAB_INFO_CUSTOM]}
        shortcut={shortcuts[COMMANDS.COPY_TAB_INFO_CUSTOM]}
        onPreviewUpdate={() => setActiveTab("custom")}
        disabled={!hasTabUrl}
      />
      <div className="mt-3 text-center">
        <Button
          onClick={openOptionsPage}
          variant="ghost"
          className="text-sm">
          Customize Options
        </Button>
      </div>
    </div>
  )
}

interface CopyButtonProps {
  onClick: () => void
  copied: boolean
  shortcut: string
  label: string
  variant: "default" | "secondary" | "outline" | "ghost"
  disabled: boolean
}

function CopyButton({
  onClick,
  copied,
  shortcut,
  label,
  variant,
  disabled = false
}: CopyButtonProps) {
  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      variant={copied ? "secondary" : variant}
      className="h-auto w-full flex-col gap-1 py-2">
      <span className="text-sm font-medium">{copied ? "Copied!" : label}</span>
      {shortcut !== NoSetText && (
        <span className="rounded border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600">
          {shortcut}
        </span>
      )}
    </Button>
  )
}

interface CustomCopySectionProps {
  options: OptionType
  onChange: (key: keyof OptionType, value: boolean) => void
  onCopy: () => void
  copied: boolean
  shortcut: string
  onPreviewUpdate: () => void
  disabled: boolean
}

function CustomCopySection({
  options,
  onChange,
  onCopy,
  copied,
  shortcut,
  onPreviewUpdate,
  disabled
}: CustomCopySectionProps) {
  return (
    <Card className="mb-3">
      <CardContent className="space-y-3">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-neutral-800">
            Custom Copy Options
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {Object.entries(options).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => {
                    onChange(key as keyof OptionType, !value)
                    onPreviewUpdate()
                  }}
                  className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-300"
                />
                <span>{key}</span>
              </label>
            ))}
          </div>
        </div>
      </CardContent>
      <div className="p-4 pt-0">
        <CopyButton
          onClick={onCopy}
          copied={copied}
          shortcut={shortcut}
          label="Copy Custom"
          variant="default"
          disabled={disabled}
        />
      </div>
    </Card>
  )
}
