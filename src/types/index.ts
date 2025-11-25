export type UserRole = "ADMIN" | "PROFESSOR" | "ALUNO"

export interface User {
  id: string
  nome: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface LoginDTO {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterDTO {
  nome: string
  email: string
  password: string
  role?: UserRole
  inviteCode?: string
  telefone?: string
  especialidade?: string
}

export interface InviteCode {
  id: string
  code: string
  role: UserRole
  usedBy: string | null
  usedAt: string | null
  expiresAt: string | null
  createdBy: string
  createdAt: string
}

export interface CreateInviteCodeDTO {
  role: "PROFESSOR" | "ADMIN"
  expiresInDays?: number
}

export interface Professor {
  id: string
  userId: string
  telefone?: string | null
  especialidade?: string | null
  createdAt: string
  updatedAt: string
  user?: User
}

// ========== ALUNO TYPES ==========
export interface Aluno {
  id: string
  userId: string
  professorId: string
  telefone?: string | null
  alturaCm?: number | null
  pesoKg?: number | null
  idade?: number | null
  cinturaCm?: number | null
  quadrilCm?: number | null
  pescocoCm?: number | null
  alimentos_quer_diario?: string[] | null
  alimentos_nao_comem?: string[] | null
  alergias_alimentares?: string[] | null
  dores_articulares?: string | null
  suplementos_consumidos?: string[] | null
  dias_treino_semana?: number | null
  frequencia_horarios_refeicoes?: string | null
  createdAt: string
  updatedAt: string
  user?: User
  professor?: Professor
}

export interface CreateAlunoDTO {
  nome: string
  email: string
  password: string

  professorId: string

  telefone?: string
  alturaCm?: number
  pesoKg?: number
  idade?: number
  cinturaCm?: number
  quadrilCm?: number
  pescocoCm?: number

  alimentos_quer_diario?: string[]
  alimentos_nao_comem?: string[]
  alergias_alimentares?: string[]
  suplementos_consumidos?: string[]

  dores_articulares?: string
  dias_treino_semana?: number
  frequencia_horarios_refeicoes?: string
}

export interface UpdateAlunoDTO {
  telefone?: string
  alturaCm?: number
  pesoKg?: number
  idade?: number
  cinturaCm?: number
  quadrilCm?: number
  pescocoCm?: number
  alimentos_quer_diario?: string[]
  alimentos_nao_comem?: string[]
  alergias_alimentares?: string[]
  suplementos_consumidos?: string[]
  dores_articulares?: string
  dias_treino_semana?: number
  frequencia_horarios_refeicoes?: string
}

export interface ApiError {
  error: string
  details?: Array<{
    campo: string
    mensagem: string
  }>
}
