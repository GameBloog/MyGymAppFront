import { useState } from "react"
import axios from "axios"

type TipoArquivo = "TREINO" | "DIETA"

interface ArquivoAluno {
  id: string
  alunoId: string
  professorId: string
  tipo: TipoArquivo
  titulo: string
  descricao: string | null
  url: string
  publicId: string
  createdAt: string
  updatedAt: string
}

interface UploadArquivoParams {
  file: File
  alunoId: string
  tipo: TipoArquivo
  titulo: string
  descricao?: string
}

export function useArquivoAluno(token: string) {
  const [arquivos, setArquivos] = useState<ArquivoAluno[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const baseURL = import.meta.env.VITE_API_URL

  const upload = async (params: UploadArquivoParams) => {
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", params.file)
      formData.append("alunoId", params.alunoId)
      formData.append("tipo", params.tipo)
      formData.append("titulo", params.titulo)
      if (params.descricao) formData.append("descricao", params.descricao)

      const { data } = await axios.post<ArquivoAluno>(
        `${baseURL}/arquivos-aluno`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      )

      setArquivos((prev) => [data, ...prev])
      return data
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error || "Erro desconhecido"
        : "Erro de rede"
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  const fetchArquivos = async (alunoId: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data } = await axios.get<ArquivoAluno[]>(
        `${baseURL}/arquivos-aluno/aluno/${alunoId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setArquivos(data)
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error || "Erro desconhecido"
        : "Erro de rede"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const deleteArquivo = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      await axios.delete(`${baseURL}/arquivos-aluno/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setArquivos((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error || "Erro desconhecido"
        : "Erro de rede"
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  const treinos = arquivos.filter((a) => a.tipo === "TREINO")
  const dietas = arquivos.filter((a) => a.tipo === "DIETA")

  return {
    arquivos,
    treinos,
    dietas,
    loading,
    error,
    upload,
    fetchArquivos,
    deleteArquivo,
  }
}
