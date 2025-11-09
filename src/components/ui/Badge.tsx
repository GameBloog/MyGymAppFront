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
    default: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
  }

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  )
}
