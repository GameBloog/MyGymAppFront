import React, { useEffect, useMemo, useState } from "react"
import { Image as ImageIcon, Trash2, Upload, X } from "lucide-react"
import { Button } from "../../../components/ui"
import type { Exercicio, ExercicioMediaKind } from "../../../types"
import { validarMidiaExercicio } from "../../../utils/validacaoUpload"

interface ExercicioMediaModalProps {
  exercicio: Exercicio | null
  isOpen: boolean
  isUploading?: boolean
  onClose: () => void
  onUpload: (kind: ExercicioMediaKind, file: File) => Promise<void>
  onClear: (kind: ExercicioMediaKind) => Promise<void>
}

interface SelectedMedia {
  file: File | null
  preview: string | null
}

const emptyMediaState: SelectedMedia = {
  file: null,
  preview: null,
}

export const ExercicioMediaModal: React.FC<ExercicioMediaModalProps> = ({
  exercicio,
  isOpen,
  isUploading = false,
  onClose,
  onUpload,
  onClear,
}) => {
  const [executionMedia, setExecutionMedia] = useState<SelectedMedia>(emptyMediaState)
  const [equipmentMedia, setEquipmentMedia] = useState<SelectedMedia>(emptyMediaState)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setExecutionMedia(emptyMediaState)
      setEquipmentMedia(emptyMediaState)
      setError(null)
    }
  }, [isOpen])

  const currentExecutionPreview = executionMedia.preview || exercicio?.executionGifUrl || null
  const currentEquipmentPreview = equipmentMedia.preview || exercicio?.equipmentImageUrl || null

  const hasAnyPendingUpload = useMemo(() => {
    return !!executionMedia.file || !!equipmentMedia.file
  }, [equipmentMedia.file, executionMedia.file])

  const updateSelectedMedia = (
    kind: ExercicioMediaKind,
    file: File | null,
    preview: string | null,
  ) => {
    const nextState = { file, preview }
    if (kind === "execucao") {
      setExecutionMedia(nextState)
      return
    }
    setEquipmentMedia(nextState)
  }

  const handleFileChange = (
    kind: ExercicioMediaKind,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const validationError = validarMidiaExercicio(file, kind)
    if (validationError) {
      setError(validationError)
      updateSelectedMedia(kind, null, null)
      return
    }

    setError(null)

    const reader = new FileReader()
    reader.onloadend = () => {
      updateSelectedMedia(kind, file, reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!hasAnyPendingUpload) {
      setError("Selecione ao menos um arquivo para enviar")
      return
    }

    setError(null)

    if (executionMedia.file) {
      await onUpload("execucao", executionMedia.file)
    }

    if (equipmentMedia.file) {
      await onUpload("aparelho", equipmentMedia.file)
    }

    onClose()
  }

  const handleClear = async (kind: ExercicioMediaKind) => {
    await onClear(kind)
  }

  if (!isOpen || !exercicio) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 p-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Mídia do exercício
            </h2>
            <p className="text-sm text-zinc-400 mt-1">{exercicio.nome}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-zinc-800"
            disabled={isUploading}
          >
            <X className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">
                Demonstração de execução
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Use GIF ou WebP para ilustrar a execução do movimento.
              </p>
            </div>
            <label className="block cursor-pointer rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 p-4 transition-colors hover:border-zinc-500">
              <input
                type="file"
                accept="image/gif,image/webp"
                className="hidden"
                onChange={(event) => handleFileChange("execucao", event)}
                disabled={isUploading}
              />
              {currentExecutionPreview ? (
                <img
                  src={currentExecutionPreview}
                  alt={`Demonstração de ${exercicio.nome}`}
                  className="h-56 w-full rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-56 flex-col items-center justify-center rounded-xl bg-zinc-950 text-center text-zinc-500">
                  <Upload className="h-8 w-8" />
                  <p className="mt-3 text-sm">Clique para selecionar um GIF ou WebP</p>
                </div>
              )}
            </label>

            {exercicio.executionGifUrl && (
              <Button
                variant="danger"
                onClick={() => handleClear("execucao")}
                disabled={isUploading}
              >
                <Trash2 className="h-4 w-4" />
                Remover demonstração
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">
                Foto do aparelho
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Use JPG, PNG ou WebP para orientar o aluno sobre o equipamento.
              </p>
            </div>
            <label className="block cursor-pointer rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 p-4 transition-colors hover:border-zinc-500">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => handleFileChange("aparelho", event)}
                disabled={isUploading}
              />
              {currentEquipmentPreview ? (
                <img
                  src={currentEquipmentPreview}
                  alt={`Aparelho para ${exercicio.nome}`}
                  className="h-56 w-full rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-56 flex-col items-center justify-center rounded-xl bg-zinc-950 text-center text-zinc-500">
                  <Upload className="h-8 w-8" />
                  <p className="mt-3 text-sm">Clique para selecionar a foto do aparelho</p>
                </div>
              )}
            </label>

            {exercicio.equipmentImageUrl && (
              <Button
                variant="danger"
                onClick={() => handleClear("aparelho")}
                disabled={isUploading}
              >
                <Trash2 className="h-4 w-4" />
                Remover foto do aparelho
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="px-6 pb-2">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-zinc-800 bg-zinc-900 p-6 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isUploading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} isLoading={isUploading}>
            Salvar mídia do exercício
          </Button>
        </div>
      </div>
    </div>
  )
}
