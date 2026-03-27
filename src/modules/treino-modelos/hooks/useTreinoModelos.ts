import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "react-query"
import { showToast } from "../../../utils/toast"
import { treinoModelosApi } from "../api/treinoModelosApi"
import type { CreateTreinoModeloDTO, TreinoModelo } from "../types"

export const useTreinoModelos = (
  enabled = true,
): UseQueryResult<TreinoModelo[], Error> => {
  return useQuery<TreinoModelo[], Error>(
    ["treino-modelos"],
    treinoModelosApi.list,
    {
      enabled,
      staleTime: 15000,
      cacheTime: 300000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  )
}

export const useCreateTreinoModelo = (): UseMutationResult<
  TreinoModelo,
  Error,
  CreateTreinoModeloDTO
> => {
  const queryClient = useQueryClient()

  return useMutation<TreinoModelo, Error, CreateTreinoModeloDTO>(
    (data) => treinoModelosApi.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["treino-modelos"])
        showToast.success("Molde de treino salvo com sucesso!")
      },
      onError: (error) => {
        showToast.error(error.message || "Erro ao salvar molde de treino")
      },
    },
  )
}
