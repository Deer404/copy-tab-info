import type React from "react"

import { cn } from "~utils/cn"

type DivProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: DivProps) {
  return (
    <div
      className={cn("rounded-lg border border-neutral-200 bg-white", className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: DivProps) {
  return <div className={cn("px-4 py-3 border-b border-neutral-200", className)} {...props} />
}

export function CardContent({ className, ...props }: DivProps) {
  return <div className={cn("p-4", className)} {...props} />
}

export function CardTitle({ className, ...props }: DivProps) {
  return <h2 className={cn("text-base font-semibold text-neutral-900", className)} {...props} />
}
