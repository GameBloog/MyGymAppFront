import { useState } from "react"
import axios from "axios"

interface FotoShape {
  id: string
  alunoId: string
  url: string
  publicId: string
  descricao: string | null
  createdAt: string
}

export function useFotoShape(token: string) {
  const [fotos, setFotos] = useState<FotoShape[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const baseURL = import.meta.env.VITE_API_URL

  const upload = async (file: File, descricao?: string) => {
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      if (descricao) formData.append("descricao", descricao)

      const { data } = await axios.post<FotoShape>(
        `${baseURL}/fotos-shape`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      )

      setFotos((prev) => [data, ...prev])
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

  const fetchFotos = async (alunoId: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data } = await axios.get<FotoShape[]>(
        `${baseURL}/fotos-shape/aluno/${alunoId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      setFotos(data)
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error || "Erro desconhecido"
        : "Erro de rede"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const deleteFoto = async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      await axios.delete(`${baseURL}/fotos-shape/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setFotos((prev) => prev.filter((f) => f.id !== id))
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

  return { fotos, loading, error, upload, fetchFotos, deleteFoto }
}
