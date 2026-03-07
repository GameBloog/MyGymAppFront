import React, { useState } from "react"
import { Camera } from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  Plus,
  User,
  Phone,
  Activity,
  Calendar,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Mail,
  TrendingUp,
  Dumbbell,
  UtensilsCrossed,
} from "lucide-react"
import { Card, Badge, Input, Button } from "../components/ui"
import { useAlunos, useDeleteAluno } from "../hooks/useAlunos"
import { useAuth } from "../hooks/useAuth"
import { showToast } from "../utils/toast"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export const AnswersList: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const { data: alunos, isLoading, error, refetch } = useAlunos()
  const deleteAluno = useDeleteAluno()

  const getNewRoute = () => {
    if (user?.role === "ADMIN") return "/admin/alunos/new"
    if (user?.role === "PROFESSOR") return "/professor/alunos/new"
    return "/aluno/perfil"
  }

  const getEditRoute = (id: string) => {
    if (user?.role === "ADMIN") return `/admin/alunos/${id}/edit`
    if (user?.role === "PROFESSOR") return `/professor/alunos/${id}/edit`
    return `/aluno/perfil`
  }

  const getEvolucaoRoute = (id: string) => {
    if (user?.role === "ADMIN") return `/admin/alunos/${id}/evolucao`
    if (user?.role === "PROFESSOR") return `/professor/alunos/${id}/evolucao`
    return `/aluno/evolucao`
  }

  const getFotosRoute = (id: string) => {
    if (user?.role === "ADMIN") return `/admin/alunos/${id}/fotos-arquivos`
    if (user?.role === "PROFESSOR")
      return `/professor/alunos/${id}/fotos-arquivos`
    return `/aluno/fotos-arquivos`
  }

  const getTreinoRoute = (id: string) => {
    if (user?.role === "ADMIN") return `/admin/alunos/${id}/treino`
    if (user?.role === "PROFESSOR") return `/professor/alunos/${id}/treino`
    return "/aluno/treino"
  }

  const getDietaRoute = (id: string) => {
    if (user?.role === "ADMIN") return `/admin/alunos/${id}/dieta`
    if (user?.role === "PROFESSOR") return `/professor/alunos/${id}/dieta`
    return "/aluno/dieta"
  }

  const canDelete = user?.role === "ADMIN" || user?.role === "PROFESSOR"
  const canCreate = user?.role === "ADMIN" || user?.role === "PROFESSOR"
  const canViewEvolucao = true

  const handleDelete = async (id: string, nome: string) => {
    if (
      window.confirm(
        `Deseja realmente excluir o aluno ${nome}?\n\nEsta ação não pode ser desfeita.`,
      )
    ) {
      const toastId = showToast.loading("Excluindo aluno...")

      try {
        await deleteAluno.mutateAsync(id)
        showToast.dismiss(toastId)
        showToast.success("Aluno excluído com sucesso!")
      } catch (error) {
        showToast.dismiss(toastId)
        if (error instanceof Error) {
          showToast.error(error.message)
        } else {
          showToast.error("Erro ao excluir aluno")
        }
      }
    }
  }

  const filteredAlunos =
    alunos?.filter((aluno) => {
      const search = searchTerm.toLowerCase()
      const nome = aluno.user?.nome?.toLowerCase() || ""
      const email = aluno.user?.email?.toLowerCase() || ""
      const telefone = aluno.telefone?.toLowerCase() || ""

      return (
        nome.includes(search) ||
        email.includes(search) ||
        telefone.includes(search) ||
        aluno.id.toLowerCase().includes(search)
      )
    }) || []

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-zinc-300">Carregando alunos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-950/40 border-2 border-red-500/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-300 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              Erro ao carregar alunos
            </h3>
            <p className="text-zinc-100 mb-4">{error.message}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => refetch()} variant="secondary">
                Tentar Novamente
              </Button>
              {canCreate && (
                <Button onClick={() => navigate(getNewRoute())}>
                  Cadastrar Novo Aluno
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {user?.role === "ALUNO" ? "Meu Perfil" : "Alunos"}
          </h1>
          <p className="text-zinc-300 mt-1">
            {alunos?.length || 0} {alunos?.length === 1 ? "aluno" : "alunos"}{" "}
            cadastrado(s)
          </p>
        </div>
        {canCreate && (
          <Button icon={Plus} onClick={() => navigate(getNewRoute())}>
            <span className="hidden sm:inline">Novo Aluno</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        )}
      </div>

      {alunos && alunos.length > 1 && (
        <Card className="mb-6">
          <Input
            icon={Search}
            placeholder="Buscar aluno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Card>
      )}

      <div className="grid gap-4">
        {filteredAlunos.map((aluno) => (
          <Card key={aluno.id} className="hover:shadow-lg transition-shadow">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="bg-blue-500/15 p-2 rounded-full flex-shrink-0">
                    <User className="h-5 w-5 text-blue-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {aluno.user?.nome || `Aluno #${aluno.id.slice(0, 8)}`}
                    </h3>
                    <p className="text-sm text-zinc-400 truncate">
                      {format(
                        new Date(aluno.createdAt),
                        "dd/MM/yyyy 'às' HH:mm",
                        { locale: ptBR },
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  {canViewEvolucao && (
                    <button
                      onClick={() => navigate(getEvolucaoRoute(aluno.id))}
                      className="p-2 hover:bg-emerald-950/30 rounded-lg transition-colors"
                      title="Ver Evolução"
                    >
                      <TrendingUp className="h-4 w-4 text-emerald-300" />
                    </button>
                  )}

                  <button
                    onClick={() => navigate(getFotosRoute(aluno.id))}
                    className="p-2 hover:bg-purple-950/30 rounded-lg transition-colors"
                    title="Ver Fotos e Arquivos"
                  >
                    <Camera className="h-4 w-4 text-purple-300" />
                  </button>

                  <button
                    onClick={() => navigate(getEditRoute(aluno.id))}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4 text-zinc-300" />
                  </button>

                  <button
                    onClick={() => navigate(getTreinoRoute(aluno.id))}
                    className="p-2 hover:bg-blue-950/30 rounded-lg transition-colors"
                    title="Treino"
                  >
                    <Dumbbell className="h-4 w-4 text-blue-300" />
                  </button>
                  <button
                    onClick={() => navigate(getDietaRoute(aluno.id))}
                    className="p-2 hover:bg-orange-950/30 rounded-lg transition-colors"
                    title="Dieta"
                  >
                    <UtensilsCrossed className="h-4 w-4 text-orange-300" />
                  </button>

                  {canDelete && (
                    <button
                      onClick={() =>
                        handleDelete(aluno.id, aluno.user?.nome || "este aluno")
                      }
                      disabled={deleteAluno.isLoading}
                      className="p-2 hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4 text-red-300" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {aluno.user?.email && (
                  <div className="flex items-center gap-2 text-zinc-300 min-w-0">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm truncate">{aluno.user.email}</span>
                  </div>
                )}
                {aluno.telefone && (
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{aluno.telefone}</span>
                  </div>
                )}
                {aluno.idade && (
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{aluno.idade} anos</span>
                  </div>
                )}
                {aluno.dias_treino_semana !== null &&
                  aluno.dias_treino_semana !== undefined && (
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Activity className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">
                        {aluno.dias_treino_semana}x por semana
                      </span>
                    </div>
                  )}
              </div>

              <div className="flex flex-wrap gap-2">
                {aluno.alturaCm && <Badge>Altura: {aluno.alturaCm} cm</Badge>}
                {aluno.pesoKg && (
                  <Badge variant="success">Peso: {aluno.pesoKg} kg</Badge>
                )}
                {aluno.cinturaCm && (
                  <Badge>Cintura: {aluno.cinturaCm} cm</Badge>
                )}
                {aluno.quadrilCm && (
                  <Badge>Quadril: {aluno.quadrilCm} cm</Badge>
                )}
                {aluno.pescocoCm && (
                  <Badge>Pescoço: {aluno.pescocoCm} cm</Badge>
                )}
              </div>

              <div className="border-t border-zinc-800 pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant="secondary"
                  icon={TrendingUp}
                  onClick={() => navigate(getEvolucaoRoute(aluno.id))}
                  className="w-full justify-center"
                >
                  Ver Evolução Completa
                </Button>
                <Button
                  variant="secondary"
                  icon={Dumbbell}
                  onClick={() => navigate(getTreinoRoute(aluno.id))}
                  className="w-full justify-center"
                >
                  Editor de Treino
                </Button>
                <Button
                  variant="secondary"
                  icon={UtensilsCrossed}
                  onClick={() => navigate(getDietaRoute(aluno.id))}
                  className="w-full justify-center"
                >
                  Editor de Dieta
                </Button>
              </div>

              {(aluno.alimentos_quer_diario?.length ||
                aluno.alimentos_nao_comem?.length ||
                aluno.alergias_alimentares?.length ||
                aluno.suplementos_consumidos?.length ||
                aluno.dores_articulares ||
                aluno.frequencia_horarios_refeicoes ||
                aluno.objetivos_atuais ||
                (aluno.toma_remedio !== null &&
                  aluno.toma_remedio !== undefined)) && (
                <div className="border-t border-zinc-800 pt-4 space-y-2 text-sm">
                  {aluno.alimentos_quer_diario &&
                    aluno.alimentos_quer_diario.length > 0 && (
                      <div>
                        <span className="font-medium text-zinc-200">
                          Alimentos diários:{" "}
                        </span>
                        <span className="text-zinc-300">
                          {aluno.alimentos_quer_diario.join(", ")}
                        </span>
                      </div>
                    )}
                  {aluno.alimentos_nao_comem &&
                    aluno.alimentos_nao_comem.length > 0 && (
                      <div>
                        <span className="font-medium text-zinc-200">
                          Não come:{" "}
                        </span>
                        <span className="text-zinc-300">
                          {aluno.alimentos_nao_comem.join(", ")}
                        </span>
                      </div>
                    )}
                  {aluno.alergias_alimentares &&
                    aluno.alergias_alimentares.length > 0 && (
                      <div>
                        <span className="font-medium text-zinc-200">
                          Alergias:{" "}
                        </span>
                        <span className="text-red-300 font-medium">
                          {aluno.alergias_alimentares.join(", ")}
                        </span>
                      </div>
                    )}
                  {aluno.suplementos_consumidos &&
                    aluno.suplementos_consumidos.length > 0 && (
                      <div>
                        <span className="font-medium text-zinc-200">
                          Suplementos:{" "}
                        </span>
                        <span className="text-zinc-300">
                          {aluno.suplementos_consumidos.join(", ")}
                        </span>
                      </div>
                    )}
                  {aluno.dores_articulares && (
                    <div>
                      <span className="font-medium text-zinc-200">
                        Dores articulares:{" "}
                      </span>
                      <span className="text-zinc-300">
                        {aluno.dores_articulares}
                      </span>
                    </div>
                  )}
                  {aluno.frequencia_horarios_refeicoes && (
                    <div>
                      <span className="font-medium text-zinc-200">
                        Refeições:{" "}
                      </span>
                      <span className="text-zinc-300">
                        {aluno.frequencia_horarios_refeicoes}
                      </span>
                    </div>
                  )}
                  {aluno.objetivos_atuais && (
                    <div>
                      <span className="font-medium text-zinc-200">
                        Objetivos atuais:{" "}
                      </span>
                      <span className="text-zinc-300">
                        {aluno.objetivos_atuais}
                      </span>
                    </div>
                  )}
                  {aluno.toma_remedio !== null &&
                    aluno.toma_remedio !== undefined && (
                      <div>
                        <span className="font-medium text-zinc-200">
                          Toma remédio:{" "}
                        </span>
                        <span className="text-zinc-300">
                          {aluno.toma_remedio ? "Sim" : "Não"}
                        </span>
                      </div>
                    )}
                  {aluno.remedios_uso && (
                    <div>
                      <span className="font-medium text-zinc-200">
                        Quais remédios:{" "}
                      </span>
                      <span className="text-zinc-300">{aluno.remedios_uso}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredAlunos.length === 0 && (
        <Card className="text-center py-12">
          <User className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            {searchTerm ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}
          </h3>
          <p className="text-zinc-400 mb-6">
            {searchTerm
              ? "Tente ajustar sua busca"
              : "Cadastre o primeiro aluno para começar"}
          </p>
          {!searchTerm && canCreate ? (
            <Button icon={Plus} onClick={() => navigate(getNewRoute())}>
              Cadastrar Primeiro Aluno
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => setSearchTerm("")}>
              Limpar Busca
            </Button>
          )}
        </Card>
      )}
    </div>
  )
}
