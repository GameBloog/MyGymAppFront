import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Dumbbell,
  Loader2,
  MessageSquare,
  PlayCircle,
  Save,
  Target,
} from "lucide-react"
import { Badge, Button, Card, Input, Textarea } from "../../components/ui"
import { useMyAluno } from "../../hooks/useMyAluno"
import {
  useFinalizeTreinoCheckin,
  usePlanoTreinoAtivo,
  useStartTreinoCheckin,
  useTreinoCheckins,
  useTreinoProgress,
  useTreinoTimeline,
  useUpdateTreinoExercicioCheckin,
} from "../../hooks/useTreino"
import { showToast } from "../../utils/toast"
import { formatDiaSemana, grupamentoLabels } from "../../utils/treino"
import type {
  ProgressSerieTreino,
  TimelineEventoTreino,
  TreinoCheckin,
} from "../../types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ExerciseDraft {
  concluido: boolean
  cargaReal: string
  repeticoesReal: string
  comentarioAluno: string
}

interface LatestExercisePerformance {
  cargaReal: number | null
  repeticoesReal: string | null
  data: string
}

const parseOptionalNumber = (value: string): number | undefined => {
  if (!value.trim()) {
    return undefined
  }
  const parsed = Number(value)
  if (Number.isNaN(parsed)) {
    return undefined
  }
  return parsed
}

const buildExerciseDrafts = (checkin: TreinoCheckin): Record<string, ExerciseDraft> => {
  const nextDrafts: Record<string, ExerciseDraft> = {}
  for (const exercise of checkin.exercicios) {
    nextDrafts[exercise.treinoDiaExercicioId] = {
      concluido: exercise.concluido,
      cargaReal:
        exercise.cargaReal !== null && exercise.cargaReal !== undefined
          ? String(exercise.cargaReal)
          : "",
      repeticoesReal: exercise.repeticoesReal || "",
      comentarioAluno: exercise.comentarioAluno || "",
    }
  }
  return nextDrafts
}

const timelineBadge = (
  event: TimelineEventoTreino,
): { text: string; variant: "default" | "success" | "warning" | "danger" } => {
  switch (event.tipo) {
    case "TREINO_INICIADO":
      return { text: "Início", variant: "warning" }
    case "EXERCICIO_CONCLUIDO":
      return { text: "Exercício", variant: "success" }
    case "TREINO_FINALIZADO":
      return { text: "Finalizado", variant: "success" }
    case "COMENTARIO_PROFESSOR":
      return { text: "Professor", variant: "default" }
    default:
      return { text: "Evento", variant: "default" }
  }
}

const getCompletionProgress = (checkin: TreinoCheckin | null): number => {
  if (!checkin || checkin.exercicios.length === 0) {
    return 0
  }
  const done = checkin.exercicios.filter((item) => item.concluido).length
  return Math.round((done / checkin.exercicios.length) * 100)
}

export const MeuTreinoPage: React.FC = () => {
  const { data: aluno, isLoading: loadingAluno } = useMyAluno()

  const alunoId = aluno?.id || ""

  const {
    data: planoAtivo,
    isLoading: loadingPlano,
    error: erroPlano,
  } = usePlanoTreinoAtivo(alunoId, !!alunoId)
  const {
    data: checkins,
    isLoading: loadingCheckins,
  } = useTreinoCheckins(alunoId, 20, !!alunoId)
  const { data: timeline, isLoading: loadingTimeline } = useTreinoTimeline(
    alunoId,
    80,
    !!alunoId,
  )
  const [selectedProgressExerciseId, setSelectedProgressExerciseId] = useState("")
  const {
    data: progressData,
    isLoading: loadingProgress,
  } = useTreinoProgress(
    alunoId,
    selectedProgressExerciseId || undefined,
    !!alunoId && !!selectedProgressExerciseId,
  )

  const startCheckin = useStartTreinoCheckin()
  const updateExercicioCheckin = useUpdateTreinoExercicioCheckin()
  const finalizeCheckin = useFinalizeTreinoCheckin()

  const [selectedDiaId, setSelectedDiaId] = useState("")
  const [checkinAtual, setCheckinAtual] = useState<TreinoCheckin | null>(null)
  const [exerciseDrafts, setExerciseDrafts] = useState<Record<string, ExerciseDraft>>({})
  const [comentarioDia, setComentarioDia] = useState("")
  const autofilledExerciseIdsRef = useRef<Record<string, true>>({})
  const initializedCheckinIdRef = useRef<string | null>(null)

  const erroPlanoNaoEncontrado =
    erroPlano?.message?.toLowerCase().includes("não encontrado") ||
    erroPlano?.message?.toLowerCase().includes("recurso não encontrado")

  const seriesDisponiveis = useMemo(() => {
    return progressData || []
  }, [progressData])

  const latestPerformanceByExerciseId = useMemo(() => {
    const map = new Map<string, LatestExercisePerformance>()

    for (const serie of seriesDisponiveis) {
      const fallbackPoint = serie.pontos[serie.pontos.length - 1]
      let latestPointWithLoad: ProgressSerieTreino["pontos"][number] | undefined

      for (let index = serie.pontos.length - 1; index >= 0; index -= 1) {
        const point = serie.pontos[index]

        if (point.cargaReal !== null && point.cargaReal !== undefined) {
          latestPointWithLoad = point
          break
        }
      }
      const latestPoint = latestPointWithLoad || fallbackPoint

      if (!latestPoint) {
        continue
      }

      map.set(serie.exercicioId, {
        cargaReal: latestPoint.cargaReal,
        repeticoesReal: latestPoint.repeticoesReal,
        data: latestPoint.data,
      })
    }

    return map
  }, [seriesDisponiveis])

  const ultimoComentarioProfessor = useMemo(() => {
    return [...(checkins || [])]
      .filter((item) => !!item.comentarioProfessor)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )[0]
  }, [checkins])

  const serieAtual = useMemo(() => {
    if (!seriesDisponiveis.length) {
      return undefined
    }
    if (!selectedProgressExerciseId) {
      return seriesDisponiveis[0]
    }
    return seriesDisponiveis.find(
      (serie) => serie.exercicioId === selectedProgressExerciseId,
    )
  }, [selectedProgressExerciseId, seriesDisponiveis])

  useEffect(() => {
    if (!selectedDiaId && planoAtivo?.dias?.length) {
      setSelectedDiaId(planoAtivo.dias[0].id)
    }
  }, [planoAtivo, selectedDiaId])

  useEffect(() => {
    if (!checkins || checkins.length === 0) {
      return
    }

    const openCheckin = checkins.find((item) => item.status === "INICIADO")
    if (!openCheckin) {
      return
    }

    setCheckinAtual((previous) => {
      if (previous?.id === openCheckin.id) {
        return previous
      }
      return openCheckin
    })
  }, [checkins])

  useEffect(() => {
    if (!checkinAtual) {
      setExerciseDrafts({})
      setComentarioDia("")
      autofilledExerciseIdsRef.current = {}
      initializedCheckinIdRef.current = null
      return
    }

    if (initializedCheckinIdRef.current === checkinAtual.id) {
      return
    }

    setExerciseDrafts(buildExerciseDrafts(checkinAtual))
    setComentarioDia(checkinAtual.comentarioAluno || "")
    autofilledExerciseIdsRef.current = {}
    initializedCheckinIdRef.current = checkinAtual.id
  }, [checkinAtual])

  useEffect(() => {
    if (!checkinAtual) {
      return
    }

    setExerciseDrafts((prev) => {
      let changed = false
      const nextDrafts = { ...prev }

      for (const exercise of checkinAtual.exercicios) {
        const draft = prev[exercise.treinoDiaExercicioId]
        const latestPerformance = latestPerformanceByExerciseId.get(
          exercise.exercicioId,
        )

        if (!draft || !latestPerformance) {
          continue
        }

        if (
          exercise.cargaReal !== null &&
          exercise.cargaReal !== undefined
        ) {
          continue
        }

        if (draft.cargaReal.trim()) {
          continue
        }

        if (
          latestPerformance.cargaReal === null ||
          latestPerformance.cargaReal === undefined
        ) {
          continue
        }

        if (autofilledExerciseIdsRef.current[exercise.treinoDiaExercicioId]) {
          continue
        }

        nextDrafts[exercise.treinoDiaExercicioId] = {
          ...draft,
          cargaReal: String(latestPerformance.cargaReal),
        }
        autofilledExerciseIdsRef.current[exercise.treinoDiaExercicioId] = true
        changed = true
      }

      return changed ? nextDrafts : prev
    })
  }, [checkinAtual, latestPerformanceByExerciseId])

  useEffect(() => {
    if (!selectedProgressExerciseId && seriesDisponiveis.length > 0) {
      setSelectedProgressExerciseId(seriesDisponiveis[0].exercicioId)
    }
  }, [selectedProgressExerciseId, seriesDisponiveis])

  const checkinsOrdenados = useMemo(() => {
    return [...(checkins || [])].sort(
      (a, b) =>
        new Date(b.iniciadoEm).getTime() - new Date(a.iniciadoEm).getTime(),
    )
  }, [checkins])

  const handleStartCheckin = async () => {
    if (!selectedDiaId || !alunoId) {
      showToast.error("Selecione o dia de treino")
      return
    }

    const checkin = await startCheckin.mutateAsync({
      treinoDiaId: selectedDiaId,
      alunoId,
    })
    setCheckinAtual(checkin)
    showToast.success("Treino iniciado com sucesso")
  }

  const handleExerciseDraftChange = (
    treinoDiaExercicioId: string,
    patch: Partial<ExerciseDraft>,
  ) => {
    setExerciseDrafts((prev) => ({
      ...prev,
      [treinoDiaExercicioId]: {
        ...prev[treinoDiaExercicioId],
        ...patch,
      },
    }))
  }

  const handleSaveExercise = async (treinoDiaExercicioId: string) => {
    if (!checkinAtual) {
      showToast.error("Nenhum treino iniciado")
      return
    }

    const draft = exerciseDrafts[treinoDiaExercicioId]
    if (!draft) {
      return
    }

    const updated = await updateExercicioCheckin.mutateAsync({
      checkinId: checkinAtual.id,
      treinoDiaExercicioId,
      data: {
        concluido: draft.concluido,
        cargaReal: parseOptionalNumber(draft.cargaReal),
        repeticoesReal: draft.repeticoesReal.trim() || undefined,
        comentarioAluno: draft.comentarioAluno.trim() || undefined,
      },
    })

    setCheckinAtual((prev) => {
      if (!prev) {
        return prev
      }
      return {
        ...prev,
        exercicios: prev.exercicios.map((exercise) => {
          if (exercise.treinoDiaExercicioId === treinoDiaExercicioId) {
            return updated
          }
          return exercise
        }),
      }
    })

    showToast.success("Exercício atualizado")
  }

  const handleFinalizeTreino = async () => {
    if (!checkinAtual || !alunoId) {
      return
    }

    const finalizado = await finalizeCheckin.mutateAsync({
      checkinId: checkinAtual.id,
      alunoId,
      comentarioAluno: comentarioDia.trim() || undefined,
    })
    setCheckinAtual(finalizado)
    showToast.success("Dia de treino marcado como concluído")
  }

  const progresso = getCompletionProgress(checkinAtual)

  const renderProgressGraphic = (serie: ProgressSerieTreino) => {
    const pontosComCarga = serie.pontos.filter(
      (point) => point.cargaReal !== null && point.cargaReal !== undefined,
    )

    if (pontosComCarga.length === 0) {
      return (
        <p className="text-sm text-zinc-400">
          Sem cargas registradas ainda para este exercício.
        </p>
      )
    }

    const maxCarga = Math.max(...pontosComCarga.map((point) => point.cargaReal || 0))

    return (
      <div className="space-y-3">
        {pontosComCarga.slice(-12).map((point) => {
          const percentual = maxCarga > 0 ? ((point.cargaReal || 0) / maxCarga) * 100 : 0
          return (
            <div key={`${point.data}-${point.cargaReal}`} className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-300">
                <span>
                  {format(new Date(point.data), "dd/MM/yyyy", { locale: ptBR })}
                </span>
                <span className="font-semibold">{point.cargaReal} kg</span>
              </div>
              <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${percentual}%` }}
                />
              </div>
              {point.repeticoesReal && (
                <p className="text-xs text-zinc-400">
                  Repetições: {point.repeticoesReal}
                </p>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  if (loadingAluno || loadingPlano) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-zinc-300">Carregando seu treino...</p>
      </div>
    )
  }

  if (!aluno) {
    return (
      <Card className="bg-amber-950/40 border-2 border-amber-500/30">
        <p className="text-zinc-100">
          Não foi possível localizar o perfil do aluno para carregar o treino.
        </p>
      </Card>
    )
  }

  if (erroPlano && !erroPlanoNaoEncontrado) {
    return (
      <Card className="bg-red-950/40 border-2 border-red-500/30">
        <p className="text-red-300">{erroPlano.message}</p>
      </Card>
    )
  }

  if (!planoAtivo) {
    return (
      <Card>
        <div className="text-center py-8">
          <Dumbbell className="h-12 w-12 text-zinc-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Treino ainda não configurado
          </h2>
          <p className="text-zinc-300">
            Seu professor ainda não montou seu plano de treino nesta área.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Meu Treino
        </h1>
        <p className="text-zinc-300">
          {planoAtivo.nome} • organize sua execução, cargas e comentários por dia
        </p>
      </div>

      <Card className="border border-[#49b4a6]/20 bg-[#0f1716]">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="h-5 w-5 text-[#7de0d3]" />
          <h2 className="text-lg font-semibold">Feedback em destaque</h2>
        </div>
        {ultimoComentarioProfessor ? (
          <div className="rounded-2xl border border-[#49b4a6]/30 bg-[#12302c] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7de0d3]">
              Último recado do professor
            </p>
            <p className="mt-3 text-sm leading-7 text-white">
              {ultimoComentarioProfessor.comentarioProfessor}
            </p>
            <p className="mt-3 text-xs text-zinc-300">
              {format(new Date(ultimoComentarioProfessor.updatedAt), "dd/MM/yyyy HH:mm", {
                locale: ptBR,
              })} • {ultimoComentarioProfessor.treinoDia.titulo}
            </p>
          </div>
        ) : (
          <p className="text-sm text-zinc-300">
            Quando houver um comentário do professor ele aparece aqui antes do restante do treino.
          </p>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CalendarCheck className="h-5 w-5" />
          Selecionar dia para treinar
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {planoAtivo.dias.map((dia) => (
            <button
              key={dia.id}
              onClick={() => setSelectedDiaId(dia.id)}
              className={`p-4 rounded-lg border text-left transition-colors ${
                selectedDiaId === dia.id
                  ? "border-blue-500 bg-blue-950/40"
                  : "border-zinc-700 hover:border-zinc-700"
              }`}
            >
              <p className="font-semibold text-white">{dia.titulo}</p>
              <p className="text-sm text-zinc-300">{formatDiaSemana(dia.diaSemana)}</p>
              <p className="text-xs text-zinc-400 mt-1">
                {dia.exercicios.length} exercício(s)
              </p>
            </button>
          ))}
        </div>

        <div className="mt-4">
          <Button
            icon={PlayCircle}
            onClick={handleStartCheckin}
            isLoading={startCheckin.isLoading}
            disabled={!selectedDiaId}
          >
            Iniciar treino do dia
          </Button>
        </div>
      </Card>

      {checkinAtual && (
        <Card>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">
                Sessão atual: {checkinAtual.treinoDia.titulo}
              </h2>
              <p className="text-sm text-zinc-300">
                Iniciado em{" "}
                {format(new Date(checkinAtual.iniciadoEm), "dd/MM/yyyy HH:mm", {
                  locale: ptBR,
                })}
              </p>
            </div>
            <Badge variant={checkinAtual.status === "CONCLUIDO" ? "success" : "warning"}>
              {checkinAtual.status === "CONCLUIDO" ? "Concluído" : "Em andamento"}
            </Badge>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm text-zinc-300 mb-1">
              <span>Progresso do dia</span>
              <span>{progresso}%</span>
            </div>
            <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 rounded-full transition-all"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {checkinAtual.exercicios.map((exercise) => {
              const draft = exerciseDrafts[exercise.treinoDiaExercicioId] || {
                concluido: false,
                cargaReal: "",
                repeticoesReal: "",
                comentarioAluno: "",
              }
              const latestPerformance = latestPerformanceByExerciseId.get(
                exercise.exercicioId,
              )
              const hasVisualMedia =
                !!exercise.exercicio.executionGifUrl ||
                !!exercise.exercicio.equipmentImageUrl

              return (
                <div
                  key={exercise.id}
                  className="border border-zinc-700 rounded-lg p-4 bg-zinc-900"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-semibold text-white">
                        {exercise.exercicio.nome}
                      </h3>
                      <p className="text-xs text-zinc-300">
                        {grupamentoLabels[exercise.exercicio.grupamentoMuscular]} •
                        {" "}
                        {exercise.treinoDiaExercicio.series || "-"} séries •{" "}
                        {exercise.treinoDiaExercicio.repeticoes || "-"} reps
                      </p>
                      {exercise.exercicio.descricao && (
                        <p className="text-xs text-zinc-400 mt-2 leading-6">
                          {exercise.exercicio.descricao}
                        </p>
                      )}
                    </div>
                    <label className="flex items-center gap-2 text-sm text-zinc-200">
                      <input
                        type="checkbox"
                        checked={draft.concluido}
                        onChange={(event) =>
                          handleExerciseDraftChange(exercise.treinoDiaExercicioId, {
                            concluido: event.target.checked,
                          })
                        }
                      />
                      Exercício concluído
                    </label>
                  </div>

                  {hasVisualMedia && (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 mb-4">
                      {exercise.exercicio.executionGifUrl && (
                        <div className="rounded-lg border border-zinc-700 bg-zinc-950 overflow-hidden">
                          <div className="px-3 py-2 border-b border-zinc-800">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
                              Execução
                            </p>
                          </div>
                          <img
                            src={exercise.exercicio.executionGifUrl}
                            alt={`Demonstração de ${exercise.exercicio.nome}`}
                            className="h-48 w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {exercise.exercicio.equipmentImageUrl && (
                        <div className="rounded-lg border border-zinc-700 bg-zinc-950 overflow-hidden">
                          <div className="px-3 py-2 border-b border-zinc-800">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
                              Aparelho
                            </p>
                          </div>
                          <img
                            src={exercise.exercicio.equipmentImageUrl}
                            alt={`Aparelho usado em ${exercise.exercicio.nome}`}
                            className="h-48 w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {latestPerformance && (
                    <div className="mb-4 rounded-lg border border-[#d4a548]/20 bg-[#191308] p-3">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-[#f1d38b]" />
                        <p className="text-sm font-medium text-white">
                          Referência de progressão
                        </p>
                      </div>
                      <p className="text-sm text-zinc-300 mt-2">
                        Último registro:{" "}
                        <strong className="text-white">
                          {latestPerformance.cargaReal !== null &&
                          latestPerformance.cargaReal !== undefined
                            ? `${latestPerformance.cargaReal} kg`
                            : "sem carga registrada"}
                        </strong>
                        {latestPerformance.repeticoesReal
                          ? ` • ${latestPerformance.repeticoesReal}`
                          : ""}
                        {" • "}
                        {format(new Date(latestPerformance.data), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                      <p className="text-xs text-zinc-400 mt-2">
                        Quando houver histórico, a última carga aparece como ponto de partida e pode ser ajustada livremente.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      label="Carga realizada (kg)"
                      type="number"
                      step="0.5"
                      min="0"
                      value={draft.cargaReal}
                      onChange={(event) =>
                        handleExerciseDraftChange(exercise.treinoDiaExercicioId, {
                          cargaReal: event.target.value,
                        })
                      }
                      placeholder={
                        latestPerformance?.cargaReal !== null &&
                        latestPerformance?.cargaReal !== undefined
                          ? `Última carga: ${latestPerformance.cargaReal} kg`
                          : exercise.treinoDiaExercicio.cargaSugerida
                            ? `Sugestão: ${exercise.treinoDiaExercicio.cargaSugerida}`
                            : "Ex: 40"
                      }
                    />
                    <Input
                      label="Repetições realizadas"
                      value={draft.repeticoesReal}
                      onChange={(event) =>
                        handleExerciseDraftChange(exercise.treinoDiaExercicioId, {
                          repeticoesReal: event.target.value,
                        })
                      }
                      placeholder="Ex: 10, 9, 8"
                    />
                  </div>

                  <Textarea
                    label="Comentário no exercício"
                    rows={2}
                    value={draft.comentarioAluno}
                    onChange={(event) =>
                      handleExerciseDraftChange(exercise.treinoDiaExercicioId, {
                        comentarioAluno: event.target.value,
                      })
                    }
                    placeholder="Como se sentiu, dor, ajuste de técnica..."
                  />

                  <Button
                    variant="secondary"
                    icon={Save}
                    onClick={() => handleSaveExercise(exercise.treinoDiaExercicioId)}
                    isLoading={updateExercicioCheckin.isLoading}
                  >
                    Salvar exercício
                  </Button>
                </div>
              )
            })}
          </div>

          <div className="mt-4">
            <Textarea
              label="Comentário geral do dia"
              rows={3}
              value={comentarioDia}
              onChange={(event) => setComentarioDia(event.target.value)}
              placeholder="Anote como foi o treino de hoje"
            />
            <Button
              icon={CheckCircle2}
              onClick={handleFinalizeTreino}
              isLoading={finalizeCheckin.isLoading}
              disabled={checkinAtual.status === "CONCLUIDO"}
            >
              {checkinAtual.status === "CONCLUIDO"
                ? "Treino já finalizado"
                : "Finalizar dia de treino"}
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Progressão de carga</h2>
        </div>

        {loadingProgress && (
          <div className="flex items-center gap-2 text-zinc-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando progressão...
          </div>
        )}

        {!loadingProgress && seriesDisponiveis.length === 0 && (
          <p className="text-sm text-zinc-400">
            Finalize treinos e registre cargas para visualizar sua evolução.
          </p>
        )}

        {seriesDisponiveis.length > 0 && (
          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <p className="text-sm text-zinc-300">
                Use esta visão para comparar sua execução recente e progredir com mais critério, não no escuro.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-200 mb-1">
                Exercício
              </label>
              <select
                value={selectedProgressExerciseId}
                onChange={(event) => setSelectedProgressExerciseId(event.target.value)}
                className="w-full md:w-auto px-3 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-300 focus:border-transparent"
              >
                {seriesDisponiveis.map((serie) => (
                  <option key={serie.exercicioId} value={serie.exercicioId}>
                    {serie.exercicioNome}
                  </option>
                ))}
              </select>
            </div>

            {serieAtual && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{serieAtual.exercicioNome}</Badge>
                  <Badge variant="warning">
                    {grupamentoLabels[serieAtual.grupamentoMuscular]}
                  </Badge>
                  <Badge variant="success">
                    {serieAtual.pontos.length} registro(s)
                  </Badge>
                </div>
                {renderProgressGraphic(serieAtual)}
              </div>
            )}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Timeline de atividades</h2>
        </div>

        {loadingTimeline && (
          <div className="flex items-center gap-2 text-zinc-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando timeline...
          </div>
        )}

        {!loadingTimeline && !timeline?.length && (
          <p className="text-sm text-zinc-400">Nenhuma atividade registrada ainda.</p>
        )}

        <div className="space-y-3">
          {(timeline || []).map((event) => {
            const badge = timelineBadge(event)
            return (
              <div
                key={event.id}
                className="border border-zinc-700 rounded-lg p-3 bg-zinc-900"
              >
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge variant={badge.variant}>{badge.text}</Badge>
                  <span className="text-xs text-zinc-400">
                    {format(new Date(event.dataHora), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
                <p className="text-sm text-zinc-200">{event.descricao}</p>
                <p className="text-xs text-zinc-300 mt-1">{event.treinoDiaTitulo}</p>
                {event.exercicioNome && (
                  <p className="text-xs text-zinc-300">
                    Exercício: {event.exercicioNome}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Histórico de check-ins</h2>
        </div>

        {loadingCheckins && (
          <div className="flex items-center gap-2 text-zinc-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando histórico...
          </div>
        )}

        {!loadingCheckins && checkinsOrdenados.length === 0 && (
          <p className="text-sm text-zinc-400">Nenhum check-in encontrado.</p>
        )}

        <div className="space-y-3">
          {checkinsOrdenados.map((checkin) => (
            <div
              key={checkin.id}
              className="border border-zinc-700 rounded-lg p-3 bg-zinc-900"
            >
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge variant={checkin.status === "CONCLUIDO" ? "success" : "warning"}>
                  {checkin.status === "CONCLUIDO" ? "Concluído" : "Em andamento"}
                </Badge>
                <Badge>{checkin.treinoDia.titulo}</Badge>
                <span className="text-xs text-zinc-400">
                  {format(new Date(checkin.iniciadoEm), "dd/MM/yyyy HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </div>
              <p className="text-sm text-zinc-200">
                Exercícios concluídos:{" "}
                {checkin.exercicios.filter((exercise) => exercise.concluido).length}/
                {checkin.exercicios.length}
              </p>
              {checkin.comentarioProfessor && (
                <p className="text-sm text-zinc-100 mt-2">
                  <strong>Feedback do professor:</strong>{" "}
                  {checkin.comentarioProfessor}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
