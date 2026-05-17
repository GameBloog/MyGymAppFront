import type React from "react"
import type { TextareaHTMLAttributes } from "react"

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
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
      <textarea
        className={`w-full px-3 py-2 bg-[color:var(--student-surface)] text-[color:var(--student-text)] border border-[color:var(--student-border)] placeholder:text-[color:var(--student-text-muted)] rounded-lg focus:ring-2 focus:ring-[color:var(--student-border-strong)] focus:border-transparent transition-colors resize-none ${error ? "border-[color:var(--student-danger)]" : ""} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-[color:var(--student-danger)]">{error}</p>
      )}
    </div>
  )
}
