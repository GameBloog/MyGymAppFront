import { useQuery, type UseQueryResult } from "react-query"
import { alunosApi } from "../services/api"
import { type Aluno } from "../types"
import { useAuth } from "./useAuth"

export const useMyAluno = (): UseQueryResult<Aluno, Error> => {
  const { user, isAuthenticated } = useAuth()
  const isAluno = user?.role === "ALUNO"

  return useQuery<Aluno, Error>(
    ["myAluno", user?.id],
    async () => {
      const alunos = await alunosApi.getAll()

      const meuAluno = alunos.find((aluno) => aluno.userId === user?.id)

      if (!meuAluno) {
        throw new Error("Registro de aluno não encontrado para este usuário")
      }

      return meuAluno
    },
    {
      enabled: isAuthenticated && isAluno && !!user?.id,
      staleTime: 30000,
      cacheTime: 300000,
      retry: 2,
      refetchOnMount: true,
      onError: (error) => {
        console.error("❌ Erro ao buscar dados do aluno:", error)
      },
      onSuccess: (data) => {
      },
    }
  )
}
