import React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  LogOut,
  TrendingUp,
  User,
  Camera,
  Dumbbell,
  UtensilsCrossed,
  Home,
} from "lucide-react"
import { Button } from "./ui/Button"
import { useAuth } from "../hooks/useAuth"
import { BrandMark } from "./BrandMark"

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
  const showDashboardLink = isAluno && !location.pathname.includes("/dashboard")
  const showPerfilLink = isAluno && !location.pathname.includes("/perfil")
  const showTreinoLink = isAluno && !location.pathname.includes("/treino")
  const showDietaLink = isAluno && !location.pathname.includes("/dieta")
  const showFotosLink =
    isAluno && !location.pathname.includes("/fotos-arquivos")
  const mobileTopbarButtonClass =
    "!h-9 !w-9 !justify-center !gap-0 !rounded-md !p-0 sm:!h-auto sm:!w-auto sm:!rounded-lg sm:!p-2"

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-zinc-950 shadow-sm border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 py-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-0">
            <div className="flex flex-wrap items-center gap-3">
              <BrandMark size="sm" text="G-Force Coach" />
              {user && (
                <span className="px-3 py-1 bg-zinc-800 text-zinc-100 text-sm rounded-full">
                  {user.role === "ADMIN" && "Administrador"}
                  {user.role === "PROFESSOR" && "Professor"}
                  {user.role === "ALUNO" && "Aluno"}
                </span>
              )}
            </div>

            <div className="flex w-full flex-wrap items-center gap-1 sm:w-auto sm:flex-nowrap sm:justify-end sm:gap-2">
              {showDashboardLink && (
                <Button
                  variant="secondary"
                  icon={Home}
                  onClick={() => navigate("/aluno/dashboard")}
                  className={mobileTopbarButtonClass}
                  title="Abrir Dashboard"
                >
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              )}

              {showPerfilLink && (
                <Button
                  variant="secondary"
                  icon={User}
                  onClick={() => navigate("/aluno/perfil")}
                  className={mobileTopbarButtonClass}
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
                  className={mobileTopbarButtonClass}
                  title="Ver Evolução"
                >
                  <span className="hidden sm:inline">Evolução</span>
                </Button>
              )}

              {showTreinoLink && (
                <Button
                  variant="secondary"
                  icon={Dumbbell}
                  onClick={() => navigate("/aluno/treino")}
                  className={mobileTopbarButtonClass}
                  title="Ver Treino"
                >
                  <span className="hidden sm:inline">Treino</span>
                </Button>
              )}

              {showDietaLink && (
                <Button
                  variant="secondary"
                  icon={UtensilsCrossed}
                  onClick={() => navigate("/aluno/dieta")}
                  className={mobileTopbarButtonClass}
                  title="Ver Dieta"
                >
                  <span className="hidden sm:inline">Dieta</span>
                </Button>
              )}

              {showFotosLink && (
                <Button
                  variant="secondary"
                  icon={Camera}
                  onClick={() => navigate("/aluno/fotos-arquivos")}
                  className={mobileTopbarButtonClass}
                  title="Enviar Fotos"
                >
                  <span className="hidden sm:inline">Fotos</span>
                </Button>
              )}

              <Button
                variant="secondary"
                icon={LogOut}
                onClick={handleLogout}
                className={mobileTopbarButtonClass}
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

      <footer className="bg-zinc-950 border-t border-zinc-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-zinc-400">
            © 2026 G-Force Coach. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
