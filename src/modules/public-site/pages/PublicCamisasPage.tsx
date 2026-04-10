import { ArrowRight, MessageCircle, ShieldCheck, Shirt, Sparkles } from "lucide-react"
import { PublicSiteLayout } from "../components/PublicSiteLayout"
import { shirtValuePillars, WHATSAPP_NUMBER } from "../content"
import { openWhatsApp } from "../utils"

export const PublicCamisasPage = () => {
  const handleContactClick = () => {
    openWhatsApp(
      WHATSAPP_NUMBER,
      "Olá! Quero saber mais sobre as camisas oficiais da G-Force.",
    )
  }

  return (
    <PublicSiteLayout>
      <section className="px-5 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.96fr_1.04fr] lg:items-center xl:gap-12">
          <div className="mx-auto w-full max-w-[34rem] overflow-hidden rounded-[34px] border border-white/10 bg-[#101010] lg:mr-auto lg:max-w-[29rem]">
            <img
              src="/20b27da5-b7bb-45e7-904e-66e8e5a997a1.jpeg"
              alt="Camisas oficiais da comunidade G-Force"
              className="aspect-[5/4] w-full object-cover sm:aspect-[6/5] lg:aspect-[4/4.3]"
              loading="lazy"
            />
          </div>

          <div className="space-y-5 lg:max-w-[36rem]">
            <p className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-200 sm:tracking-[0.18em]">
              <Shirt className="h-4 w-4 text-[#d4a548]" />
              Camisas oficiais
            </p>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
              A camisa carrega a identidade da comunidade que escolhe processo, constância e evolução real.
            </h1>
            <p className="text-lg leading-8 text-zinc-300">
              O serviço principal continua sendo o centro da proposta da G-Force. A camisa entra
              como extensão da cultura da comunidade: um símbolo de pertencimento, disciplina e
              compromisso com a rotina.
            </p>
            <button
              onClick={handleContactClick}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#49b4a6] px-6 py-4 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 sm:w-auto sm:px-7 sm:text-base"
            >
              <MessageCircle className="h-5 w-5" />
              Falar sobre as camisas
            </button>
          </div>
        </div>
      </section>

      <section className="bg-[#0d0d0d] px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d4a548]">
              Valor percebido
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              O valor da camisa vai além do tecido: ela representa vínculo com a cultura da G-Force.
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {shirtValuePillars.map((item) => (
              <div
                key={item.title}
                className="rounded-[28px] border border-white/10 bg-[#101010] p-6 sm:p-7"
              >
                <Sparkles className="h-6 w-6 text-[#f1d38b]" />
                <p className="mt-5 text-2xl font-semibold text-white">{item.title}</p>
                <p className="mt-4 text-sm leading-7 text-zinc-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[28px] border border-white/10 bg-[#101010] p-6 sm:p-8">
            <ShieldCheck className="h-7 w-7 text-[#49b4a6]" />
            <h2 className="mt-5 text-2xl font-bold text-white">
              Um item para representar a comunidade fora da tela
            </h2>
            <p className="mt-4 text-sm leading-7 text-zinc-300">
              A camisa aproxima identidade e rotina. Ela conversa com a cultura da G-Force
              sem competir com o serviço principal, que continua sendo acompanhamento sério.
            </p>
          </div>

          <div className="rounded-[32px] border border-[#49b4a6]/25 bg-[linear-gradient(140deg,_rgba(73,180,166,0.18),_rgba(11,11,11,0.96)_38%,_rgba(212,165,72,0.16))] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7de0d3]">
              Disponibilidade e detalhes
            </p>
            <h2 className="mt-4 text-3xl font-bold text-white">
              Quer saber sobre modelagem, disponibilidade e valores da camisa?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-zinc-100">
              Fale direto com a equipe para receber as informações atualizadas e entender o que
              está disponível no momento.
            </p>
            <button
              onClick={handleContactClick}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#49b4a6] px-6 py-4 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 sm:w-auto sm:px-7 sm:text-base"
            >
              <MessageCircle className="h-5 w-5" />
              Pedir informações das camisas
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>
    </PublicSiteLayout>
  )
}

export default PublicCamisasPage
