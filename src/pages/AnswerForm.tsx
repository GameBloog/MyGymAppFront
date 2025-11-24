import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  User,
  Mail,
  Lock,
  Phone,
  Calendar,
  Activity,
  Heart,
  Plus,
  ArrowLeft,
  Loader2,
  Save,
  RotateCcw,
} from "lucide-react"
import { Card, Input, Button, Textarea } from "../components/ui"
import { useCreateAluno, useUpdateAluno, useAluno } from "../hooks/useAlunos"
import { type CreateAlunoDTO, type UpdateAlunoDTO } from "../types"
import { showToast } from "../utils/toast"
import { useAuth } from "../hooks/useAuth"

const initialFormState = {
  nome: "",
  email: "",
  password: "",
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
}

export const AnswerForm: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const isEdit = Boolean(id)

  // CORREÇÃO: Aluno sempre edita a si mesmo
  const isAluno = user?.role === "ALUNO"
  const alunoIdToEdit = isAluno ? user.id : id

  const createAluno = useCreateAluno()
  const updateAluno = useUpdateAluno()
  const { data: existingAluno, isLoading: loadingAluno } = useAluno(
    alunoIdToEdit || ""
  )

  const [formData, setFormData] = useState(initialFormState)
  const [alimentosDiario, setAlimentosDiario] = useState("")
  const [alimentosNaoCome, setAlimentosNaoCome] = useState("")
  const [alergias, setAlergias] = useState("")
  const [suplementos, setSuplementos] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const getBackRoute = () => {
    if (user?.role === "ADMIN") return "/admin/alunos"
    if (user?.role === "PROFESSOR") return "/professor/dashboard"
    return "/aluno/perfil"
  }

  useEffect(() => {
    if ((isEdit || isAluno) && existingAluno) {
      setFormData({
        nome: "",
        email: "",
        password: "",
        telefone: existingAluno.telefone || "",
        alturaCm: existingAluno.alturaCm?.toString() || "",
        pesoKg: existingAluno.pesoKg?.toString() || "",
        idade: existingAluno.idade?.toString() || "",
        cinturaCm: existingAluno.cinturaCm?.toString() || "",
        quadrilCm: existingAluno.quadrilCm?.toString() || "",
        pescocoCm: existingAluno.pescocoCm?.toString() || "",
        dias_treino_semana: existingAluno.dias_treino_semana?.toString() || "",
        dores_articulares: existingAluno.dores_articulares || "",
        frequencia_horarios_refeicoes:
          existingAluno.frequencia_horarios_refeicoes || "",
      })

      setAlimentosDiario(existingAluno.alimentos_quer_diario?.join(", ") || "")
      setAlimentosNaoCome(existingAluno.alimentos_nao_comem?.join(", ") || "")
      setAlergias(existingAluno.alergias_alimentares?.join(", ") || "")
      setSuplementos(existingAluno.suplementos_consumidos?.join(", ") || "")
    }
  }, [isEdit, isAluno, existingAluno])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!isEdit && !isAluno) {
      if (!formData.nome.trim()) {
        newErrors.nome = "Nome é obrigatório"
      } else if (formData.nome.trim().length < 2) {
        newErrors.nome = "Nome deve ter pelo menos 2 caracteres"
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email é obrigatório"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Email inválido"
      }

      if (!formData.password) {
        newErrors.password = "Senha é obrigatória"
      } else if (formData.password.length < 6) {
        newErrors.password = "Senha deve ter pelo menos 6 caracteres"
      }
    }

    if (formData.dias_treino_semana) {
      const dias = Number(formData.dias_treino_semana)
      if (dias < 0 || dias > 7) {
        newErrors.dias_treino_semana = "Dias de treino deve estar entre 0 e 7"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setFormData(initialFormState)
    setAlimentosDiario("")
    setAlimentosNaoCome("")
    setAlergias("")
    setSuplementos("")
    setErrors({})
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast.error("Por favor, corrija os erros no formulário")
      return
    }

    try {
      if (isEdit || isAluno) {
        const dataToSend: UpdateAlunoDTO = {}

        if (formData.telefone.trim())
          dataToSend.telefone = formData.telefone.trim()
        if (formData.alturaCm) dataToSend.alturaCm = Number(formData.alturaCm)
        if (formData.pesoKg) dataToSend.pesoKg = Number(formData.pesoKg)
        if (formData.idade) dataToSend.idade = Number(formData.idade)
        if (formData.cinturaCm)
          dataToSend.cinturaCm = Number(formData.cinturaCm)
        if (formData.quadrilCm)
          dataToSend.quadrilCm = Number(formData.quadrilCm)
        if (formData.pescocoCm)
          dataToSend.pescocoCm = Number(formData.pescocoCm)
        if (formData.dias_treino_semana)
          dataToSend.dias_treino_semana = Number(formData.dias_treino_semana)
        if (formData.dores_articulares.trim())
          dataToSend.dores_articulares = formData.dores_articulares.trim()
        if (formData.frequencia_horarios_refeicoes.trim())
          dataToSend.frequencia_horarios_refeicoes =
            formData.frequencia_horarios_refeicoes.trim()

        const alimentosDiarioArray = alimentosDiario
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        if (alimentosDiarioArray.length > 0)
          dataToSend.alimentos_quer_diario = alimentosDiarioArray

        const alimentosNaoComeArray = alimentosNaoCome
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        if (alimentosNaoComeArray.length > 0)
          dataToSend.alimentos_nao_comem = alimentosNaoComeArray

        const alergiasArray = alergias
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        if (alergiasArray.length > 0)
          dataToSend.alergias_alimentares = alergiasArray

        const suplementosArray = suplementos
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        if (suplementosArray.length > 0)
          dataToSend.suplementos_consumidos = suplementosArray

        await updateAluno.mutateAsync({ id: alunoIdToEdit!, data: dataToSend })
        showToast.success("✅ Dados atualizados com sucesso!")

        if (!isAluno) {
          navigate(getBackRoute())
        }
      } else {
        const dataToSend: CreateAlunoDTO = {
          nome: formData.nome.trim(),
          email: formData.email.trim(),
          password: formData.password,
          
          professorId: user!.id,
        }

        if (formData.telefone.trim())
          dataToSend.telefone = formData.telefone.trim()
        if (formData.alturaCm) dataToSend.alturaCm = Number(formData.alturaCm)
        if (formData.pesoKg) dataToSend.pesoKg = Number(formData.pesoKg)
        if (formData.idade) dataToSend.idade = Number(formData.idade)
        if (formData.cinturaCm)
          dataToSend.cinturaCm = Number(formData.cinturaCm)
        if (formData.quadrilCm)
          dataToSend.quadrilCm = Number(formData.quadrilCm)
        if (formData.pescocoCm)
          dataToSend.pescocoCm = Number(formData.pescocoCm)
        if (formData.dias_treino_semana)
          dataToSend.dias_treino_semana = Number(formData.dias_treino_semana)
        if (formData.dores_articulares.trim())
          dataToSend.dores_articulares = formData.dores_articulares.trim()
        if (formData.frequencia_horarios_refeicoes.trim())
          dataToSend.frequencia_horarios_refeicoes =
            formData.frequencia_horarios_refeicoes.trim()

        const alimentosDiarioArray = alimentosDiario
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        if (alimentosDiarioArray.length > 0)
          dataToSend.alimentos_quer_diario = alimentosDiarioArray

        const alimentosNaoComeArray = alimentosNaoCome
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        if (alimentosNaoComeArray.length > 0)
          dataToSend.alimentos_nao_comem = alimentosNaoComeArray

        const alergiasArray = alergias
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        if (alergiasArray.length > 0)
          dataToSend.alergias_alimentares = alergiasArray

        const suplementosArray = suplementos
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        if (suplementosArray.length > 0)
          dataToSend.suplementos_consumidos = suplementosArray

        await createAluno.mutateAsync(dataToSend)
        showToast.success("✅ Aluno cadastrado com sucesso!")
        resetForm()
        navigate(getBackRoute())
      }
    } catch (error: any) {
      showToast.error(error.message || "Erro ao salvar aluno")
    }
  }

  if ((isEdit || isAluno) && loadingAluno) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-600">Carregando dados...</p>
      </div>
    )
  }

  const isLoading = createAluno.isLoading || updateAluno.isLoading

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {!isAluno && (
            <button
              onClick={() => navigate(getBackRoute())}
              className="p-2 hover:bg-white rounded-lg transition-colors"
              title="Voltar"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-3xl font-bold text-gray-900">
            {isAluno ? "Meu Perfil" : isEdit ? "Editar Aluno" : "Novo Aluno"}
          </h1>
        </div>

        {!isEdit && !isAluno && (
          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={resetForm}
            disabled={isLoading}
          >
            Limpar Formulário
          </Button>
        )}
      </div>

      {/* Dados de Acesso (apenas criação) */}
      {!isEdit && !isAluno && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            Dados de Acesso
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome Completo *"
              icon={User}
              value={formData.nome}
              onChange={(e) => {
                setFormData({ ...formData, nome: e.target.value })
                setErrors({ ...errors, nome: "" })
              }}
              placeholder="João Silva"
              error={errors.nome}
              required
            />
            <Input
              label="Email *"
              icon={Mail}
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value })
                setErrors({ ...errors, email: "" })
              }}
              placeholder="joao@email.com"
              error={errors.email}
              required
            />
            <Input
              label="Senha Temporária *"
              icon={Lock}
              type="password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value })
                setErrors({ ...errors, password: "" })
              }}
              placeholder="Mínimo 6 caracteres"
              error={errors.password}
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
          </div>
        </Card>
      )}

      {/* Dados Pessoais (edição) */}
      {(isEdit || isAluno) && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            Dados Pessoais
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      )}

      {!isEdit && !isAluno && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Dados Físicos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      )}

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
            onChange={(e) => {
              setFormData({ ...formData, dias_treino_semana: e.target.value })
              setErrors({ ...errors, dias_treino_semana: "" })
            }}
            placeholder="5"
            min="0"
            max="7"
            error={errors.dias_treino_semana}
          />
        </div>
      </Card>

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
          icon={isEdit || isAluno ? Save : Plus}
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isEdit || isAluno ? "Salvar Alterações" : "Cadastrar Aluno"}
        </Button>
        {!isAluno && (
          <Button
            variant="secondary"
            onClick={() => navigate(getBackRoute())}
            disabled={isLoading}
          >
            Voltar
          </Button>
        )}
      </div>

      {!isEdit && !isAluno && (
        <p className="text-sm text-gray-500 mt-4">* Campos obrigatórios</p>
      )}
    </div>
  )
}
