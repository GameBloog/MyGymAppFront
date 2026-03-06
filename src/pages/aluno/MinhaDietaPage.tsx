import React, { useEffect, useMemo, useState } from "react"
import {
  CheckCircle2,
  ClipboardList,
  Loader2,
  PlayCircle,
  Save,
  UtensilsCrossed,
} from "lucide-react"
import { Badge, Button, Card, Textarea } from "../../components/ui"
import { useMyAluno } from "../../hooks/useMyAluno"
import {
  useDietaCheckins,
  useFinalizeDietaCheckin,
  usePlanoDietaAtivo,
  useStartDietaCheckin,
  useUpdateDietaRefeicaoCheckin,
} from "../../hooks/useDieta"
import { formatDiaSemana } from "../../utils/treino"
import { showToast } from "../../utils/toast"
import type { DietaCheckin } from "../../types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface RefeicaoDraft {
  concluida: boolean
  observacaoAluno: string
}

const buildDrafts = (checkin: DietaCheckin) => {
  const next: Record<string, RefeicaoDraft> = {}
  for (const item of checkin.refeicoes) {
    next[item.dietaRefeicaoId] = {
      concluida: item.concluida,
      observacaoAluno: item.observacaoAluno || "",
    }
  }
  return next
}

const getCompletion = (checkin: DietaCheckin | null) => {
  if (!checkin || checkin.refeicoes.length === 0) return 0
  const done = checkin.refeicoes.filter((item) => item.concluida).length
  return Math.round((done / checkin.refeicoes.length) * 100)
}

export const MinhaDietaPage: React.FC = () => {
  const { data: aluno, isLoading: loadingAluno } = useMyAluno()
  const alunoId = aluno?.id || ""

  const {
    data: planoAtivo,
    isLoading: loadingPlano,
    error: erroPlano,
  } = usePlanoDietaAtivo(alunoId, !!alunoId)
  const {
    data: checkins,
    isLoading: loadingCheckins,
  } = useDietaCheckins(alunoId, 30, !!alunoId)

  const startCheckin = useStartDietaCheckin()
  const updateRefeicao = useUpdateDietaRefeicaoCheckin()
  const finalizeCheckin = useFinalizeDietaCheckin()

  const [selectedDiaId, setSelectedDiaId] = useState("")
  const [checkinAtual, setCheckinAtual] = useState<DietaCheckin | null>(null)
  const [refeicaoDrafts, setRefeicaoDrafts] = useState<Record<string, RefeicaoDraft>>({})
  const [observacaoDia, setObservacaoDia] = useState("")

  const erroPlanoNaoEncontrado =
    erroPlano?.message?.toLowerCase().includes("não encontrado") ||
    erroPlano?.message?.toLowerCase().includes("recurso não encontrado")

  useEffect(() => {
    if (!selectedDiaId && planoAtivo?.dias?.length) {
      setSelectedDiaId(planoAtivo.dias[0].id)
    }
  }, [planoAtivo, selectedDiaId])

  useEffect(() => {
    if (!checkins || checkins.length === 0) {
      return
    }

    const aberto = checkins.find((item) => item.status === "INICIADO")
    if (aberto) {
      setCheckinAtual(aberto)
    }
  }, [checkins])

  useEffect(() => {
    if (!checkinAtual) {
      setRefeicaoDrafts({})
      setObservacaoDia("")
      return
    }
    setRefeicaoDrafts(buildDrafts(checkinAtual))
    setObservacaoDia(checkinAtual.observacaoDia || "")
  }, [checkinAtual])

  const historicoOrdenado = useMemo(() => {
    return [...(checkins || [])].sort(
      (a, b) =>
        new Date(b.iniciadoEm).getTime() - new Date(a.iniciadoEm).getTime(),
    )
  }, [checkins])

  const handleStart = async () => {
    if (!selectedDiaId || !alunoId) {
      showToast.error("Selecione um dia")
      return
    }
    const checkin = await startCheckin.mutateAsync({ dietaDiaId: selectedDiaId, alunoId })
    setCheckinAtual(checkin)
    showToast.success("Dia de dieta iniciado")
  }

  const handleDraftChange = (refeicaoId: string, patch: Partial<RefeicaoDraft>) => {
    setRefeicaoDrafts((prev) => ({
      ...prev,
      [refeicaoId]: {
        ...prev[refeicaoId],
        ...patch,
      },
    }))
  }

  const handleSaveRefeicao = async (dietaRefeicaoId: string) => {
    if (!checkinAtual || !alunoId) return
    const draft = refeicaoDrafts[dietaRefeicaoId]
    if (!draft) return

    const updated = await updateRefeicao.mutateAsync({
      checkinId: checkinAtual.id,
      dietaRefeicaoId,
      alunoId,
      data: {
        concluida: draft.concluida,
        observacaoAluno: draft.observacaoAluno.trim() || undefined,
      },
    })

    setCheckinAtual((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        refeicoes: prev.refeicoes.map((ref) => {
          if (ref.dietaRefeicaoId === dietaRefeicaoId) {
            return updated as DietaCheckin["refeicoes"][number]
          }
          return ref
        }),
      }
    })
    showToast.success("Refeição atualizada")
  }

  const handleFinalize = async () => {
    if (!checkinAtual || !alunoId) return
    const done = await finalizeCheckin.mutateAsync({
      checkinId: checkinAtual.id,
      alunoId,
      observacaoDia: observacaoDia.trim() || undefined,
    })
    setCheckinAtual(done)
  }

  const progresso = getCompletion(checkinAtual)

  if (loadingAluno || loadingPlano) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-gray-600">Carregando sua dieta...</p>
      </div>
    )
  }

  if (!aluno) {
    return (
      <Card className="bg-yellow-50 border-2 border-yellow-200">
        <p className="text-yellow-800">
          Não foi possível localizar seu perfil de aluno para carregar a dieta.
        </p>
      </Card>
    )
  }

  if (erroPlano && !erroPlanoNaoEncontrado) {
    return (
      <Card className="bg-red-50 border-2 border-red-200">
        <p className="text-red-700">{erroPlano.message}</p>
      </Card>
    )
  }

  if (!planoAtivo) {
    return (
      <Card>
        <div className="text-center py-8">
          <UtensilsCrossed className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Dieta ainda não configurada
          </h2>
          <p className="text-gray-600">
            Seu professor ainda não montou o plano alimentar nesta área.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Minha Dieta</h1>
        <p className="text-gray-600">
          {planoAtivo.nome} • {planoAtivo.objetivo.toLowerCase()}
        </p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold mb-3">Metas diárias</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-gray-600">Calorias</p>
            <p className="text-lg font-semibold text-blue-700">
              {planoAtivo.caloriasMeta.toFixed(0)} kcal
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-gray-600">Proteína</p>
            <p className="text-lg font-semibold text-green-700">
              {planoAtivo.proteinasMetaG.toFixed(0)} g
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <p className="text-xs text-gray-600">Carboidrato</p>
            <p className="text-lg font-semibold text-yellow-700">
              {planoAtivo.carboidratosMetaG.toFixed(0)} g
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-xs text-gray-600">Gordura</p>
            <p className="text-lg font-semibold text-purple-700">
              {planoAtivo.gordurasMetaG.toFixed(0)} g
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-3">Selecionar dia alimentar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {planoAtivo.dias.map((dia) => (
            <button
              key={dia.id}
              onClick={() => setSelectedDiaId(dia.id)}
              className={`p-4 rounded-lg border text-left transition-colors ${
                selectedDiaId === dia.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className="font-semibold text-gray-900">{dia.titulo}</p>
              <p className="text-sm text-gray-600">{formatDiaSemana(dia.diaSemana)}</p>
              <p className="text-xs text-gray-500 mt-1">
                {dia.refeicoes.length} refeição(ões)
              </p>
            </button>
          ))}
        </div>
        <div className="mt-4">
          <Button icon={PlayCircle} onClick={handleStart} isLoading={startCheckin.isLoading}>
            Iniciar dia da dieta
          </Button>
        </div>
      </Card>

      {checkinAtual && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="text-lg font-semibold">
              Check-in atual: {checkinAtual.dietaDia.titulo}
            </h2>
            <Badge variant={checkinAtual.status === "CONCLUIDO" ? "success" : "warning"}>
              {checkinAtual.status === "CONCLUIDO" ? "Concluído" : "Em andamento"}
            </Badge>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progresso do dia</span>
              <span>{progresso}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 rounded-full"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {checkinAtual.refeicoes.map((refeicao) => {
              const draft = refeicaoDrafts[refeicao.dietaRefeicaoId] || {
                concluida: false,
                observacaoAluno: "",
              }
              const totalKcal = refeicao.dietaRefeicao.itens.reduce(
                (acc, item) => acc + item.calorias,
                0,
              )

              return (
                <div
                  key={refeicao.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {refeicao.dietaRefeicao.nome}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {refeicao.dietaRefeicao.horario || "Horário livre"} •{" "}
                        {totalKcal.toFixed(0)} kcal
                      </p>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={draft.concluida}
                        onChange={(e) =>
                          handleDraftChange(refeicao.dietaRefeicaoId, {
                            concluida: e.target.checked,
                          })
                        }
                      />
                      Refeição feita
                    </label>
                  </div>

                  <div className="space-y-2 mb-3">
                    {refeicao.dietaRefeicao.itens.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 rounded border border-gray-200 bg-white text-sm"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <strong>{item.alimento.nome}</strong>
                          <Badge>{item.quantidadeGramas}g</Badge>
                          <Badge variant="success">{item.calorias} kcal</Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          P {item.proteinas}g • C {item.carboidratos}g • G {item.gorduras}g
                        </p>
                      </div>
                    ))}
                  </div>

                  <Textarea
                    label="Observação na refeição"
                    rows={2}
                    value={draft.observacaoAluno}
                    onChange={(e) =>
                      handleDraftChange(refeicao.dietaRefeicaoId, {
                        observacaoAluno: e.target.value,
                      })
                    }
                    placeholder="Ex: troquei arroz por batata"
                  />

                  <Button
                    variant="secondary"
                    icon={Save}
                    onClick={() => handleSaveRefeicao(refeicao.dietaRefeicaoId)}
                    isLoading={updateRefeicao.isLoading}
                  >
                    Salvar refeição
                  </Button>
                </div>
              )
            })}
          </div>

          <div className="mt-4">
            <Textarea
              label="Observação geral do dia"
              rows={3}
              value={observacaoDia}
              onChange={(e) => setObservacaoDia(e.target.value)}
              placeholder="Como foi o dia alimentar? Fome, saciedade, trocas etc."
            />
            <Button
              icon={CheckCircle2}
              onClick={handleFinalize}
              isLoading={finalizeCheckin.isLoading}
              disabled={checkinAtual.status === "CONCLUIDO"}
            >
              {checkinAtual.status === "CONCLUIDO"
                ? "Dia já finalizado"
                : "Marcar dia como concluído"}
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Histórico de dias alimentares</h2>
        </div>

        {loadingCheckins && (
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando histórico...
          </div>
        )}

        {!loadingCheckins && historicoOrdenado.length === 0 && (
          <p className="text-sm text-gray-500">Nenhum dia registrado ainda.</p>
        )}

        <div className="space-y-3">
          {historicoOrdenado.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge variant={item.status === "CONCLUIDO" ? "success" : "warning"}>
                  {item.status === "CONCLUIDO" ? "Concluído" : "Em andamento"}
                </Badge>
                <Badge>{item.dietaDia.titulo}</Badge>
                <span className="text-xs text-gray-500">
                  {format(new Date(item.iniciadoEm), "dd/MM/yyyy HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                Refeições feitas: {item.refeicoes.filter((ref) => ref.concluida).length}/
                {item.refeicoes.length}
              </p>
              {item.observacaoDia && (
                <p className="text-sm text-gray-700 mt-1">
                  <strong>Observação:</strong> {item.observacaoDia}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
