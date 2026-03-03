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
  return (
    <div className="inline-flex w-full rounded-md border border-neutral-200 bg-neutral-50 p-1">
      {tabs.map((tab) => {
        const isActive = activeKey === tab.key

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              "flex-1 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            )}>
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
