import type React from "react"

import { cn } from "~utils/cn"

type DivProps = React.HTMLAttributes<HTMLDivElement>
type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>

export function Card({ className, ...props }: DivProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: DivProps) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-5", className)}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }: DivProps) {
  return <div className={cn("p-5 pt-0", className)} {...props} />
}

export function CardTitle({ className, ...props }: HeadingProps) {
  return (
    <h2
      className={cn(
        "text-base font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
}
