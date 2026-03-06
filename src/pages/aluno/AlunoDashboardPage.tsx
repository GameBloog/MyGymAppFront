import React, { useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  CalendarDays,
  Camera,
  ClipboardList,
  Dumbbell,
  FileText,
  Flame,
  Loader2,
  MessageSquareText,
  Target,
  TrendingUp,
  User,
  UtensilsCrossed,
} from "lucide-react"
import { format, addDays, endOfWeek, isWithinInterval, set, startOfDay, startOfWeek, subDays, subWeeks } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge, Button, Card } from "../../components/ui"
import { useAuth } from "../../hooks/useAuth"
import { useMyAluno } from "../../hooks/useMyAluno"
import { useHistorico } from "../../hooks/useHistorico"
import { useArquivoAluno } from "../../hooks/useArquivoAluno"
import { usePlanoDietaAtivo, useDietaCheckins } from "../../hooks/useDieta"
import { usePlanoTreinoAtivo, useTreinoCheckins, useTreinoTimeline } from "../../hooks/useTreino"
import { formatDiaSemana } from "../../utils/treino"
import type { TimelineEventoTreino } from "../../types"

type BadgeVariant = "default" | "success" | "warning" | "danger"

interface NextMeal {
  dataHora: Date
  diaTitulo: string
  refeicaoNome: string
}

interface NextWorkout {
  dataHora: Date
  diaTitulo: string
}

interface FeedEvent {
  id: string
  dataHora: string
  origem: "TREINO" | "DIETA"
  titulo: string
  descricao: string
  variant: BadgeVariant
}

const getIsoDay = (date: Date): number => {
  const day = date.getDay()
  return day === 0 ? 7 : day
}

const parseTime = (horario: string | null | undefined, ordem: number) => {
  if (horario) {
    const match = horario.match(/^([01]?\d|2[0-3]):([0-5]\d)$/)
    if (match) {
      return { hour: Number(match[1]), minute: Number(match[2]) }
    }
  }

  const hourFallback = Math.min(22, 7 + ordem * 3)
  return { hour: hourFallback, minute: 0 }
}

const treinoTimelineLabel = (
  evento: TimelineEventoTreino,
): { titulo: string; variant: BadgeVariant } => {
  switch (evento.tipo) {
    case "TREINO_INICIADO":
      return { titulo: "Treino iniciado", variant: "warning" }
    case "EXERCICIO_CONCLUIDO":
      return { titulo: "Exercício concluído", variant: "success" }
    case "TREINO_FINALIZADO":
      return { titulo: "Treino finalizado", variant: "success" }
    case "COMENTARIO_PROFESSOR":
      return { titulo: "Comentário do professor", variant: "default" }
    default:
      return { titulo: "Treino", variant: "default" }
  }
}

export const AlunoDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { token } = useAuth()
  const { data: aluno, isLoading: loadingAluno } = useMyAluno()
  const alunoId = aluno?.id || ""

  const {
    data: planoTreino,
    error: treinoError,
    isLoading: loadingTreino,
  } = usePlanoTreinoAtivo(alunoId, !!alunoId)
  const { data: treinoCheckins, isLoading: loadingTreinoCheckins } = useTreinoCheckins(
    alunoId,
    40,
    !!alunoId,
  )
  const { data: treinoTimeline, isLoading: loadingTreinoTimeline } = useTreinoTimeline(
    alunoId,
    60,
    !!alunoId,
  )

  const {
    data: planoDieta,
    error: dietaError,
    isLoading: loadingDieta,
  } = usePlanoDietaAtivo(alunoId, !!alunoId)
  const { data: dietaCheckins, isLoading: loadingDietaCheckins } = useDietaCheckins(
    alunoId,
    40,
    !!alunoId,
  )

  const { data: historico, isLoading: loadingHistorico } = useHistorico(
    alunoId,
    { limite: 30 },
    { enabled: !!alunoId },
  )

  const arquivoHook = useArquivoAluno(token || "")
  useEffect(() => {
    if (alunoId && token) {
      arquivoHook.fetchArquivos(alunoId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alunoId, token])

  const treinoNaoEncontrado =
    treinoError?.message?.toLowerCase().includes("não encontrado") ||
    treinoError?.message?.toLowerCase().includes("recurso não encontrado")
  const dietaNaoEncontrada =
    dietaError?.message?.toLowerCase().includes("não encontrado") ||
    dietaError?.message?.toLowerCase().includes("recurso não encontrado")

  const proximoTreino = useMemo<NextWorkout | null>(() => {
    if (!planoTreino?.dias?.length) {
      return null
    }

    const now = new Date()
    const hojeInicio = startOfDay(now)
    const concluidosHoje = new Set(
      (treinoCheckins || [])
        .filter((checkin) => {
          if (checkin.status !== "CONCLUIDO") return false
          const data = new Date(checkin.iniciadoEm)
          return data >= hojeInicio
        })
        .map((checkin) => checkin.treinoDiaId),
    )

    const candidates: NextWorkout[] = []

    for (let offset = 0; offset <= 14; offset += 1) {
      const dayBase = addDays(hojeInicio, offset)
      const isoDay = getIsoDay(dayBase)

      for (const dia of planoTreino.dias) {
        if (dia.diaSemana && dia.diaSemana !== isoDay) {
          continue
        }

        if (offset === 0 && concluidosHoje.has(dia.id)) {
          continue
        }

        const dateCandidate = set(dayBase, {
          hours: 6 + (dia.ordem - 1),
          minutes: 0,
          seconds: 0,
          milliseconds: 0,
        })

        if (dateCandidate < now) {
          continue
        }

        candidates.push({
          dataHora: dateCandidate,
          diaTitulo: dia.titulo,
        })
      }

      if (candidates.length > 0) {
        break
      }
    }

    if (candidates.length === 0) {
      const first = [...planoTreino.dias].sort((a, b) => a.ordem - b.ordem)[0]
      return first
        ? {
            dataHora: now,
            diaTitulo: first.titulo,
          }
        : null
    }

    candidates.sort((a, b) => a.dataHora.getTime() - b.dataHora.getTime())
    return candidates[0]
  }, [planoTreino, treinoCheckins])

  const proximaRefeicao = useMemo<NextMeal | null>(() => {
    if (!planoDieta?.dias?.length) {
      return null
    }

    const now = new Date()
    const hojeInicio = startOfDay(now)
    const candidates: NextMeal[] = []

    for (let offset = 0; offset <= 7; offset += 1) {
      const dayBase = addDays(hojeInicio, offset)
      const isoDay = getIsoDay(dayBase)

      for (const dia of planoDieta.dias) {
        if (dia.diaSemana && dia.diaSemana !== isoDay) {
          continue
        }

        const refeicoesOrdenadas = [...dia.refeicoes].sort((a, b) => a.ordem - b.ordem)
        for (const refeicao of refeicoesOrdenadas) {
          const { hour, minute } = parseTime(refeicao.horario, refeicao.ordem)
          const dateCandidate = set(dayBase, {
            hours: hour,
            minutes: minute,
            seconds: 0,
            milliseconds: 0,
          })

          if (dateCandidate < now) {
            continue
          }

          candidates.push({
            dataHora: dateCandidate,
            diaTitulo: dia.titulo,
            refeicaoNome: refeicao.nome,
          })
        }
      }

      if (candidates.length > 0) {
        break
      }
    }

    if (candidates.length === 0) {
      const firstDay = [...planoDieta.dias].sort((a, b) => a.ordem - b.ordem)[0]
      const firstMeal = firstDay?.refeicoes?.sort((a, b) => a.ordem - b.ordem)[0]

      if (!firstDay || !firstMeal) {
        return null
      }

      return {
        dataHora: now,
        diaTitulo: firstDay.titulo,
        refeicaoNome: firstMeal.nome,
      }
    }

    candidates.sort((a, b) => a.dataHora.getTime() - b.dataHora.getTime())
    return candidates[0]
  }, [planoDieta])

  const ultimaDietaPdf = useMemo(() => {
    return [...arquivoHook.dietas].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0]
  }, [arquivoHook.dietas])

  const ultimoTreinoPdf = useMemo(() => {
    return [...arquivoHook.treinos].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0]
  }, [arquivoHook.treinos])

  const inicioSemana = startOfWeek(new Date(), { weekStartsOn: 1 })
  const fimSemana = endOfWeek(new Date(), { weekStartsOn: 1 })

  const checkinsTreinoSemana = useMemo(() => {
    return (treinoCheckins || []).filter((item) =>
      isWithinInterval(new Date(item.iniciadoEm), {
        start: inicioSemana,
        end: fimSemana,
      }),
    ).length
  }, [fimSemana, inicioSemana, treinoCheckins])

  const checkinsDietaSemana = useMemo(() => {
    return (dietaCheckins || []).filter((item) =>
      isWithinInterval(new Date(item.iniciadoEm), {
        start: inicioSemana,
        end: fimSemana,
      }),
    ).length
  }, [dietaCheckins, fimSemana, inicioSemana])

  const progressoSemanaDieta = useMemo(() => {
    const checkinsSemana = (dietaCheckins || []).filter((item) =>
      isWithinInterval(new Date(item.iniciadoEm), {
        start: inicioSemana,
        end: fimSemana,
      }),
    )

    const totalRefeicoes = checkinsSemana.reduce(
      (acc, checkin) => acc + checkin.refeicoes.length,
      0,
    )
    if (totalRefeicoes === 0) {
      return 0
    }

    const refeicoesConcluidas = checkinsSemana.reduce(
      (acc, checkin) => acc + checkin.refeicoes.filter((ref) => ref.concluida).length,
      0,
    )

    return Math.round((refeicoesConcluidas / totalRefeicoes) * 100)
  }, [dietaCheckins, fimSemana, inicioSemana])

  const frequenciaTreino28Dias = useMemo(() => {
    const limite = subDays(new Date(), 28)
    return (treinoCheckins || []).filter(
      (item) => new Date(item.iniciadoEm) >= limite && item.status === "CONCLUIDO",
    ).length
  }, [treinoCheckins])

  const comentariosProfessor = useMemo(() => {
    const commentsFromTreino = (treinoCheckins || [])
      .filter((item) => !!item.comentarioProfessor)
      .map((item) => ({
        id: `treino-${item.id}`,
        origem: "Treino",
        texto: item.comentarioProfessor as string,
        dataHora: item.updatedAt,
      }))

    const commentsFromDieta = (dietaCheckins || [])
      .filter((item) => !!item.comentarioProfessor)
      .map((item) => ({
        id: `dieta-${item.id}`,
        origem: "Dieta",
        texto: item.comentarioProfessor as string,
        dataHora: item.updatedAt,
      }))

    return [...commentsFromTreino, ...commentsFromDieta]
      .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())
      .slice(0, 4)
  }, [dietaCheckins, treinoCheckins])

  const feed = useMemo<FeedEvent[]>(() => {
    const treinoEvents = (treinoTimeline || []).map((evento) => {
      const meta = treinoTimelineLabel(evento)
      return {
        id: `treino-${evento.id}`,
        dataHora: evento.dataHora,
        origem: "TREINO" as const,
        titulo: meta.titulo,
        descricao: `${evento.descricao} • ${evento.treinoDiaTitulo}`,
        variant: meta.variant,
      }
    })

    const dietaEvents = (dietaCheckins || []).flatMap((checkin) => {
      const events: FeedEvent[] = [
        {
          id: `dieta-start-${checkin.id}`,
          dataHora: checkin.iniciadoEm,
          origem: "DIETA",
          titulo: "Dia de dieta iniciado",
          descricao: checkin.dietaDia.titulo,
          variant: "warning",
        },
      ]

      for (const refeicao of checkin.refeicoes.filter((item) => item.concluida)) {
        events.push({
          id: `dieta-refeicao-${refeicao.id}`,
          dataHora: refeicao.updatedAt,
          origem: "DIETA",
          titulo: "Refeição concluída",
          descricao: `${checkin.dietaDia.titulo} • ${refeicao.dietaRefeicao.nome}`,
          variant: "success",
        })
      }

      if (checkin.finalizadoEm) {
        events.push({
          id: `dieta-end-${checkin.id}`,
          dataHora: checkin.finalizadoEm,
          origem: "DIETA",
          titulo: "Dia alimentar finalizado",
          descricao: checkin.dietaDia.titulo,
          variant: "success",
        })
      }

      if (checkin.comentarioProfessor) {
        events.push({
          id: `dieta-prof-${checkin.id}`,
          dataHora: checkin.updatedAt,
          origem: "DIETA",
          titulo: "Comentário do professor",
          descricao: checkin.comentarioProfessor,
          variant: "default",
        })
      }

      return events
    })

    return [...treinoEvents, ...dietaEvents]
      .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())
      .slice(0, 24)
  }, [dietaCheckins, treinoTimeline])

  const serieSemanal = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 8 }).map((_, index) => {
      const shift = 7 - index
      const inicio = startOfWeek(subWeeks(now, shift), { weekStartsOn: 1 })
      const fim = endOfWeek(subWeeks(now, shift), { weekStartsOn: 1 })

      const treino = (treinoCheckins || []).filter((item) =>
        isWithinInterval(new Date(item.iniciadoEm), {
          start: inicio,
          end: fim,
        }),
      ).length

      const dieta = (dietaCheckins || []).filter((item) =>
        isWithinInterval(new Date(item.iniciadoEm), {
          start: inicio,
          end: fim,
        }),
      ).length

      return {
        key: format(inicio, "dd/MM"),
        treino,
        dieta,
      }
    })
  }, [dietaCheckins, treinoCheckins])

  const seriePeso = useMemo(() => {
    return [...(historico || [])]
      .filter((item) => item.pesoKg !== null && item.pesoKg !== undefined)
      .sort(
        (a, b) =>
          new Date(a.dataRegistro).getTime() - new Date(b.dataRegistro).getTime(),
      )
      .slice(-8)
  }, [historico])

  const loadingBase = loadingAluno || loadingHistorico

  if (loadingBase) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-gray-600">Carregando dashboard...</p>
      </div>
    )
  }

  if (!aluno) {
    return (
      <Card className="bg-red-50 border-2 border-red-200">
        <p className="text-red-700">
          Não foi possível carregar seu perfil de aluno para montar o dashboard.
        </p>
      </Card>
    )
  }

  const maxCheckinSemana = Math.max(
    1,
    ...serieSemanal.flatMap((item) => [item.treino, item.dieta]),
  )
  const valoresPeso = seriePeso.map((item) => item.pesoKg as number)
  const minPeso = valoresPeso.length > 0 ? Math.min(...valoresPeso) : 0
  const maxPeso = valoresPeso.length > 0 ? Math.max(...valoresPeso) : 0

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Dashboard do Aluno
            </h1>
            <p className="text-blue-100 mt-1">
              Bem-vindo, {aluno.user?.nome}. Seu resumo semanal está aqui.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="warning">
              Semana: {format(inicioSemana, "dd/MM")} - {format(fimSemana, "dd/MM")}
            </Badge>
            <Badge variant="success">
              {checkinsTreinoSemana} treino(s) / {checkinsDietaSemana} dieta(s)
            </Badge>
          </div>
        </div>
      </Card>

      {(treinoError && !treinoNaoEncontrado) || (dietaError && !dietaNaoEncontrada) ? (
        <Card className="bg-red-50 border-2 border-red-200">
          <p className="text-red-700">
            Erro ao carregar parte dos dados do dashboard. Treino:{" "}
            {treinoError?.message || "ok"} | Dieta: {dietaError?.message || "ok"}
          </p>
        </Card>
      ) : null}

      <Card>
        <h2 className="text-lg font-semibold mb-4">Atalhos rápidos</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          <Button variant="secondary" icon={User} onClick={() => navigate("/aluno/perfil")}>
            Formulário
          </Button>
          <Button
            variant="secondary"
            icon={TrendingUp}
            onClick={() => navigate("/aluno/evolucao")}
          >
            Histórico
          </Button>
          <Button
            variant="secondary"
            icon={UtensilsCrossed}
            onClick={() => navigate("/aluno/dieta")}
          >
            Dieta
          </Button>
          <Button
            variant="secondary"
            icon={Dumbbell}
            onClick={() => navigate("/aluno/treino")}
          >
            Treino
          </Button>
          <Button
            variant="secondary"
            icon={Camera}
            onClick={() => navigate("/aluno/fotos-arquivos")}
          >
            Enviar Fotos
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <UtensilsCrossed className="h-5 w-5 text-blue-700" />
            <h2 className="text-lg font-semibold">Próxima refeição</h2>
          </div>

          {loadingDieta && (
            <p className="text-sm text-gray-600">Carregando agenda de dieta...</p>
          )}

          {!loadingDieta && proximaRefeicao && (
            <div className="space-y-2">
              <p className="text-xl font-bold text-gray-900">{proximaRefeicao.refeicaoNome}</p>
              <p className="text-sm text-gray-600">
                {proximaRefeicao.diaTitulo} •{" "}
                {format(proximaRefeicao.dataHora, "dd/MM/yyyy HH:mm", {
                  locale: ptBR,
                })}
              </p>
              <Button
                icon={UtensilsCrossed}
                onClick={() => navigate("/aluno/dieta")}
              >
                Abrir dieta dinâmica
              </Button>
            </div>
          )}

          {!loadingDieta && !proximaRefeicao && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Nenhum plano de dieta dinâmico ativo no momento.
              </p>
              {ultimaDietaPdf ? (
                <a
                  href={ultimaDietaPdf.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex"
                >
                  <Button icon={FileText}>Abrir última dieta em PDF</Button>
                </a>
              ) : (
                <p className="text-sm text-gray-500">
                  Também não há PDF de dieta disponível.
                </p>
              )}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Dumbbell className="h-5 w-5 text-blue-700" />
            <h2 className="text-lg font-semibold">Próximo treino</h2>
          </div>

          {loadingTreino && (
            <p className="text-sm text-gray-600">Carregando agenda de treino...</p>
          )}

          {!loadingTreino && proximoTreino && (
            <div className="space-y-2">
              <p className="text-xl font-bold text-gray-900">{proximoTreino.diaTitulo}</p>
              <p className="text-sm text-gray-600">
                {format(proximoTreino.dataHora, "dd/MM/yyyy", { locale: ptBR })} •{" "}
                {formatDiaSemana(getIsoDay(proximoTreino.dataHora))}
              </p>
              <Button
                icon={Dumbbell}
                onClick={() => navigate("/aluno/treino")}
              >
                Abrir treino dinâmico
              </Button>
            </div>
          )}

          {!loadingTreino && !proximoTreino && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Nenhum plano de treino dinâmico ativo no momento.
              </p>
              {ultimoTreinoPdf ? (
                <a
                  href={ultimoTreinoPdf.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex"
                >
                  <Button icon={FileText}>Abrir último treino em PDF</Button>
                </a>
              ) : (
                <p className="text-sm text-gray-500">
                  Também não há PDF de treino disponível.
                </p>
              )}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Resumo semanal</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-xs text-gray-600">Treinos na semana</p>
              <p className="text-2xl font-bold text-blue-700">{checkinsTreinoSemana}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <p className="text-xs text-gray-600">Check-ins dieta</p>
              <p className="text-2xl font-bold text-green-700">{checkinsDietaSemana}</p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-3">
              <p className="text-xs text-gray-600">Aderência dieta</p>
              <p className="text-2xl font-bold text-yellow-700">{progressoSemanaDieta}%</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Frequência de treino nos últimos 28 dias:{" "}
            <strong>{frequenciaTreino28Dias} sessão(ões) concluída(s)</strong>.
          </p>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquareText className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Recados do professor</h2>
          </div>

          {comentariosProfessor.length === 0 && (
            <p className="text-sm text-gray-500">
              Quando houver feedback no treino ou dieta ele aparece aqui.
            </p>
          )}

          <div className="space-y-3">
            {comentariosProfessor.map((comment) => (
              <div key={comment.id} className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge>{comment.origem}</Badge>
                  <span className="text-xs text-gray-600">
                    {format(new Date(comment.dataHora), "dd/MM HH:mm", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
                <p className="text-sm text-blue-900 mt-2">{comment.texto}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Check-ins por semana</h2>
          </div>
          <div className="space-y-3">
            {serieSemanal.map((item) => {
              const treinoWidth = (item.treino / maxCheckinSemana) * 100
              const dietaWidth = (item.dieta / maxCheckinSemana) * 100
              return (
                <div key={item.key}>
                  <p className="text-xs text-gray-600 mb-1">Semana {item.key}</p>
                  <div className="space-y-1">
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${treinoWidth}%` }} />
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full bg-green-600 rounded-full" style={{ width: `${dietaWidth}%` }} />
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Treino: {item.treino} | Dieta: {item.dieta}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Evolução de peso</h2>
          </div>

          {seriePeso.length === 0 && (
            <p className="text-sm text-gray-500">
              Sem registros de evolução com peso para montar o gráfico.
            </p>
          )}

          {seriePeso.length > 0 && (
            <div className="space-y-3">
              <div className="h-44 border-l border-b border-gray-200 px-2 flex items-end gap-2">
                {seriePeso.map((item) => {
                  const peso = item.pesoKg as number
                  const heightPercent =
                    maxPeso === minPeso ? 65 : 20 + ((peso - minPeso) / (maxPeso - minPeso)) * 70
                  return (
                    <div key={item.id} className="flex-1 flex flex-col items-center justify-end gap-1">
                      <div
                        className="w-full rounded-t bg-blue-500"
                        style={{ height: `${heightPercent}%` }}
                        title={`${peso} kg`}
                      />
                      <span className="text-[10px] text-gray-500">
                        {format(new Date(item.dataRegistro), "dd/MM")}
                      </span>
                    </div>
                  )
                })}
              </div>
              <p className="text-sm text-gray-600">
                Atual: <strong>{seriePeso[seriePeso.length - 1].pesoKg} kg</strong> | Inicial:{" "}
                <strong>{seriePeso[0].pesoKg} kg</strong>
              </p>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Timeline de atividades</h2>
        </div>

        {(loadingTreinoTimeline || loadingTreinoCheckins || loadingDietaCheckins) && (
          <div className="flex items-center gap-2 text-gray-600 mb-3">
            <Loader2 className="h-4 w-4 animate-spin" />
            Atualizando feed...
          </div>
        )}

        {feed.length === 0 && (
          <p className="text-sm text-gray-500">
            Sem atividades ainda. Comece o treino ou dieta para alimentar sua timeline.
          </p>
        )}

        <div className="space-y-3">
          {feed.map((event) => (
            <div key={event.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge variant={event.variant}>{event.titulo}</Badge>
                <Badge>{event.origem}</Badge>
                <span className="text-xs text-gray-500">
                  {format(new Date(event.dataHora), "dd/MM/yyyy HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-800">{event.descricao}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
