import React from "react"
import { useNavigate } from "react-router-dom"
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Phone,
  Mail,
  Briefcase,
  UserCheck,
} from "lucide-react"
import { Card, Button, Badge } from "../../components/ui"
import { useProfessores, useDeleteProfessor } from "../../hooks/useProfessores"
import { showToast } from "../../utils/toast"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export const ProfessoresPage: React.FC = () => {
  const navigate = useNavigate()
  const { data: professores, isLoading, error, refetch } = useProfessores()
  const deleteProfessor = useDeleteProfessor()

  const handleDelete = async (id: string, nome: string) => {
    if (
      window.confirm(
        `Deseja realmente excluir o professor ${nome}?\n\n⚠️ Isso só é possível se ele não tiver alunos vinculados.`
      )
    ) {
      const toastId = showToast.loading("Excluindo professor...")

      try {
        await deleteProfessor.mutateAsync(id)
        showToast.dismiss(toastId)
        showToast.success("Professor excluído com sucesso!")
      } catch (error: any) {
        showToast.dismiss(toastId)
        showToast.error(error.message || "Erro ao excluir professor")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-600">Carregando professores...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-2 border-red-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Erro ao carregar professores
            </h3>
            <p className="text-red-800 mb-4">{error.message}</p>
            <div className="flex gap-3">
              <Button onClick={() => refetch()} variant="secondary">
                Tentar Novamente
              </Button>
              <Button onClick={() => navigate("/admin/professores/new")}>
                Cadastrar Novo Professor
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="p-2 hover:bg-white rounded-lg transition-colors"
            title="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Professores</h1>
            <p className="text-gray-600 mt-1">
              {professores?.length || 0}{" "}
              {professores?.length === 1 ? "professor" : "professores"}{" "}
              cadastrado(s)
            </p>
          </div>
        </div>

        <Button icon={Plus} onClick={() => navigate("/admin/professores/new")}>
          Novo Professor
        </Button>
      </div>

      <div className="grid gap-4">
        {professores && professores.length > 0 ? (
          professores.map((professor) => (
            <Card
              key={professor.id}
              className="hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {professor.user?.nome ||
                          `Professor #${professor.id.slice(0, 8)}`}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Cadastrado em{" "}
                        {format(
                          new Date(professor.createdAt),
                          "dd/MM/yyyy 'às' HH:mm",
                          { locale: ptBR }
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        navigate(`/admin/professores/${professor.id}/edit`)
                      }
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(
                          professor.id,
                          professor.user?.nome || "este professor"
                        )
                      }
                      disabled={deleteProfessor.isLoading}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {professor.user?.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">{professor.user.email}</span>
                    </div>
                  )}
                  {professor.telefone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">{professor.telefone}</span>
                    </div>
                  )}
                  {professor.especialidade && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">{professor.especialidade}</span>
                    </div>
                  )}
                  {professor.totalAlunos !== undefined && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">
                        {professor.totalAlunos}{" "}
                        {professor.totalAlunos === 1 ? "aluno" : "alunos"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {professor.totalAlunos !== undefined && (
                    <Badge
                      variant={
                        professor.totalAlunos > 0 ? "success" : "default"
                      }
                    >
                      {professor.totalAlunos > 0
                        ? `${professor.totalAlunos} aluno(s)`
                        : "Sem alunos"}
                    </Badge>
                  )}
                  {professor.especialidade && (
                    <Badge>{professor.especialidade}</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum professor cadastrado
            </h3>
            <p className="text-gray-500 mb-6">
              Cadastre o primeiro professor para começar
            </p>
            <Button
              icon={Plus}
              onClick={() => navigate("/admin/professores/new")}
            >
              Cadastrar Primeiro Professor
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
