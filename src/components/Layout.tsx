import type React from "react"
import type { ReactNode } from "react"
import { Navigation } from "./Navegation"

interface LayoutProps {
  children: ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      <div className="container mx-auto px-4 pb-8">{children}</div>
    </div>
  )
}
