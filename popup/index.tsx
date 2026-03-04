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

const optionLabels: Record<keyof OptionType, string> = {
  title: "Title",
  hostname: "Domain",
  pathname: "Path",
  hash: "Hash",
  params: "Query",
  protocol: "Protocol"
}

const compactOptionOrder: Array<keyof OptionType> = [
  "title",
  "protocol",
  "hostname",
  "pathname",
  "params",
  "hash"
]

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
      [COMMANDS.COPY_TAB_INFO_CUSTOM]: formatCustomTabInfo(
        tabInfo,
        customOptions
      )
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
    setCustomOptions((prev) => ({
      ...resolveCustomOptions(prev),
      [key]: value
    }))
    setActiveTab("custom")
  }

  const resolvedOptions = resolveCustomOptions(customOptions)
  const customPreviewText = formatCustomTabInfo(tabInfo, resolvedOptions, false)

  return (
    <div className="w-[340px] p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold leading-none tracking-tight">
            CopyTab
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Copy current tab quickly
          </p>
        </div>
        <Button
          onClick={openOptionsPage}
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs">
          Options
        </Button>
      </div>

      <Card className="mb-2">
        <CardContent className="space-y-2 p-3 pt-3">
          <Tabs
            tabs={tabItems}
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as "full" | "custom")}
          />
          {activeTab === "full" ? (
            <section
              role="tabpanel"
              id="tab-panel-full"
              aria-labelledby="tab-full"
              className="space-y-2">
              <p className="line-clamp-2 break-words text-sm font-semibold leading-snug">
                {tabInfo.title}
              </p>
              <p className="line-clamp-2 break-all rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                {tabInfo.url}
              </p>
            </section>
          ) : (
            <section
              role="tabpanel"
              id="tab-panel-custom"
              aria-labelledby="tab-custom"
              className="space-y-2">
              <p className="line-clamp-2 break-words text-sm font-semibold leading-snug">
                {resolvedOptions.title ? tabInfo.title : ""}
              </p>
              <p className="line-clamp-2 break-all rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                {customPreviewText}
              </p>
            </section>
          )}
        </CardContent>
      </Card>
      <div className="mb-2 grid grid-cols-1 gap-1.5">
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
        <p className="mb-2 rounded-md border border-dashed p-1.5 text-center text-[11px] text-muted-foreground">
          Open a valid tab URL to enable copying.
        </p>
      )}
      {activeTab === "custom" && (
        <CustomCopySection
          options={resolvedOptions}
          onChange={handleCustomOptionChange}
          onCopy={() => copyToClipboard(COMMANDS.COPY_TAB_INFO_CUSTOM)}
          copied={copied[COMMANDS.COPY_TAB_INFO_CUSTOM]}
          shortcut={shortcuts[COMMANDS.COPY_TAB_INFO_CUSTOM]}
          onPreviewUpdate={() => setActiveTab("custom")}
          disabled={!hasTabUrl}
        />
      )}
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
      className="h-9 w-full justify-between gap-2 px-3">
      <span className="text-sm font-medium tracking-tight">
        {copied ? "Copied!" : label}
      </span>
      {shortcut !== NoSetText && (
        <span className="rounded border bg-background px-1.5 py-0.5 text-[11px] text-muted-foreground">
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
    <Card className="mb-2">
      <CardContent className="space-y-2 p-3 pt-3">
        <div>
          <h3 className="mb-1 text-xs font-semibold tracking-tight text-muted-foreground">
            Custom Copy Options
          </h3>
          <div className="grid grid-cols-3 gap-1">
            {compactOptionOrder.map((key) => {
              const value = options[key]
              return (
                <label
                  key={key}
                  className="flex cursor-pointer select-none items-center gap-1 rounded-md border px-1.5 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => {
                      onChange(key as keyof OptionType, !value)
                      onPreviewUpdate()
                    }}
                    className="h-3.5 w-3.5 rounded border-input accent-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                  />
                  <span>{optionLabels[key]}</span>
                </label>
              )
            })}
          </div>
        </div>
      </CardContent>
      <div className="px-3 pb-3 pt-0">
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
