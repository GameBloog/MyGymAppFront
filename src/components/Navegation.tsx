import type React from "react"
import { BrandMark } from "./BrandMark"

export const Navigation: React.FC = () => {
  return (
    <nav className="bg-zinc-950 shadow-md border-b border-zinc-800">
      <div className="container mx-auto px-4 py-4">
        <BrandMark size="md" text="G-FORCE Coach" />
      </div>
    </nav>
  )
}
