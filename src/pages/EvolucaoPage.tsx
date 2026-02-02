import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Trash2,
  TrendingUp,
} from "lucide-react"
import { Card, Button, Badge } from "../components/ui"
import { GraficoEvolucao } from "../components/GraficoEvolucao"
import { HistoricoForm } from "../components/HistoricoForm"
import { ConfirmModal } from "../components/ConfirmModal"
import { useHistorico, useDeleteHistorico } from "../hooks/useHistorico"
import { useAluno, useAlunos } from "../hooks/useAlunos"
import { useAuth } from "../hooks/useAuth"
import { showToast } from "../utils/toast"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { type MetricaEvolucao } from "../types/historico"

export const EvolucaoPage: React.FC = () => {
  const navigate = useNavigate()
  const { id: alunoIdParam } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [metricaSelecionada, setMetricaSelecionada] =
    useState<MetricaEvolucao>("pesoKg")
  const [showForm, setShowForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean
    id: string
  }>({ isOpen: false, id: "" })

  const isAdmin = user?.role === "ADMIN"
  const isProfessor = user?.role === "PROFESSOR"
  const isAluno = user?.role === "ALUNO"
  const podeEditar = isAdmin || isProfessor

  const { data: alunos } = useAlunos()
  const meuAlunoRegistro = isAluno
    ? alunos?.find((a) => a.userId === user?.id)
    : null

  const alunoId =
    isAluno && meuAlunoRegistro ? meuAlunoRegistro.id : alunoIdParam

  const { data: aluno, isLoading: loadingAluno } = useAluno(alunoId || "", {
    enabled: !!alunoId,
  })

  const {
    data: historico,
    isLoading: loadingHistorico,
    refetch,
  } = useHistorico(alunoId || "", undefined, {
    enabled: !!alunoId,
  })
  const deleteHistorico = useDeleteHistorico()

  const getBackRoute = () => {
    if (isAdmin) return "/admin/alunos"
    if (isProfessor) return "/professor/dashboard"
    return "/aluno/perfil"
  }

  const handleDelete = async (id: string) => {
    setConfirmDelete({ isOpen: true, id })
  }

  const confirmDeleteAction = async () => {
    try {
      await deleteHistorico.mutateAsync({
        id: confirmDelete.id,
        alunoId: alunoId || "",
      })
      setConfirmDelete({ isOpen: false, id: "" })
      refetch()
    } catch (error: any) {
      showToast.error(error.message || "Erro ao excluir registro")
    }
  }

  if (loadingAluno || loadingHistorico) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-600">Carregando...</p>
      </div>
    )
  }

  if (!aluno) {
    return (
      <Card className="bg-red-50 border-2 border-red-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Aluno não encontrado
            </h3>
            <Button
              onClick={() => navigate(getBackRoute())}
              variant="secondary"
            >
              Voltar
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(getBackRoute())}
            className="p-2 hover:bg-white rounded-lg transition-colors"
            title="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Evolução - {aluno.user?.nome || "Aluno"}
            </h1>
            <p className="text-gray-600 mt-1">
              {historico?.length || 0}{" "}
              {historico?.length === 1 ? "registro" : "registros"}
            </p>
          </div>
        </div>

        {podeEditar && (
          <Button
            icon={TrendingUp}
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? "secondary" : "primary"}
          >
            {showForm ? "Ocultar Formulário" : "Novo Registro"}
          </Button>
        )}
      </div>

      {podeEditar && showForm && (
        <div className="mb-6">
          <HistoricoForm
            alunoId={alunoId || ""}
            onSuccess={() => {
              setShowForm(false)
              refetch()
            }}
          />
        </div>
      )}

      <Card className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Selecione a métrica para visualizar:
        </label>
        <select
          value={metricaSelecionada}
          onChange={(e) =>
            setMetricaSelecionada(e.target.value as MetricaEvolucao)
          }
          className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="pesoKg">Peso (kg)</option>
          <option value="cinturaCm">Cintura (cm)</option>
          <option value="quadrilCm">Quadril (cm)</option>
          <option value="pescocoCm">Pescoço (cm)</option>
          <option value="percentualGordura">% Gordura</option>
          <option value="massaMuscularKg">Massa Muscular (kg)</option>
          <option value="bracoEsquerdoCm">Braço Esquerdo (cm)</option>
          <option value="bracoDireitoCm">Braço Direito (cm)</option>
          <option value="pernaEsquerdaCm">Perna Esquerda (cm)</option>
          <option value="pernaDireitaCm">Perna Direita (cm)</option>
        </select>
      </Card>

      <div className="mb-6">
        <GraficoEvolucao alunoId={alunoId || ""} metrica={metricaSelecionada} />
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Histórico Completo</h2>

        {historico && historico.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left text-sm font-medium text-gray-700">
                    Data
                  </th>
                  <th className="p-3 text-center text-sm font-medium text-gray-700">
                    Peso
                  </th>
                  <th className="p-3 text-center text-sm font-medium text-gray-700">
                    Altura
                  </th>
                  <th className="p-3 text-center text-sm font-medium text-gray-700">
                    Cintura
                  </th>
                  <th className="p-3 text-center text-sm font-medium text-gray-700">
                    % Gordura
                  </th>
                  <th className="p-3 text-left text-sm font-medium text-gray-700">
                    Observações
                  </th>
                  {podeEditar && (
                    <th className="p-3 text-center text-sm font-medium text-gray-700">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {historico.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm">
                      {format(new Date(item.dataRegistro), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </td>
                    <td className="p-3 text-center text-sm">
                      {item.pesoKg ? (
                        <Badge variant="success">{item.pesoKg} kg</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center text-sm">
                      {item.alturaCm ? (
                        <Badge>{item.alturaCm} cm</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center text-sm">
                      {item.cinturaCm ? (
                        <Badge variant="warning">{item.cinturaCm} cm</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center text-sm">
                      {item.percentualGordura ? (
                        <Badge variant="danger">
                          {item.percentualGordura}%
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {item.observacoes || "-"}
                    </td>
                    {podeEditar && (
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deleteHistorico.isLoading}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum registro de evolução
            </h3>
            <p className="text-gray-500 mb-6">
              {podeEditar
                ? "Adicione o primeiro registro para começar o acompanhamento"
                : "Ainda não há registros de evolução disponíveis"}
            </p>
            {podeEditar && !showForm && (
              <Button icon={TrendingUp} onClick={() => setShowForm(true)}>
                Adicionar Primeiro Registro
              </Button>
            )}
          </div>
        )}
      </Card>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Excluir Registro"
        message={`Deseja realmente excluir este registro de evolução?\n\nEsta ação não pode ser desfeita.`}
        confirmText="Sim, Excluir"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete({ isOpen: false, id: "" })}
        isLoading={deleteHistorico.isLoading}
      />
    </div>
  )
}
