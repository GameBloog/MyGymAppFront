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
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.82fr] lg:items-end">
            <div className="space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d4a548]">
                Planos G-Force
              </p>
              <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
                O valor do plano não está apenas no que ele entrega. Está na rotina que ele torna possível.
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-zinc-300">
                Esta página compara o valor do acompanhamento sem reduzir a conversa a preço isolado.
                A lógica é simples: quanto mais clareza, contexto e capacidade de ajuste você precisa,
                mais importante fica a qualidade do acompanhamento.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#111111] p-6 sm:p-7">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#49b4a6]">
                Comparativo sem preço
              </p>
              <p className="mt-4 text-base leading-7 text-zinc-300">
                A definição do plano ideal é alinhada na conversa. O foco aqui é ajudar você a
                entender qual nível de estrutura e acompanhamento faz sentido para o seu momento.
              </p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {planValuePillars.map((item, index) => (
              <div
                key={item.title}
                className={`rounded-[28px] border p-6 sm:p-7 ${
                  index === 1
                    ? "border-[#d4a548]/30 bg-[#1f180d]"
                    : "border-white/10 bg-[#101010]"
                }`}
              >
                <p className="text-2xl font-semibold text-white">{item.title}</p>
                <p className="mt-4 text-sm leading-7 text-zinc-300">{item.description}</p>
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#49b4a6]">
                    Melhor para
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">{item.audience}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0d0d0d] px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#49b4a6]">
              O que sustenta valor de verdade
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
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
                className="flex items-start gap-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-5"
              >
                <CheckCircle2 className="mt-1 h-5 w-5 text-[#d4a548]" />
                <p className="text-sm leading-7 text-zinc-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="rounded-[28px] border border-white/10 bg-[#101010] p-6 sm:p-8">
            <Target className="h-7 w-7 text-[#49b4a6]" />
            <h2 className="mt-5 text-2xl font-bold text-white">
              Como escolher sem cair em decisão rasa
            </h2>
            <p className="mt-4 text-sm leading-7 text-zinc-300">
              Pergunte menos “qual o preço?” e mais “qual estrutura eu preciso para executar bem,
              manter consistência e ajustar a rota quando a rotina apertar?”.
            </p>
          </div>

          <div className="rounded-[32px] border border-[#d4a548]/25 bg-[linear-gradient(140deg,_rgba(212,165,72,0.18),_rgba(11,11,11,0.96)_38%,_rgba(73,180,166,0.16))] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f1d38b]">
              Conversa direta
            </p>
            <h2 className="mt-4 text-3xl font-bold text-white">
              Quer descobrir qual formato de acompanhamento combina com o seu momento?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-zinc-100">
              Fale com a equipe, explique sua rotina e seu objetivo, e a conversa segue com mais
              critério do que uma escolha baseada só em número solto.
            </p>
            <button
              onClick={handleContactClick}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d4a548] px-6 py-4 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 sm:w-auto sm:px-7 sm:text-base"
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
