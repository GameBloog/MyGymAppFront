import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  Activity,
  Mail,
  Lock,
  User,
  Phone,
  Briefcase,
  Ticket,
} from "lucide-react"
import { Card, Input, Button } from "../../components/ui"
import { useAuth } from "../../hooks/useAuth"
import { type RegisterDTO } from "../../types"

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isProfessor, setIsProfessor] = useState(false)

  const [formData, setFormData] = useState<RegisterDTO>({
    nome: "",
    email: "",
    password: "",
    role: "ALUNO",
    inviteCode: "",
    telefone: "",
    especialidade: "",
  })

  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

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

    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = "As senhas não correspondem"
    }

    if (isProfessor && !formData.inviteCode?.trim()) {
      newErrors.inviteCode = "Código de convite é obrigatório para professores"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setIsLoading(true)
    try {
      const dataToSend: RegisterDTO = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: isProfessor ? "PROFESSOR" : "ALUNO",
      }

      if (isProfessor) {
        dataToSend.inviteCode = formData.inviteCode?.trim()
        if (formData.telefone?.trim())
          dataToSend.telefone = formData.telefone.trim()
        if (formData.especialidade?.trim())
          dataToSend.especialidade = formData.especialidade.trim()
      }

      await register(dataToSend)
      navigate("/login")
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleProfessor = () => {
    setIsProfessor(!isProfessor)
    setFormData({
      ...formData,
      role: !isProfessor ? "PROFESSOR" : "ALUNO",
      inviteCode: "",
      telefone: "",
      especialidade: "",
    })
    setErrors({})
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-blue-600 p-4 rounded-2xl">
            <Activity className="h-12 w-12 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Criar Conta
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Preencha os dados para se registrar
        </p>

        {/* Toggle Professor */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isProfessor}
              onChange={handleToggleProfessor}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              Sou um Professor (preciso de código de convite)
            </span>
          </label>
        </div>

        {/* Form */}
        <div className="space-y-4">
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
          />

          <Input
            label="Senha *"
            icon={Lock}
            type="password"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value })
              setErrors({ ...errors, password: "" })
            }}
            placeholder="Mínimo 6 caracteres"
            error={errors.password}
          />

          <Input
            label="Confirmar Senha *"
            icon={Lock}
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              setErrors({ ...errors, confirmPassword: "" })
            }}
            placeholder="Digite a senha novamente"
            error={errors.confirmPassword}
          />

          {/* Campos extras para Professor */}
          {isProfessor && (
            <>
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-4">
                  Dados do Professor
                </p>

                <div className="space-y-4">
                  <Input
                    label="Código de Convite *"
                    icon={Ticket}
                    value={formData.inviteCode || ""}
                    onChange={(e) => {
                      setFormData({ ...formData, inviteCode: e.target.value })
                      setErrors({ ...errors, inviteCode: "" })
                    }}
                    placeholder="PROF-2025-ABC123"
                    error={errors.inviteCode}
                  />

                  <Input
                    label="Telefone"
                    icon={Phone}
                    value={formData.telefone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, telefone: e.target.value })
                    }
                    placeholder="(11) 98765-4321"
                  />

                  <Input
                    label="Especialidade"
                    icon={Briefcase}
                    value={formData.especialidade || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        especialidade: e.target.value,
                      })
                    }
                    placeholder="Ex: Musculação, Crossfit"
                  />
                </div>
              </div>
            </>
          )}

          <Button
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Criando conta..." : "Criar Conta"}
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Faça login
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
