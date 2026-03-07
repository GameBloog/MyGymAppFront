import React from "react"
import type { ReactNode } from "react"

type BadgeVariant = "default" | "success" | "warning" | "danger"

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
}) => {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-blue-950/50 text-white border border-blue-500/30",
    success: "bg-emerald-950/50 text-white border border-emerald-500/30",
    warning: "bg-amber-950/50 text-white border border-amber-500/30",
    danger: "bg-red-950/50 text-white border border-red-500/30",
  }

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  )
}
