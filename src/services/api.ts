import axios, { AxiosError } from "axios"
import {
  type User,
  type LoginDTO,
  type LoginResponse,
  type RegisterDTO,
  type InviteCode,
  type CreateInviteCodeDTO,
  type LeadLink,
  type CreateLeadLinkDTO,
  type UpdateLeadLinkDTO,
  type TrackLeadClickDTO,
  type LeadLinksListResponse,
  type LeadAnalytics,
  type Professor,
  type CreateProfessorDTO,
  type Aluno,
  type CreateAlunoDTO,
  type UpdateAlunoDTO,
  type UpdateAlunoStatusDTO,
  type ApiError,
  type UserAnswer,
  type CreateUserAnswerDTO,
  type UpdateUserAnswerDTO,
  type YoutubeLatestContentResponse,
  type FinanceDashboardResponse,
  type FinanceRenewal,
  type CreateFinanceRenewalDTO,
  type UpdateFinanceRenewalDTO,
  type FinanceEntry,
  type CreateFinanceEntryDTO,
  type UpdateFinanceEntryDTO,
  type FinanceEntryType,
  type FinanceMonthState,
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

const redirectToPublicEntry = () => {
  if (isRedirecting) return
  isRedirecting = true

  clearAuth()

  const currentPath = window.location.pathname
  if (
    !currentPath.includes("/landing") &&
    !currentPath.includes("/login") &&
    !currentPath.includes("/register")
  ) {
    window.location.href = "/landing"
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
      console.log("🔒 Token inválido/expirado - redirecionando para landing")
      redirectToPublicEntry()
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

export const leadLinksApi = {
  create: async (data: CreateLeadLinkDTO): Promise<LeadLink> => {
    const response = await api.post<LeadLink>("/lead-links", data)
    return response.data
  },

  getAll: async (range = 30): Promise<LeadLinksListResponse> => {
    const response = await api.get<LeadLinksListResponse>(
      `/lead-links?range=${range}`,
    )
    return response.data
  },

  update: async (id: string, data: UpdateLeadLinkDTO): Promise<LeadLink> => {
    const response = await api.patch<LeadLink>(`/lead-links/${id}`, data)
    return response.data
  },

  getAnalytics: async (range = 30): Promise<LeadAnalytics> => {
    const response = await api.get<LeadAnalytics>(
      `/lead-links/analytics?range=${range}`,
    )
    return response.data
  },

  trackClick: async (
    data: TrackLeadClickDTO,
  ): Promise<{ tracked: boolean }> => {
    const response = await api.post<{ tracked: boolean }>("/lead-links/click", data)
    return response.data
  },
}

export const contentApi = {
  getLatestYoutubeVideo: async (): Promise<YoutubeLatestContentResponse> => {
    const response = await api.get<YoutubeLatestContentResponse>(
      "/content/youtube/latest",
    )
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

export const answersApi = {
  getAll: async (): Promise<UserAnswer[]> => {
    const response = await api.get<UserAnswer[]>("/answers")
    return response.data
  },

  getById: async (id: string): Promise<UserAnswer> => {
    const response = await api.get<UserAnswer>(`/answers/${id}`)
    return response.data
  },

  create: async (data: CreateUserAnswerDTO): Promise<UserAnswer> => {
    const response = await api.post<UserAnswer>("/answers", data)
    return response.data
  },

  update: async (id: string, data: UpdateUserAnswerDTO): Promise<UserAnswer> => {
    const response = await api.put<UserAnswer>(`/answers/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/answers/${id}`)
  },

  healthCheck: async (): Promise<{ status: string }> => {
    const response = await api.get<{ status: string }>("/health")
    return response.data
  },
}

export const alunosApi = {
  getAll: async (): Promise<Aluno[]> => {
    const response = await api.get<Aluno[]>("/alunos")
    return response.data
  },

  getMe: async (): Promise<Aluno> => {
    const response = await api.get<Aluno>("/alunos/me")
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

  updateStatus: async (
    id: string,
    data: UpdateAlunoStatusDTO,
  ): Promise<Aluno> => {
    const response = await api.patch<Aluno>(`/alunos/${id}/status`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/alunos/${id}`)
  },
}

export const financeApi = {
  getDashboard: async (
    from?: string,
    to?: string,
  ): Promise<FinanceDashboardResponse> => {
    const params = new URLSearchParams()

    if (from) {
      params.set("from", from)
    }
    if (to) {
      params.set("to", to)
    }

    const query = params.toString()
    const path = query ? `/finance/dashboard?${query}` : "/finance/dashboard"
    const response = await api.get<FinanceDashboardResponse>(path)
    return response.data
  },

  getRenewals: async (month: string): Promise<FinanceRenewal[]> => {
    const response = await api.get<FinanceRenewal[]>(
      `/finance/renewals?month=${month}`,
    )
    return response.data
  },

  createRenewal: async (data: CreateFinanceRenewalDTO): Promise<FinanceRenewal> => {
    const response = await api.post<FinanceRenewal>("/finance/renewals", data)
    return response.data
  },

  updateRenewal: async (
    id: string,
    data: UpdateFinanceRenewalDTO,
  ): Promise<FinanceRenewal> => {
    const response = await api.patch<FinanceRenewal>(`/finance/renewals/${id}`, data)
    return response.data
  },

  deleteRenewal: async (id: string): Promise<void> => {
    await api.delete(`/finance/renewals/${id}`)
  },

  getEntries: async (month: string, type?: FinanceEntryType): Promise<FinanceEntry[]> => {
    const path = type
      ? `/finance/entries?month=${month}&type=${type}`
      : `/finance/entries?month=${month}`
    const response = await api.get<FinanceEntry[]>(path)
    return response.data
  },

  createEntry: async (data: CreateFinanceEntryDTO): Promise<FinanceEntry> => {
    const response = await api.post<FinanceEntry>("/finance/entries", data)
    return response.data
  },

  updateEntry: async (id: string, data: UpdateFinanceEntryDTO): Promise<FinanceEntry> => {
    const response = await api.patch<FinanceEntry>(`/finance/entries/${id}`, data)
    return response.data
  },

  deleteEntry: async (id: string): Promise<void> => {
    await api.delete(`/finance/entries/${id}`)
  },

  closeMonth: async (month: string): Promise<FinanceMonthState> => {
    const response = await api.patch<FinanceMonthState>(`/finance/months/${month}/close`)
    return response.data
  },

  reopenMonth: async (month: string): Promise<FinanceMonthState> => {
    const response = await api.patch<FinanceMonthState>(`/finance/months/${month}/reopen`)
    return response.data
  },
}

export default api
