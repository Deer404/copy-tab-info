import type React from "react"

import { cn } from "~utils/cn"

type TabsProps = {
  tabs: Array<{
    key: string
    label: string
  }>
  activeKey: string
  onChange: (key: string) => void
}

export function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
      return
    }

    event.preventDefault()
    const direction = event.key === "ArrowRight" ? 1 : -1
    const nextIndex = (index + direction + tabs.length) % tabs.length
    onChange(tabs[nextIndex].key)
  }

  return (
    <div
      role="tablist"
      className="inline-flex w-full items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
      {tabs.map((tab, index) => {
        const isActive = activeKey === tab.key

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tab-panel-${tab.key}`}
            id={`tab-${tab.key}`}
            tabIndex={isActive ? 0 : -1}
            className={cn(
              "inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "hover:text-foreground"
            )}>
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
