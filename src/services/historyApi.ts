import {
  type HistoricoEvolucao,
  type CreateHistoricoDTO,
  type UpdateHistoricoDTO,
  type HistoricoFiltros,
} from "../types/historico"
import { api } from "./api"

export const historicoApi = {
  criar: async (data: CreateHistoricoDTO): Promise<HistoricoEvolucao> => {
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        acc[key] = value
      }
      return acc
    }, {} as any)

    const response = await api.post<HistoricoEvolucao>(
      `/alunos/${data.alunoId}/historico`,
      cleanData
    )
    return response.data
  },

  listar: async (
    alunoId: string,
    filtros?: HistoricoFiltros
  ): Promise<HistoricoEvolucao[]> => {
    const params = new URLSearchParams()
    if (filtros?.dataInicio) params.append("dataInicio", filtros.dataInicio)
    if (filtros?.dataFim) params.append("dataFim", filtros.dataFim)
    if (filtros?.limite) params.append("limite", filtros.limite.toString())

    const response = await api.get<HistoricoEvolucao[]>(
      `/alunos/${alunoId}/historico?${params}`
    )
    return response.data
  },

  buscarUltimo: async (alunoId: string): Promise<HistoricoEvolucao> => {
    const response = await api.get<HistoricoEvolucao>(
      `/alunos/${alunoId}/historico/latest`
    )
    return response.data
  },

  atualizar: async (
    id: string,
    data: UpdateHistoricoDTO
  ): Promise<HistoricoEvolucao> => {
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        acc[key] = value
      }
      return acc
    }, {} as any)

    if (Object.keys(cleanData).length === 0) {
      throw new Error("Nenhum campo foi enviado para atualização")
    }

    const response = await api.put<HistoricoEvolucao>(
      `/historico/${id}`,
      cleanData
    )
    return response.data
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/historico/${id}`)
  },
}
