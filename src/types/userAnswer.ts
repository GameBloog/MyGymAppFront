export interface UserAnswer {
  id: string
  createdAt: string
  nome: string
  email: string
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
}

export interface CreateUserAnswerDTO {
  nome: string
  email: string
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
  dores_articulares?: string
  suplementos_consumidos?: string[]
  dias_treino_semana?: number
  frequencia_horarios_refeicoes?: string
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateUserAnswerDTO extends Partial<CreateUserAnswerDTO> {}

export interface ApiError {
  error: string
  details?: Array<{
    campo: string
    mensagem: string
  }>
}

export interface HealthCheck {
  status: string
  timestamp: string
}
