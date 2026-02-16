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

let isRedirecting = false

const clearAuth = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

const redirectToLogin = () => {
  if (isRedirecting) return
  isRedirecting = true

  clearAuth()

  const currentPath = window.location.pathname
  if (!currentPath.includes("/login") && !currentPath.includes("/register")) {
    window.location.href = "/login"
  }

  setTimeout(() => {
    isRedirecting = false
  }, 1000)
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error("❌ Request Error:", error)
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    console.error("❌ API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    })

    if (!error.response) {
      return Promise.reject(
        new Error("Servidor não respondeu. Verifique sua conexão."),
      )
    }

    const status = error.response.status
    const errorMessage = error.response.data?.error || "Erro desconhecido"

    if (status === 401) {
      console.log("🔒 Token inválido/expirado - redirecionando para login")
      redirectToLogin()
      return Promise.reject(new Error("Sessão expirada. Faça login novamente."))
    }

    if (status === 403) {
      return Promise.reject(
        new Error("Você não tem permissão para acessar este recurso"),
      )
    }

    if (status === 404) {
      return Promise.reject(new Error("Recurso não encontrado"))
    }

    if (error.response.data?.details) {
      const details = error.response.data.details
        .map((d) => `${d.campo}: ${d.mensagem}`)
        .join(", ")
      return Promise.reject(new Error(`${errorMessage} - ${details}`))
    }

    return Promise.reject(new Error(errorMessage))
  },
)

export const authApi = {
  login: async (data: LoginDTO): Promise<LoginResponse> => {
    try {
      const normalizedData = {
        ...data,
        email: data.email.toLowerCase().trim(),
      }

      const response = await api.post<LoginResponse>(
        "/auth/login",
        normalizedData,
      )
      return response.data
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("401")) {
          throw new Error("Email ou senha incorretos")
        }
        if (error.message.includes("404")) {
          throw new Error("Usuário não encontrado")
        }
        throw error
      }
      throw new Error("Erro ao fazer login")
    }
  },

  register: async (data: RegisterDTO): Promise<void> => {
    try {
      const normalizedData = {
        ...data,
        email: data.email.toLowerCase().trim(),
      }

      await api.post("/auth/register", normalizedData)
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes("409") ||
          error.message.includes("já existe")
        ) {
          throw new Error("Este email já está cadastrado")
        }
        if (error.message.includes("código de convite")) {
          throw new Error("Código de convite inválido ou expirado")
        }
        throw error
      }
      throw new Error("Erro ao criar conta")
    }
  },

  me: async (): Promise<User> => {
    const response = await api.get<User>("/auth/me")
    return response.data
  },

  checkToken: async (): Promise<boolean> => {
    try {
      await api.get("/auth/me")
      return true
    } catch (error) {
      console.log(error)
      return false
    }
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
    data: Partial<CreateProfessorDTO>,
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
    const cleanData = Object.entries(data).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
          if (Array.isArray(value) && value.length === 0) {
            return acc
          }
          acc[key] = value
        }
        return acc
      },
      {} as Record<string, unknown>,
    )

    const response = await api.post<Aluno>("/alunos", cleanData)
    return response.data
  },

  update: async (id: string, data: UpdateAlunoDTO): Promise<Aluno> => {
    const cleanData = Object.entries(data).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
          if (Array.isArray(value) && value.length === 0) {
            return acc
          }
          acc[key] = value
        }
        return acc
      },
      {} as Record<string, unknown>,
    )

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
