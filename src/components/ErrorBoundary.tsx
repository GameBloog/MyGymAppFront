import React from "react"
import { useNavigate } from "react-router-dom"
import { AlertCircle, RefreshCw, Home, LogOut } from "lucide-react"
import { Button, Card } from "./ui"

interface ErrorPageProps {
  error?: {
    status?: number
    message?: string
    code?: string
  }
  onRetry?: () => void
  showLogout?: boolean
}

export const ErrorPage: React.FC<ErrorPageProps> = ({
  error,
  onRetry,
  showLogout = true,
}) => {
  const navigate = useNavigate()

  const getErrorInfo = () => {
    if (!error) {
      return {
        title: "Algo deu errado",
        message: "Ocorreu um erro inesperado. Por favor, tente novamente.",
        icon: "🤔",
      }
    }

    const status = error.status || 0
    const code = error.code || ""

    if (status === 401 || code === "UNAUTHORIZED") {
      return {
        title: "Sessão Expirada",
        message:
          "Sua sessão expirou. Por favor, faça login novamente para continuar.",
        icon: "🔒",
        showLogin: true,
      }
    }

    if (
      code === "INVALID_CREDENTIALS" ||
      error.message?.includes("credenciais")
    ) {
      return {
        title: "Email ou Senha Incorretos",
        message:
          "Verifique se digitou seu email e senha corretamente. Lembre-se que o email é case-sensitive (diferencia maiúsculas de minúsculas).",
        icon: "⚠️",
        showRetry: true,
      }
    }

    if (status === 404 || code === "NOT_FOUND") {
      return {
        title: "Não Encontrado",
        message:
          "O recurso que você está procurando não foi encontrado. Ele pode ter sido removido ou não existe.",
        icon: "🔍",
      }
    }

    if (status === 403 || code === "FORBIDDEN") {
      return {
        title: "Sem Permissão",
        message:
          "Você não tem permissão para acessar este recurso. Entre em contato com o administrador.",
        icon: "🚫",
      }
    }

    if (status >= 500) {
      return {
        title: "Erro no Servidor",
        message:
          "Nosso servidor está com problemas no momento. Por favor, tente novamente em alguns instantes.",
        icon: "⚙️",
        showRetry: true,
      }
    }

    if (
      error.message?.includes("Network") ||
      error.message?.includes("timeout")
    ) {
      return {
        title: "Sem Conexão",
        message:
          "Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.",
        icon: "📡",
        showRetry: true,
      }
    }

    return {
      title: "Erro",
      message: error.message || "Ocorreu um erro inesperado.",
      icon: "❌",
      showRetry: true,
    }
  }

  const errorInfo = getErrorInfo()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="text-center">
          <div className="text-6xl mb-4">{errorInfo.icon}</div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {errorInfo.title}
          </h1>

          <p className="text-gray-600 mb-6">{errorInfo.message}</p>

          {error?.code && (
            <div className="mb-6 p-3 bg-gray-100 rounded-lg">
              <p className="text-xs text-gray-500 font-mono">
                Código: {error.code}
                {error.status && ` | Status: ${error.status}`}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {(errorInfo.showRetry || onRetry) && (
              <Button
                icon={RefreshCw}
                onClick={onRetry || (() => window.location.reload())}
                className="w-full"
              >
                Tentar Novamente
              </Button>
            )}

            {errorInfo.showLogin && (
              <Button
                icon={LogOut}
                onClick={() => navigate("/login")}
                className="w-full"
              >
                Fazer Login
              </Button>
            )}

            <Button
              variant="secondary"
              icon={Home}
              onClick={() => navigate("/")}
              className="w-full"
            >
              Voltar ao Início
            </Button>

            {showLogout && !errorInfo.showLogin && (
              <Button
                variant="secondary"
                icon={LogOut}
                onClick={handleLogout}
                className="w-full"
              >
                Sair da Conta
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
