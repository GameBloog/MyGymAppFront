import React from "react"
import { Loader2, AlertCircle, TrendingUp } from "lucide-react"
import { Card } from "../components/ui"
import { useHistorico } from "../hooks/useHistorico"
import type { MetricaEvolucao } from "../types/historico"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface GraficoEvolucaoProps {
  alunoId: string
  metrica: MetricaEvolucao
}

const nomesMetricas: Record<MetricaEvolucao, string> = {
  pesoKg: "Peso (kg)",
  cinturaCm: "Cintura (cm)",
  quadrilCm: "Quadril (cm)",
  pescocoCm: "Pescoço (cm)",
  percentualGordura: "% Gordura",
  massaMuscularKg: "Massa Muscular (kg)",
  bracoEsquerdoCm: "Braço Esquerdo (cm)",
  bracoDireitoCm: "Braço Direito (cm)",
  pernaEsquerdaCm: "Perna Esquerda (cm)",
  pernaDireitaCm: "Perna Direita (cm)",
}

export const GraficoEvolucao: React.FC<GraficoEvolucaoProps> = ({
  alunoId,
  metrica,
}) => {
  const { data: historico, isLoading, error } = useHistorico(alunoId)

  if (isLoading) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-600">Carregando evolução...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-2 border-red-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Erro ao carregar gráfico
            </h3>
            <p className="text-red-800">{error.message}</p>
          </div>
        </div>
      </Card>
    )
  }

  if (!historico || historico.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum histórico disponível
          </h3>
          <p className="text-gray-500">
            Adicione o primeiro registro para visualizar a evolução
          </p>
        </div>
      </Card>
    )
  }

  const dadosFiltrados = [...historico]
    .filter((item) => item[metrica] !== null && item[metrica] !== undefined)
    .sort(
      (a, b) =>
        new Date(a.dataRegistro).getTime() - new Date(b.dataRegistro).getTime()
    ) 

  if (dadosFiltrados.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sem dados para {nomesMetricas[metrica]}
          </h3>
          <p className="text-gray-500">Nenhum registro contém esta medida</p>
        </div>
      </Card>
    )
  }

  const valores = dadosFiltrados.map((item) => item[metrica] as number)
  const valorMinimo = Math.min(...valores)
  const valorMaximo = Math.max(...valores)
  const valorMedio = valores.reduce((a, b) => a + b, 0) / valores.length
  const diferencaTotal = valores[valores.length - 1] - valores[0]

  const calcularAltura = (valor: number) => {
    if (valorMinimo === valorMaximo) return 100
    return ((valor - valorMinimo) / (valorMaximo - valorMinimo)) * 80 + 20
  }

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Evolução de {nomesMetricas[metrica]}
        </h2>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Valor Atual</p>
            <p className="text-lg font-bold text-blue-600">
              {valores[valores.length - 1].toFixed(1)}
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Média</p>
            <p className="text-lg font-bold text-green-600">
              {valorMedio.toFixed(1)}
            </p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Mínimo</p>
            <p className="text-lg font-bold text-purple-600">
              {valorMinimo.toFixed(1)}
            </p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Máximo</p>
            <p className="text-lg font-bold text-orange-600">
              {valorMaximo.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Diferença Total */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm">
            <span className="font-medium">Evolução total:</span>{" "}
            <span
              className={`font-bold ${
                diferencaTotal > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {diferencaTotal > 0 ? "+" : ""}
              {diferencaTotal.toFixed(1)}
            </span>
          </p>
        </div>
      </div>

      {/* Gráfico de Barras Simples */}
      <div className="relative h-64 border-l-2 border-b-2 border-gray-300 pl-2">
        <div className="flex items-end justify-center h-full pb-2 gap-2 md:gap-4">
          {dadosFiltrados.map((item, index) => {
            const altura = calcularAltura(item[metrica] as number)
            const valor = item[metrica] as number
            const barWidth =
              dadosFiltrados.length <= 3
                ? "80px"
                : dadosFiltrados.length <= 5
                ? "60px"
                : dadosFiltrados.length <= 10
                ? "40px"
                : "30px"

            return (
              <div
                key={item.id}
                className="flex flex-col items-center justify-end group relative"
                style={{ width: barWidth, minWidth: "30px" }}
              >
                {/* Barra */}
                <div
                  className="w-full bg-blue-500 hover:bg-blue-600 transition-colors rounded-t cursor-pointer relative"
                  style={{ height: `${altura}%`, minHeight: "4px" }}
                  title={`${format(new Date(item.dataRegistro), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}: ${valor.toFixed(1)}`}
                >
                  {/* Valor no topo da barra (visível no hover em telas grandes) */}
                  <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {valor.toFixed(1)}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                </div>

                {/* Data (mostrar apenas algumas labels) */}
                {(dadosFiltrados.length <= 10 ||
                  index % Math.ceil(dadosFiltrados.length / 10) === 0) && (
                  <p className="text-[10px] text-gray-600 mt-1 whitespace-nowrap">
                    {format(new Date(item.dataRegistro), "dd/MM", {
                      locale: ptBR,
                    })}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Linha da média */}
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed border-green-400 pointer-events-none"
          style={{
            bottom: `calc(${calcularAltura(valorMedio)}% + 0.5rem)`,
          }}
        >
          <span className="absolute right-2 -top-5 text-xs font-medium text-green-600 bg-white px-2">
            Média: {valorMedio.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Legenda */}
      <div className="mt-4 text-xs text-gray-500">
        <p>
          📊 Total de registros: {dadosFiltrados.length} | Período:{" "}
          {format(new Date(dadosFiltrados[0].dataRegistro), "dd/MM/yyyy", {
            locale: ptBR,
          })}{" "}
          -{" "}
          {format(
            new Date(dadosFiltrados[dadosFiltrados.length - 1].dataRegistro),
            "dd/MM/yyyy",
            { locale: ptBR }
          )}
        </p>
      </div>
    </Card>
  )
}
