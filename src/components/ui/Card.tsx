import React, { type MouseEvent, type ReactNode } from "react"

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: (event: MouseEvent<HTMLDivElement>) => void
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  onClick,
}) => {
  return (
    <div
      className={`bg-[color:var(--student-surface-strong)] border border-[color:var(--student-border)] rounded-lg shadow-[var(--student-shadow)] p-6 ${className}`}
      onClick={onClick}
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      {children}
    </div>
  )
}
