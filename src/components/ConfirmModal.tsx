import React from "react"
import { AlertCircle, X } from "lucide-react"
import { Button } from "./ui"

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "info"
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null

  const variantColors = {
    danger: {
      icon: "text-red-300",
      bg: "bg-red-950/50",
      border: "border-red-500/40",
      button: "danger" as const,
    },
    warning: {
      icon: "text-amber-300",
      bg: "bg-amber-950/50",
      border: "border-amber-500/40",
      button: "primary" as const,
    },
    info: {
      icon: "text-blue-300",
      bg: "bg-blue-950/50",
      border: "border-blue-500/40",
      button: "primary" as const,
    },
  }

  const colors = variantColors[variant]

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl w-full max-w-md transform transition-all animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${colors.bg} ${colors.border} border-2`}
            >
              <AlertCircle className={`h-6 w-6 ${colors.icon}`} />
            </div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-zinc-200 whitespace-pre-line">{message}</p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 p-6 border-t border-zinc-800 bg-zinc-900">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button
            variant={colors.button}
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {confirmText}
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  )
}
