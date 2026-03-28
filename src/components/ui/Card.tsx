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
      className={`bg-zinc-950 border border-zinc-800 rounded-lg shadow-md p-6 ${className}`}
      onClick={onClick}
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      {children}
    </div>
  )
}
