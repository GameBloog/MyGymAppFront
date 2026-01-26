import { useEffect, useState } from "react"
import api from "../services/api"
import { Trophy } from "lucide-react"

type Aluno = {
  id: string
  nome: string
  pontuacao: number
}

export default function RankingPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([])

  useEffect(() => {
    async function fetchRanking() {
      try {
        const response = await api.get("/ranking")
        setAlunos(response.data)
      } catch (error) {
        console.error("Erro ao buscar ranking:", error)
      }
    }

    fetchRanking()
  }, [])

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-8 w-8 text-yellow-500" />
        <h1 className="text-3xl font-bold text-gray-900">Ranking de Alunos</h1>
      </div>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Posição</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nome</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Pontuação</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map((aluno, index) => (
              <tr
                key={aluno.id}
                className={`hover:bg-gray-50 ${
                  index === 0 ? "bg-yellow-50 font-bold" : ""
                }`}
              >
                <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{aluno.nome}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{aluno.pontuacao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}