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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-lg border border-[color:var(--student-border)] bg-[color:var(--student-surface-strong)] shadow-[var(--student-shadow)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[color:var(--student-border)] p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-[color:var(--student-text)]">
            <FileText className="h-5 w-5" />
            Enviar Arquivo
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-lg p-2 text-[color:var(--student-text-muted)] transition-colors hover:bg-[color:var(--student-surface)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[color:var(--student-text)]">
              Tipo *
            </label>
            <div className="flex gap-3">
              <label className="flex flex-1 cursor-pointer items-center rounded-lg border-2 border-[color:var(--student-border)] p-3 transition-colors hover:bg-[color:var(--student-info-surface)]">
                <input
                  type="radio"
                  name="tipo"
                  value="TREINO"
                  checked={tipo === "TREINO"}
                  onChange={(e) => setTipo(e.target.value as "TREINO")}
                  className="mr-3"
                  disabled={isLoading}
                />
                <span className="font-medium text-[color:var(--student-text)]">Treino</span>
              </label>

              <label className="flex flex-1 cursor-pointer items-center rounded-lg border-2 border-[color:var(--student-border)] p-3 transition-colors hover:bg-[color:var(--student-success-surface)]">
                <input
                  type="radio"
                  name="tipo"
                  value="DIETA"
                  checked={tipo === "DIETA"}
                  onChange={(e) => setTipo(e.target.value as "DIETA")}
                  className="mr-3"
                  disabled={isLoading}
                />
                <span className="font-medium text-[color:var(--student-text)]">Dieta</span>
              </label>
            </div>
          </div>

          <div>
            <label
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
                file
                  ? "border-[color:rgba(125,224,211,0.55)] bg-[color:var(--student-success-surface)]"
                  : "border-[color:var(--student-border)] hover:border-[color:var(--student-border-strong)] hover:bg-[color:var(--student-surface)]"
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
                  <FileText className="mx-auto mb-2 h-12 w-12 text-[color:var(--student-success)]" />
                  <p className="text-sm font-medium text-[color:var(--student-text)]">
                    {file.name}
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--student-text-muted)]">
                    {formatarTamanho(file.size)}
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--student-text-muted)]">
                    Clique para trocar
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto mb-3 h-12 w-12 text-[color:var(--student-text-muted)]" />
                  <p className="mb-1 font-medium text-[color:var(--student-text-soft)]">
                    Arraste aqui ou clique
                  </p>
                  <p className="text-sm text-[color:var(--student-text-muted)]">
                    Apenas PDF • Máximo 5MB
                  </p>
                </div>
              )}
            </label>

            {error && (
              <p className="mt-2 flex items-center gap-1 text-sm text-[color:var(--student-danger)]">
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

        <div className="flex gap-3 border-t border-[color:var(--student-border)] bg-[color:var(--student-surface)] p-6">
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
