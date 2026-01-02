import axios, { AxiosError } from "axios"
import {
  type User,
  type LoginDTO,
  type LoginResponse,
  type RegisterDTO,
  type InviteCode,
  type CreateInviteCodeDTO,
  type Professor,
  type CreateProfessorDTO,
  type Aluno,
  type CreateAlunoDTO,
  type UpdateAlunoDTO,
  type ApiError,
} from "../types"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
  (response) => {
    return response
  },
  (error: AxiosError<ApiError>) => {
    console.error("❌ API Error:", error.response?.data || error.message)

    if (error.response) {
      const status = error.response.status 
      const errorMessage = error.response.data?.error || "Erro desconhecido"

      if (status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")

        const currentPath = window.location.pathname
        if (
          !currentPath.includes("/login") &&
          !currentPath.includes("/register")
        ) {
          window.location.href = "/login"
        }

        throw new Error("Sessão expirada. Faça login novamente.")
      }

      if (status === 404) {
        throw new Error("Recurso não encontrado")
      }

      if (status === 403) {
        throw new Error("Você não tem permissão para acessar este recurso")
      }

      if (error.response.data?.details) {
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
    const normalizedData = {
      ...data,
      email: data.email.toLowerCase().trim(),
    }

    const response = await api.post<LoginResponse>(
      "/auth/login",
      normalizedData
    )
    return response.data
  },

  register: async (data: RegisterDTO): Promise<void> => {
    const normalizedData = {
      ...data,
      email: data.email.toLowerCase().trim(),
    }

    await api.post("/auth/register", normalizedData)
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

  create: async (data: CreateProfessorDTO): Promise<Professor> => {
    const response = await api.post<Professor>("/professores", data)
    return response.data
  },

  update: async (
    id: string,
    data: Partial<CreateProfessorDTO>
  ): Promise<Professor> => {
    const response = await api.put<Professor>(`/professores/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/professores/${id}`)
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
