import axios, { AxiosError } from "axios"
import {
  type User,
  type LoginDTO,
  type LoginResponse,
  type RegisterDTO,
  type InviteCode,
  type CreateInviteCodeDTO,
  type Professor,
  type Aluno,
  type CreateAlunoDTO,
  type UpdateAlunoDTO,
  type ApiError,
} from "../types"

const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      const errorMessage = error.response.data.error || "Erro desconhecido"

      if (error.response.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
      }

      if (error.response.data.details) {
        const details = error.response.data.details
          .map((d) => `${d.campo}: ${d.mensagem}`)
          .join(", ")
        throw new Error(`${errorMessage} - ${details}`)
      }

      throw new Error(errorMessage)
    } else if (error.request) {
      throw new Error("Servidor não respondeu. Verifique sua conexão.")
    } else {
      throw new Error(error.message)
    }
  }
)

export const authApi = {
  login: async (data: LoginDTO): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", data)
    return response.data
  },

  register: async (data: RegisterDTO): Promise<void> => {
    await api.post("/auth/register", data)
  },

  me: async (): Promise<User> => {
    const response = await api.get<User>("/auth/me")
    return response.data
  },
}

export const inviteCodesApi = {
  create: async (data: CreateInviteCodeDTO): Promise<InviteCode> => {
    const response = await api.post<InviteCode>("/auth/invite-codes", data)
    return response.data
  },

  getAll: async (): Promise<InviteCode[]> => {
    const response = await api.get<InviteCode[]>("/auth/invite-codes")
    return response.data
  },
}

export const professoresApi = {
  getAll: async (): Promise<Professor[]> => {
    const response = await api.get<Professor[]>("/professores")
    return response.data
  },

  getById: async (id: string): Promise<Professor> => {
    const response = await api.get<Professor>(`/professores/${id}`)
    return response.data
  },
}

export const alunosApi = {
  getAll: async (): Promise<Aluno[]> => {
    const response = await api.get<Aluno[]>("/alunos")
    return response.data
  },

  getById: async (id: string): Promise<Aluno> => {
    const response = await api.get<Aluno>(`/alunos/${id}`)
    return response.data
  },

  create: async (data: CreateAlunoDTO): Promise<Aluno> => {
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        if (Array.isArray(value) && value.length === 0) {
          return acc
        }
        acc[key] = value
      }
      return acc
    }, {} as any)

    const response = await api.post<Aluno>("/alunos", cleanData)
    return response.data
  },

  update: async (id: string, data: UpdateAlunoDTO): Promise<Aluno> => {
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        if (Array.isArray(value) && value.length === 0) {
          return acc
        }
        acc[key] = value
      }
      return acc
    }, {} as any)

    if (Object.keys(cleanData).length === 0) {
      throw new Error("Nenhum campo foi enviado para atualização")
    }

    const response = await api.put<Aluno>(`/alunos/${id}`, cleanData)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/alunos/${id}`)
  },
}

export default api
