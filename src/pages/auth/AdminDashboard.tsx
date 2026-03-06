import React, { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Users,
  UserPlus,
  Ticket,
  Plus,
  UserCheck,
  Link2,
  MousePointerClick,
} from "lucide-react"
import { Card, Button } from "../../components/ui"
import { useAlunos } from "../../hooks/useAlunos"
import { useInviteCodes } from "../../hooks/useInviteCodes"
import { useProfessores } from "../../hooks/useProfessores"
import { useLeadAnalytics } from "../../hooks/useLeadLinks"

const ranges = [7, 30, 90] as const

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [leadRange, setLeadRange] = useState<(typeof ranges)[number]>(30)

  const { data: alunos, isLoading: loadingAlunos } = useAlunos()
  const { data: inviteCodes, isLoading: loadingCodes } = useInviteCodes()
  const { data: professores, isLoading: loadingProfessores } = useProfessores()
  const { data: leadAnalytics, isLoading: loadingLeads } = useLeadAnalytics(leadRange)

  const stats = [
    {
      title: "Professores",
      value: professores?.length || 0,
      icon: UserCheck,
      color: "bg-purple-100 text-purple-600",
      onClick: () => navigate("/admin/professores"),
    },
    {
      title: "Total de Alunos",
      value: alunos?.length || 0,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      onClick: () => navigate("/admin/alunos"),
    },
    {
      title: "Códigos Ativos",
      value: inviteCodes?.filter((c) => !c.usedBy).length || 0,
      icon: Ticket,
      color: "bg-green-100 text-green-600",
      onClick: () => navigate("/admin/invite-codes"),
    },
    {
      title: "Leads Únicos",
      value: leadAnalytics?.cards.clicksUnique || 0,
      icon: MousePointerClick,
      color: "bg-indigo-100 text-indigo-600",
      onClick: () => navigate("/admin/lead-links"),
    },
  ]

  const maxSeriesValue = useMemo(() => {
    if (!leadAnalytics?.series?.length) {
      return 1
    }

    return Math.max(...leadAnalytics.series.map((item) => item.clicksUnique), 1)
  }, [leadAnalytics?.series])

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Administrativo
          </h1>
          <p className="text-gray-600 mt-1">Visão geral do sistema</p>
        </div>

        <div className="flex gap-3">
          <Button
            icon={UserCheck}
            onClick={() => navigate("/admin/professores/new")}
          >
            Novo Professor
          </Button>
          <Button icon={Plus} onClick={() => navigate("/admin/alunos/new")}>
            Novo Aluno
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={stat.onClick}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {loadingAlunos || loadingCodes || loadingProfessores || loadingLeads
                    ? "..."
                    : stat.value}
                </p>
              </div>
              <div className={`p-4 rounded-full ${stat.color}`}>
                <stat.icon className="h-8 w-8" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Aquisição de Leads</h2>
            <p className="text-sm text-gray-600">
              Cliques rastreados, conversão e ranking de links
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white"
              value={leadRange}
              onChange={(event) =>
                setLeadRange(Number(event.target.value) as (typeof ranges)[number])
              }
            >
              {ranges.map((range) => (
                <option key={range} value={range}>
                  {range} dias
                </option>
              ))}
            </select>
            <Button icon={Link2} onClick={() => navigate("/admin/lead-links")}>
              Gerenciar Links
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm text-blue-700">Cliques totais</p>
            <p className="text-2xl font-bold text-blue-900">
              {loadingLeads ? "..." : leadAnalytics?.cards.clicksTotal || 0}
            </p>
          </div>
          <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
            <p className="text-sm text-green-700">Cliques únicos</p>
            <p className="text-2xl font-bold text-green-900">
              {loadingLeads ? "..." : leadAnalytics?.cards.clicksUnique || 0}
            </p>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-sm text-amber-700">Novos cadastros</p>
            <p className="text-2xl font-bold text-amber-900">
              {loadingLeads ? "..." : leadAnalytics?.cards.novosCadastros || 0}
            </p>
          </div>
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
            <p className="text-sm text-indigo-700">Taxa de conversão</p>
            <p className="text-2xl font-bold text-indigo-900">
              {loadingLeads
                ? "..."
                : `${leadAnalytics?.cards.conversao?.toFixed(2) || "0.00"}%`}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            Evolução diária de cliques únicos
          </h3>
          <div className="overflow-x-auto">
            <div className="min-w-[640px] flex items-end gap-2 h-44 p-3 bg-gray-50 rounded-lg border border-gray-200">
              {(leadAnalytics?.series || []).map((point) => {
                const height = Math.max(
                  8,
                  Math.round((point.clicksUnique / maxSeriesValue) * 120),
                )

                return (
                  <div key={point.date} className="flex flex-col items-center gap-2 w-10">
                    <span className="text-[11px] text-gray-700">{point.clicksUnique}</span>
                    <div
                      className="w-8 rounded-t bg-indigo-500"
                      style={{ height: `${height}px` }}
                      title={`${point.date}: ${point.clicksUnique} cliques únicos`}
                    />
                    <span className="text-[11px] text-gray-500">{point.date.slice(5)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Top links</h3>
          <div className="space-y-2">
            {(leadAnalytics?.topLinks || []).slice(0, 5).map((item) => (
              <div
                key={item.leadLinkId}
                className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-2"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.nome}</p>
                  <p className="text-sm text-gray-600">{item.slug}</p>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-700">
                  <span>Total: {item.clicksTotal}</span>
                  <span>Únicos: {item.clicksUnique}</span>
                  <span>Cadastros: {item.novosCadastros}</span>
                  <span>Conv.: {item.conversao.toFixed(2)}%</span>
                </div>
              </div>
            ))}

            {!loadingLeads && (!leadAnalytics?.topLinks || leadAnalytics.topLinks.length === 0) && (
              <p className="text-sm text-gray-600">Nenhum dado de lead no período.</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/admin/professores")}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
          >
            <UserCheck className="h-6 w-6 text-purple-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Gerenciar Professores</h3>
            <p className="text-sm text-gray-600">Ver, editar e criar professores</p>
          </button>

          <button
            onClick={() => navigate("/admin/alunos")}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
          >
            <Users className="h-6 w-6 text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Gerenciar Alunos</h3>
            <p className="text-sm text-gray-600">Ver e editar todos os alunos do sistema</p>
          </button>

          <button
            onClick={() => navigate("/admin/invite-codes")}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
          >
            <Ticket className="h-6 w-6 text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Códigos de Convite</h3>
            <p className="text-sm text-gray-600">Gerenciar códigos para professores</p>
          </button>

          <button
            onClick={() => navigate("/admin/lead-links")}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
          >
            <Link2 className="h-6 w-6 text-indigo-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Links de Lead</h3>
            <p className="text-sm text-gray-600">Criar links rastreáveis e acompanhar conversão</p>
          </button>
        </div>
      </Card>

      {alunos && alunos.length > 0 && (
        <Card className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Últimos Alunos Cadastrados
            </h2>
            <Button
              variant="secondary"
              onClick={() => navigate("/admin/alunos")}
            >
              Ver Todos
            </Button>
          </div>

          <div className="space-y-3">
            {alunos.slice(0, 5).map((aluno) => (
              <div
                key={aluno.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => navigate(`/admin/alunos/${aluno.id}/edit`)}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <UserPlus className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {aluno.user?.nome || `Aluno #${aluno.id.slice(0, 8)}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(aluno.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {aluno.pesoKg && (
                    <p className="text-sm font-medium">{aluno.pesoKg} kg</p>
                  )}
                  {aluno.dias_treino_semana && (
                    <p className="text-xs text-gray-600">
                      {aluno.dias_treino_semana}x/semana
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
