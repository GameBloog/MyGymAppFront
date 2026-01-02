// src/pages/professor/ProfessorDashboard.tsx - COM BOTÃO DE EVOLUÇÃO
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Users,
  Plus,
  Search,
  User,
  Activity,
  Calendar,
  Phone,
  TrendingUp,
} from "lucide-react"
import { Card, Button, Input, Badge } from "../../components/ui"
import { useAlunos } from "../../hooks/useAlunos"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export const ProfessorDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { data: alunos, isLoading } = useAlunos()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredAlunos =
    alunos?.filter((aluno) => {
      const search = searchTerm.toLowerCase()
      const nome = aluno.user?.nome?.toLowerCase() || ""
      const email = aluno.user?.email?.toLowerCase() || ""

      return (
        nome.includes(search) ||
        email.includes(search) ||
        aluno.id.toLowerCase().includes(search)
      )
    }) || []

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Alunos</h1>
          <p className="text-gray-600 mt-1">
            {alunos?.length || 0} {alunos?.length === 1 ? "aluno" : "alunos"}{" "}
            cadastrado(s)
          </p>
        </div>

        <Button icon={Plus} onClick={() => navigate("/professor/alunos/new")}>
          Adicionar Aluno
        </Button>
      </div>

      {/* Search */}
      {alunos && alunos.length > 0 && (
        <Card className="mb-6">
          <Input
            icon={Search}
            placeholder="Buscar aluno por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Card>
      )}

      {/* Lista de Alunos */}
      {filteredAlunos.length > 0 ? (
        <div className="grid gap-4">
          {filteredAlunos.map((aluno) => (
            <Card key={aluno.id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {aluno.user?.nome || `Aluno #${aluno.id.slice(0, 8)}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {aluno.user?.email || "Email não disponível"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Cadastrado em{" "}
                      {format(new Date(aluno.createdAt), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>

                {/* Ações Rápidas */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      navigate(`/professor/alunos/${aluno.id}/evolucao`)
                    }
                    className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                    title="Ver Evolução"
                  >
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </button>
                </div>
              </div>

              {/* Info adicional */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {aluno.telefone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{aluno.telefone}</span>
                  </div>
                )}
                {aluno.idade && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{aluno.idade} anos</span>
                  </div>
                )}
                {aluno.dias_treino_semana !== null && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Activity className="h-4 w-4" />
                    <span className="text-sm">
                      {aluno.dias_treino_semana}x por semana
                    </span>
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {aluno.pesoKg && <Badge>Peso: {aluno.pesoKg} kg</Badge>}
                {aluno.alturaCm && (
                  <Badge variant="success">Alt: {aluno.alturaCm} cm</Badge>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 border-t pt-3">
                <Button
                  variant="secondary"
                  icon={TrendingUp}
                  onClick={() =>
                    navigate(`/professor/alunos/${aluno.id}/evolucao`)
                  }
                  className="flex-1"
                >
                  Ver Evolução
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/professor/alunos/${aluno.id}/edit`)}
                  className="flex-1"
                >
                  Editar Perfil
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? "Tente ajustar sua busca"
              : "Adicione seu primeiro aluno para começar"}
          </p>
          {!searchTerm ? (
            <Button
              icon={Plus}
              onClick={() => navigate("/professor/alunos/new")}
            >
              Adicionar Primeiro Aluno
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
