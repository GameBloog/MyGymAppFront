import type { Exercicio, UpsertPlanoTreinoDTO } from "../../../types"

export interface TreinoModeloDiaExercicio {
  id: string
  treinoModeloDiaId: string
  exercicioId: string
  ordem: number
  series?: number | null
  repeticoes?: string | null
  cargaSugerida?: number | null
  observacoes?: string | null
  metodo?: string | null
  createdAt: string
  updatedAt: string
  exercicio: Exercicio
}

export interface TreinoModeloDia {
  id: string
  treinoModeloId: string
  titulo: string
  ordem: number
  diaSemana?: number | null
  observacoes?: string | null
  metodo?: string | null
  createdAt: string
  updatedAt: string
  exercicios: TreinoModeloDiaExercicio[]
}

export interface TreinoModelo {
  id: string
  professorId: string
  nome: string
  observacoes?: string | null
  createdAt: string
  updatedAt: string
  dias: TreinoModeloDia[]
}

export interface CreateTreinoModeloDTO {
  nome: string
  observacoes?: string
  dias: UpsertPlanoTreinoDTO["dias"]
}
