import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Mail, Lock, AlertCircle } from "lucide-react"
import { Card, Input, Button } from "../components/ui"
import { BrandMark } from "../components/BrandMark"
import { useAuth } from "../hooks/useAuth"
import { type LoginDTO } from "../types"
import { showToast } from "../utils/toast"

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState<LoginDTO>({
    email: "",
    password: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string>("")

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    setGeneralError("")

    if (!validate()) return

    setIsLoading(true)
    try {
      await login(formData)
      navigate("/")
    } catch (error) {
      if (error instanceof Error) {
        setGeneralError(error.message)
        showToast.error(error.message)
      } else {
        setGeneralError("Erro ao fazer login. Tente novamente.")
        showToast.error("Erro ao fazer login")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="flex justify-center mb-2">
          <BrandMark size="lg" text="G-FORCE Coach" />
        </h1>
        <p className="text-center text-gray-300 mb-8">
          Faça login para continuar
        </p>

        {generalError && (
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">
                Erro ao fazer login
              </p>
              <p className="text-sm text-red-700 mt-1">{generalError}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Email"
            icon={Mail}
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value })
              setErrors({ ...errors, email: "" })
              setGeneralError("")
            }}
            onKeyPress={handleKeyPress}
            placeholder="seu@email.com"
            error={errors.email}
            autoComplete="email"
          />

          <Input
            label="Senha"
            icon={Lock}
            type="password"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value })
              setErrors({ ...errors, password: "" })
              setGeneralError("")
            }}
            onKeyPress={handleKeyPress}
            placeholder="••••••••"
            error={errors.password}
            autoComplete="current-password"
          />

          <Button
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-300">
            Não tem uma conta?{" "}
            <Link
              to="/register"
              className="text-white hover:text-gray-300 font-medium underline"
            >
              Registre-se
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
