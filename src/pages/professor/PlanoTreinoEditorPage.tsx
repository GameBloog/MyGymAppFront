import React, { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  ClipboardList,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react"
import { Badge, Button, Card, Input, Textarea } from "../../components/ui"
import { useAluno } from "../../hooks/useAlunos"
import {
  useComentarCheckinProfessor,
  useCreateExercicio,
  useExercicios,
  useExerciciosExternos,
  useGrupamentosExercicios,
  useImportExercicioExterno,
  usePlanoTreinoAtivo,
  useTreinoCheckins,
  useUpsertPlanoTreino,
} from "../../hooks/useTreino"
import { showToast } from "../../utils/toast"
import { diasSemanaOptions, formatDiaSemana, grupamentoLabels } from "../../utils/treino"
import { useAuth } from "../../hooks/useAuth"
import type {
  Exercicio,
  ExercicioExterno,
  GrupamentoMuscular,
  TreinoCheckin,
  UpsertPlanoTreinoDTO,
} from "../../types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

type PlanoDiaPayload = UpsertPlanoTreinoDTO["dias"][number]
type PlanoDiaExercicioPayload = PlanoDiaPayload["exercicios"][number]

type DraftExercise = PlanoDiaExercicioPayload & {
  localId: string
  exercicio: Exercicio
}

type DraftDay = Omit<PlanoDiaPayload, "exercicios"> & {
  localId: string
  observacoes?: string
  metodo?: string
  exercicios: DraftExercise[]
}

interface DragItem {
  sourceDayId: string
  sourceExerciseId: string
}

interface CustomExerciseForm {
  nome: string
  descricao: string
  grupamentoMuscular: GrupamentoMuscular
}

const createLocalId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const getBackRoute = (isAdmin: boolean) => {
  if (isAdmin) {
    return "/admin/alunos"
  }
  return "/professor/dashboard"
}

const mapCheckinStatus = (checkin: TreinoCheckin) => {
  if (checkin.status === "CONCLUIDO") {
    return { text: "Concluído", variant: "success" as const }
  }
  return { text: "Em andamento", variant: "warning" as const }
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

const parseOptionalInt = (value: string): number | undefined => {
  const parsed = parseOptionalNumber(value)
  if (parsed === undefined) {
    return undefined
  }
  return Math.trunc(parsed)
}

export const PlanoTreinoEditorPage: React.FC = () => {
  const navigate = useNavigate()
  const { id: alunoId } = useParams<{ id: string }>()
  const { user } = useAuth()
  const isAdmin = user?.role === "ADMIN"

  const [nomePlano, setNomePlano] = useState("")
  const [observacoesPlano, setObservacoesPlano] = useState("")
  const [dias, setDias] = useState<DraftDay[]>([])
  const [selectedDayId, setSelectedDayId] = useState<string>("")
  const [dragging, setDragging] = useState<DragItem | null>(null)
  const [customExercise, setCustomExercise] = useState<CustomExerciseForm>({
    nome: "",
    descricao: "",
    grupamentoMuscular: "PEITO",
  })
  const [filtroExercicio, setFiltroExercicio] = useState("")
  const [filtroGrupamento, setFiltroGrupamento] = useState<GrupamentoMuscular | "">("")
  const [buscaExterna, setBuscaExterna] = useState("")
  const [comentariosProfessor, setComentariosProfessor] = useState<Record<string, string>>({})
  const [initializedFromBackend, setInitializedFromBackend] = useState(false)

  const { data: aluno, isLoading: loadingAluno } = useAluno(alunoId || "", {
    enabled: !!alunoId,
  })
  const {
    data: planoAtivo,
    isLoading: loadingPlanoAtivo,
    error: erroPlanoAtivo,
  } = usePlanoTreinoAtivo(alunoId || "", !!alunoId)
  const { data: exercicios, isLoading: loadingExercicios } = useExercicios({
    q: filtroExercicio || undefined,
    grupamento: filtroGrupamento || undefined,
  })
  const { data: grupamentos } = useGrupamentosExercicios()
  const { data: exerciciosExternos, isFetching: loadingExerciciosExternos } =
    useExerciciosExternos({
      q: buscaExterna,
      limit: 20,
      enabled: buscaExterna.trim().length >= 2,
    })
  const { data: checkins, isLoading: loadingCheckins } = useTreinoCheckins(
    alunoId || "",
    15,
    !!alunoId,
  )

  const upsertPlano = useUpsertPlanoTreino()
  const createExercicio = useCreateExercicio()
  const importExercicioExterno = useImportExercicioExterno()
  const comentarCheckinProfessor = useComentarCheckinProfessor()

  const erroPlanoNaoEncontrado =
    erroPlanoAtivo?.message?.toLowerCase().includes("não encontrado") ||
    erroPlanoAtivo?.message?.toLowerCase().includes("recurso não encontrado")

  const checkinsOrdenados = useMemo(() => {
    return [...(checkins || [])].sort(
      (a, b) =>
        new Date(b.iniciadoEm).getTime() - new Date(a.iniciadoEm).getTime(),
    )
  }, [checkins])

  useEffect(() => {
    if (initializedFromBackend || loadingPlanoAtivo) {
      return
    }

    if (planoAtivo) {
      setNomePlano(planoAtivo.nome)
      setObservacoesPlano(planoAtivo.observacoes || "")
      const diasMapeados: DraftDay[] = planoAtivo.dias
        .sort((a, b) => a.ordem - b.ordem)
        .map((dia, dayIndex) => ({
          localId: createLocalId(),
          titulo: dia.titulo,
          ordem: dayIndex + 1,
          diaSemana: dia.diaSemana || undefined,
          observacoes: dia.observacoes || "",
          metodo: dia.metodo || "",
          exercicios: dia.exercicios
            .sort((a, b) => a.ordem - b.ordem)
            .map((item, itemIndex) => ({
              localId: createLocalId(),
              exercicioId: item.exercicioId,
              ordem: itemIndex + 1,
              series: item.series || undefined,
              repeticoes: item.repeticoes || undefined,
              cargaSugerida: item.cargaSugerida || undefined,
              observacoes: item.observacoes || undefined,
              metodo: item.metodo || undefined,
              exercicio: item.exercicio,
            })),
        }))
      setDias(diasMapeados)
      if (diasMapeados.length > 0) {
        setSelectedDayId(diasMapeados[0].localId)
      }
      setInitializedFromBackend(true)
      return
    }

    if (erroPlanoAtivo && !erroPlanoNaoEncontrado) {
      return
    }

    if (!planoAtivo) {
      const diaInicial: DraftDay = {
        localId: createLocalId(),
        titulo: "Treino A",
        ordem: 1,
        diaSemana: 1,
        observacoes: "",
        metodo: "",
        exercicios: [],
      }
      setDias([diaInicial])
      setSelectedDayId(diaInicial.localId)
      setNomePlano("Plano de Treino")
      setInitializedFromBackend(true)
    }
  }, [
    erroPlanoAtivo,
    erroPlanoNaoEncontrado,
    initializedFromBackend,
    loadingPlanoAtivo,
    planoAtivo,
  ])

  const addDay = () => {
    const novoDia: DraftDay = {
      localId: createLocalId(),
      titulo: `Treino ${String.fromCharCode(65 + dias.length)}`,
      ordem: dias.length + 1,
      diaSemana: undefined,
      observacoes: "",
      metodo: "",
      exercicios: [],
    }
    setDias((prev) => [...prev, novoDia])
    setSelectedDayId(novoDia.localId)
  }

  const removeDay = (dayId: string) => {
    if (dias.length === 1) {
      showToast.error("O plano precisa ter pelo menos um dia de treino")
      return
    }

    setDias((prev) =>
      prev
        .filter((day) => day.localId !== dayId)
        .map((day, index) => ({
          ...day,
          ordem: index + 1,
        })),
    )

    if (selectedDayId === dayId) {
      const nextDay = dias.find((day) => day.localId !== dayId)
      if (nextDay) {
        setSelectedDayId(nextDay.localId)
      }
    }
  }

  const updateDay = (dayId: string, patch: Partial<DraftDay>) => {
    setDias((prev) =>
      prev.map((day) => {
        if (day.localId !== dayId) {
          return day
        }
        return {
          ...day,
          ...patch,
        }
      }),
    )
  }

  const addExerciseToDay = (dayId: string, exercicio: Exercicio) => {
    setDias((prev) =>
      prev.map((day) => {
        if (day.localId !== dayId) {
          return day
        }

        const nextOrder = day.exercicios.length + 1
        const novoItem: DraftExercise = {
          localId: createLocalId(),
          exercicioId: exercicio.id,
          ordem: nextOrder,
          series: undefined,
          repeticoes: undefined,
          cargaSugerida: undefined,
          observacoes: "",
          metodo: "",
          exercicio,
        }

        return {
          ...day,
          exercicios: [...day.exercicios, novoItem],
        }
      }),
    )
  }

  const removeExercise = (dayId: string, localExerciseId: string) => {
    setDias((prev) =>
      prev.map((day) => {
        if (day.localId !== dayId) {
          return day
        }

        return {
          ...day,
          exercicios: day.exercicios
            .filter((item) => item.localId !== localExerciseId)
            .map((item, index) => ({
              ...item,
              ordem: index + 1,
            })),
        }
      }),
    )
  }

  const updateExercise = (
    dayId: string,
    localExerciseId: string,
    patch: Partial<DraftExercise>,
  ) => {
    setDias((prev) =>
      prev.map((day) => {
        if (day.localId !== dayId) {
          return day
        }
        return {
          ...day,
          exercicios: day.exercicios.map((item) => {
            if (item.localId !== localExerciseId) {
              return item
            }
            return {
              ...item,
              ...patch,
            }
          }),
        }
      }),
    )
  }

  const handleDropExercise = (targetDayId: string, targetIndex: number) => {
    if (!dragging) {
      return
    }

    setDias((prev) => {
      const sourceDay = prev.find((day) => day.localId === dragging.sourceDayId)
      if (!sourceDay) {
        return prev
      }
      const movingExercise = sourceDay.exercicios.find(
        (item) => item.localId === dragging.sourceExerciseId,
      )
      if (!movingExercise) {
        return prev
      }

      return prev.map((day) => {
        if (day.localId === dragging.sourceDayId && day.localId !== targetDayId) {
          const filtered = day.exercicios
            .filter((item) => item.localId !== dragging.sourceExerciseId)
            .map((item, index) => ({
              ...item,
              ordem: index + 1,
            }))
          return {
            ...day,
            exercicios: filtered,
          }
        }

        if (day.localId === targetDayId) {
          let baseItems = day.exercicios.filter(
            (item) => item.localId !== dragging.sourceExerciseId,
          )
          const safeIndex = Math.max(0, Math.min(targetIndex, baseItems.length))
          baseItems = [
            ...baseItems.slice(0, safeIndex),
            movingExercise,
            ...baseItems.slice(safeIndex),
          ]
          return {
            ...day,
            exercicios: baseItems.map((item, index) => ({
              ...item,
              ordem: index + 1,
            })),
          }
        }

        if (day.localId === dragging.sourceDayId) {
          const filtered = day.exercicios
            .filter((item) => item.localId !== dragging.sourceExerciseId)
            .map((item, index) => ({
              ...item,
              ordem: index + 1,
            }))
          return {
            ...day,
            exercicios: filtered,
          }
        }

        return day
      })
    })

    setDragging(null)
  }

  const selectedDay = dias.find((day) => day.localId === selectedDayId)

  const ensureDaySelection = () => {
    if (selectedDayId) {
      return selectedDayId
    }

    if (dias.length > 0) {
      setSelectedDayId(dias[0].localId)
      return dias[0].localId
    }

    showToast.error("Adicione um dia de treino antes de inserir exercícios")
    return null
  }

  const handleAddExerciseClick = (exercicio: Exercicio) => {
    const dayId = ensureDaySelection()
    if (!dayId) {
      return
    }
    addExerciseToDay(dayId, exercicio)
  }

  const handleCreateCustomExercise = async () => {
    if (!customExercise.nome.trim()) {
      showToast.error("Informe o nome do exercício")
      return
    }

    try {
      const created = await createExercicio.mutateAsync({
        nome: customExercise.nome.trim(),
        descricao: customExercise.descricao.trim() || undefined,
        grupamentoMuscular: customExercise.grupamentoMuscular,
      })
      const dayId = ensureDaySelection()
      if (dayId) {
        addExerciseToDay(dayId, created)
      }
      setCustomExercise({
        nome: "",
        descricao: "",
        grupamentoMuscular: customExercise.grupamentoMuscular,
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleImportExternalExercise = async (
    externalExercise: ExercicioExterno,
  ) => {
    try {
      const imported = await importExercicioExterno.mutateAsync({
        externalId: externalExercise.externalId,
        nome: externalExercise.nome,
        descricao: externalExercise.descricao,
        grupamentoMuscular: externalExercise.grupamentoMuscular,
        externalSource: externalExercise.externalSource,
      })
      const dayId = ensureDaySelection()
      if (dayId) {
        addExerciseToDay(dayId, imported)
        showToast.success("Exercício importado e adicionado ao treino")
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleSavePlano = async () => {
    if (!alunoId) {
      showToast.error("Aluno inválido")
      return
    }

    if (!nomePlano.trim() || nomePlano.trim().length < 2) {
      showToast.error("Informe um nome válido para o plano")
      return
    }

    if (dias.length === 0) {
      showToast.error("Adicione pelo menos um dia de treino")
      return
    }

    const invalidDay = dias.find(
      (day) => !day.titulo.trim() || day.exercicios.length === 0,
    )
    if (invalidDay) {
      showToast.error(
        "Cada dia precisa ter título e pelo menos um exercício cadastrado",
      )
      return
    }

    const payload: UpsertPlanoTreinoDTO = {
      alunoId,
      nome: nomePlano.trim(),
      observacoes: observacoesPlano.trim() || undefined,
      dias: dias.map((day, dayIndex) => ({
        titulo: day.titulo.trim(),
        ordem: dayIndex + 1,
        diaSemana: day.diaSemana,
        observacoes: day.observacoes?.trim() || undefined,
        metodo: day.metodo?.trim() || undefined,
        exercicios: day.exercicios.map((item, itemIndex) => ({
          exercicioId: item.exercicioId,
          ordem: itemIndex + 1,
          series: item.series || undefined,
          repeticoes: item.repeticoes?.trim() || undefined,
          cargaSugerida: item.cargaSugerida || undefined,
          observacoes: item.observacoes?.trim() || undefined,
          metodo: item.metodo?.trim() || undefined,
        })),
      })),
    }

    await upsertPlano.mutateAsync(payload)
  }

  const handleSaveProfessorComment = async (checkinId: string) => {
    const draft = comentariosProfessor[checkinId]
    if (!draft || !draft.trim()) {
      showToast.error("Digite um comentário antes de salvar")
      return
    }

    await comentarCheckinProfessor.mutateAsync({
      checkinId,
      data: {
        comentarioProfessor: draft.trim(),
      },
    })
  }

  if (!alunoId) {
    return (
      <Card className="bg-red-50 border-2 border-red-200">
        <p className="text-red-700">Aluno inválido para montar plano de treino.</p>
      </Card>
    )
  }

  if (loadingAluno || loadingPlanoAtivo) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-gray-600">Carregando editor de treino...</p>
      </div>
    )
  }

  if (erroPlanoAtivo && !erroPlanoNaoEncontrado) {
    return (
      <Card className="bg-red-50 border-2 border-red-200">
        <p className="text-red-700">{erroPlanoAtivo.message}</p>
      </Card>
    )
  }

  if (!aluno) {
    return (
      <Card className="bg-red-50 border-2 border-red-200">
        <p className="text-red-700">Aluno não encontrado.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(getBackRoute(isAdmin))}
            className="p-2 hover:bg-white rounded-lg transition-colors"
            title="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Editor de Treino
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {aluno.user?.nome || "Aluno"} • monte dias, exercícios, métodos e
              observações
            </p>
          </div>
        </div>

        <Button
          icon={Save}
          onClick={handleSavePlano}
          isLoading={upsertPlano.isLoading}
        >
          Salvar Plano
        </Button>
      </div>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Configuração do Plano</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome do plano"
            value={nomePlano}
            onChange={(event) => setNomePlano(event.target.value)}
            placeholder="Ex: Hipertrofia 4x semana"
          />
          <Textarea
            label="Observações gerais"
            value={observacoesPlano}
            rows={2}
            onChange={(event) => setObservacoesPlano(event.target.value)}
            placeholder="Estratégia geral, alertas e foco do ciclo"
          />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Divisão de Treino por Dias</h2>
          <Button icon={Plus} onClick={addDay} variant="secondary">
            Adicionar Dia
          </Button>
        </div>

        <div className="space-y-4">
          {dias.map((day) => (
            <div
              key={day.localId}
              className={`border rounded-lg p-4 transition-colors ${
                selectedDayId === day.localId
                  ? "border-blue-400 bg-blue-50/40"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    label="Título do dia"
                    value={day.titulo}
                    onChange={(event) =>
                      updateDay(day.localId, { titulo: event.target.value })
                    }
                    placeholder="Treino A - Inferiores"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dia da semana
                    </label>
                    <select
                      value={day.diaSemana || ""}
                      onChange={(event) =>
                        updateDay(day.localId, {
                          diaSemana: event.target.value
                            ? Number(event.target.value)
                            : undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sem dia fixo</option>
                      {diasSemanaOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedDayId(day.localId)}
                      className="w-full"
                    >
                      {selectedDayId === day.localId
                        ? "Dia Ativo"
                        : "Definir como Ativo"}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => removeDay(day.localId)}
                      className="!px-3"
                      title="Remover dia"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Textarea
                  label="Método do dia"
                  rows={2}
                  value={day.metodo || ""}
                  onChange={(event) =>
                    updateDay(day.localId, { metodo: event.target.value })
                  }
                  placeholder="Ex: bi-set, rest-pause, tempo controlado"
                />
                <Textarea
                  label="Observações do dia"
                  rows={2}
                  value={day.observacoes || ""}
                  onChange={(event) =>
                    updateDay(day.localId, { observacoes: event.target.value })
                  }
                  placeholder="Orientações extras para o aluno"
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">
                  Exercícios ({day.exercicios.length}) • arraste e solte para
                  reorganizar
                </p>

                {day.exercicios.map((item, index) => (
                  <div
                    key={item.localId}
                    draggable
                    onDragStart={() =>
                      setDragging({
                        sourceDayId: day.localId,
                        sourceExerciseId: item.localId,
                      })
                    }
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleDropExercise(day.localId, index)}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start gap-3">
                      <div className="flex items-center gap-2 text-gray-400 mt-1">
                        <GripVertical className="h-4 w-4" />
                        <span className="text-xs font-semibold">
                          {item.ordem}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {item.exercicio.nome}
                          </h4>
                          <Badge>{grupamentoLabels[item.exercicio.grupamentoMuscular]}</Badge>
                          <Badge variant="warning">{formatDiaSemana(day.diaSemana)}</Badge>
                        </div>
                        {item.exercicio.descricao && (
                          <p className="text-xs text-gray-600 mb-3">
                            {item.exercicio.descricao}
                          </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Input
                            label="Séries"
                            type="number"
                            min="1"
                            max="20"
                            value={item.series?.toString() || ""}
                            onChange={(event) =>
                              updateExercise(day.localId, item.localId, {
                                series: parseOptionalInt(event.target.value),
                              })
                            }
                          />
                          <Input
                            label="Repetições"
                            value={item.repeticoes || ""}
                            onChange={(event) =>
                              updateExercise(day.localId, item.localId, {
                                repeticoes: event.target.value,
                              })
                            }
                            placeholder="Ex: 8-12"
                          />
                          <Input
                            label="Carga sugerida (kg)"
                            type="number"
                            min="0"
                            step="0.5"
                            value={item.cargaSugerida?.toString() || ""}
                            onChange={(event) =>
                              updateExercise(day.localId, item.localId, {
                                cargaSugerida: parseOptionalNumber(event.target.value),
                              })
                            }
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Textarea
                            label="Método"
                            rows={2}
                            value={item.metodo || ""}
                            onChange={(event) =>
                              updateExercise(day.localId, item.localId, {
                                metodo: event.target.value,
                              })
                            }
                            placeholder="Ex: rest-pause"
                          />
                          <Textarea
                            label="Observações"
                            rows={2}
                            value={item.observacoes || ""}
                            onChange={(event) =>
                              updateExercise(day.localId, item.localId, {
                                observacoes: event.target.value,
                              })
                            }
                            placeholder="Execução, respiração, tempo"
                          />
                        </div>
                      </div>

                      <Button
                        variant="danger"
                        className="!px-3 self-start"
                        onClick={() => removeExercise(day.localId, item.localId)}
                        title="Remover exercício"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDropExercise(day.localId, day.exercicios.length)}
                  className="border border-dashed border-gray-300 rounded-lg p-3 text-xs text-gray-500 text-center"
                >
                  Solte aqui para mover o exercício para o final deste dia
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Banco de Exercícios</h2>

        <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-900">
            Dia ativo para adicionar exercícios:{" "}
            <strong>{selectedDay?.titulo || "nenhum"}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Exercícios já cadastrados
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                icon={Search}
                placeholder="Buscar exercício"
                value={filtroExercicio}
                onChange={(event) => setFiltroExercicio(event.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grupamento
                </label>
                <select
                  value={filtroGrupamento}
                  onChange={(event) =>
                    setFiltroGrupamento(
                      event.target.value as GrupamentoMuscular | "",
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  {(grupamentos || []).map((grupamento) => (
                    <option key={grupamento} value={grupamento}>
                      {grupamentoLabels[grupamento]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 max-h-80 overflow-auto border border-gray-200 rounded-lg">
              {loadingExercicios ? (
                <div className="p-4 flex items-center gap-2 text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando exercícios...
                </div>
              ) : (
                (exercicios || []).map((exercise) => (
                  <div
                    key={exercise.id}
                    className="p-3 border-b last:border-b-0 flex items-start justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{exercise.nome}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {grupamentoLabels[exercise.grupamentoMuscular]}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => handleAddExerciseClick(exercise)}
                      disabled={!selectedDay}
                    >
                      Adicionar
                    </Button>
                  </div>
                ))
              )}

              {!loadingExercicios && exercicios?.length === 0 && (
                <div className="p-4 text-sm text-gray-500">
                  Nenhum exercício encontrado com os filtros atuais.
                </div>
              )}
            </div>

            <div className="mt-4 border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                Criar exercício personalizado
              </h4>
              <Input
                label="Nome"
                value={customExercise.nome}
                onChange={(event) =>
                  setCustomExercise((prev) => ({
                    ...prev,
                    nome: event.target.value,
                  }))
                }
                placeholder="Ex: Agachamento com pausa"
              />
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grupamento muscular
                </label>
                <select
                  value={customExercise.grupamentoMuscular}
                  onChange={(event) =>
                    setCustomExercise((prev) => ({
                      ...prev,
                      grupamentoMuscular: event.target.value as GrupamentoMuscular,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {(grupamentos || []).map((grupamento) => (
                    <option key={grupamento} value={grupamento}>
                      {grupamentoLabels[grupamento]}
                    </option>
                  ))}
                </select>
              </div>
              <Textarea
                label="Descrição"
                rows={2}
                value={customExercise.descricao}
                onChange={(event) =>
                  setCustomExercise((prev) => ({
                    ...prev,
                    descricao: event.target.value,
                  }))
                }
                placeholder="Detalhes de execução, equipamentos etc."
              />
              <Button
                onClick={handleCreateCustomExercise}
                icon={Plus}
                isLoading={createExercicio.isLoading}
              >
                Criar e adicionar no dia ativo
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Buscar exercícios externos
            </h3>
            <Input
              icon={Search}
              placeholder="Digite ao menos 2 letras para buscar"
              value={buscaExterna}
              onChange={(event) => setBuscaExterna(event.target.value)}
            />

            <div className="mt-3 max-h-80 overflow-auto border border-gray-200 rounded-lg">
              {buscaExterna.trim().length < 2 && (
                <div className="p-4 text-sm text-gray-500">
                  Digite um termo para buscar na base externa.
                </div>
              )}

              {loadingExerciciosExternos && (
                <div className="p-4 flex items-center gap-2 text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Buscando exercícios...
                </div>
              )}

              {buscaExterna.trim().length >= 2 &&
                !loadingExerciciosExternos &&
                (exerciciosExternos || []).map((exercise) => (
                  <div
                    key={`${exercise.externalSource}-${exercise.externalId}`}
                    className="p-3 border-b last:border-b-0 flex items-start justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{exercise.nome}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {grupamentoLabels[exercise.grupamentoMuscular]} • fonte{" "}
                        {exercise.externalSource}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => handleImportExternalExercise(exercise)}
                      isLoading={importExercicioExterno.isLoading}
                      disabled={!selectedDay}
                    >
                      Importar
                    </Button>
                  </div>
                ))}

              {buscaExterna.trim().length >= 2 &&
                !loadingExerciciosExternos &&
                exerciciosExternos?.length === 0 && (
                  <div className="p-4 text-sm text-gray-500">
                    Nenhum exercício externo encontrado.
                  </div>
                )}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="h-5 w-5 text-gray-700" />
          <h2 className="text-lg font-semibold">
            Check-ins recentes e comentários do professor
          </h2>
        </div>

        {loadingCheckins && (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando check-ins...
          </div>
        )}

        {!loadingCheckins && checkinsOrdenados.length === 0 && (
          <p className="text-sm text-gray-500">
            Ainda não há check-ins para este aluno.
          </p>
        )}

        <div className="space-y-4">
          {checkinsOrdenados.map((checkin) => {
            const status = mapCheckinStatus(checkin)
            return (
              <div
                key={checkin.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant={status.variant}>{status.text}</Badge>
                  <Badge>{checkin.treinoDia.titulo}</Badge>
                  <span className="text-xs text-gray-500">
                    {format(new Date(checkin.iniciadoEm), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </span>
                </div>

                <p className="text-sm text-gray-700">
                  Concluídos:{" "}
                  {
                    checkin.exercicios.filter((exercise) => exercise.concluido)
                      .length
                  }
                  /{checkin.exercicios.length}
                </p>

                {checkin.comentarioAluno && (
                  <p className="text-sm text-gray-700 mt-2">
                    <strong>Comentário do aluno:</strong> {checkin.comentarioAluno}
                  </p>
                )}

                <div className="mt-3">
                  <Textarea
                    label="Comentário do professor"
                    rows={2}
                    value={
                      comentariosProfessor[checkin.id] ??
                      checkin.comentarioProfessor ??
                      ""
                    }
                    onChange={(event) =>
                      setComentariosProfessor((prev) => ({
                        ...prev,
                        [checkin.id]: event.target.value,
                      }))
                    }
                    placeholder="Feedback técnico e ajustes da próxima sessão"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => handleSaveProfessorComment(checkin.id)}
                    isLoading={comentarCheckinProfessor.isLoading}
                  >
                    Salvar comentário
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
