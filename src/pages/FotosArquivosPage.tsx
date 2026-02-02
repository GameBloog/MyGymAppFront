import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Image as ImageIcon,
  FileText,
  Plus,
  Trash2,
  Loader2,
  Download,
} from "lucide-react"
import { Card, Button } from "../components/ui"
import { ModalEnviarFoto } from "../components/ModalEnviarFoto"
import { ModalEnviarArquivo } from "../components/ModalEnviarArquivo"
import { ConfirmModal } from "../components/ConfirmModal"
import { useFotoShape } from "../hooks/useFotoShape"
import { useArquivoAluno } from "../hooks/useArquivoAluno"
import { useAluno, useAlunos } from "../hooks/useAlunos"
import { useAuth } from "../hooks/useAuth"
import { showToast } from "../utils/toast"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export const FotosArquivosPage: React.FC = () => {
  const navigate = useNavigate()
  const { id: alunoIdParam } = useParams<{ id: string }>()
  const { user, token } = useAuth()

  const [showModalFoto, setShowModalFoto] = useState(false)
  const [showModalArquivo, setShowModalArquivo] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean
    id: string
    tipo: "foto" | "arquivo"
  }>({ isOpen: false, id: "", tipo: "foto" })

  const isAluno = user?.role === "ALUNO"
  const isAdmin = user?.role === "ADMIN"
  const isProfessor = user?.role === "PROFESSOR"

  const podeEnviarFoto = isAluno
  const podeEnviarArquivo = isAdmin || isProfessor
  const podeDeletarFoto = isAluno || isAdmin
  const podeDeletarArquivo = isAdmin || isProfessor

  const { data: alunos } = useAlunos()
  const meuAlunoRegistro = isAluno
    ? alunos?.find((a) => a.userId === user?.id)
    : null

  const alunoId =
    isAluno && meuAlunoRegistro ? meuAlunoRegistro.id : alunoIdParam

  const { data: aluno, isLoading: loadingAluno } = useAluno(alunoId || "", {
    enabled: !!alunoId,
  })

  const fotoHook = useFotoShape(token || "")
  const arquivoHook = useArquivoAluno(token || "")

  useEffect(() => {
    if (alunoId && token) {
      fotoHook.fetchFotos(alunoId)
      arquivoHook.fetchArquivos(alunoId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alunoId, token])

  const getBackRoute = () => {
    if (isAdmin) return "/admin/alunos"
    if (isProfessor) return "/professor/dashboard"
    return "/aluno/perfil"
  }

  const handleUploadFoto = async (file: File, descricao?: string) => {
    try {
      await fotoHook.upload(file, descricao)
      showToast.success("Foto enviada com sucesso!")
      fotoHook.fetchFotos(alunoId!)
    } catch (error: any) {
      showToast.error(error.message || "Erro ao enviar foto")
      throw error
    }
  }

  const handleUploadArquivo = async (params: {
    file: File
    alunoId: string
    tipo: "TREINO" | "DIETA"
    titulo: string
    descricao?: string
  }) => {
    try {
      await arquivoHook.upload(params)
      showToast.success("Arquivo enviado com sucesso!")
      arquivoHook.fetchArquivos(alunoId!)
    } catch (error: any) {
      showToast.error(error.message || "Erro ao enviar arquivo")
      throw error
    }
  }

  const handleDeleteFoto = (id: string) => {
    setConfirmDelete({ isOpen: true, id, tipo: "foto" })
  }

  const handleDeleteArquivo = (id: string) => {
    setConfirmDelete({ isOpen: true, id, tipo: "arquivo" })
  }

  const confirmDeleteAction = async () => {
    try {
      if (confirmDelete.tipo === "foto") {
        await fotoHook.deleteFoto(confirmDelete.id)
        showToast.success("Foto excluída com sucesso!")
      } else {
        await arquivoHook.deleteArquivo(confirmDelete.id)
        showToast.success("Arquivo excluído com sucesso!")
      }
      setConfirmDelete({ isOpen: false, id: "", tipo: "foto" })
    } catch (error: any) {
      showToast.error(error.message || "Erro ao excluir")
    }
  }

  if (loadingAluno) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-600">Carregando...</p>
      </div>
    )
  }

  if (!aluno) {
    return (
      <Card className="bg-red-50 border-2 border-red-200">
        <p className="text-red-800">Aluno não encontrado</p>
        <Button onClick={() => navigate(getBackRoute())} variant="secondary">
          Voltar
        </Button>
      </Card>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(getBackRoute())}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isAluno
                ? "Minhas Fotos e Arquivos"
                : `Fotos e Arquivos - ${aluno.user?.nome}`}
            </h1>
            <p className="text-gray-600 mt-1">
              {fotoHook.fotos.length} foto(s) • {arquivoHook.arquivos.length}{" "}
              arquivo(s)
            </p>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Fotos de Shape
          </h2>
          {podeEnviarFoto && (
            <Button
              icon={Plus}
              onClick={() => setShowModalFoto(true)}
              disabled={fotoHook.loading}
            >
              Nova Foto
            </Button>
          )}
        </div>

        {fotoHook.loading && fotoHook.fotos.length === 0 ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          </div>
        ) : fotoHook.fotos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fotoHook.fotos.map((foto) => (
              <div
                key={foto.id}
                className="relative group rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors"
              >
                <img
                  src={foto.url}
                  alt={foto.descricao || "Foto de shape"}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                  {podeDeletarFoto && (
                    <button
                      onClick={() => handleDeleteFoto(foto.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="p-2 bg-gray-50">
                  <p className="text-xs text-gray-600">
                    {format(new Date(foto.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                  {foto.descricao && (
                    <p className="text-sm text-gray-900 mt-1">
                      {foto.descricao}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Nenhuma foto enviada ainda</p>
            {podeEnviarFoto && (
              <Button icon={Plus} onClick={() => setShowModalFoto(true)}>
                Enviar Primeira Foto
              </Button>
            )}
          </div>
        )}
      </Card>

      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Treinos
          </h2>
          {podeEnviarArquivo && (
            <Button
              icon={Plus}
              onClick={() => {
                setShowModalArquivo(true)
              }}
              disabled={arquivoHook.loading}
            >
              Novo Treino
            </Button>
          )}
        </div>

        {arquivoHook.treinos.length > 0 ? (
          <div className="space-y-3">
            {arquivoHook.treinos.map((arquivo) => (
              <div
                key={arquivo.id}
                className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {arquivo.titulo}
                  </h3>
                  {arquivo.descricao && (
                    <p className="text-sm text-gray-600 mt-1">
                      {arquivo.descricao}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {format(new Date(arquivo.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={arquivo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Abrir PDF"
                  >
                    <Download className="h-4 w-4 text-blue-600" />
                  </a>
                  {podeDeletarArquivo && (
                    <button
                      onClick={() => handleDeleteArquivo(arquivo.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Nenhum treino disponível</p>
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Dietas
          </h2>
          {podeEnviarArquivo && (
            <Button
              icon={Plus}
              onClick={() => setShowModalArquivo(true)}
              disabled={arquivoHook.loading}
            >
              Nova Dieta
            </Button>
          )}
        </div>

        {arquivoHook.dietas.length > 0 ? (
          <div className="space-y-3">
            {arquivoHook.dietas.map((arquivo) => (
              <div
                key={arquivo.id}
                className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {arquivo.titulo}
                  </h3>
                  {arquivo.descricao && (
                    <p className="text-sm text-gray-600 mt-1">
                      {arquivo.descricao}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {format(new Date(arquivo.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={arquivo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Abrir PDF"
                  >
                    <Download className="h-4 w-4 text-blue-600" />
                  </a>
                  {podeDeletarArquivo && (
                    <button
                      onClick={() => handleDeleteArquivo(arquivo.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Nenhuma dieta disponível</p>
          </div>
        )}
      </Card>

      <ModalEnviarFoto
        isOpen={showModalFoto}
        onClose={() => setShowModalFoto(false)}
        onSubmit={handleUploadFoto}
        isLoading={fotoHook.loading}
      />

      <ModalEnviarArquivo
        isOpen={showModalArquivo}
        onClose={() => setShowModalArquivo(false)}
        alunoId={alunoId!}
        onSubmit={handleUploadArquivo}
        isLoading={arquivoHook.loading}
      />

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title={`Excluir ${confirmDelete.tipo === "foto" ? "Foto" : "Arquivo"}`}
        message={`Deseja realmente excluir ${
          confirmDelete.tipo === "foto" ? "esta foto" : "este arquivo"
        }?\n\nEsta ação não pode ser desfeita.`}
        confirmText="Sim, Excluir"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={confirmDeleteAction}
        onCancel={() =>
          setConfirmDelete({ isOpen: false, id: "", tipo: "foto" })
        }
        isLoading={fotoHook.loading || arquivoHook.loading}
      />
    </div>
  )
}
