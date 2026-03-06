import React, { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  ClipboardList,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  UtensilsCrossed,
} from "lucide-react"
import { Badge, Button, Card, Input, Textarea } from "../../components/ui"
import { useAluno } from "../../hooks/useAlunos"
import {
  useComentarDietaCheckinProfessor,
  useCreateAlimentoDieta,
  useDietaAlimentos,
  useDietaAlimentosExternos,
  useDietaCheckins,
  useDietaRecomendacao,
  useImportAlimentoExterno,
  usePlanoDietaAtivo,
  useUpsertPlanoDieta,
} from "../../hooks/useDieta"
import { useAuth } from "../../hooks/useAuth"
import { showToast } from "../../utils/toast"
import { calculateFoodMacrosByQuantity } from "../../utils/bodyComposition"
import { formatDiaSemana } from "../../utils/treino"
import type {
  AlimentoDieta,
  AlimentoExterno,
  DietaCheckin,
  ObjetivoDieta,
  UpsertPlanoDietaDTO,
} from "../../types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface DraftItem {
  localId: string
  alimentoId: string
  alimento: AlimentoDieta
  ordem: number
  quantidadeGramas: number
  observacoes?: string
}

interface DraftMeal {
  localId: string
  nome: string
  ordem: number
  horario?: string
  observacoes?: string
  itens: DraftItem[]
}

interface DraftDay {
  localId: string
  titulo: string
  ordem: number
  diaSemana?: number
  observacoes?: string
  refeicoes: DraftMeal[]
}

interface CustomFoodForm {
  nome: string
  descricao: string
  calorias100g: string
  proteinas100g: string
  carboidratos100g: string
  gorduras100g: string
  fibras100g: string
}

const createLocalId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const objetivos: Array<{ value: ObjetivoDieta; label: string; description: string }> = [
  {
    value: "MANTER",
    label: "Manter peso",
    description: "Calorias próximas da manutenção",
  },
  {
    value: "PERDER",
    label: "Diminuir peso",
    description: "Déficit calórico controlado",
  },
  {
    value: "GANHAR",
    label: "Aumentar peso",
    description: "Superávit calórico moderado",
  },
]

const diasSemana = [
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
  { value: 7, label: "Domingo" },
]

const parseOptionalNumber = (value: string): number | undefined => {
  if (!value.trim()) return undefined
  const parsed = Number(value.replace(",", "."))
  return Number.isFinite(parsed) ? parsed : undefined
}

const mapCheckinStatus = (checkin: DietaCheckin) => {
  if (checkin.status === "CONCLUIDO") {
    return { text: "Concluído", variant: "success" as const }
  }
  return { text: "Em andamento", variant: "warning" as const }
}

export const PlanoDietaEditorPage: React.FC = () => {
  const navigate = useNavigate()
  const { id: alunoId } = useParams<{ id: string }>()
  const { user } = useAuth()
  const isAdmin = user?.role === "ADMIN"

  const [nomePlano, setNomePlano] = useState("")
  const [objetivo, setObjetivo] = useState<ObjetivoDieta>("MANTER")
  const [fatorAtividadeInput, setFatorAtividadeInput] = useState("")
  const [caloriasMetaInput, setCaloriasMetaInput] = useState("")
  const [proteinaMetaInput, setProteinaMetaInput] = useState("")
  const [carboMetaInput, setCarboMetaInput] = useState("")
  const [gorduraMetaInput, setGorduraMetaInput] = useState("")
  const [observacoesPlano, setObservacoesPlano] = useState("")

  const [dias, setDias] = useState<DraftDay[]>([])
  const [selectedDayId, setSelectedDayId] = useState("")
  const [selectedMealId, setSelectedMealId] = useState("")
  const [filtroAlimento, setFiltroAlimento] = useState("")
  const [buscaExterna, setBuscaExterna] = useState("")
  const [fonteExterna, setFonteExterna] = useState<"USDA" | "TACO" | "ALL">("ALL")
  const [customFood, setCustomFood] = useState<CustomFoodForm>({
    nome: "",
    descricao: "",
    calorias100g: "",
    proteinas100g: "",
    carboidratos100g: "",
    gorduras100g: "",
    fibras100g: "",
  })
  const [comentariosProfessor, setComentariosProfessor] = useState<Record<string, string>>({})
  const [initializedFromBackend, setInitializedFromBackend] = useState(false)

  const { data: aluno, isLoading: loadingAluno } = useAluno(alunoId || "", {
    enabled: !!alunoId,
  })

  const {
    data: planoAtivo,
    isLoading: loadingPlano,
    error: erroPlano,
  } = usePlanoDietaAtivo(alunoId || "", !!alunoId)

  const fatorAtividade = parseOptionalNumber(fatorAtividadeInput)
  const {
    data: recomendacao,
    isLoading: loadingRecomendacao,
  } = useDietaRecomendacao(alunoId || "", objetivo, fatorAtividade, !!alunoId)

  const { data: alimentos, isLoading: loadingAlimentos } = useDietaAlimentos(
    filtroAlimento || undefined,
  )
  const { data: checkins, isLoading: loadingCheckins } = useDietaCheckins(
    alunoId || "",
    20,
    !!alunoId,
  )

  const { data: externos, isFetching: loadingExternos } = useDietaAlimentosExternos({
    q: buscaExterna,
    source: fonteExterna,
    enabled: buscaExterna.trim().length >= 2,
  })

  const importAlimento = useImportAlimentoExterno()
  const createAlimento = useCreateAlimentoDieta()
  const upsertPlano = useUpsertPlanoDieta()
  const comentarCheckinProfessor = useComentarDietaCheckinProfessor()

  const erroPlanoNaoEncontrado =
    erroPlano?.message?.toLowerCase().includes("não encontrado") ||
    erroPlano?.message?.toLowerCase().includes("recurso não encontrado")

  const checkinsOrdenados = useMemo(() => {
    return [...(checkins || [])].sort(
      (a, b) =>
        new Date(b.iniciadoEm).getTime() - new Date(a.iniciadoEm).getTime(),
    )
  }, [checkins])

  useEffect(() => {
    if (initializedFromBackend || loadingPlano) return

    if (planoAtivo) {
      setNomePlano(planoAtivo.nome)
      setObjetivo(planoAtivo.objetivo)
      setFatorAtividadeInput(planoAtivo.fatorAtividade ? String(planoAtivo.fatorAtividade) : "")
      setCaloriasMetaInput(String(planoAtivo.caloriasMeta || ""))
      setProteinaMetaInput(String(planoAtivo.proteinasMetaG || ""))
      setCarboMetaInput(String(planoAtivo.carboidratosMetaG || ""))
      setGorduraMetaInput(String(planoAtivo.gordurasMetaG || ""))
      setObservacoesPlano(planoAtivo.observacoes || "")

      const diasMapeados: DraftDay[] = planoAtivo.dias.map((dia, dayIndex) => ({
        localId: createLocalId(),
        titulo: dia.titulo,
        ordem: dayIndex + 1,
        diaSemana: dia.diaSemana || undefined,
        observacoes: dia.observacoes || "",
        refeicoes: dia.refeicoes.map((ref, refIndex) => ({
          localId: createLocalId(),
          nome: ref.nome,
          ordem: refIndex + 1,
          horario: ref.horario || "",
          observacoes: ref.observacoes || "",
          itens: ref.itens.map((item, itemIndex) => ({
            localId: createLocalId(),
            alimentoId: item.alimentoId,
            alimento: item.alimento,
            ordem: itemIndex + 1,
            quantidadeGramas: item.quantidadeGramas,
            observacoes: item.observacoes || "",
          })),
        })),
      }))

      setDias(diasMapeados)
      if (diasMapeados.length > 0) {
        setSelectedDayId(diasMapeados[0].localId)
        if (diasMapeados[0].refeicoes.length > 0) {
          setSelectedMealId(diasMapeados[0].refeicoes[0].localId)
        }
      }
      setInitializedFromBackend(true)
      return
    }

    if (erroPlano && !erroPlanoNaoEncontrado) return

    const diaInicial: DraftDay = {
      localId: createLocalId(),
      titulo: "Dia 1",
      ordem: 1,
      diaSemana: 1,
      observacoes: "",
      refeicoes: [
        {
          localId: createLocalId(),
          nome: "Café da manhã",
          ordem: 1,
          horario: "",
          observacoes: "",
          itens: [],
        },
      ],
    }

    setNomePlano("Plano Alimentar Semanal")
    setDias([diaInicial])
    setSelectedDayId(diaInicial.localId)
    setSelectedMealId(diaInicial.refeicoes[0].localId)
    setInitializedFromBackend(true)
  }, [erroPlano, erroPlanoNaoEncontrado, initializedFromBackend, loadingPlano, planoAtivo])

  useEffect(() => {
    if (!recomendacao) return
    if (!caloriasMetaInput) setCaloriasMetaInput(String(recomendacao.caloriasMeta || ""))
    if (!proteinaMetaInput) setProteinaMetaInput(String(recomendacao.proteinasMetaG || ""))
    if (!carboMetaInput) setCarboMetaInput(String(recomendacao.carboidratosMetaG || ""))
    if (!gorduraMetaInput) setGorduraMetaInput(String(recomendacao.gordurasMetaG || ""))
    if (!fatorAtividadeInput) {
      setFatorAtividadeInput(
        recomendacao.fatorAtividade ? String(recomendacao.fatorAtividade) : "",
      )
    }
  }, [recomendacao, caloriasMetaInput, proteinaMetaInput, carboMetaInput, gorduraMetaInput, fatorAtividadeInput])

  const selectedDay = dias.find((day) => day.localId === selectedDayId)
  const selectedMeal = selectedDay?.refeicoes.find((meal) => meal.localId === selectedMealId)

  const ensureSelectedMeal = () => {
    if (selectedMealId && selectedMeal) return selectedMealId
    if (selectedDay?.refeicoes.length) {
      const fallback = selectedDay.refeicoes[0].localId
      setSelectedMealId(fallback)
      return fallback
    }
    showToast.error("Selecione ou crie uma refeição para adicionar alimentos")
    return null
  }

  const updateDay = (dayId: string, patch: Partial<DraftDay>) => {
    setDias((prev) =>
      prev.map((day) => (day.localId === dayId ? { ...day, ...patch } : day)),
    )
  }

  const addDay = () => {
    const newDay: DraftDay = {
      localId: createLocalId(),
      titulo: `Dia ${dias.length + 1}`,
      ordem: dias.length + 1,
      diaSemana: undefined,
      observacoes: "",
      refeicoes: [],
    }
    setDias((prev) => [...prev, newDay])
    setSelectedDayId(newDay.localId)
  }

  const removeDay = (dayId: string) => {
    if (dias.length === 1) {
      showToast.error("A dieta precisa ter ao menos um dia")
      return
    }

    setDias((prev) =>
      prev
        .filter((day) => day.localId !== dayId)
        .map((day, index) => ({ ...day, ordem: index + 1 })),
    )

    if (selectedDayId === dayId) {
      const fallback = dias.find((day) => day.localId !== dayId)
      if (fallback) {
        setSelectedDayId(fallback.localId)
        setSelectedMealId(fallback.refeicoes[0]?.localId || "")
      }
    }
  }

  const addMeal = (dayId: string) => {
    setDias((prev) =>
      prev.map((day) => {
        if (day.localId !== dayId) return day
        const newMeal: DraftMeal = {
          localId: createLocalId(),
          nome: `Refeição ${day.refeicoes.length + 1}`,
          ordem: day.refeicoes.length + 1,
          horario: "",
          observacoes: "",
          itens: [],
        }
        setSelectedMealId(newMeal.localId)
        return { ...day, refeicoes: [...day.refeicoes, newMeal] }
      }),
    )
  }

  const updateMeal = (dayId: string, mealId: string, patch: Partial<DraftMeal>) => {
    setDias((prev) =>
      prev.map((day) => {
        if (day.localId !== dayId) return day
        return {
          ...day,
          refeicoes: day.refeicoes.map((meal) =>
            meal.localId === mealId ? { ...meal, ...patch } : meal,
          ),
        }
      }),
    )
  }

  const removeMeal = (dayId: string, mealId: string) => {
    setDias((prev) =>
      prev.map((day) => {
        if (day.localId !== dayId) return day
        return {
          ...day,
          refeicoes: day.refeicoes
            .filter((meal) => meal.localId !== mealId)
            .map((meal, index) => ({ ...meal, ordem: index + 1 })),
        }
      }),
    )
    if (selectedMealId === mealId) {
      const fallback = selectedDay?.refeicoes.find((meal) => meal.localId !== mealId)
      setSelectedMealId(fallback?.localId || "")
    }
  }

  const addFoodToMeal = (dayId: string, mealId: string, alimento: AlimentoDieta) => {
    setDias((prev) =>
      prev.map((day) => {
        if (day.localId !== dayId) return day
        return {
          ...day,
          refeicoes: day.refeicoes.map((meal) => {
            if (meal.localId !== mealId) return meal
            const newItem: DraftItem = {
              localId: createLocalId(),
              alimentoId: alimento.id,
              alimento,
              ordem: meal.itens.length + 1,
              quantidadeGramas: 100,
              observacoes: "",
            }
            return {
              ...meal,
              itens: [...meal.itens, newItem],
            }
          }),
        }
      }),
    )
  }

  const updateFoodItem = (
    dayId: string,
    mealId: string,
    itemId: string,
    patch: Partial<DraftItem>,
  ) => {
    setDias((prev) =>
      prev.map((day) => {
        if (day.localId !== dayId) return day
        return {
          ...day,
          refeicoes: day.refeicoes.map((meal) => {
            if (meal.localId !== mealId) return meal
            return {
              ...meal,
              itens: meal.itens.map((item) =>
                item.localId === itemId ? { ...item, ...patch } : item,
              ),
            }
          }),
        }
      }),
    )
  }

  const removeFoodItem = (dayId: string, mealId: string, itemId: string) => {
    setDias((prev) =>
      prev.map((day) => {
        if (day.localId !== dayId) return day
        return {
          ...day,
          refeicoes: day.refeicoes.map((meal) => {
            if (meal.localId !== mealId) return meal
            return {
              ...meal,
              itens: meal.itens
                .filter((item) => item.localId !== itemId)
                .map((item, index) => ({ ...item, ordem: index + 1 })),
            }
          }),
        }
      }),
    )
  }

  const handleImportExternal = async (food: AlimentoExterno) => {
    const mealId = ensureSelectedMeal()
    if (!mealId || !selectedDay) return

    try {
      const imported = await importAlimento.mutateAsync({
        externalId: food.externalId,
        nome: food.nome,
        descricao: food.descricao,
        calorias100g: food.calorias100g,
        proteinas100g: food.proteinas100g,
        carboidratos100g: food.carboidratos100g,
        gorduras100g: food.gorduras100g,
        fibras100g: food.fibras100g,
        source: food.source,
      })
      addFoodToMeal(selectedDay.localId, mealId, imported)
      showToast.success("Alimento importado e adicionado à refeição")
    } catch (error) {
      console.error(error)
    }
  }

  const handleCreateCustomFood = async () => {
    if (!customFood.nome.trim()) {
      showToast.error("Informe o nome do alimento")
      return
    }

    const calorias100g = parseOptionalNumber(customFood.calorias100g)
    const proteinas100g = parseOptionalNumber(customFood.proteinas100g)
    const carboidratos100g = parseOptionalNumber(customFood.carboidratos100g)
    const gorduras100g = parseOptionalNumber(customFood.gorduras100g)
    const fibras100g = parseOptionalNumber(customFood.fibras100g)

    if (
      calorias100g === undefined ||
      proteinas100g === undefined ||
      carboidratos100g === undefined ||
      gorduras100g === undefined
    ) {
      showToast.error("Preencha calorias, proteínas, carboidratos e gorduras")
      return
    }

    if (calorias100g < 0 || proteinas100g < 0 || carboidratos100g < 0 || gorduras100g < 0) {
      showToast.error("Valores nutricionais devem ser números positivos")
      return
    }

    if (fibras100g !== undefined && fibras100g < 0) {
      showToast.error("Fibras deve ser um número positivo")
      return
    }

    if (proteinas100g + carboidratos100g + gorduras100g > 100.5) {
      showToast.error("A soma de proteínas, carboidratos e gorduras deve ser <= 100g")
      return
    }

    if (fibras100g !== undefined && fibras100g > carboidratos100g + 0.5) {
      showToast.error("Fibras não pode ser maior que carboidratos por 100g")
      return
    }

    const mealId = ensureSelectedMeal()
    if (!mealId || !selectedDay) return

    try {
      const created = await createAlimento.mutateAsync({
        nome: customFood.nome.trim(),
        descricao: customFood.descricao.trim() || undefined,
        calorias100g,
        proteinas100g,
        carboidratos100g,
        gorduras100g,
        fibras100g,
      })

      addFoodToMeal(selectedDay.localId, mealId, created)
      setCustomFood({
        nome: "",
        descricao: "",
        calorias100g: "",
        proteinas100g: "",
        carboidratos100g: "",
        gorduras100g: "",
        fibras100g: "",
      })
      showToast.success("Alimento criado e adicionado à refeição ativa")
    } catch (error) {
      console.error(error)
    }
  }

  const handleSavePlano = async () => {
    if (!alunoId) return
    if (!nomePlano.trim()) {
      showToast.error("Informe o nome do plano")
      return
    }
    if (dias.length === 0) {
      showToast.error("Adicione ao menos um dia na dieta")
      return
    }
    const invalidDay = dias.find((day) => day.refeicoes.length === 0)
    if (invalidDay) {
      showToast.error("Todos os dias devem possuir ao menos uma refeição")
      return
    }
    const invalidMeal = dias.flatMap((day) => day.refeicoes).find((meal) => meal.itens.length === 0)
    if (invalidMeal) {
      showToast.error("Todas as refeições devem possuir ao menos um alimento")
      return
    }

    const payload: UpsertPlanoDietaDTO = {
      alunoId,
      nome: nomePlano.trim(),
      objetivo,
      fatorAtividade: parseOptionalNumber(fatorAtividadeInput),
      caloriasMeta: parseOptionalNumber(caloriasMetaInput),
      proteinasMetaG: parseOptionalNumber(proteinaMetaInput),
      carboidratosMetaG: parseOptionalNumber(carboMetaInput),
      gordurasMetaG: parseOptionalNumber(gorduraMetaInput),
      observacoes: observacoesPlano.trim() || undefined,
      dias: dias.map((day, dayIndex) => ({
        titulo: day.titulo.trim(),
        ordem: dayIndex + 1,
        diaSemana: day.diaSemana,
        observacoes: day.observacoes?.trim() || undefined,
        refeicoes: day.refeicoes.map((meal, mealIndex) => ({
          nome: meal.nome.trim(),
          ordem: mealIndex + 1,
          horario: meal.horario?.trim() || undefined,
          observacoes: meal.observacoes?.trim() || undefined,
          itens: meal.itens.map((item, itemIndex) => ({
            alimentoId: item.alimentoId,
            ordem: itemIndex + 1,
            quantidadeGramas: item.quantidadeGramas,
            observacoes: item.observacoes?.trim() || undefined,
          })),
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
      alunoId: alunoId || "",
      comentarioProfessor: draft.trim(),
    })
  }

  const macrosResumo = useMemo(() => {
    const totals = dias.reduce(
      (acc, day) => {
        for (const meal of day.refeicoes) {
          for (const item of meal.itens) {
            const calculated = calculateFoodMacrosByQuantity({
              quantidadeGramas: item.quantidadeGramas,
              calorias100g: item.alimento.calorias100g,
              proteinas100g: item.alimento.proteinas100g,
              carboidratos100g: item.alimento.carboidratos100g,
              gorduras100g: item.alimento.gorduras100g,
              fibras100g: item.alimento.fibras100g,
            })
            acc.calorias += calculated.calorias
            acc.proteinas += calculated.proteinas
            acc.carboidratos += calculated.carboidratos
            acc.gorduras += calculated.gorduras
          }
        }
        return acc
      },
      { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 },
    )
    return totals
  }, [dias])

  if (!alunoId) {
    return (
      <Card className="bg-red-50 border-2 border-red-200">
        <p className="text-red-700">Aluno inválido para montar dieta.</p>
      </Card>
    )
  }

  if (loadingAluno || loadingPlano || loadingRecomendacao) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-gray-600">Carregando editor de dieta...</p>
      </div>
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
            onClick={() =>
              navigate(isAdmin ? "/admin/alunos" : "/professor/dashboard")
            }
            className="p-2 hover:bg-white rounded-lg transition-colors"
            title="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Editor de Dieta
            </h1>
            <p className="text-gray-600">
              {aluno.user?.nome || "Aluno"} • plano semanal com macros e check-ins
            </p>
          </div>
        </div>
        <Button icon={Save} onClick={handleSavePlano} isLoading={upsertPlano.isLoading}>
          Salvar Plano
        </Button>
      </div>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Estratégia calórica e macros</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
          {objetivos.map((item) => (
            <button
              key={item.value}
              onClick={() => setObjetivo(item.value)}
              className={`text-left border rounded-lg p-3 transition-colors ${
                objetivo === item.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className="font-semibold text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-600 mt-1">{item.description}</p>
            </button>
          ))}
        </div>

        {recomendacao && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">% Gordura</p>
              <p className="text-lg font-semibold text-blue-700">
                {recomendacao.percentualGordura ?? "-"}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">Massa magra (kg)</p>
              <p className="text-lg font-semibold text-green-700">
                {recomendacao.massaMagraKg ?? "-"}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">TMB (kcal)</p>
              <p className="text-lg font-semibold text-yellow-700">
                {recomendacao.tmbKcal ?? "-"}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">Calorias alvo (kcal)</p>
              <p className="text-lg font-semibold text-purple-700">
                {recomendacao.caloriasMeta ?? "-"}
              </p>
            </div>
          </div>
        )}

        {recomendacao && recomendacao.missingFields.length > 0 && (
          <div className="mb-4 p-3 rounded-lg border border-yellow-300 bg-yellow-50">
            <p className="text-sm text-yellow-900 font-medium">
              Alguns dados estão ausentes para recomendação completa:
            </p>
            <p className="text-sm text-yellow-800">
              {recomendacao.missingFields.join(", ")}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            label="Nome do plano"
            value={nomePlano}
            onChange={(e) => setNomePlano(e.target.value)}
            placeholder="Plano Alimentar"
          />
          <Input
            label="Fator atividade"
            type="number"
            step="0.01"
            value={fatorAtividadeInput}
            onChange={(e) => setFatorAtividadeInput(e.target.value)}
            placeholder="1.55"
          />
          <Input
            label="Calorias alvo"
            type="number"
            value={caloriasMetaInput}
            onChange={(e) => setCaloriasMetaInput(e.target.value)}
            placeholder="2200"
          />
          <Input
            label="Proteína alvo (g)"
            type="number"
            value={proteinaMetaInput}
            onChange={(e) => setProteinaMetaInput(e.target.value)}
            placeholder="160"
          />
          <Input
            label="Carbo alvo (g)"
            type="number"
            value={carboMetaInput}
            onChange={(e) => setCarboMetaInput(e.target.value)}
            placeholder="220"
          />
          <Input
            label="Gordura alvo (g)"
            type="number"
            value={gorduraMetaInput}
            onChange={(e) => setGorduraMetaInput(e.target.value)}
            placeholder="65"
          />
        </div>
        <Textarea
          label="Observações gerais"
          rows={2}
          value={observacoesPlano}
          onChange={(e) => setObservacoesPlano(e.target.value)}
          placeholder="Notas para o aluno sobre hidratação, substituições etc."
        />
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Plano semanal de refeições</h2>
          <Button variant="secondary" icon={Plus} onClick={addDay}>
            Adicionar dia
          </Button>
        </div>

        <div className="space-y-4">
          {dias.map((day) => (
            <div
              key={day.localId}
              className={`border rounded-lg p-4 ${
                selectedDayId === day.localId
                  ? "border-blue-400 bg-blue-50/40"
                  : "border-gray-200"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Input
                  label="Título"
                  value={day.titulo}
                  onChange={(e) => updateDay(day.localId, { titulo: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dia da semana
                  </label>
                  <select
                    value={day.diaSemana || ""}
                    onChange={(e) =>
                      updateDay(day.localId, {
                        diaSemana: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sem dia fixo</option>
                    {diasSemana.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSelectedDayId(day.localId)
                      setSelectedMealId(day.refeicoes[0]?.localId || "")
                    }}
                    className="w-full"
                  >
                    {selectedDayId === day.localId ? "Dia ativo" : "Ativar dia"}
                  </Button>
                  <Button
                    variant="danger"
                    className="!px-3"
                    onClick={() => removeDay(day.localId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  label="Observações do dia"
                  rows={2}
                  value={day.observacoes || ""}
                  onChange={(e) => updateDay(day.localId, { observacoes: e.target.value })}
                />
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">
                    Refeições de {day.titulo} ({formatDiaSemana(day.diaSemana)})
                  </p>
                  <Button
                    variant="secondary"
                    className="!py-1 !px-3"
                    onClick={() => addMeal(day.localId)}
                  >
                    <Plus className="h-4 w-4" />
                    Refeição
                  </Button>
                </div>

                <div className="space-y-2">
                  {day.refeicoes.map((meal) => (
                    <div
                      key={meal.localId}
                      className={`border rounded-lg p-3 ${
                        selectedMealId === meal.localId ? "border-blue-300 bg-white" : "border-gray-200"
                      }`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <Input
                          label="Nome"
                          value={meal.nome}
                          onChange={(e) =>
                            updateMeal(day.localId, meal.localId, {
                              nome: e.target.value,
                            })
                          }
                        />
                        <Input
                          label="Horário"
                          value={meal.horario || ""}
                          onChange={(e) =>
                            updateMeal(day.localId, meal.localId, {
                              horario: e.target.value,
                            })
                          }
                          placeholder="08:00"
                        />
                        <Textarea
                          label="Observações"
                          rows={2}
                          value={meal.observacoes || ""}
                          onChange={(e) =>
                            updateMeal(day.localId, meal.localId, {
                              observacoes: e.target.value,
                            })
                          }
                        />
                        <div className="flex items-end gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setSelectedDayId(day.localId)
                              setSelectedMealId(meal.localId)
                            }}
                            className="w-full"
                          >
                            {selectedMealId === meal.localId
                              ? "Refeição ativa"
                              : "Ativar"}
                          </Button>
                          <Button
                            variant="danger"
                            className="!px-3"
                            onClick={() => removeMeal(day.localId, meal.localId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        {meal.itens.map((item) => {
                          const macros = calculateFoodMacrosByQuantity({
                            quantidadeGramas: item.quantidadeGramas,
                            calorias100g: item.alimento.calorias100g,
                            proteinas100g: item.alimento.proteinas100g,
                            carboidratos100g: item.alimento.carboidratos100g,
                            gorduras100g: item.alimento.gorduras100g,
                            fibras100g: item.alimento.fibras100g,
                          })

                          return (
                            <div
                              key={item.localId}
                              className="rounded-lg border border-gray-200 p-3 bg-gray-50"
                            >
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <p className="font-medium text-gray-900">
                                  {item.alimento.nome}
                                </p>
                                <Badge>{item.quantidadeGramas}g</Badge>
                                <Badge variant="success">{macros.calorias} kcal</Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                <Input
                                  label="Quantidade (g)"
                                  type="number"
                                  min="1"
                                  value={String(item.quantidadeGramas)}
                                  onChange={(e) =>
                                    updateFoodItem(day.localId, meal.localId, item.localId, {
                                      quantidadeGramas: Number(e.target.value) || 0,
                                    })
                                  }
                                />
                                <Input
                                  label="Proteína (g)"
                                  value={String(macros.proteinas)}
                                  readOnly
                                />
                                <Input
                                  label="Carbo (g)"
                                  value={String(macros.carboidratos)}
                                  readOnly
                                />
                                <Input
                                  label="Gordura (g)"
                                  value={String(macros.gorduras)}
                                  readOnly
                                />
                              </div>
                              <Textarea
                                label="Observações do item"
                                rows={2}
                                value={item.observacoes || ""}
                                onChange={(e) =>
                                  updateFoodItem(day.localId, meal.localId, item.localId, {
                                    observacoes: e.target.value,
                                  })
                                }
                              />
                              <Button
                                variant="danger"
                                className="!py-1 !px-3"
                                onClick={() =>
                                  removeFoodItem(day.localId, meal.localId, item.localId)
                                }
                              >
                                Remover alimento
                              </Button>
                            </div>
                          )
                        })}

                        {meal.itens.length === 0 && (
                          <p className="text-sm text-gray-500">
                            Nenhum alimento nesta refeição.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5" />
          Banco de alimentos
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Dia ativo: <strong>{selectedDay?.titulo || "nenhum"}</strong> • Refeição
          ativa: <strong>{selectedMeal?.nome || "nenhuma"}</strong>
        </p>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Alimentos cadastrados</h3>
            <Input
              icon={Search}
              value={filtroAlimento}
              onChange={(e) => setFiltroAlimento(e.target.value)}
              placeholder="Buscar alimento"
            />
            <div className="mt-2 max-h-80 overflow-auto border border-gray-200 rounded-lg">
              {loadingAlimentos && (
                <div className="p-3 flex items-center gap-2 text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando alimentos...
                </div>
              )}
              {!loadingAlimentos &&
                (alimentos || []).map((food) => (
                  <div
                    key={food.id}
                    className="p-3 border-b last:border-b-0 flex items-start justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{food.nome}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {food.calorias100g} kcal/100g • P {food.proteinas100g}g • C{" "}
                        {food.carboidratos100g}g • G {food.gorduras100g}g
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const mealId = ensureSelectedMeal()
                        if (!mealId || !selectedDay) return
                        addFoodToMeal(selectedDay.localId, mealId, food)
                      }}
                    >
                      Adicionar
                    </Button>
                  </div>
                ))}

              {!loadingAlimentos && (alimentos || []).length === 0 && (
                <div className="p-3 text-sm text-gray-500">
                  Nenhum alimento encontrado com os filtros atuais.
                </div>
              )}
            </div>

            <div className="mt-4 border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                Criar alimento personalizado
              </h4>
              <Input
                label="Nome"
                value={customFood.nome}
                onChange={(event) =>
                  setCustomFood((prev) => ({
                    ...prev,
                    nome: event.target.value,
                  }))
                }
                placeholder="Ex: Iogurte natural integral"
              />
              <Textarea
                label="Descrição"
                rows={2}
                value={customFood.descricao}
                onChange={(event) =>
                  setCustomFood((prev) => ({
                    ...prev,
                    descricao: event.target.value,
                  }))
                }
                placeholder="Marca, preparo ou observações"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input
                  label="Calorias (100g)"
                  type="number"
                  step="0.1"
                  min="0"
                  value={customFood.calorias100g}
                  onChange={(event) =>
                    setCustomFood((prev) => ({
                      ...prev,
                      calorias100g: event.target.value,
                    }))
                  }
                  placeholder="150"
                />
                <Input
                  label="Proteínas (100g)"
                  type="number"
                  step="0.1"
                  min="0"
                  value={customFood.proteinas100g}
                  onChange={(event) =>
                    setCustomFood((prev) => ({
                      ...prev,
                      proteinas100g: event.target.value,
                    }))
                  }
                  placeholder="12"
                />
                <Input
                  label="Carboidratos (100g)"
                  type="number"
                  step="0.1"
                  min="0"
                  value={customFood.carboidratos100g}
                  onChange={(event) =>
                    setCustomFood((prev) => ({
                      ...prev,
                      carboidratos100g: event.target.value,
                    }))
                  }
                  placeholder="8"
                />
                <Input
                  label="Gorduras (100g)"
                  type="number"
                  step="0.1"
                  min="0"
                  value={customFood.gorduras100g}
                  onChange={(event) =>
                    setCustomFood((prev) => ({
                      ...prev,
                      gorduras100g: event.target.value,
                    }))
                  }
                  placeholder="5"
                />
                <Input
                  label="Fibras (100g) opcional"
                  type="number"
                  step="0.1"
                  min="0"
                  value={customFood.fibras100g}
                  onChange={(event) =>
                    setCustomFood((prev) => ({
                      ...prev,
                      fibras100g: event.target.value,
                    }))
                  }
                  placeholder="2"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 mb-3">
                Regra: proteínas + carboidratos + gorduras deve ser até 100g por 100g.
              </p>
              <Button
                onClick={handleCreateCustomFood}
                icon={Plus}
                isLoading={createAlimento.isLoading}
              >
                Criar e adicionar na refeição ativa
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Buscar alimentos externos (USDA/TACO)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <Input
                icon={Search}
                value={buscaExterna}
                onChange={(e) => setBuscaExterna(e.target.value)}
                placeholder="Buscar alimento"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fonte
                </label>
                <select
                  value={fonteExterna}
                  onChange={(e) =>
                    setFonteExterna(e.target.value as "USDA" | "TACO" | "ALL")
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">USDA + TACO</option>
                  <option value="USDA">USDA</option>
                  <option value="TACO">TACO</option>
                </select>
              </div>
            </div>

            <div className="max-h-80 overflow-auto border border-gray-200 rounded-lg">
              {buscaExterna.trim().length < 2 && (
                <p className="p-3 text-sm text-gray-500">
                  Digite pelo menos 2 letras para pesquisar.
                </p>
              )}

              {loadingExternos && (
                <div className="p-3 flex items-center gap-2 text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Buscando alimentos...
                </div>
              )}

              {!loadingExternos &&
                (externos || []).map((food) => (
                  <div
                    key={`${food.source}-${food.externalId}`}
                    className="p-3 border-b last:border-b-0 flex items-start justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{food.nome}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {food.source} • {food.calorias100g} kcal/100g
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      isLoading={importAlimento.isLoading}
                      onClick={() => handleImportExternal(food)}
                    >
                      Importar
                    </Button>
                  </div>
                ))}

              {buscaExterna.trim().length >= 2 &&
                !loadingExternos &&
                externos?.length === 0 && (
                  <p className="p-3 text-sm text-gray-500">
                    Nenhum resultado externo encontrado. Verifique os filtros ou crie
                    um alimento personalizado.
                  </p>
                )}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-3">Resumo do plano montado</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">Kcal total planejada</p>
            <p className="text-lg font-semibold text-blue-700">
              {macrosResumo.calorias.toFixed(1)}
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">Proteína total (g)</p>
            <p className="text-lg font-semibold text-green-700">
              {macrosResumo.proteinas.toFixed(1)}
            </p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">Carbo total (g)</p>
            <p className="text-lg font-semibold text-yellow-700">
              {macrosResumo.carboidratos.toFixed(1)}
            </p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">Gordura total (g)</p>
            <p className="text-lg font-semibold text-purple-700">
              {macrosResumo.gorduras.toFixed(1)}
            </p>
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
            Ainda não há check-ins de dieta para este aluno.
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
                  <Badge>{checkin.dietaDia.titulo}</Badge>
                  <span className="text-xs text-gray-500">
                    {format(new Date(checkin.iniciadoEm), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </span>
                </div>

                <p className="text-sm text-gray-700">
                  Refeições concluídas: {checkin.refeicoes.filter((ref) => ref.concluida).length}
                  /{checkin.refeicoes.length}
                </p>

                {checkin.observacaoDia && (
                  <p className="text-sm text-gray-700 mt-2">
                    <strong>Observação do aluno:</strong> {checkin.observacaoDia}
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
                    placeholder="Feedback para reforçar consistência e ajustes"
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
