import React, { useEffect, useState } from "react"
import {
  ArrowRight,
  LogIn,
  Menu,
  MessageCircle,
  Moon,
  Sun,
  Shirt,
  X,
} from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { BrandMark } from "../../../components/BrandMark"
import {
  publicNavigationSections,
  WHATSAPP_NUMBER,
} from "../content"
import { openWhatsApp, scrollToPublicSection } from "../utils"

interface PublicSiteLayoutProps {
  children: React.ReactNode
}

type PublicTheme = "dark" | "light"

const PUBLIC_THEME_STORAGE_KEY = "gforce-public-theme"

const navButtonClass =
  "text-sm font-medium text-[color:var(--public-text-soft)] transition-colors hover:text-[color:var(--public-text)]"

export const PublicSiteLayout: React.FC<PublicSiteLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState<PublicTheme>(() => {
    if (typeof window === "undefined") {
      return "dark"
    }

    const savedTheme = window.localStorage.getItem(PUBLIC_THEME_STORAGE_KEY)
    return savedTheme === "light" ? "light" : "dark"
  })
  const location = useLocation()
  const navigate = useNavigate()

  const isLanding = location.pathname === "/landing"
  const isDarkTheme = theme === "dark"
  const themeToggleLabel = isDarkTheme ? "Ativar modo light" : "Ativar modo dark"

  useEffect(() => {
    document.documentElement.setAttribute("data-public-theme", theme)
    window.localStorage.setItem(PUBLIC_THEME_STORAGE_KEY, theme)
  }, [theme])

  const handleSectionNavigation = (target: string) => {
    if (isLanding) {
      scrollToPublicSection(target)
    } else {
      navigate(`/landing#${target}`)
    }
    setMobileMenuOpen(false)
  }

  const handlePlansNavigation = () => {
    navigate("/planos")
    setMobileMenuOpen(false)
  }

  const handleShirtsNavigation = () => {
    navigate("/camisas")
    setMobileMenuOpen(false)
  }

  const handleContactClick = () => {
    openWhatsApp(
      WHATSAPP_NUMBER,
      "Olá! Quero saber mais sobre a experiência da G-Force.",
    )
    setMobileMenuOpen(false)
  }

  const handleLoginClick = () => {
    navigate("/login")
    setMobileMenuOpen(false)
  }

  const handleThemeToggle = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-[color:var(--public-bg)] text-[color:var(--public-text)]">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-[color:var(--public-border)] bg-[color:var(--public-nav)] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/landing")}
            className="min-w-0 shrink rounded-lg transition-opacity hover:opacity-90"
            aria-label="Voltar para a landing page"
          >
            <BrandMark
              size="sm"
              className="max-w-full"
              imageClassName="border-[color:var(--public-border-strong)]"
              textClassName="text-base tracking-[0.14em] text-[color:var(--public-text)] sm:text-xl sm:tracking-[0.22em]"
            />
          </button>

          <div className="hidden items-center gap-7 lg:flex">
            {publicNavigationSections.map((item) => (
              <button
                key={item.target}
                onClick={() => handleSectionNavigation(item.target)}
                className={navButtonClass}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={handlePlansNavigation}
              className={navButtonClass}
            >
              Planos
            </button>
            <button
              onClick={handleShirtsNavigation}
              className={navButtonClass}
            >
              Produtos
            </button>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              onClick={handleThemeToggle}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--public-border)] px-4 py-2 text-sm font-medium text-[color:var(--public-text-soft)] transition-colors hover:border-[color:var(--public-border-strong)] hover:bg-[color:var(--public-surface)] hover:text-[color:var(--public-text)]"
              aria-label={themeToggleLabel}
            >
              {isDarkTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {isDarkTheme ? "Modo light" : "Modo dark"}
            </button>
            <button
              onClick={handleLoginClick}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--public-border)] px-4 py-2 text-sm font-medium text-[color:var(--public-text-soft)] transition-colors hover:border-[color:var(--public-border-strong)] hover:bg-[color:var(--public-surface)] hover:text-[color:var(--public-text)]"
            >
              <LogIn className="h-4 w-4" />
              Acessar
            </button>
            <button
              onClick={handleContactClick}
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--public-accent)] bg-[image:var(--public-accent-gradient)] px-5 py-2 text-sm font-semibold text-[color:var(--public-accent-contrast)] transition-transform hover:-translate-y-0.5"
            >
              <MessageCircle className="h-4 w-4" />
              Falar no WhatsApp
            </button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={handleThemeToggle}
              className="rounded-lg border border-[color:var(--public-border)] p-2 text-[color:var(--public-text-soft)] transition-colors hover:border-[color:var(--public-border-strong)] hover:bg-[color:var(--public-surface)] hover:text-[color:var(--public-text)]"
              aria-label={themeToggleLabel}
            >
              {isDarkTheme ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="rounded-lg border border-[color:var(--public-border)] p-2 text-[color:var(--public-text-soft)]"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-[color:var(--public-border)] bg-[color:var(--public-surface-strong)] px-5 py-4 sm:px-6 lg:hidden">
            <div className="space-y-2">
              {publicNavigationSections.map((item) => (
                <button
                  key={item.target}
                  onClick={() => handleSectionNavigation(item.target)}
                  className="block w-full rounded-xl border border-transparent px-4 py-3 text-left text-sm font-medium text-[color:var(--public-text-soft)] transition-colors hover:border-[color:var(--public-border)] hover:bg-[color:var(--public-surface)] hover:text-[color:var(--public-text)]"
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={handlePlansNavigation}
                className="block w-full rounded-xl border border-transparent px-4 py-3 text-left text-sm font-medium text-[color:var(--public-text-soft)] transition-colors hover:border-[color:var(--public-border)] hover:bg-[color:var(--public-surface)] hover:text-[color:var(--public-text)]"
              >
                Planos
              </button>
              <button
                onClick={handleShirtsNavigation}
                className="block w-full rounded-xl border border-transparent px-4 py-3 text-left text-sm font-medium text-[color:var(--public-text-soft)] transition-colors hover:border-[color:var(--public-border)] hover:bg-[color:var(--public-surface)] hover:text-[color:var(--public-text)]"
              >
                Produtos
              </button>
            </div>

            <div className="mt-4 grid gap-2">
              <button
                onClick={handleThemeToggle}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--public-border)] px-4 py-3 text-sm font-medium text-[color:var(--public-text-soft)]"
              >
                {isDarkTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {isDarkTheme ? "Ativar modo light" : "Ativar modo dark"}
              </button>
              <button
                onClick={handleLoginClick}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--public-border)] px-4 py-3 text-sm font-medium text-[color:var(--public-text-soft)]"
              >
                <LogIn className="h-4 w-4" />
                Acessar plataforma
              </button>
              <button
                onClick={handleContactClick}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--public-accent)] bg-[image:var(--public-accent-gradient)] px-4 py-3 text-sm font-semibold text-[color:var(--public-accent-contrast)]"
              >
                <MessageCircle className="h-4 w-4" />
                Falar no WhatsApp
              </button>
            </div>
          </div>
        )}
      </nav>

      <main>{children}</main>

      <footer className="border-t border-[color:var(--public-border)] bg-[color:var(--public-footer)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.95fr_1fr] lg:px-8">
          <div className="space-y-4 rounded-[28px] border border-[color:var(--public-border)] bg-[color:var(--public-surface-soft)] p-6 shadow-[var(--public-shadow)]">
            <BrandMark
              size="sm"
              imageClassName="border-[color:var(--public-border-strong)]"
              textClassName="text-lg tracking-[0.18em] text-[color:var(--public-text)]"
            />
            <p className="max-w-md text-sm leading-6 text-[color:var(--public-text-soft)]">
              A G-Force organiza treino, dieta, histórico e acompanhamento em uma
              experiência mais clara para quem quer tratar evolução com seriedade.
            </p>
          </div>

          <div className="rounded-[28px] border border-[color:var(--public-border)] bg-[color:var(--public-surface-soft)] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--public-accent)]">
              Navegação
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-[color:var(--public-text-soft)]">
              <button onClick={() => handleSectionNavigation("plataforma")} className="text-left transition-colors hover:text-[color:var(--public-text)]">
                Plataforma
              </button>
              <button onClick={() => handleSectionNavigation("servico")} className="text-left transition-colors hover:text-[color:var(--public-text)]">
                Serviço principal
              </button>
              <button onClick={() => handleSectionNavigation("quem-somos")} className="text-left transition-colors hover:text-[color:var(--public-text)]">
                Quem somos
              </button>
              <button onClick={handlePlansNavigation} className="text-left transition-colors hover:text-[color:var(--public-text)]">
                Planos
              </button>
              <button onClick={handleShirtsNavigation} className="inline-flex items-center gap-2 text-left transition-colors hover:text-[color:var(--public-text)]">
                <Shirt className="h-4 w-4" />
                Produtos
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-[color:var(--public-border)] bg-[color:var(--public-surface-soft)] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--public-teal)]">
              Contato
            </p>
            <div className="mt-4 space-y-3 text-sm text-[color:var(--public-text-soft)]">
              <p>Fale com a equipe para entender o melhor caminho para sua rotina.</p>
              <button
                onClick={handleContactClick}
                className="inline-flex items-center gap-2 font-medium text-[color:var(--public-text)]"
              >
                Abrir WhatsApp
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-[color:var(--public-border)] px-5 py-4 text-center text-xs text-[color:var(--public-text-muted)] sm:px-6 lg:px-8">
          © 2026 G-Force. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
