import React, { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  BarChart3,
  Check,
  Copy,
  Link2,
  Plus,
  RefreshCw,
} from "lucide-react"
import { Button, Card } from "../../components/ui"
import {
  useCreateLeadLink,
  useLeadLinks,
  useUpdateLeadLink,
} from "../../hooks/useLeadLinks"
import { showToast } from "../../utils/toast"

const rangeOptions = [
  { value: 7, label: "7 dias" },
  { value: 30, label: "30 dias" },
  { value: 90, label: "90 dias" },
]

export const LeadLinksPage: React.FC = () => {
  const navigate = useNavigate()
  const [range, setRange] = useState(30)
  const [showModal, setShowModal] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nome: "",
    canal: "",
    origem: "",
    slug: "",
  })

  const { data, isLoading } = useLeadLinks(range)
  const createLeadLink = useCreateLeadLink()
  const updateLeadLink = useUpdateLeadLink()

  const items = data?.items ?? []

  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.clicksTotal += item.clicksTotal
        acc.clicksUnique += item.clicksUnique
        acc.novosCadastros += item.novosCadastros
        return acc
      },
      {
        clicksTotal: 0,
        clicksUnique: 0,
        novosCadastros: 0,
      },
    )
  }, [items])

  const conversion =
    totals.clicksUnique > 0
      ? ((totals.novosCadastros / totals.clicksUnique) * 100).toFixed(2)
      : "0.00"

  const handleCreate = async () => {
    if (!formData.nome.trim()) {
      showToast.error("Nome da campanha é obrigatório")
      return
    }

    await createLeadLink.mutateAsync({
      nome: formData.nome.trim(),
      canal: formData.canal.trim() || undefined,
      origem: formData.origem.trim() || undefined,
      slug: formData.slug.trim() || undefined,
    })

    setFormData({ nome: "", canal: "", origem: "", slug: "" })
    setShowModal(false)
  }

  const handleCopy = async (id: string, landingPath: string) => {
    const fullUrl = `${window.location.origin}${landingPath}`
    await navigator.clipboard.writeText(fullUrl)
    setCopiedId(id)
    showToast.success("Link copiado")
    window.setTimeout(() => setCopiedId(null), 1800)
  }

  const handleToggle = async (id: string, ativo: boolean) => {
    await updateLeadLink.mutateAsync({
      id,
      data: { ativo: !ativo },
    })
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Links de Lead</h1>
            <p className="text-zinc-300 mt-1">
              Geração de links rastreáveis para aquisição
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <select
            className="px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-white focus:ring-2 focus:ring-zinc-300 focus:border-transparent"
            value={range}
            onChange={(event) => setRange(Number(event.target.value))}
          >
            {rangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button icon={Plus} onClick={() => setShowModal(true)}>
            Novo Link
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-zinc-900 border-zinc-700">
          <p className="text-sm text-zinc-200 mb-1">Links criados</p>
          <p className="text-3xl font-bold text-white">{items.length}</p>
        </Card>
        <Card className="bg-blue-950/40 border-blue-500/30">
          <p className="text-sm text-zinc-100 mb-1">Cliques totais</p>
          <p className="text-3xl font-bold text-blue-200">{totals.clicksTotal}</p>
        </Card>
        <Card className="bg-emerald-950/40 border-emerald-500/30">
          <p className="text-sm text-zinc-100 mb-1">Cliques únicos</p>
          <p className="text-3xl font-bold text-emerald-200">{totals.clicksUnique}</p>
        </Card>
        <Card className="bg-indigo-950/40 border-indigo-500/30">
          <p className="text-sm text-zinc-100 mb-1">Conversão média</p>
          <p className="text-3xl font-bold text-indigo-200">{conversion}%</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Links ({range} dias)</h2>
          {isLoading && <RefreshCw className="h-4 w-4 animate-spin text-zinc-400" />}
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="border border-zinc-700 rounded-lg p-4 bg-zinc-900"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-blue-300" />
                    <p className="font-semibold text-white">{item.nome}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        item.ativo
                          ? "bg-emerald-950/50 text-emerald-200 border border-emerald-500/30"
                          : "bg-zinc-800 text-zinc-200 border border-zinc-700"
                      }`}
                    >
                      {item.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-300 font-mono break-all">
                    {window.location.origin}
                    {item.landingPath}
                  </p>

                  <div className="flex flex-wrap gap-3 text-sm text-zinc-200">
                    <span>Canal: {item.canal || "-"}</span>
                    <span>Origem: {item.origem || "-"}</span>
                    <span>Slug: {item.slug}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[220px]">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-zinc-900 rounded-lg p-2 border border-zinc-700">
                      <p className="text-zinc-400">Total</p>
                      <p className="font-semibold text-white">{item.clicksTotal}</p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-2 border border-zinc-700">
                      <p className="text-zinc-400">Únicos</p>
                      <p className="font-semibold text-white">{item.clicksUnique}</p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-2 border border-zinc-700">
                      <p className="text-zinc-400">Cadastros</p>
                      <p className="font-semibold text-white">{item.novosCadastros}</p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-2 border border-zinc-700">
                      <p className="text-zinc-400">Conv.</p>
                      <p className="font-semibold text-white">{item.conversao.toFixed(2)}%</p>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="secondary"
                      icon={copiedId === item.id ? Check : Copy}
                      onClick={() => handleCopy(item.id, item.landingPath)}
                    >
                      {copiedId === item.id ? "Copiado" : "Copiar"}
                    </Button>
                    <Button
                      variant="secondary"
                      icon={BarChart3}
                      onClick={() => handleToggle(item.id, item.ativo)}
                    >
                      {item.ativo ? "Desativar" : "Ativar"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!isLoading && items.length === 0 && (
            <div className="text-center py-10">
              <p className="text-zinc-300">Nenhum link de lead cadastrado ainda.</p>
            </div>
          )}
        </div>
      </Card>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-zinc-900 rounded-lg shadow-xl w-full max-w-lg p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-4">Criar Link de Lead</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-zinc-200">Nome da campanha *</label>
                <input
                  className="w-full mt-1 px-3 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-300 focus:border-transparent"
                  value={formData.nome}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, nome: event.target.value }))
                  }
                  placeholder="Ex: Campanha Instagram Março"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-200">Canal</label>
                <input
                  className="w-full mt-1 px-3 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-300 focus:border-transparent"
                  value={formData.canal}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, canal: event.target.value }))
                  }
                  placeholder="Ex: Instagram"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-200">Origem</label>
                <input
                  className="w-full mt-1 px-3 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-300 focus:border-transparent"
                  value={formData.origem}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, origem: event.target.value }))
                  }
                  placeholder="Ex: ADS, Parceiro, Bio"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-200">Slug (opcional)</label>
                <input
                  className="w-full mt-1 px-3 py-2 bg-zinc-900 text-white border border-zinc-700 rounded-lg focus:ring-2 focus:ring-zinc-300 focus:border-transparent"
                  value={formData.slug}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, slug: event.target.value }))
                  }
                  placeholder="Ex: instagram-marco"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} isLoading={createLeadLink.isLoading}>
                Criar Link
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
