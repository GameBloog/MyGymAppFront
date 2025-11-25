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

      if (!alunos || alunos.length === 0) {
        throw new Error("Registro de aluno não encontrado")
      }

      return alunos[0]
    },
    {
      enabled: isAuthenticated && isAluno,
      staleTime: 30000,
      cacheTime: 300000,
      retry: 2,
      refetchOnMount: true,
    }
  )
}
