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
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  }

  const colors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-yellow-50 border-yellow-200",
    info: "bg-blue-50 border-blue-200",
  }

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border-2 ${colors[type]} min-w-[300px]`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1">
        {title && <p className="font-semibold text-gray-900 mb-1">{title}</p>}
        <p className="text-sm text-gray-700">{message}</p>
      </div>
    </div>
  )
}
