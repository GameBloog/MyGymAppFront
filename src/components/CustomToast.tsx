import React from "react"
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react"

interface CustomToastProps {
  type: "success" | "error" | "warning" | "info"
  message: string
  title?: string
}

export const CustomToast: React.FC<CustomToastProps> = ({
  type,
  message,
  title,
}) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-300" />,
    error: <XCircle className="h-5 w-5 text-red-300" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-300" />,
    info: <Info className="h-5 w-5 text-blue-300" />,
  }

  const colors = {
    success: "bg-emerald-950/50 border-emerald-500/30",
    error: "bg-red-950/50 border-red-500/30",
    warning: "bg-amber-950/50 border-amber-500/30",
    info: "bg-blue-950/50 border-blue-500/30",
  }

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border-2 ${colors[type]} min-w-[300px]`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1">
        {title && <p className="font-semibold text-white mb-1">{title}</p>}
        <p className="text-sm text-zinc-200">{message}</p>
      </div>
    </div>
  )
}
