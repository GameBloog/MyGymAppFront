import React, { useState } from "react"
import { X, Upload, FileText } from "lucide-react"
import { Button, Input, Textarea } from "./ui"
import { validarArquivo, formatarTamanho } from "../utils/validacaoUpload"

interface ModalEnviarArquivoProps {
  isOpen: boolean
  onClose: () => void
  alunoId: string
  onSubmit: (params: {
    file: File
    alunoId: string
    tipo: "TREINO" | "DIETA"
    titulo: string
    descricao?: string
  }) => Promise<void>
  isLoading?: boolean
}

export const ModalEnviarArquivo: React.FC<ModalEnviarArquivoProps> = ({
  isOpen,
  onClose,
  alunoId,
  onSubmit,
  isLoading = false,
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [tipo, setTipo] = useState<"TREINO" | "DIETA">("TREINO")
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (selectedFile.type !== "application/pdf") {
      setError("Apenas arquivos PDF são permitidos")
      setFile(null)
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Arquivo muito grande. Máximo 5MB")
      setFile(null)
      return
    }

    setError(null)
    setFile(selectedFile)
  }

  const handleSubmit = async () => {
    const erro = validarArquivo({
      file,
      tipo,
      titulo,
      descricao,
    })

    if (erro) {
      setError(erro)
      return
    }

    try {
      await onSubmit({
        file: file!,
        alunoId,
        tipo,
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
      })
      handleClose()
    } catch (error) {
      console.log(error)
    }
  }

  const handleClose = () => {
    setFile(null)
    setTipo("TREINO")
    setTitulo("")
    setDescricao("")
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
            <FileText className="h-5 w-5" />
            Enviar Arquivo
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
            <label className="block text-sm font-medium text-zinc-200 mb-2">
              Tipo *
            </label>
            <div className="flex gap-3">
              <label className="flex-1 flex items-center p-3 border-2 border-zinc-700 rounded-lg cursor-pointer transition-colors hover:bg-blue-950/30">
                <input
                  type="radio"
                  name="tipo"
                  value="TREINO"
                  checked={tipo === "TREINO"}
                  onChange={(e) => setTipo(e.target.value as "TREINO")}
                  className="mr-3"
                  disabled={isLoading}
                />
                <span className="font-medium text-zinc-100">Treino</span>
              </label>

              <label className="flex-1 flex items-center p-3 border-2 border-zinc-700 rounded-lg cursor-pointer transition-colors hover:bg-emerald-950/30">
                <input
                  type="radio"
                  name="tipo"
                  value="DIETA"
                  checked={tipo === "DIETA"}
                  onChange={(e) => setTipo(e.target.value as "DIETA")}
                  className="mr-3"
                  disabled={isLoading}
                />
                <span className="font-medium text-zinc-100">Dieta</span>
              </label>
            </div>
          </div>

          <div>
            <label
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
                file
                  ? "border-emerald-500 bg-emerald-950/30"
                  : "border-zinc-700 hover:border-blue-500 hover:bg-blue-950/30"
              }`}
            >
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={isLoading}
              />

              {file ? (
                <div className="text-center">
                  <FileText className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">
                    {file.name}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    {formatarTamanho(file.size)}
                  </p>
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
                    Apenas PDF • Máximo 5MB
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

          <Input
            label="Título *"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Treino ABC - Janeiro 2025"
            disabled={isLoading}
            required
          />

          <Textarea
            label="Descrição (opcional)"
            rows={3}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Focado em hipertrofia"
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
            disabled={isLoading || !file || !titulo.trim()}
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
