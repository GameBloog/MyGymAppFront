import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, User, Mail, Phone, Activity, Calendar, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Card, Badge, Input, Button } from '../components/ui';
import { useAnswers, useDeleteAnswer } from '../hooks/userAnswer';
import { showToast } from '../utils/toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const AnswersList: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const { data: answers, isLoading, error, refetch } = useAnswers()
  const deleteAnswer = useDeleteAnswer()

  const handleDelete = async (id: string, nome: string) => {
    if (window.confirm(`Deseja realmente excluir a resposta de ${nome}?`)) {
      const toastId = showToast.loading("Excluindo resposta...")

      try {
        await deleteAnswer.mutateAsync(id)
        showToast.dismiss(toastId)
        showToast.success(`Resposta de ${nome} excluída com sucesso!`)
      } catch (error: any) {
        showToast.dismiss(toastId)
        showToast.error(error.message || "Erro ao excluir resposta")
      }
    }
  }

  const filteredAnswers =
    answers?.filter(
      (answer) =>
        answer.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        answer.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-600">Carregando respostas...</p>
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
              Erro ao carregar respostas
            </h3>
            <p className="text-red-800 mb-4">{error.message}</p>
            <div className="flex gap-3">
              <Button onClick={() => refetch()} variant="secondary">
                Tentar Novamente
              </Button>
              <Button onClick={() => navigate("/new")}>
                Cadastrar Nova Resposta
              </Button>
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
            Respostas Cadastradas
          </h1>
          <p className="text-gray-600 mt-1">
            {answers?.length || 0}{" "}
            {answers?.length === 1 ? "resposta" : "respostas"} cadastrada(s)
          </p>
        </div>
        <Button icon={Plus} onClick={() => navigate("/new")}>
          Nova Resposta
        </Button>
      </div>

      {/* Search */}
      {answers && answers.length > 0 && (
        <Card className="mb-6">
          <Input
            icon={Search}
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Card>
      )}

      {/* Lista */}
      <div className="grid gap-4">
        {filteredAnswers.map((answer) => (
          <Card key={answer.id} className="hover:shadow-lg transition-shadow">
            <div className="flex flex-col gap-4">
              {/* Header do Card */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {answer.nome}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Cadastrado em{" "}
                      {format(
                        new Date(answer.createdAt),
                        "dd/MM/yyyy 'às' HH:mm",
                        { locale: ptBR }
                      )}
                    </p>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/edit/${answer.id}`)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(answer.id, answer.nome)}
                    disabled={deleteAnswer.isLoading}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Informações Principais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm truncate">{answer.email}</span>
                </div>
                {answer.telefone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{answer.telefone}</span>
                  </div>
                )}
                {answer.idade && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{answer.idade} anos</span>
                  </div>
                )}
                {answer.dias_treino_semana !== null &&
                  answer.dias_treino_semana !== undefined && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Activity className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">
                        {answer.dias_treino_semana}x por semana
                      </span>
                    </div>
                  )}
              </div>

              {/* Badges de Medidas */}
              <div className="flex flex-wrap gap-2">
                {answer.alturaCm && <Badge>Altura: {answer.alturaCm} cm</Badge>}
                {answer.pesoKg && (
                  <Badge variant="success">Peso: {answer.pesoKg} kg</Badge>
                )}
                {answer.cinturaCm && (
                  <Badge>Cintura: {answer.cinturaCm} cm</Badge>
                )}
                {answer.quadrilCm && (
                  <Badge>Quadril: {answer.quadrilCm} cm</Badge>
                )}
                {answer.pescocoCm && (
                  <Badge>Pescoço: {answer.pescocoCm} cm</Badge>
                )}
              </div>

              {/* Informações Adicionais */}
              {(answer.alimentos_quer_diario?.length ||
                answer.alimentos_nao_comem?.length ||
                answer.alergias_alimentares?.length ||
                answer.suplementos_consumidos?.length ||
                answer.dores_articulares ||
                answer.frequencia_horarios_refeicoes) && (
                <div className="border-t pt-4 space-y-2 text-sm">
                  {answer.alimentos_quer_diario &&
                    answer.alimentos_quer_diario.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Alimentos diários:{" "}
                        </span>
                        <span className="text-gray-600">
                          {answer.alimentos_quer_diario.join(", ")}
                        </span>
                      </div>
                    )}
                  {answer.alimentos_nao_comem &&
                    answer.alimentos_nao_comem.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Não come:{" "}
                        </span>
                        <span className="text-gray-600">
                          {answer.alimentos_nao_comem.join(", ")}
                        </span>
                      </div>
                    )}
                  {answer.alergias_alimentares &&
                    answer.alergias_alimentares.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Alergias:{" "}
                        </span>
                        <span className="text-red-600 font-medium">
                          {answer.alergias_alimentares.join(", ")}
                        </span>
                      </div>
                    )}
                  {answer.suplementos_consumidos &&
                    answer.suplementos_consumidos.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Suplementos:{" "}
                        </span>
                        <span className="text-gray-600">
                          {answer.suplementos_consumidos.join(", ")}
                        </span>
                      </div>
                    )}
                  {answer.dores_articulares && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Dores articulares:{" "}
                      </span>
                      <span className="text-gray-600">
                        {answer.dores_articulares}
                      </span>
                    </div>
                  )}
                  {answer.frequencia_horarios_refeicoes && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Refeições:{" "}
                      </span>
                      <span className="text-gray-600">
                        {answer.frequencia_horarios_refeicoes}
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
      {filteredAnswers.length === 0 && (
        <Card className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm
              ? "Nenhuma resposta encontrada"
              : "Nenhuma resposta cadastrada"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? "Tente ajustar sua busca"
              : "Cadastre a primeira resposta para começar"}
          </p>
          {!searchTerm && (
            <Button icon={Plus} onClick={() => navigate("/new")}>
              Cadastrar Primeira Resposta
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