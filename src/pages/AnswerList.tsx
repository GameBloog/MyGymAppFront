import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, User, Phone, Activity, Calendar, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Card, Badge, Input, Button } from '../components/ui';
import { useAlunos, useDeleteAluno } from '../hooks/useAlunos';
import { useAuth } from '../hooks/useAuth';
import { showToast } from '../utils/toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const AnswersList: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const { data: alunos, isLoading, error, refetch } = useAlunos()
  const deleteAluno = useDeleteAluno()

  // Determinar rotas baseadas no role
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

  const canDelete = user?.role === "ADMIN" || user?.role === "PROFESSOR"
  const canCreate = user?.role === "ADMIN" || user?.role === "PROFESSOR"

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Deseja realmente excluir este aluno? Esta ação não pode ser desfeita."
      )
    ) {
      const toastId = showToast.loading("Excluindo aluno...")

      try {
        await deleteAluno.mutateAsync(id)
        showToast.dismiss(toastId)
        showToast.success("Aluno excluído com sucesso!")
      } catch (error: any) {
        showToast.dismiss(toastId)
        showToast.error(error.message || "Erro ao excluir aluno")
      }
    }
  }

  const filteredAlunos =
    alunos?.filter((aluno) => {
      const search = searchTerm.toLowerCase()
      return (
        aluno.id.toLowerCase().includes(search) ||
        aluno.telefone?.toLowerCase().includes(search)
      )
    }) || []

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-600">Carregando alunos...</p>
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
              Erro ao carregar alunos
            </h3>
            <p className="text-red-800 mb-4">{error.message}</p>
            <div className="flex gap-3">
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === "ALUNO" ? "Meu Perfil" : "Alunos"}
          </h1>
          <p className="text-gray-600 mt-1">
            {alunos?.length || 0} {alunos?.length === 1 ? "aluno" : "alunos"}{" "}
            cadastrado(s)
          </p>
        </div>

        {canCreate && (
          <Button icon={Plus} onClick={() => navigate(getNewRoute())}>
            Novo Aluno
          </Button>
        )}
      </div>

      {/* Search */}
      {alunos && alunos.length > 1 && (
        <Card className="mb-6">
          <Input
            icon={Search}
            placeholder="Buscar aluno por ID ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Card>
      )}

      {/* Lista */}
      <div className="grid gap-4">
        {filteredAlunos.map((aluno) => (
          <Card key={aluno.id} className="hover:shadow-lg transition-shadow">
            <div className="flex flex-col gap-4">
              {/* Header do Card */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Aluno #{aluno.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Cadastrado em{" "}
                      {format(
                        new Date(aluno.createdAt),
                        "dd/MM/yyyy 'às' HH:mm",
                        { locale: ptBR }
                      )}
                    </p>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(getEditRoute(aluno.id))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                  </button>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(aluno.id)}
                      disabled={deleteAluno.isLoading}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* Informações Principais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {aluno.telefone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{aluno.telefone}</span>
                  </div>
                )}
                {aluno.idade && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{aluno.idade} anos</span>
                  </div>
                )}
                {aluno.dias_treino_semana !== null &&
                  aluno.dias_treino_semana !== undefined && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Activity className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">
                        {aluno.dias_treino_semana}x por semana
                      </span>
                    </div>
                  )}
              </div>

              {/* Badges de Medidas */}
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

              {/* Informações Adicionais */}
              {(aluno.alimentos_quer_diario?.length ||
                aluno.alimentos_nao_comem?.length ||
                aluno.alergias_alimentares?.length ||
                aluno.suplementos_consumidos?.length ||
                aluno.dores_articulares ||
                aluno.frequencia_horarios_refeicoes) && (
                <div className="border-t pt-4 space-y-2 text-sm">
                  {aluno.alimentos_quer_diario &&
                    aluno.alimentos_quer_diario.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Alimentos diários:{" "}
                        </span>
                        <span className="text-gray-600">
                          {aluno.alimentos_quer_diario.join(", ")}
                        </span>
                      </div>
                    )}
                  {aluno.alimentos_nao_comem &&
                    aluno.alimentos_nao_comem.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Não come:{" "}
                        </span>
                        <span className="text-gray-600">
                          {aluno.alimentos_nao_comem.join(", ")}
                        </span>
                      </div>
                    )}
                  {aluno.alergias_alimentares &&
                    aluno.alergias_alimentares.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Alergias:{" "}
                        </span>
                        <span className="text-red-600 font-medium">
                          {aluno.alergias_alimentares.join(", ")}
                        </span>
                      </div>
                    )}
                  {aluno.suplementos_consumidos &&
                    aluno.suplementos_consumidos.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Suplementos:{" "}
                        </span>
                        <span className="text-gray-600">
                          {aluno.suplementos_consumidos.join(", ")}
                        </span>
                      </div>
                    )}
                  {aluno.dores_articulares && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Dores articulares:{" "}
                      </span>
                      <span className="text-gray-600">
                        {aluno.dores_articulares}
                      </span>
                    </div>
                  )}
                  {aluno.frequencia_horarios_refeicoes && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Refeições:{" "}
                      </span>
                      <span className="text-gray-600">
                        {aluno.frequencia_horarios_refeicoes}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAlunos.length === 0 && (
        <Card className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? "Tente ajustar sua busca"
              : "Cadastre o primeiro aluno para começar"}
          </p>
          {!searchTerm && canCreate && (
            <Button icon={Plus} onClick={() => navigate(getNewRoute())}>
              Cadastrar Primeiro Aluno
            </Button>
          )}
          {searchTerm && (
            <Button variant="secondary" onClick={() => setSearchTerm("")}>
              Limpar Busca
            </Button>
          )}
        </Card>
      )}
    </div>
  )
}