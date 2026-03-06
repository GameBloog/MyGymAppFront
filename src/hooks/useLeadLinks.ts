import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "react-query"
import { leadLinksApi } from "../services/api"
import {
  type CreateLeadLinkDTO,
  type LeadAnalytics,
  type LeadLink,
  type LeadLinksListResponse,
  type UpdateLeadLinkDTO,
} from "../types"
import { showToast } from "../utils/toast"

const leadLinksKey = (range: number) => ["leadLinks", range]
const leadAnalyticsKey = (range: number) => ["leadAnalytics", range]

export const useLeadLinks = (
  range = 30,
): UseQueryResult<LeadLinksListResponse, Error> => {
  return useQuery<LeadLinksListResponse, Error>(
    leadLinksKey(range),
    () => leadLinksApi.getAll(range),
    {
      staleTime: 30_000,
      cacheTime: 300_000,
      retry: 2,
    },
  )
}

export const useLeadAnalytics = (
  range = 30,
): UseQueryResult<LeadAnalytics, Error> => {
  return useQuery<LeadAnalytics, Error>(
    leadAnalyticsKey(range),
    () => leadLinksApi.getAnalytics(range),
    {
      staleTime: 30_000,
      cacheTime: 300_000,
      retry: 2,
    },
  )
}

export const useCreateLeadLink = (): UseMutationResult<
  LeadLink,
  Error,
  CreateLeadLinkDTO
> => {
  const queryClient = useQueryClient()

  return useMutation<LeadLink, Error, CreateLeadLinkDTO>(
    (data) => leadLinksApi.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("leadLinks")
        queryClient.invalidateQueries("leadAnalytics")
        showToast.success("Link de lead criado com sucesso")
      },
      onError: (error) => {
        showToast.error(error.message || "Erro ao criar link")
      },
    },
  )
}

export const useUpdateLeadLink = (): UseMutationResult<
  LeadLink,
  Error,
  { id: string; data: UpdateLeadLinkDTO }
> => {
  const queryClient = useQueryClient()

  return useMutation<LeadLink, Error, { id: string; data: UpdateLeadLinkDTO }>(
    ({ id, data }) => leadLinksApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("leadLinks")
        queryClient.invalidateQueries("leadAnalytics")
        showToast.success("Link de lead atualizado")
      },
      onError: (error) => {
        showToast.error(error.message || "Erro ao atualizar link")
      },
    },
  )
}
