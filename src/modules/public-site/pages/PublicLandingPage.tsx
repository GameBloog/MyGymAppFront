import { useEffect } from "react"
import {
  ArrowRight,
  CalendarDays,
  Check,
  Dumbbell,
  LogIn,
  MessageCircle,
  ShieldCheck,
  Shirt,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { leadLinksApi } from "../../../services/api"
import {
  normalizeLeadSlug,
  saveLeadSlug,
  shouldTrackLeadOnThisLoad,
} from "../../../utils/leadTracking"
import {
  experienceValues,
  frictionPoints,
  platformCards,
  serviceHighlights,
  WHATSAPP_NUMBER,
  whoWeArePillars,
} from "../content"
import { PublicSiteLayout } from "../components/PublicSiteLayout"
import { openWhatsApp, scrollToPublicSection } from "../utils"

const accentCardClass =
  "rounded-[28px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.24)]"

export const PublicLandingPage = () => {
  const location = useLocation()
  const navigate = useNavigate()

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

  useEffect(() => {
    if (!location.hash) {
      return
    }

    const sectionId = location.hash.replace("#", "")
    const timeout = window.setTimeout(() => {
      scrollToPublicSection(sectionId)
    }, 80)

    return () => window.clearTimeout(timeout)
  }, [location.hash])

  const handleContactClick = () => {
    openWhatsApp(
      WHATSAPP_NUMBER,
      "Olá! Quero entender como funciona o acompanhamento da G-Force.",
    )
  }

  const handleShirtClick = () => {
    openWhatsApp(
      WHATSAPP_NUMBER,
      "Olá! Quero saber mais sobre as camisas oficiais da G-Force.",
    )
  }

  return (
    <PublicSiteLayout>
      <section className="relative overflow-hidden px-5 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,165,72,0.20),_transparent_28%),radial-gradient(circle_at_80%_20%,_rgba(73,180,166,0.18),_transparent_24%),linear-gradient(180deg,_#080808_0%,_#101010_42%,_#080808_100%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-[#d4a548]/35 bg-[#d4a548]/10 px-4 py-2 text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#f4d598] sm:justify-start sm:text-left sm:text-xs sm:tracking-[0.2em]">
              <Sparkles className="h-3.5 w-3.5" />
              Clareza comercial + experiência real do aluno
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-[4.2rem]">
                Acompanhamento não deveria depender de bagunça, improviso e mensagem perdida.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
                A G-Force combina comunidade, acompanhamento e plataforma própria para
                organizar treino, dieta, feedback e evolução em uma rotina mais clara,
                forte e sustentável.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleContactClick}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d4a548] px-6 py-4 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 sm:w-auto sm:px-7 sm:text-base"
              >
                <MessageCircle className="h-5 w-5" />
                Quero entender meu melhor caminho
              </button>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-4 text-sm font-semibold text-white transition-colors hover:border-white/20 hover:bg-white/5 sm:w-auto sm:px-7 sm:text-base"
              >
                <LogIn className="h-5 w-5" />
                Já sou aluno
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {serviceHighlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[#0d0d0d] shadow-[0_25px_100px_rgba(0,0,0,0.35)]">
              <img
                src="/0e831fa0-39ee-4b03-9071-98532877d713.jpeg"
                alt="Identidade visual da comunidade G-Force"
                className="aspect-[4/4.1] w-full object-cover"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className={`${accentCardClass} bg-[#132926]/70`}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7de0d3]">
                  Feedback visível
                </p>
                <p className="mt-3 text-lg font-semibold text-white">
                  O aluno encontra orientação do professor sem precisar caçar histórico solto.
                </p>
              </div>
              <div className={`${accentCardClass} bg-[#2f2410]/70`}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f1d38b]">
                  Cronograma claro
                </p>
                <p className="mt-3 text-lg font-semibold text-white">
                  Treino do dia, rotina da semana e evolução ficam acessíveis no mesmo fluxo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="servico" className="px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-14">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d4a548]">
              Onde a evolução costuma travar
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Não é falta de esforço. Normalmente é falta de método para sustentar o esforço.
            </h2>
            <p className="text-lg leading-8 text-zinc-300">
              Quando treino, dieta, feedback e histórico ficam espalhados, até a boa vontade
              perde força. A proposta da G-Force é reduzir esse atrito e deixar o processo
              mais utilizável no mundo real.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-4">
              {frictionPoints.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[24px] border border-[#6b2d2d] bg-[#250d0d] p-6"
                >
                  <p className="text-lg font-semibold text-white">{item.title}</p>
                  <p className="mt-3 text-sm leading-7 text-zinc-300">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#111111] via-[#131313] to-[#090909] p-6 sm:p-7">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#49b4a6]">
                O que muda com a G-Force
              </p>
              <h3 className="mt-4 text-2xl font-bold text-white">
                O serviço principal vem antes de qualquer acessório: primeiro clareza, depois complemento.
              </h3>
              <div className="mt-6 space-y-4">
                {serviceHighlights.map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-[#49b4a6]/15 p-1.5 text-[#7de0d3]">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-sm leading-6 text-zinc-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="plataforma" className="bg-[#0d0d0d] px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#49b4a6]">
              Plataforma própria
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              O acompanhamento fica mais forte quando o aluno enxerga o processo com clareza.
            </h2>
            <p className="text-lg leading-8 text-zinc-300">
              A plataforma própria centraliza o que mais importa para manter consistência:
              treino, dieta, materiais, histórico, recados e sinais concretos de progresso.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {platformCards.map((item, index) => (
              <div
                key={item.title}
                className={`rounded-[28px] border p-6 sm:p-7 ${
                  index % 2 === 0
                    ? "border-[#d4a548]/20 bg-[#21180b]"
                    : "border-[#49b4a6]/20 bg-[#102321]"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
                  {item.eyebrow}
                </p>
                <h3 className="mt-4 text-2xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-zinc-300">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            <div className={accentCardClass}>
              <CalendarDays className="h-7 w-7 text-[#f1d38b]" />
              <p className="mt-4 text-lg font-semibold text-white">Cronograma útil</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                O aluno abre a rotina e identifica rapidamente o próximo treino e o próximo passo.
              </p>
            </div>
            <div className={accentCardClass}>
              <Target className="h-7 w-7 text-[#7de0d3]" />
              <p className="mt-4 text-lg font-semibold text-white">Execução com contexto</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Histórico de carga, observações e mídia ajudam a transformar orientação em ação.
              </p>
            </div>
            <div className={accentCardClass}>
              <TrendingUp className="h-7 w-7 text-[#f1d38b]" />
              <p className="mt-4 text-lg font-semibold text-white">Progressão real</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Fica mais fácil perceber o que evoluiu, o que estagnou e onde ajustar.
              </p>
            </div>
            <div className={accentCardClass}>
              <ShieldCheck className="h-7 w-7 text-[#7de0d3]" />
              <p className="mt-4 text-lg font-semibold text-white">Menos ruído</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                A experiência reduz dependência de conversa solta para algo que exige método.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-[#d4a548]/20 bg-[#17120a] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f1d38b]">
              Planos
            </p>
            <h2 className="mt-4 text-3xl font-bold text-white">
              O valor do plano está na experiência organizada que ele sustenta.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-zinc-300">
              A página de planos mostra como avaliar o nível de acompanhamento ideal sem cair
              em conversa rasa de preço solto. Primeiro você entende o valor. Depois escolhe
              o caminho mais coerente para a sua rotina.
            </p>
            <button
              onClick={() => navigate("/planos")}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#d4a548]/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d4a548]/10"
            >
              Ver página de planos
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[#0f0f0f] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#49b4a6]">
              Acesso rápido
            </p>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="font-semibold text-white">Treino do dia</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Rotina organizada para facilitar aderência e execução.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="font-semibold text-white">Feedback do professor</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Comentários aparecem com mais visibilidade para orientar a próxima sessão.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="quem-somos" className="bg-[#0d0d0d] px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d4a548]">
              Quem somos
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              A G-Force nasce da ideia de que evolução séria precisa de acompanhamento utilizável.
            </h2>
            <p className="text-base leading-8 text-zinc-300">
              Somos uma comunidade que une treino, dieta, organização e plataforma própria para
              apoiar a rotina de quem quer construir resultado com disciplina, clareza e visão de
              longo prazo.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {whoWeArePillars.map((item) => (
              <div
                key={item}
                className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5"
              >
                <Dumbbell className="h-6 w-6 text-[#7de0d3]" />
                <p className="mt-4 text-sm leading-7 text-zinc-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="experiencia" className="px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-10">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#49b4a6]">
              O que a comunidade valoriza
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Uma experiência pensada para ajudar o aluno a continuar, não apenas começar.
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {experienceValues.map((item) => (
              <div
                key={item.title}
                className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#111111] to-[#0a0a0a] p-6 sm:p-7"
              >
                <p className="text-xl font-semibold text-white">{item.title}</p>
                <p className="mt-4 text-sm leading-7 text-zinc-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0d0d0d] px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center xl:gap-12">
          <div className="space-y-4 lg:max-w-[36rem]">
            <p className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-200 sm:tracking-[0.18em]">
              <Shirt className="h-4 w-4 text-[#d4a548]" />
              Camisas oficiais
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              As camisas entram como extensão da comunidade, não como foco principal da oferta.
            </h2>
            <p className="text-base leading-8 text-zinc-300">
              O serviço continua sendo o centro da experiência. As camisas representam
              pertencimento, identidade e vínculo com a cultura da G-Force.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/camisas")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5 sm:w-auto"
              >
                Conhecer a página das camisas
              </button>
              <button
                onClick={handleShirtClick}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#49b4a6] px-6 py-3 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 sm:w-auto"
              >
                Falar sobre as camisas
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[34rem] overflow-hidden rounded-[32px] border border-white/10 bg-[#101010] lg:ml-auto lg:max-w-[30rem]">
            <img
              src="/20b27da5-b7bb-45e7-904e-66e8e5a997a1.jpeg"
              alt="Camisas oficiais da comunidade G-Force"
              className="aspect-[5/4] w-full object-cover sm:aspect-[6/5] lg:aspect-[5/4]"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,_rgba(212,165,72,0.18),_rgba(10,10,10,0.96)_40%,_rgba(73,180,166,0.16))] px-6 py-10 text-center sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f1d38b]">
            Próximo passo
          </p>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Se você quer tratar treino e dieta com mais clareza, o ponto de partida é organizar a experiência.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-zinc-200">
            A G-Force foi desenhada para fortalecer constância, acompanhamento e leitura real do processo.
            Se isso faz sentido para o seu momento, vamos conversar.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={handleContactClick}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d4a548] px-6 py-4 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 sm:w-auto sm:px-7 sm:text-base"
            >
              <MessageCircle className="h-5 w-5" />
              Quero iniciar meu acompanhamento
            </button>
            <button
              onClick={() => navigate("/planos")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/5 sm:w-auto sm:px-7 sm:text-base"
            >
              Entender o valor dos planos
            </button>
          </div>
        </div>
      </section>
    </PublicSiteLayout>
  )
}

export default PublicLandingPage
