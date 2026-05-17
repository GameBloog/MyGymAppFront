import type { InputHTMLAttributes } from "react"
import type { LucideIcon } from "lucide-react"
import type React from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: LucideIcon
  error?: string
}

export const Input: React.FC<InputProps> = ({
  label,
  icon: Icon,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-[color:var(--student-text)] mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-[color:var(--student-text-muted)]" />
          </div>
        )}
        <input
          className={`w-full ${Icon ? "pl-10" : "pl-3"} pr-3 py-2 bg-[color:var(--student-surface)] text-[color:var(--student-text)] border border-[color:var(--student-border)] placeholder:text-[color:var(--student-text-muted)] rounded-lg focus:ring-2 focus:ring-[color:var(--student-border-strong)] focus:border-transparent transition-colors ${error ? "border-[color:var(--student-danger)]" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-[color:var(--student-danger)]">{error}</p>
      )}
    </div>
  )
}
