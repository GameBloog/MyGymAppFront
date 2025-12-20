import React, { useState, useMemo } from "react"
import { Trophy } from "lucide-react"
import { Card, Button } from "../components/ui"

type Player = {
  id: string
  nome: string
  pontos: number
}

export const RankingPage: React.FC = () => {
  const [players] = useState<Player[]>([
    { id: "1", nome: "Ana Silva", pontos: 1200 },
    { id: "2", nome: "Pedro Santos", pontos: 1480 },
    { id: "3", nome: "Lucas Ferreira", pontos: 980 },
    { id: "4", nome: "Maria Souza", pontos: 750 },
    { id: "5", nome: "João Almeida", pontos: 1600 },
  ])

  const [order, setOrder] = useState<"asc" | "desc">("desc")

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) =>
      order === "desc" ? b.pontos - a.pontos : a.pontos - b.pontos
    )
  }, [players, order])

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        {/* Logo / Ícone */}
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-500 p-4 rounded-2xl">
            <Trophy className="h-12 w-12 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Ranking
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Veja a classificação dos jogadores
        </p>

        {/* Botão de ordenação */}
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
            className="text-sm"
          >
            Ordenar: {order === "asc" ? "Asc ↑" : "Desc ↓"}
          </Button>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Posição</th>
                <th className="p-3 text-left">Jogador</th>
                <th className="p-3 text-left">Pontos</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => (
                <tr
                  key={player.id}
                  className={`border-t ${
                    index < 3 ? "bg-yellow-50 font-semibold" : ""
                  }`}
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{player.nome}</td>
                  <td className="p-3">{player.pontos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}