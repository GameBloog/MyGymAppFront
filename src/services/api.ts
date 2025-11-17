import axios, { AxiosError } from "axios"
import type {
  ApiError,
  CreateUserAnswerDTO,
  HealthCheck,
  UpdateUserAnswerDTO,
  UserAnswer,
} from "../types/userAnswer"

const api = axios.create({
  baseURL: "https://unreceivable-cytophagous-emeline.ngrok-free.dev",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, //10segundos
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      const errorMessage = error.response.data.error || "Erro desconhecido"
      console.log("Erro da Api", errorMessage)

      if (error.response.data.details) {
        const details = error.response.data.details
          .map((d) => `${d.campo}: ${d.mensagem}`)
          .join(", ")
        throw new Error(`${errorMessage} - ${details}`)
      }

      throw new Error(errorMessage)
    } else if (error.request) {
      console.error("Sem resposta do servidor")
      throw new Error(
        "Servidor não respondeu. Verifique se o backend está rodando em http://localhost:3333"
      )
    } else {
      console.error("Erro ao fazer requisição:", error.message)
      throw new Error(error.message)
    }
  }
)

export const answersApi = {
  healthCheck: async (): Promise<HealthCheck> => {
    const response = await api.get<HealthCheck>("/health")
    return response.data
  },

  getAll: async (): Promise<UserAnswer[]> => {
    const response = await api.get<UserAnswer[]>("/answers")
    return response.data
  },

  getById: async (id: string): Promise<UserAnswer> => {
    const response = await api.get<UserAnswer>(`/answers/${id}`)
    return response.data
  },

  create: async (data: CreateUserAnswerDTO): Promise<UserAnswer> => {
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        // Para arrays, só inclui se tiver elementos
        if (Array.isArray(value) && value.length === 0) {
          return acc
        }
        acc[key] = value
      }
      return acc
    }, {} as any)

    const response = await api.post<UserAnswer>("/answers", cleanData)
    return response.data
  },

  update: async (
    id: string,
    data: UpdateUserAnswerDTO
  ): Promise<UserAnswer> => {
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        if (Array.isArray(value) && value.length === 0) {
          return acc
        }
        acc[key] = value
      }
      return acc
    }, {} as any)

    // Verifica se há algum campo para atualizar
    if (Object.keys(cleanData).length === 0) {
      throw new Error("Nenhum campo foi enviado para atualização")
    }

    const response = await api.put<UserAnswer>(`/answers/${id}`, cleanData)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/answers/${id}`)
  },
}

export default api
