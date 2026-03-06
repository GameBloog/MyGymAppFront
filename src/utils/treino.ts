import type { GrupamentoMuscular } from "../types"

export const grupamentoLabels: Record<GrupamentoMuscular, string> = {
  PEITO: "Peito",
  COSTAS: "Costas",
  PERNAS: "Pernas",
  OMBRO: "Ombro",
  BICEPS: "Bíceps",
  TRICEPS: "Tríceps",
  ABDOMEN: "Abdômen",
  GLUTEOS: "Glúteos",
  CARDIO: "Cardio",
  OUTRO: "Outro",
}

export const diasSemanaOptions = [
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
]

export const formatDiaSemana = (diaSemana?: number | null): string => {
  if (!diaSemana) {
    return "Dia livre"
  }

  const found = diasSemanaOptions.find((item) => item.value === diaSemana)
  return found?.label ?? "Dia livre"
}
