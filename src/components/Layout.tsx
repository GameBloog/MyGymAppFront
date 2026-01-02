import React, { type ReactNode } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Activity, LogOut, TrendingUp, User } from "lucide-react"
import { useAuth } from "../hooks/useAuth"
import { Button } from "./ui"

interface LayoutProps {
  children: ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const getRoleBadge = () => {
    const badges = {
      ADMIN: { text: "Administrador", color: "bg-purple-100 text-purple-800" },
      PROFESSOR: { text: "Professor", color: "bg-blue-100 text-blue-800" },
      ALUNO: { text: "Aluno", color: "bg-green-100 text-green-800" },
    }

    const badge = user ? badges[user.role] : badges.ALUNO

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}
      >
        {badge.text}
      </span>
    )
  }

  const isAluno = user?.role === "ALUNO"
  const showEvolucaoLink = isAluno && !location.pathname.includes("/evolucao")
  const showPerfilLink = isAluno && location.pathname.includes("/evolucao")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md mb-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">G-FORCE Coach</h1>
                {user && (
                  <p className="text-xs text-gray-500">Plataforma de gerenciamento de alunos e evolução física</p>
                )}
              </div>
            </div>

            {/* User Info */}
            {user && (
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.nome}
                  </p>
                  <div className="flex items-center gap-2 justify-end">
                    {getRoleBadge()}
                  </div>
                </div>

                {/* Links de navegação para Aluno */}
                {showEvolucaoLink && (
                  <Button
                    variant="secondary"
                    icon={TrendingUp}
                    onClick={() => navigate("/aluno/evolucao")}
                    className="!p-2"
                    title="Ver Minha Evolução"
                  >
                    <span className="hidden sm:inline">Evolução</span>
                  </Button>
                )}

                {showPerfilLink && (
                  <Button
                    variant="secondary"
                    icon={User}
                    onClick={() => navigate("/aluno/perfil")}
                    className="!p-2"
                    title="Ver Meu Perfil"
                  >
                    <span className="hidden sm:inline">Perfil</span>
                  </Button>
                )}

                <Button
                  variant="secondary"
                  icon={LogOut}
                  onClick={handleLogout}
                  className="!p-2"
                  title="Sair"
                >
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 pb-8">{children}</div>
    </div>
  )
}
