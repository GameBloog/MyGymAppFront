import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { Badge, Button, Card, Input } from "../components/ui"
import { useAnswers, useDeleteAnswer } from "../hooks/userAnswer"
import {
  Activity,
  Calendar,
  Edit,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
} from "lucide-react"
import { ptBR } from "date-fns/locale"

export const AnswersList: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const { data: answers, isLoading, error } = useAnswers()
  const deleteAnswer = useDeleteAnswer()

  const handleDelete = async (id: string, nome: string) => {
    if (window.confirm(`Deseja realmente excluir a resposta de ${nome}?`)) {
      try {
        await deleteAnswer.mutateAsync(id)
        alert("Resposta excluída com sucesso!")
      } catch (error) {
        alert(`Erro ao excluir resposta`)
        console.log(error)
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-50 border border-red-200">
        <p className=" text-red-800">
          Erro ao carregar respostas. Verifique se o backend está rodando em
          http://localhost:3333
        </p>
      </Card>
    )
  }

  return (
    <div>
      {/*Header*/}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Respostas Cadastradas
        </h1>
        <Button icon={Plus} onClick={() => navigate("/new")}>
          Nova Resposta
        </Button>
      </div>

      {/*Search */}
      <Card className="mb-6">
        <Input
          icon={Search}
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      {/*Lista */}
      <div className="grip gap-4">
        {filteredAnswers.map((answer) => (
          <Card key={answer.id} className="hover:shadow-lg transition-shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
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
                  {answer.dias_treino_semana && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Activity className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">
                        {answer.dias_treino_semana}x por semana
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {answer.alturaCm && (
                    <Badge variant="default">{answer.alturaCm} cm</Badge>
                  )}
                  {answer.pesoKg && (
                    <Badge variant="default">{answer.alturaCm} kg</Badge>
                  )}
                  {answer.cinturaCm && (
                    <Badge variant="default">{answer.alturaCm} cm</Badge>
                  )}
                </div>
              </div>
              <div className="flex sm:flex-col gap-2">
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
          </Card>
        ))}
      </div>
      {/*Empty State */}
      {filteredAnswers.length === 0 && (
        <Card className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma resposta encontrada
          </h3>
          <p className="text-gray-500 mb-6">
            {answers && answers.length > 0
              ? "Tente ajustar sua busca"
              : "Cadastre a primeira resposta para começar"}
          </p>

          {!answers ||
            (answers.length === 0 && (
              <Button icon={Plus} onClick={() => navigate("/new")}>
                Cadastrar Primeira Resposta
              </Button>
            ))}
        </Card>
      )}
    </div>
  )
}
