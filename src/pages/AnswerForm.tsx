import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  User,
  Mail,
  Phone,
  Calendar,
  Activity,
  Heart,
  Plus,
  ArrowLeft,
} from "lucide-react"
import { Card, Input, Button, Textarea } from "../components/ui"
import { useCreateAnswer } from "../hooks/userAnswer"
import type { CreateUserAnswerDTO } from "../types/userAnswer"

export const AnswerForm: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const createAnswer = useCreateAnswer()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    alturaCm: "",
    pesoKg: "",
    idade: "",
    cinturaCm: "",
    quadrilCm: "",
    pescocoCm: "",
    dias_treino_semana: "",
    dores_articulares: "",
    frequencia_horarios_refeicoes: "",
  })

  const [alimentosDiario, setAlimentosDiario] = useState("")
  const [alimentosNaoCome, setAlimentosNaoCome] = useState("")
  const [alergias, setAlergias] = useState("")
  const [suplementos, setSuplementos] = useState("")

  const handleSubmit = async () => {
    if (!formData.nome || !formData.email) {
      alert("Por favor, preencha os campos obrigatórios (Nome e Email)")
      return
    }

    const dataToSend: CreateUserAnswerDTO = {
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone || undefined,
      alturaCm: formData.alturaCm ? Number(formData.alturaCm) : undefined,
      pesoKg: formData.pesoKg ? Number(formData.pesoKg) : undefined,
      idade: formData.idade ? Number(formData.idade) : undefined,
      cinturaCm: formData.cinturaCm ? Number(formData.cinturaCm) : undefined,
      quadrilCm: formData.quadrilCm ? Number(formData.quadrilCm) : undefined,
      pescocoCm: formData.pescocoCm ? Number(formData.pescocoCm) : undefined,
      dias_treino_semana: formData.dias_treino_semana
        ? Number(formData.dias_treino_semana)
        : undefined,
      dores_articulares: formData.dores_articulares || undefined,
      frequencia_horarios_refeicoes:
        formData.frequencia_horarios_refeicoes || undefined,
      alimentos_quer_diario: alimentosDiario
        ? alimentosDiario
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      alimentos_nao_comem: alimentosNaoCome
        ? alimentosNaoCome
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      alergias_alimentares: alergias
        ? alergias
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      suplementos_consumidos: suplementos
        ? suplementos
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
    }

    try {
      await createAnswer.mutateAsync(dataToSend)
      alert("Resposta cadastrada com sucesso!")
      navigate("/")
    } catch (error) {
      console.error("Erro ao cadastrar:", error)
      alert("Erro ao cadastrar resposta. Verifique se o backend está rodando.")
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/")}
          className="p-2 hover:bg-white rounded-lg transition-colors"
          title="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? "Editar Resposta" : "Nova Resposta"}
        </h1>
      </div>

      {/* Informações Pessoais */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <User className="h-5 w-5" />
          Informações Pessoais
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome Completo *"
            icon={User}
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            placeholder="João Silva"
            required
          />
          <Input
            label="Email *"
            icon={Mail}
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="joao@email.com"
            required
          />
          <Input
            label="Telefone"
            icon={Phone}
            value={formData.telefone}
            onChange={(e) =>
              setFormData({ ...formData, telefone: e.target.value })
            }
            placeholder="(11) 98765-4321"
          />
          <Input
            label="Idade"
            icon={Calendar}
            type="number"
            value={formData.idade}
            onChange={(e) =>
              setFormData({ ...formData, idade: e.target.value })
            }
            placeholder="28"
            min="1"
            max="120"
          />
        </div>
      </Card>

      {/* Medidas Corporais */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Medidas Corporais
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Input
            label="Altura (cm)"
            type="number"
            value={formData.alturaCm}
            onChange={(e) =>
              setFormData({ ...formData, alturaCm: e.target.value })
            }
            placeholder="175"
            min="100"
            max="250"
          />
          <Input
            label="Peso (kg)"
            type="number"
            step="0.1"
            value={formData.pesoKg}
            onChange={(e) =>
              setFormData({ ...formData, pesoKg: e.target.value })
            }
            placeholder="80.5"
            min="30"
            max="300"
          />
          <Input
            label="Cintura (cm)"
            type="number"
            value={formData.cinturaCm}
            onChange={(e) =>
              setFormData({ ...formData, cinturaCm: e.target.value })
            }
            placeholder="85"
          />
          <Input
            label="Quadril (cm)"
            type="number"
            value={formData.quadrilCm}
            onChange={(e) =>
              setFormData({ ...formData, quadrilCm: e.target.value })
            }
            placeholder="95"
          />
          <Input
            label="Pescoço (cm)"
            type="number"
            value={formData.pescocoCm}
            onChange={(e) =>
              setFormData({ ...formData, pescocoCm: e.target.value })
            }
            placeholder="38"
          />
          <Input
            label="Dias de treino/semana"
            type="number"
            value={formData.dias_treino_semana}
            onChange={(e) =>
              setFormData({ ...formData, dias_treino_semana: e.target.value })
            }
            placeholder="5"
            min="0"
            max="7"
          />
        </div>
      </Card>

      {/* Informações Nutricionais */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Informações Nutricionais e Saúde
        </h2>

        <div className="space-y-4">
          <Textarea
            label="Alimentos que quer consumir diariamente"
            rows={2}
            value={alimentosDiario}
            onChange={(e) => setAlimentosDiario(e.target.value)}
            placeholder="Ex: frango, arroz, brócolis (separados por vírgula)"
          />

          <Textarea
            label="Alimentos que não come"
            rows={2}
            value={alimentosNaoCome}
            onChange={(e) => setAlimentosNaoCome(e.target.value)}
            placeholder="Ex: carne vermelha, laticínios (separados por vírgula)"
          />

          <Textarea
            label="Alergias alimentares"
            rows={2}
            value={alergias}
            onChange={(e) => setAlergias(e.target.value)}
            placeholder="Ex: amendoim, frutos do mar (separados por vírgula)"
          />

          <Textarea
            label="Suplementos consumidos"
            rows={2}
            value={suplementos}
            onChange={(e) => setSuplementos(e.target.value)}
            placeholder="Ex: whey protein, creatina (separados por vírgula)"
          />

          <Textarea
            label="Dores articulares"
            rows={2}
            value={formData.dores_articulares}
            onChange={(e) =>
              setFormData({ ...formData, dores_articulares: e.target.value })
            }
            placeholder="Descreva suas dores articulares, se houver"
          />

          <Textarea
            label="Frequência e horários das refeições"
            rows={2}
            value={formData.frequencia_horarios_refeicoes}
            onChange={(e) =>
              setFormData({
                ...formData,
                frequencia_horarios_refeicoes: e.target.value,
              })
            }
            placeholder="Ex: 5 refeições - 7h, 10h, 13h, 16h, 20h"
          />
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={handleSubmit}
          icon={Plus}
          isLoading={createAnswer.isLoading}
        >
          {isEdit ? "Salvar Alterações" : "Cadastrar Resposta"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate("/")}
          disabled={createAnswer.isLoading}
        >
          Cancelar
        </Button>
      </div>
    </div>
  )
}
