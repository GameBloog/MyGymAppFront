import { ArrowRight, CheckCircle2, MessageCircle, Target } from "lucide-react"
import { PublicSiteLayout } from "../components/PublicSiteLayout"
import { planValuePillars, WHATSAPP_NUMBER } from "../content"
import { openWhatsApp } from "../utils"

export const PublicPlanosPage = () => {
  const handleContactClick = () => {
    openWhatsApp(
      WHATSAPP_NUMBER,
      "Olá! Quero entender qual formato de acompanhamento da G-Force faz mais sentido para mim.",
    )
  }

  return (
    <PublicSiteLayout>
      <section className="px-5 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-8xl space-y-12">
          <div className="lg:grid-cols-[1fr_0.82fr] lg:items-end">
            <div className="mx-auto max-w-3xl space-y-4 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--public-accent)]">
                Planos G-Force
              </p>
              <h1 className="text-[2.2rem] font-semibold leading-[1.14] tracking-[-0.01em] text-[color:var(--public-text)] sm:text-[2.8rem] lg:text-[3.2rem]">
                O valor do plano não está apenas no que ele entrega. Está na rotina que ele torna possível.
              </h1>
              <p className="text-[1rem] leading-8 text-[color:var(--public-text-soft)] sm:text-[1.05rem]">
                Esta página compara o valor do acompanhamento sem reduzir a conversa a preço isolado.
                A lógica é simples: quanto mais clareza, contexto e capacidade de ajuste você precisa,
                mais importante fica a qualidade do acompanhamento.
              </p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {planValuePillars.map((item, index) => (
              <div
                key={item.title}
                className={`rounded-[28px] border p-6 sm:p-7 ${
                  index === 1
                    ? "border-[color:var(--public-border-strong)] bg-[color:var(--public-accent-surface)]"
                    : "border-[color:var(--public-border)] bg-[color:var(--public-surface)]"
                }`}
              >
                <p className="text-2xl font-semibold text-[color:var(--public-text)]">{item.title}</p>
                <p className="mt-4 text-sm leading-7 text-[color:var(--public-text-soft)]">{item.description}</p>
                <div className="mt-6 rounded-2xl border border-[color:var(--public-border)] bg-[color:var(--public-surface-soft)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--public-teal)]">
                    Melhor para
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--public-text-soft)]">{item.audience}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--public-bg-alt)] px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--public-teal)]">
              O que sustenta valor de verdade
            </p>
            <h2 className="text-[1rem] font-semibold leading-[1] tracking-[-0.01em] text-[color:var(--public-text)] sm:text-[3rem]">
              O plano certo ajuda a organizar, acompanhar e ajustar com muito menos ruído.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              "Treino e dieta com acesso mais claro no dia a dia.",
              "Feedback do professor em contexto, sem depender de conversa perdida.",
              "Histórico de execução e evolução para tomar decisões melhores.",
              "Plataforma própria para reduzir atrito e fortalecer constância.",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-[24px] border border-[color:var(--public-border)] bg-[color:var(--public-surface)] p-5"
              >
                <CheckCircle2 className="mt-1 h-5 w-5 text-[color:var(--public-accent)]" />
                <p className="text-sm leading-7 text-[color:var(--public-text-soft)]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 pt-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="rounded-[28px] border border-[color:var(--public-border)] bg-[color:var(--public-surface)] p-6 sm:p-8">
            <Target className="h-7 w-7 text-[color:var(--public-teal)]" />
            <h2 className="mt-5 text-2xl font-semibold text-[color:var(--public-text)]">
              Como escolher sem cair em decisão rasa
            </h2>
            <p className="mt-4 text-sm leading-7 text-[color:var(--public-text-soft)]">
              Pergunte menos “qual o preço?” e mais “qual estrutura eu preciso para executar bem,
              manter consistência e ajustar a rota quando a rotina apertar?”.
            </p>
          </div>

          <div className="rounded-[32px] border border-[color:var(--public-border)] bg-[linear-gradient(140deg,var(--public-accent-surface),var(--public-surface-strong)_38%,var(--public-teal-surface))] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--public-accent)]">
              Conversa direta
            </p>
            <h2 className="mt-4 max-w-[16ch] text-[2rem] font-semibold leading-[1.16] tracking-[-0.01em] text-[color:var(--public-text)] sm:text-[2.35rem]">
              Quer descobrir qual formato de acompanhamento combina com o seu momento?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--public-text-soft)]">
              Fale com a equipe, explique sua rotina e seu objetivo, e a conversa segue com mais
              critério do que uma escolha baseada só em número solto.
            </p>
            <button
              onClick={handleContactClick}
              className="mt-7 inline-flex items-center justify-center gap-2 self-start rounded-full bg-[color:var(--public-accent)] bg-[image:var(--public-accent-gradient)] px-6 py-4 text-sm font-semibold text-[color:var(--public-accent-contrast)] transition-transform hover:-translate-y-0.5 sm:px-7 sm:text-base"
            >
              <MessageCircle className="h-5 w-5" />
              Falar sobre os planos
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>
    </PublicSiteLayout>
  )
}

export default PublicPlanosPage
