import React, { useState } from "react"
import { X, Upload, Image as ImageIcon } from "lucide-react"
import { Button, Textarea } from "./ui"
import { validarFoto } from "../utils/validacaoUpload"

interface ModalEnviarFotoProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (file: File, descricao?: string) => Promise<void>
  isLoading?: boolean
}

export const ModalEnviarFoto: React.FC<ModalEnviarFotoProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [descricao, setDescricao] = useState("")
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const erro = validarFoto(selectedFile)
    if (erro) {
      setError(erro)
      setFile(null)
      setPreview(null)
      return
    }

    setError(null)
    setFile(selectedFile)

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleSubmit = async () => {
    if (!file) {
      setError("Selecione uma foto")
      return
    }

    try {
      await onSubmit(file, descricao.trim() || undefined)
      handleClose()
    } catch (error) {
      console.log(error)
    }
  }

  const handleClose = () => {
    setFile(null)
    setDescricao("")
    setPreview(null)
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <div
        className="bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Nova Foto de Shape
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors ${
                preview
                  ? "border-emerald-500 bg-emerald-950/30"
                  : "border-zinc-700 hover:border-blue-500 hover:bg-blue-950/30"
              }`}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                disabled={isLoading}
              />

              {preview ? (
                <div className="text-center">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-48 rounded-lg mb-3"
                  />
                  <p className="text-sm text-zinc-200">{file?.name}</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Clique para trocar
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-12 w-12 text-zinc-400 mx-auto mb-3" />
                  <p className="text-zinc-200 font-medium mb-1">
                    Arraste aqui ou clique
                  </p>
                  <p className="text-sm text-zinc-400">
                    JPG, PNG, WebP • Máximo 2MB
                  </p>
                </div>
              )}
            </label>

            {error && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                ⚠️ {error}
              </p>
            )}
          </div>

          <Textarea
            label="Descrição (opcional)"
            rows={3}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Frente - Semana 1"
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-3 p-6 border-t border-zinc-800 bg-zinc-900">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !file}
            isLoading={isLoading}
            className="flex-1"
          >
            {isLoading ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      </div>
    </div>
  )
}
