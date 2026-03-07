import { useEffect, useState } from "react"
import {
  Check,
  X,
  Menu,
  ArrowRight,
  MessageCircle,
  LogIn,
  Users,
  TrendingUp,
  Target,
  Award,
  ShoppingBag,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { leadLinksApi } from "../services/api"
import { BrandMark } from "../components/BrandMark"
import {
  normalizeLeadSlug,
  saveLeadSlug,
  shouldTrackLeadOnThisLoad,
} from "../utils/leadTracking"

const WHATSAPP_NUMBER = "5511953693554"

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const leadParam = params.get("lead")

    if (!leadParam) {
      return
    }

    const leadSlug = normalizeLeadSlug(leadParam)
    if (!leadSlug) {
      return
    }

    saveLeadSlug(leadSlug)

    if (!shouldTrackLeadOnThisLoad(leadSlug)) {
      return
    }

    leadLinksApi
      .trackClick({
        leadSlug,
        referrer: document.referrer || undefined,
        path: window.location.pathname,
        utmSource: params.get("utm_source") || undefined,
        utmMedium: params.get("utm_medium") || undefined,
        utmCampaign: params.get("utm_campaign") || undefined,
        utmContent: params.get("utm_content") || undefined,
        utmTerm: params.get("utm_term") || undefined,
      })
      .catch((error) => {
        console.error("[lead] Falha ao rastrear clique:", error)
      })
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: "smooth" })
    setMobileMenuOpen(false)
  }

  const openWhatsApp = (message: string) => {
    const encodedMessage = encodeURIComponent(message)
    window.open(
      "https://wa.me/5511953693554?text=Olá! Quero saber mais sobre a G-Force",
      "_blank",
      "noopener,noreferrer",
    )
  }

  const handleWhatsAppClick = () => {
    openWhatsApp("Olá! Quero saber mais sobre a G-Force")
  }

  const handleShirtWhatsAppClick = () => {
    openWhatsApp(
      "Estou interessado nas camisas da G-Force!. Pode me passar os detalhes?",
    )
  }

  const navigate = useNavigate()
  const handleLoginClick = () => navigate("/login")

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header/Nav */}
      <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-sm shadow-sm border-b border-zinc-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <BrandMark size="sm" textClassName="text-xl" />

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("problema")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                O Problema
              </button>
              <button
                onClick={() => scrollToSection("solucao")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                A Solução
              </button>
              <button
                onClick={() => scrollToSection("diferenciais")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Diferenciais
              </button>
              <button
                onClick={() => scrollToSection("depoimentos")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Depoimentos
              </button>
              <button
                onClick={() => scrollToSection("camisetas")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Camisetas
              </button>
              <button
                onClick={handleLoginClick}
                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Acessar</span>
              </button>
              <button
                onClick={handleWhatsAppClick}
                className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Contato</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-zinc-900 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-zinc-800 space-y-2">
              <button
                onClick={() => scrollToSection("problema")}
                className="block w-full text-left px-4 py-2 hover:bg-zinc-900 rounded-lg"
              >
                O Problema
              </button>
              <button
                onClick={() => scrollToSection("solucao")}
                className="block w-full text-left px-4 py-2 hover:bg-zinc-900 rounded-lg"
              >
                A Solução
              </button>
              <button
                onClick={() => scrollToSection("diferenciais")}
                className="block w-full text-left px-4 py-2 hover:bg-zinc-900 rounded-lg"
              >
                Diferenciais
              </button>
              <button
                onClick={() => scrollToSection("depoimentos")}
                className="block w-full text-left px-4 py-2 hover:bg-zinc-900 rounded-lg"
              >
                Depoimentos
              </button>
              <button
                onClick={() => scrollToSection("camisetas")}
                className="block w-full text-left px-4 py-2 hover:bg-zinc-900 rounded-lg"
              >
                Camisetas
              </button>
              <button
                onClick={handleLoginClick}
                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-zinc-900 rounded-lg"
              >
                <LogIn className="h-4 w-4" />
                <span>Acessar Plataforma</span>
              </button>
              <button
                onClick={handleWhatsAppClick}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-zinc-800 text-white rounded-lg"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Falar no WhatsApp</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-black via-zinc-950 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Evolução real não é sorte. É processo, constância e
                acompanhamento.
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                A G-Force é uma comunidade de treino e dieta com acompanhamento
                organizado, centralizado e focado em evolução consistente — sem
                atalhos, sem promessas irreais.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleWhatsAppClick}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-black text-lg font-semibold rounded-lg hover:bg-zinc-200 transition-all"
                >
                  <MessageCircle className="h-5 w-5" />
                  Quero fazer parte da G-Force
                </button>
                <button
                  onClick={handleLoginClick}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-zinc-700 text-white text-lg font-semibold rounded-lg hover:border-zinc-300 hover:bg-zinc-900 transition-all"
                >
                  <LogIn className="h-5 w-5" />
                  Já sou aluno
                </button>
              </div>
            </div>
            <div className="relative">
              <img
                src="/0e831fa0-39ee-4b03-9071-98532877d713.jpeg"
                alt="Logo G-Force"
                className="aspect-square w-full object-cover rounded-2xl border border-zinc-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problema Section */}
      <section id="problema" className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              A maioria das pessoas não falha por falta de esforço.
              <br />
              <span className="text-zinc-300">
                Falha por falta de organização.
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-6 bg-red-950 border-2 border-red-700 rounded-lg">
                  <X className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Treino no PDF.
                    </h3>
                    <p className="text-gray-300">
                      Arquivos desorganizados, versões antigas, difícil
                      acompanhamento.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-red-950 border-2 border-red-700 rounded-lg">
                  <X className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Dieta no bloco de notas.
                    </h3>
                    <p className="text-gray-300">
                      Informações dispersas, sem histórico, impossível analisar
                      evolução.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-red-950 border-2 border-red-700 rounded-lg">
                  <X className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Fotos perdidas no WhatsApp.
                    </h3>
                    <p className="text-gray-300">
                      Progress pics misturadas com conversas, sem linha do tempo
                      clara.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-red-950 border-2 border-red-700 rounded-lg">
                  <X className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-2">
                      Mensagens importantes misturadas.
                    </h3>
                    <p className="text-gray-300">
                      Orientações perdidas entre conversas aleatórias e memes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-900 text-white rounded-lg">
                <p className="text-xl font-semibold mb-4">O resultado?</p>
                <ul className="space-y-2">
                  <li>• Falta de histórico</li>
                  <li>• Falta de clareza do progresso</li>
                  <li>• Falta de visão do processo como um todo</li>
                </ul>
                <p className="mt-4 text-lg">
                  Sem organização, a evolução vira tentativa — não método.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center">
                <Users className="h-32 w-32 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solução Section */}
      <section
        id="solucao"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-zinc-950 to-black"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              O que é a G-Force
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A G-Force é uma comunidade de acompanhamento fitness estruturada,
              criada para quem leva o processo a sério.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative order-2 md:order-1">
              <img
                src="/0e831fa0-39ee-4b03-9071-98532877d713.jpeg"
                alt="Logo G-Force"
                className="aspect-[4/3] w-full object-cover rounded-2xl border border-zinc-700"
              />
            </div>

            <div className="space-y-6 order-1 md:order-2">
              <p className="text-lg text-gray-200 leading-relaxed">
                Tudo acontece em uma <strong>plataforma própria</strong>, onde o
                aluno tem acesso centralizado a:
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-zinc-900 rounded-lg shadow-sm">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white">Treino</h3>
                    <p className="text-gray-300">
                      Sempre atualizado e acessível
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-zinc-900 rounded-lg shadow-sm">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white">Dieta</h3>
                    <p className="text-gray-300">
                      Planos e ajustes organizados
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-zinc-900 rounded-lg shadow-sm">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white">
                      Materiais e documentos
                    </h3>
                    <p className="text-gray-300">Tudo em um só lugar</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-zinc-900 rounded-lg shadow-sm">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white">
                      Envio de fotos de evolução
                    </h3>
                    <p className="text-gray-300">Linha do tempo visual clara</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-zinc-900 rounded-lg shadow-sm">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white">
                      Histórico completo
                    </h3>
                    <p className="text-gray-300">
                      Acompanhamento detalhado do processo
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-zinc-800 text-white rounded-lg">
                <p className="text-lg font-semibold mb-2">
                  Nada de depender do WhatsApp
                </p>
                <p>para algo que exige método, análise e constância.</p>
                <p className="mt-4 text-xl font-bold">
                  A G-Force não vende milagres.
                  <br />
                  Entrega processo, clareza e acompanhamento de verdade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Como funciona
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-zinc-600 to-zinc-900 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Entrada na comunidade
              </h3>
              <p className="text-gray-300">
                Você passa a fazer parte da G-Force e recebe acesso à
                plataforma.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-zinc-600 to-zinc-900 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Organização total
              </h3>
              <p className="text-gray-300">
                Treino, dieta e materiais ficam centralizados em um único lugar.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-zinc-600 to-zinc-900 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Acompanhamento contínuo
              </h3>
              <p className="text-gray-300">
                Você envia fotos, acompanha seu histórico e mantém clareza da
                evolução.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-zinc-600 to-zinc-900 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Processo constante
              </h3>
              <p className="text-gray-300">
                Sem atalhos. Sem bagunça. Evolução construída no dia a dia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section
        id="diferenciais"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-zinc-950 to-black"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Diferenciais da G-Force
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: null,
                title: "Plataforma própria de acompanhamento",
                desc: "Tecnologia desenvolvida especificamente para o processo",
              },
              {
                icon: TrendingUp,
                title: "Histórico completo",
                desc: "Treino, dieta e evolução registrados",
              },
              {
                icon: Target,
                title: "Organização profissional",
                desc: "Tudo estruturado e acessível",
              },
              {
                icon: Users,
                title: "Comunicação clara",
                desc: "Objetiva e direcionada",
              },
              {
                icon: Award,
                title: "Visão de longo prazo",
                desc: "Foco em resultados sustentáveis",
              },
              {
                icon: Users,
                title: "Comunidade alinhada",
                desc: "Pessoas com o mesmo propósito",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-6 bg-zinc-900 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                {item.icon ? (
                  <item.icon className="h-12 w-12 text-zinc-300 mb-4" />
                ) : (
                  <img
                    src="/0e831fa0-39ee-4b03-9071-98532877d713.jpeg"
                    alt="Logo G-Force"
                    className="h-12 w-12 object-cover rounded-md border border-zinc-700 mb-4"
                  />
                )}
                <h3 className="text-lg font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Para quem é / não é */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Para quem é */}
            <div className="p-8 bg-green-950 border-2 border-green-700 rounded-lg">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Check className="h-8 w-8 text-green-600" />A G-Force é para
                você que:
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-200">
                    Quer resultados reais e sustentáveis
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-200">
                    Valoriza acompanhamento sério
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-200">
                    Entende que evolução exige disciplina
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-200">
                    Busca organização e clareza no processo
                  </span>
                </li>
              </ul>
            </div>

            {/* Para quem não é */}
            <div className="p-8 bg-red-950 border-2 border-red-700 rounded-lg">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <X className="h-8 w-8 text-red-600" />A G-Force não é para quem:
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <X className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-200">
                    Procura soluções rápidas ou milagrosas
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-200">
                    Não quer seguir um processo
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-200">
                    Vive pulando de método em método
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-200">Não valoriza constância</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section
        id="depoimentos"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-zinc-950 to-black"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Pessoas diferentes. Objetivos diferentes.
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Um ponto em comum: compromisso com o processo.
            </p>
            <p className="text-lg text-gray-300 mt-4">
              Veja o que dizem alunos que escolheram a organização, a constância
              e a evolução real com a G-Force.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 bg-zinc-900 rounded-lg shadow-sm">
                <div className="aspect-square bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg mb-4 flex items-center justify-center">
                  <Users className="h-16 w-16 text-gray-400" />
                </div>
                <p className="text-gray-200 italic mb-4">
                  "Depoimento de aluno sobre a experiência com a G-Force e os
                  resultados obtidos através do processo."
                </p>
                <p className="font-semibold text-white">Aluno G-Force</p>
                <p className="text-sm text-gray-300">Membro desde 2024</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Camisetas */}
      <section id="camisetas" className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-800 text-zinc-100 rounded-full text-sm font-medium">
                <ShoppingBag className="h-4 w-4" />
                Loja G-Force
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Camisetas oficiais da comunidade
              </h2>
              <p className="text-lg text-gray-300">
                Garanta a sua camiseta da G-Force. Clique no botão abaixo e
                fale direto no WhatsApp para receber valores e disponibilidade.
              </p>
              <button
                onClick={handleShirtWhatsAppClick}
                className="inline-flex items-center gap-2 px-7 py-4 bg-white text-black rounded-lg font-semibold hover:bg-zinc-200 transition-all"
              >
                <MessageCircle className="h-5 w-5" />
                Tenho interesse nas camisetas
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-zinc-700 shadow-sm bg-zinc-900">
              <img
                src="/20b27da5-b7bb-45e7-904e-66e8e5a997a1.jpeg"
                alt="Camisetas oficiais da comunidade G-Force"
                className="w-full h-full min-h-[320px] object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-800 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            Evolução não acontece por acaso.
          </h2>
          <p className="text-xl opacity-90">
            Ela acontece quando existe método, acompanhamento e constância.
          </p>
          <p className="text-2xl font-semibold">
            Se você está pronto para tratar seu treino e sua dieta com
            seriedade, a G-Force é o seu lugar.
          </p>
          <button
            onClick={handleWhatsAppClick}
            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black text-xl font-bold rounded-lg hover:bg-zinc-200 transition-all"
          >
            <MessageCircle className="h-6 w-6" />
            Quero iniciar meu acompanhamento na G-Force
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <h3 className="text-xl font-bold mb-4">Missão</h3>
              <p className="text-gray-400">
                Promover evolução real através de acompanhamento organizado,
                humano e consistente.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Valores</h3>
              <ul className="text-gray-400 space-y-2">
                <li>• Constância</li>
                <li>• Disciplina</li>
                <li>• Clareza</li>
                <li>• Organização</li>
                <li>• Processo</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Visão</h3>
              <p className="text-gray-400">
                Construir uma comunidade forte, consciente e comprometida com
                evolução de longo prazo — física e mental.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <BrandMark size="sm" textClassName="text-lg text-white" />
              <p className="text-gray-400">
                © 2025 G-Force. Todos os direitos reservados.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleWhatsAppClick}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  WhatsApp
                </button>
                <button
                  onClick={handleLoginClick}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
