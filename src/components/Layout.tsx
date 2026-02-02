import React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { LogOut, TrendingUp, User, Camera } from "lucide-react" // ← ADICIONE Camera AQUI
import { Button } from "./ui/Button"
import { useAuth } from "../hooks/useAuth"

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const isAluno = user?.role === "ALUNO"

  const showEvolucaoLink = isAluno && !location.pathname.includes("/evolucao")

  const showPerfilLink = isAluno && !location.pathname.includes("/perfil")

  const showFotosLink =
    isAluno && !location.pathname.includes("/fotos-arquivos")

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                G-Force Coach
              </h1>
              {user && (
                <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {user.role === "ADMIN" && "Administrador"}
                  {user.role === "PROFESSOR" && "Professor"}
                  {user.role === "ALUNO" && "Aluno"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {showPerfilLink && (
                <Button
                  variant="secondary"
                  icon={User}
                  onClick={() => navigate("/aluno/perfil")}
                  className="!p-2"
                  title="Ver Perfil"
                >
                  <span className="hidden sm:inline">Perfil</span>
                </Button>
              )}

              {showEvolucaoLink && (
                <Button
                  variant="secondary"
                  icon={TrendingUp}
                  onClick={() => navigate("/aluno/evolucao")}
                  className="!p-2"
                  title="Ver Evolução"
                >
                  <span className="hidden sm:inline">Evolução</span>
                </Button>
              )}

     
              {showFotosLink && (
                <Button
                  variant="secondary"
                  icon={Camera}
                  onClick={() => navigate("/aluno/fotos-arquivos")}
                  className="!p-2"
                  title="Ver Fotos e Arquivos"
                >
                  <span className="hidden sm:inline">Fotos</span>
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
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2026 G-Force Coach. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
