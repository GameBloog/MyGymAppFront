import { useQuery, type UseQueryResult } from "react-query"
import { professoresApi } from "../services/api"
import { type Professor } from "../types"

export const useProfessores = (): UseQueryResult<Professor[], Error> => {
  return useQuery<Professor[], Error>("professores", professoresApi.getAll, {
    staleTime: 60000, 
    cacheTime: 300000, 
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 2,
  })
}
