import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "react-query"
import { historicoApi } from "../services/historyApi"
import {
  type HistoricoEvolucao,
  type CreateHistoricoDTO,
  type UpdateHistoricoDTO,
  type HistoricoFiltros,
} from "../types/historico"
import { showToast } from "../utils/toast"

export const useHistorico = (
  alunoId: string,
  filtros?: HistoricoFiltros,
  options?: { enabled?: boolean }
): UseQueryResult<HistoricoEvolucao[], Error> => {
  return useQuery<HistoricoEvolucao[], Error>(
    ["historico", alunoId, filtros],
    () => historicoApi.listar(alunoId, filtros),
    {
      enabled: options?.enabled !== false && !!alunoId,
      staleTime: 30000,
      cacheTime: 300000,
      retry: 2,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error("❌ Erro ao buscar histórico:", error)
      },
    }
  )
}

export const useUltimoHistorico = (
  alunoId: string
): UseQueryResult<HistoricoEvolucao, Error> => {
  return useQuery<HistoricoEvolucao, Error>(
    ["historico-ultimo", alunoId],
    () => historicoApi.buscarUltimo(alunoId),
    {
      enabled: !!alunoId,
      staleTime: 30000,
      cacheTime: 300000,
      retry: 2,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error("❌ Erro ao buscar último histórico:", error)
      },
    }
  )
}

export const useCreateHistorico = (): UseMutationResult<
  HistoricoEvolucao,
  Error,
  CreateHistoricoDTO
> => {
  const queryClient = useQueryClient()

  return useMutation<HistoricoEvolucao, Error, CreateHistoricoDTO>(
    (data) => historicoApi.criar(data),
    {
      onSuccess: (newHistorico) => {
        queryClient.invalidateQueries(["historico", newHistorico.alunoId])
        queryClient.invalidateQueries([
          "historico-ultimo",
          newHistorico.alunoId,
        ])
        showToast.success("Registro de evolução adicionado com sucesso!")
      },
      onError: (error: any) => {
        console.error("❌ Erro ao criar histórico:", error)
        showToast.error(error.message || "Erro ao adicionar registro")
      },
    }
  )
}

export const useUpdateHistorico = (): UseMutationResult<
  HistoricoEvolucao,
  Error,
  { id: string; alunoId: string; data: UpdateHistoricoDTO }
> => {
  const queryClient = useQueryClient()

  return useMutation<
    HistoricoEvolucao,
    Error,
    { id: string; alunoId: string; data: UpdateHistoricoDTO }
  >(({ id, data }) => historicoApi.atualizar(id, data), {
    onSuccess: (updatedHistorico, variables) => {
      queryClient.invalidateQueries(["historico", variables.alunoId])
      queryClient.invalidateQueries(["historico-ultimo", variables.alunoId])
      showToast.success("Registro atualizado com sucesso!")
    },
    onError: (error: any) => {
      console.error("❌ Erro ao atualizar histórico:", error)
      showToast.error(error.message || "Erro ao atualizar registro")
    },
  })
}

export const useDeleteHistorico = (): UseMutationResult<
  void,
  Error,
  { id: string; alunoId: string }
> => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { id: string; alunoId: string }>(
    ({ id }) => historicoApi.deletar(id),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(["historico", variables.alunoId])
        queryClient.invalidateQueries(["historico-ultimo", variables.alunoId])
        showToast.success("Registro excluído com sucesso!")
      },
      onError: (error: any) => {
        console.error("❌ Erro ao deletar histórico:", error)
        showToast.error(error.message || "Erro ao excluir registro")
      },
    }
  )
}
