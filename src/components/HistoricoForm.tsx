import React, { useState } from "react"
import { Activity, Plus, Calendar } from "lucide-react"
import { Card, Input, Button, Textarea } from "../components/ui"
import { useCreateHistorico } from "../hooks/useHistorico"
import { type CreateHistoricoDTO } from "../types/historico"

interface HistoricoFormProps {
  alunoId: string
  onSuccess?: () => void
}

const initialFormState = {
  pesoKg: "",
  alturaCm: "",
  cinturaCm: "",
  quadrilCm: "",
  pescocoCm: "",
  bracoEsquerdoCm: "",
  bracoDireitoCm: "",
  pernaEsquerdaCm: "",
  pernaDireitaCm: "",
  percentualGordura: "",
  massaMuscularKg: "",
  observacoes: "",
  dataRegistro: "",
}

export const HistoricoForm: React.FC<HistoricoFormProps> = ({
  alunoId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState(initialFormState)
  const createHistorico = useCreateHistorico()

  const handleSubmit = async () => {
    try {
      const dataToSend: CreateHistoricoDTO = {
        alunoId,
      }

      if (formData.pesoKg) dataToSend.pesoKg = Number(formData.pesoKg)
      if (formData.alturaCm) dataToSend.alturaCm = Number(formData.alturaCm)
      if (formData.cinturaCm) dataToSend.cinturaCm = Number(formData.cinturaCm)
      if (formData.quadrilCm) dataToSend.quadrilCm = Number(formData.quadrilCm)
      if (formData.pescocoCm) dataToSend.pescocoCm = Number(formData.pescocoCm)
      if (formData.bracoEsquerdoCm)
        dataToSend.bracoEsquerdoCm = Number(formData.bracoEsquerdoCm)
      if (formData.bracoDireitoCm)
        dataToSend.bracoDireitoCm = Number(formData.bracoDireitoCm)
      if (formData.pernaEsquerdaCm)
        dataToSend.pernaEsquerdaCm = Number(formData.pernaEsquerdaCm)
      if (formData.pernaDireitaCm)
        dataToSend.pernaDireitaCm = Number(formData.pernaDireitaCm)
      if (formData.percentualGordura)
        dataToSend.percentualGordura = Number(formData.percentualGordura)
      if (formData.massaMuscularKg)
        dataToSend.massaMuscularKg = Number(formData.massaMuscularKg)
      if (formData.observacoes.trim())
        dataToSend.observacoes = formData.observacoes.trim()
      if (formData.dataRegistro)
        dataToSend.dataRegistro = new Date(formData.dataRegistro).toISOString()

      await createHistorico.mutateAsync(dataToSend)

      setFormData(initialFormState)
      onSuccess?.()
    } catch (error) {
      console.error("Erro ao adicionar histórico:", error)
    }
  }

  const isLoading = createHistorico.isLoading

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5" />
        Adicionar Novo Registro de Evolução
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data do Registro
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="datetime-local"
              value={formData.dataRegistro}
              onChange={(e) =>
                setFormData({ ...formData, dataRegistro: e.target.value })
              }
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Deixe em branco para usar a data/hora atual
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Input
            label="Peso (kg)"
            type="number"
            step="0.1"
            value={formData.pesoKg}
            onChange={(e) =>
              setFormData({ ...formData, pesoKg: e.target.value })
            }
            placeholder="75.5"
            min="30"
            max="300"
          />
          <Input
            label="Altura (cm)"
            type="number"
            value={formData.alturaCm}
            onChange={(e) =>
              setFormData({ ...formData, alturaCm: e.target.value })
            }
            placeholder="175"
            min="100"
            max="250"
          />
          <Input
            label="Cintura (cm)"
            type="number"
            step="0.1"
            value={formData.cinturaCm}
            onChange={(e) =>
              setFormData({ ...formData, cinturaCm: e.target.value })
            }
            placeholder="80"
          />
          <Input
            label="Quadril (cm)"
            type="number"
            step="0.1"
            value={formData.quadrilCm}
            onChange={(e) =>
              setFormData({ ...formData, quadrilCm: e.target.value })
            }
            placeholder="95"
          />
          <Input
            label="Pescoço (cm)"
            type="number"
            step="0.1"
            value={formData.pescocoCm}
            onChange={(e) =>
              setFormData({ ...formData, pescocoCm: e.target.value })
            }
            placeholder="38"
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Medidas de Membros
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              label="Braço Esquerdo (cm)"
              type="number"
              step="0.1"
              value={formData.bracoEsquerdoCm}
              onChange={(e) =>
                setFormData({ ...formData, bracoEsquerdoCm: e.target.value })
              }
              placeholder="35.5"
            />
            <Input
              label="Braço Direito (cm)"
              type="number"
              step="0.1"
              value={formData.bracoDireitoCm}
              onChange={(e) =>
                setFormData({ ...formData, bracoDireitoCm: e.target.value })
              }
              placeholder="36.0"
            />
            <Input
              label="Perna Esquerda (cm)"
              type="number"
              step="0.1"
              value={formData.pernaEsquerdaCm}
              onChange={(e) =>
                setFormData({ ...formData, pernaEsquerdaCm: e.target.value })
              }
              placeholder="55.0"
            />
            <Input
              label="Perna Direita (cm)"
              type="number"
              step="0.1"
              value={formData.pernaDireitaCm}
              onChange={(e) =>
                setFormData({ ...formData, pernaDireitaCm: e.target.value })
              }
              placeholder="55.5"
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Composição Corporal
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="% Gordura"
              type="number"
              step="0.1"
              value={formData.percentualGordura}
              onChange={(e) =>
                setFormData({ ...formData, percentualGordura: e.target.value })
              }
              placeholder="15.5"
              min="0"
              max="100"
            />
            <Input
              label="Massa Muscular (kg)"
              type="number"
              step="0.1"
              value={formData.massaMuscularKg}
              onChange={(e) =>
                setFormData({ ...formData, massaMuscularKg: e.target.value })
              }
              placeholder="60.0"
            />
          </div>
        </div>

        <Textarea
          label="Observações"
          rows={3}
          value={formData.observacoes}
          onChange={(e) =>
            setFormData({ ...formData, observacoes: e.target.value })
          }
          placeholder="Ex: Boa evolução, aumento de massa muscular visível..."
        />
      </div>

      <div className="flex gap-3 mt-6">
        <Button
          onClick={handleSubmit}
          icon={Plus}
          isLoading={isLoading}
          disabled={isLoading}
        >
          Adicionar Registro
        </Button>
      </div>
    </Card>
  )
}
