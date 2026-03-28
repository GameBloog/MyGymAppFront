import { useQuery, type UseQueryResult } from "react-query"
import { alunosApi } from "../services/api"
import { type Aluno } from "../types"
import { useAuth } from "./useAuth"

export const useMyAluno = (): UseQueryResult<Aluno, Error> => {
  const { user, isAuthenticated } = useAuth()
  const isAluno = user?.role === "ALUNO"

  return useQuery<Aluno, Error>(
    ["myAluno", user?.id],
    () => alunosApi.getMe(),
    {
      enabled: isAuthenticated && isAluno && !!user?.id,
      staleTime: 30000,
      cacheTime: 300000,
      retry: 2,
      refetchOnMount: true,
      onError: (error) => {
        console.error("❌ Erro ao buscar dados do aluno:", error)
      },
      onSuccess: () => {},
    }
  )
}
