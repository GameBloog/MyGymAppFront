import { api } from "../../../services/api"
import type { CreateTreinoModeloDTO, TreinoModelo } from "../types"

export const treinoModelosApi = {
  create: async (data: CreateTreinoModeloDTO): Promise<TreinoModelo> => {
    const response = await api.post<TreinoModelo>("/treinos/moldes", data)
    return response.data
  },

  list: async (): Promise<TreinoModelo[]> => {
    const response = await api.get<TreinoModelo[]>("/treinos/moldes")
    return response.data
  },
}
