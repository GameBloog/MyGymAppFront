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
        <label className="block text-sm font-medium text-gray-200 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-500" />
          </div>
        )}
        <input
          className={`w-full ${Icon ? "pl-10" : "pl-3"} pr-3 py-2 bg-zinc-900 text-white border border-zinc-700 placeholder:text-zinc-500 rounded-lg focus:ring-2 focus:ring-zinc-300 focus:border-transparent transition-colors ${error ? "border-red-500" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
