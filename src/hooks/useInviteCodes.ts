import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "react-query"
import { inviteCodesApi } from "../services/api"
import { type InviteCode, type CreateInviteCodeDTO } from "../types"

export const useInviteCodes = (): UseQueryResult<InviteCode[], Error> => {
  return useQuery<InviteCode[], Error>("inviteCodes", inviteCodesApi.getAll, {
    staleTime: 30000,
    cacheTime: 300000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

export const useCreateInviteCode = (): UseMutationResult<
  InviteCode,
  Error,
  CreateInviteCodeDTO
> => {
  const queryClient = useQueryClient()

  return useMutation<InviteCode, Error, CreateInviteCodeDTO>(
    (data) => inviteCodesApi.create(data),
    {
      onSuccess: (newCode) => {
        queryClient.setQueryData<InviteCode[]>("inviteCodes", (old) => {
          if (!old) return [newCode]
          return [newCode, ...old]
        })

        queryClient.invalidateQueries("inviteCodes")
      },
    }
  )
}
