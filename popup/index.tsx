import React, { useEffect, useState } from "react"

import "../css/index.css"

import { useStorage } from "@plasmohq/storage/hook"

import { COMMANDS, NoSetText, STORE_KEYS } from "~constant"

export const DefaultOptions = {
  title: true,
  hostname: true,
  pathname: true,
  hash: true,
  params: true,
  protocol: true
}

interface TabInfo {
  title: string
  url: string
  urlNoParams: string
  protocol: string
  hash?: string
  hostname?: string
  pathname?: string
  params?: string
}

const renderCommands = [COMMANDS.COPY_TAB_INFO, COMMANDS.COPY_TAB_INFO_MARKDOWN]

export default function Popup() {
  const [tabInfo, setTabInfo] = useState<TabInfo>({
    title: "",
    url: "",
    urlNoParams: "",
    protocol: "",
    hash: "",
    hostname: "",
    pathname: "",
    params: ""
  })

  const [customOptions, setCustomOptions] = useStorage(
    STORE_KEYS,
    DefaultOptions
  )

  const [copied, setCopied] = useState(
    Object.fromEntries(Object.values(COMMANDS).map((cmd) => [cmd, false]))
  )

  const [shortcuts, setShortcuts] = useState(
    Object.fromEntries(Object.values(COMMANDS).map((cmd) => [cmd, NoSetText]))
  )

  const [activeTab, setActiveTab] = useState("full")

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab && tab.url) {
        const url = new URL(tab.url)
        setTabInfo({
          title: tab.title || "",
          url: url.href,
          urlNoParams: `${url.origin}${url.pathname}`,
          protocol: url.protocol,
          hostname: url.hostname,
          pathname: url.pathname,
          hash: url.hash,
          params: url.search
        })
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
    const texts = {
      [COMMANDS.COPY_TAB_INFO]: `${tabInfo.title}\n${tabInfo.url}`,
      [COMMANDS.COPY_TAB_INFO_MARKDOWN]: `[${tabInfo.title}](${tabInfo.url})`,
      [COMMANDS.COPY_TAB_INFO_CUSTOM]: generateCustomText(
        tabInfo,
        customOptions
      )
    }

    navigator.clipboard
      .writeText(texts[command] || "")
      .then(() => updateCopiedState(command))
      .catch((err) => console.error("Failed to copy to clipboard:", err))
  }

  const generateCustomText = (
    tabInfo: TabInfo,
    options: typeof DefaultOptions
  ) => {
    let text = ""
    let result = []
    if (options.protocol) result.push(`${tabInfo.protocol}//`)
    if (options.hostname) result.push(tabInfo.hostname)
    if (options.pathname) result.push(tabInfo.pathname)
    if (options.hash) result.push(tabInfo.hash)
    if (options.params && tabInfo.hash !== "") result.push(tabInfo.params)
    if (options.title) text = `${tabInfo.title}\n${result.join("")}`
    else text = `${result.join("")}`
    return text
  }

  const updateCopiedState = (command: string) => {
    setCopied((prev) => ({ ...prev, [command]: true }))
    setTimeout(() => setCopied((prev) => ({ ...prev, [command]: false })), 2000)
  }

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage()
  }

  const getLabelForCommand = (command: string) => {
    const labels = {
      [COMMANDS.COPY_TAB_INFO]: "Full URL",
      [COMMANDS.COPY_TAB_INFO_MARKDOWN]: "Markdown",
      [COMMANDS.COPY_TAB_INFO_CUSTOM]: "Custom"
    }
    return labels[command] || "Copy"
  }

  const getColorForCommand = (command: string) => {
    const colors = {
      [COMMANDS.COPY_TAB_INFO]: "from-blue-400 to-indigo-500",
      [COMMANDS.COPY_TAB_INFO_MARKDOWN]: "from-yellow-400 to-orange-500",
      [COMMANDS.COPY_TAB_INFO_CUSTOM]: "from-teal-400 to-cyan-500"
    }
    return colors[command] || "from-gray-400 to-gray-500"
  }

  const handleCustomOptionChange = (
    key: keyof typeof DefaultOptions,
    value: boolean
  ) => {
    setCustomOptions((prev) => ({ ...prev, [key]: value }))
    setActiveTab("custom")
  }

  const customPreviewText = generateCustomText(tabInfo, customOptions)

  return (
    <div className="w-[300px] p-4 font-sans bg-gradient-to-br from-[#e0eafc] to-[#cfdef3] rounded-lg shadow-lg">
      <h2 className="text-center text-xl font-bold text-gray-800 mb-2">
        CopyTab
      </h2>
      <div className="bg-white bg-opacity-90 p-3 rounded-md shadow-sm mb-2">
        <div className="flex mb-4 relative">
          <div
            className={`absolute bottom-0 h-1 w-1/2 bg-blue-500 transition-all duration-300 ease-in-out rounded-full ${
              activeTab === "full" ? "left-0" : "left-1/2"
            }`}
          />
          <button
            className={`flex-1 px-4 pb-2 text-sm font-medium transition-all duration-200 ease-in-out ${
              activeTab === "full"
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("full")}>
            Full URL
          </button>
          <button
            className={`flex-1 px-4 pb-2 text-sm font-medium transition-all duration-200 ease-in-out ${
              activeTab === "custom"
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("custom")}>
            Custom
          </button>
        </div>
        {activeTab === "full" ? (
          <>
            <p className="font-bold text-gray-800 mb-1 break-words">
              {tabInfo.title}
            </p>
            <p className="text-gray-600 text-sm break-all">{tabInfo.url}</p>
          </>
        ) : (
          <>
            <p className="font-bold text-gray-800 mb-1 break-words">
              {customOptions.title ? tabInfo.title : undefined}
            </p>
            <p className="text-gray-600 text-sm break-all">
              {customPreviewText}
            </p>
          </>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2 mb-2">
        {renderCommands.map((command) => (
          <CopyButton
            key={command}
            onClick={() => copyToClipboard(command)}
            copied={copied[command]}
            shortcut={shortcuts[command]}
            label={getLabelForCommand(command)}
            color={getColorForCommand(command)}
            disabled={false}
          />
        ))}
      </div>
      <CustomCopySection
        options={customOptions}
        onChange={handleCustomOptionChange}
        onCopy={() => copyToClipboard(COMMANDS.COPY_TAB_INFO_CUSTOM)}
        copied={copied[COMMANDS.COPY_TAB_INFO_CUSTOM]}
        shortcut={shortcuts[COMMANDS.COPY_TAB_INFO_CUSTOM]}
        onPreviewUpdate={() => setActiveTab("custom")}
      />
      <div className="text-center mt-4">
        <button
          onClick={openOptionsPage}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          Customize Options
        </button>
      </div>
    </div>
  )
}

interface CopyButtonProps {
  onClick: () => void
  copied: boolean
  shortcut: string
  label: string
  color: string
  disabled: boolean
}

function CopyButton({
  onClick,
  copied,
  shortcut,
  label,
  color,
  disabled = false
}: CopyButtonProps) {
  const buttonClass = `flex flex-col justify-center items-center p-2 ${
    copied ? "bg-green-500" : `bg-gradient-to-r ${color}`
  } text-white rounded-md transition-all duration-300 hover:opacity-90`
  const disabledClass =
    "flex flex-col justify-center items-center p-2 cursor-not-allowed bg-gray-400 rounded-md p-2 text-white"
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={disabled ? disabledClass : buttonClass}>
      <span className="font-medium text-sm">{copied ? "Copied!" : label}</span>
      {shortcut !== NoSetText && (
        <span className="text-xs bg-white bg-opacity-20 px-1.5 py-0.5 rounded mt-1">
          {shortcut}
        </span>
      )}
    </button>
  )
}

interface CustomCopySectionProps {
  options: typeof DefaultOptions
  onChange: (key: keyof typeof DefaultOptions, value: boolean) => void
  onCopy: () => void
  copied: boolean
  shortcut: string
  onPreviewUpdate: () => void
}

function CustomCopySection({
  options,
  onChange,
  onCopy,
  copied,
  shortcut,
  onPreviewUpdate
}: CustomCopySectionProps) {
  return (
    <div className="bg-white bg-opacity-90 p-3 rounded-md shadow-sm mb-2">
      <div className="mb-3">
        <h3 className="font-semibold text-gray-700 mb-2">
          Custom Copy Options
        </h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {Object.entries(options).map(([key, value]) => (
            <label
              key={key}
              className="flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                checked={value}
                onChange={() => {
                  onChange(key as keyof typeof DefaultOptions, !value)
                  onPreviewUpdate()
                }}
                className="mr-2 form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
              />
              <span>{key}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <CopyButton
          onClick={onCopy}
          copied={copied}
          shortcut={shortcut}
          label="Copy Custom"
          color="from-teal-400 to-cyan-500"
          disabled={false}
        />
      </div>
    </div>
  )
}
