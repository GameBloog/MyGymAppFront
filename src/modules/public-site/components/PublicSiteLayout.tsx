import React, { useState } from "react"
import {
  ArrowRight,
  LogIn,
  Menu,
  MessageCircle,
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

const navButtonClass =
  "text-sm font-medium text-zinc-300 transition-colors hover:text-white"

export const PublicSiteLayout: React.FC<PublicSiteLayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const isLanding = location.pathname === "/landing"

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

  return (
    <div className="min-h-screen overflow-x-clip bg-[#080808] text-white">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/landing")}
            className="min-w-0 shrink rounded-lg transition-opacity hover:opacity-90"
            aria-label="Voltar para a landing page"
          >
            <BrandMark
              size="sm"
              className="max-w-full"
              textClassName="text-base tracking-[0.14em] sm:text-xl sm:tracking-[0.22em]"
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
              Camisas
            </button>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              onClick={handleLoginClick}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              <LogIn className="h-4 w-4" />
              Acessar
            </button>
            <button
              onClick={handleContactClick}
              className="inline-flex items-center gap-2 rounded-full bg-[#d4a548] px-5 py-2 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5"
            >
              <MessageCircle className="h-4 w-4" />
              Falar no WhatsApp
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="rounded-lg border border-white/10 p-2 text-zinc-200 lg:hidden"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-[#0b0b0b] px-5 py-4 sm:px-6 lg:hidden">
            <div className="space-y-2">
              {publicNavigationSections.map((item) => (
                <button
                  key={item.target}
                  onClick={() => handleSectionNavigation(item.target)}
                  className="block w-full rounded-xl border border-transparent px-4 py-3 text-left text-sm font-medium text-zinc-200 transition-colors hover:border-white/10 hover:bg-white/5"
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={handlePlansNavigation}
                className="block w-full rounded-xl border border-transparent px-4 py-3 text-left text-sm font-medium text-zinc-200 transition-colors hover:border-white/10 hover:bg-white/5"
              >
                Planos
              </button>
              <button
                onClick={handleShirtsNavigation}
                className="block w-full rounded-xl border border-transparent px-4 py-3 text-left text-sm font-medium text-zinc-200 transition-colors hover:border-white/10 hover:bg-white/5"
              >
                Camisas
              </button>
            </div>

            <div className="mt-4 grid gap-2">
              <button
                onClick={handleLoginClick}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-3 text-sm font-medium text-zinc-200"
              >
                <LogIn className="h-4 w-4" />
                Acessar plataforma
              </button>
              <button
                onClick={handleContactClick}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d4a548] px-4 py-3 text-sm font-semibold text-black"
              >
                <MessageCircle className="h-4 w-4" />
                Falar no WhatsApp
              </button>
            </div>
          </div>
        )}
      </nav>

      <main>{children}</main>

      <footer className="border-t border-white/10 bg-[#050505]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
          <div className="space-y-4">
            <BrandMark size="sm" textClassName="text-lg tracking-[0.18em]" />
            <p className="max-w-md text-sm leading-6 text-zinc-400">
              A G-Force organiza treino, dieta, histórico e acompanhamento em uma
              experiência mais clara para quem quer tratar evolução com seriedade.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d4a548]">
              Navegação
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-zinc-300">
              <button onClick={() => handleSectionNavigation("servico")} className="text-left hover:text-white">
                Serviço principal
              </button>
              <button onClick={() => handleSectionNavigation("quem-somos")} className="text-left hover:text-white">
                Quem somos
              </button>
              <button onClick={handlePlansNavigation} className="text-left hover:text-white">
                Planos
              </button>
              <button onClick={handleShirtsNavigation} className="inline-flex items-center gap-2 text-left hover:text-white">
                <Shirt className="h-4 w-4" />
                Camisas
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#49b4a6]">
              Contato
            </p>
            <div className="mt-4 space-y-3 text-sm text-zinc-300">
              <p>Fale com a equipe para entender o melhor caminho para sua rotina.</p>
              <button
                onClick={handleContactClick}
                className="inline-flex items-center gap-2 font-medium text-white"
              >
                Abrir WhatsApp
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 px-5 py-4 text-center text-xs text-zinc-500 sm:px-6 lg:px-8">
          © 2026 G-Force. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
