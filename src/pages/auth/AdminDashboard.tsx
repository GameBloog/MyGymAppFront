import React from "react"
import { useNavigate } from "react-router-dom"
import {
  Users,
  UserPlus,
  Ticket,
  BarChart3,
  Plus,
  UserCheck,
} from "lucide-react"
import { Card, Button } from "../../components/ui"
import { useAlunos } from "../../hooks/useAlunos"
import { useInviteCodes } from "../../hooks/useInviteCodes"
import { useProfessores } from "../../hooks/useProfessores"

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { data: alunos, isLoading: loadingAlunos } = useAlunos()
  const { data: inviteCodes, isLoading: loadingCodes } = useInviteCodes()
  const { data: professores, isLoading: loadingProfessores } = useProfessores()

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
      title: "Códigos Usados",
      value: inviteCodes?.filter((c) => c.usedBy).length || 0,
      icon: BarChart3,
      color: "bg-orange-100 text-orange-600",
      onClick: () => navigate("/admin/invite-codes"),
    },
  ]

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
                  {loadingAlunos || loadingCodes || loadingProfessores
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
        <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/admin/professores")}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
          >
            <UserCheck className="h-6 w-6 text-purple-600 mb-2" />
            <h3 className="font-semibold text-gray-900">
              Gerenciar Professores
            </h3>
            <p className="text-sm text-gray-600">
              Ver, editar e criar professores
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/alunos")}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
          >
            <Users className="h-6 w-6 text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Gerenciar Alunos</h3>
            <p className="text-sm text-gray-600">
              Ver e editar todos os alunos do sistema
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/invite-codes")}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
          >
            <Ticket className="h-6 w-6 text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-900">Códigos de Convite</h3>
            <p className="text-sm text-gray-600">
              Gerenciar códigos para professores
            </p>
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
