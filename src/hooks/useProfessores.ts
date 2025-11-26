import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
  type UseQueryOptions,
} from "react-query"
import { professoresApi } from "../services/api"
import { type Professor, type CreateProfessorDTO } from "../types"
import { showToast } from "../utils/toast"

export const useProfessores = (): UseQueryResult<Professor[], Error> => {
  return useQuery<Professor[], Error>("professores", professoresApi.getAll, {
    staleTime: 60000,
    cacheTime: 300000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
    onError: (error) => {
      console.error("❌ Erro ao buscar professores:", error)
      showToast.error("Erro ao carregar professores")
    },
    onSuccess: (data) => {
      console.log("✅ Professores carregados:", data)
    },
  })
}

export const useProfessor = (
  id: string,
  options?: UseQueryOptions<Professor, Error>
): UseQueryResult<Professor, Error> => {
  return useQuery<Professor, Error>(
    ["professor", id],
    () => professoresApi.getById(id),
    {
      enabled: !!id,
      staleTime: 60000,
      cacheTime: 300000,
      retry: 2,
      onError: (error) => {
        console.error("❌ Erro ao buscar professor:", error)
        showToast.error("Erro ao carregar professor")
      },
      ...options,
    }
  )
}

export const useCreateProfessor = (): UseMutationResult<
  Professor,
  Error,
  CreateProfessorDTO
> => {
  const queryClient = useQueryClient()

  return useMutation<Professor, Error, CreateProfessorDTO>(
    (data) => professoresApi.create(data),
    {
      onSuccess: (newProfessor) => {
        queryClient.setQueryData<Professor[]>("professores", (old) => {
          if (!old) return [newProfessor]
          return [newProfessor, ...old]
        })

        queryClient.invalidateQueries("professores")
        showToast.success("Professor criado com sucesso!")
      },
      onError: (error: any) => {
        console.error("❌ Erro ao criar professor:", error)
        showToast.error(error.message || "Erro ao criar professor")
      },
    }
  )
}

export const useUpdateProfessor = (): UseMutationResult<
  Professor,
  Error,
  { id: string; data: Partial<CreateProfessorDTO> }
> => {
  const queryClient = useQueryClient()

  return useMutation<
    Professor,
    Error,
    { id: string; data: Partial<CreateProfessorDTO> }
  >(({ id, data }) => professoresApi.update(id, data), {
    onSuccess: (updatedProfessor) => {
      queryClient.setQueryData<Professor[]>("professores", (old) => {
        if (!old) return [updatedProfessor]
        return old.map((prof) =>
          prof.id === updatedProfessor.id ? updatedProfessor : prof
        )
      })

      queryClient.setQueryData(
        ["professor", updatedProfessor.id],
        updatedProfessor
      )
      queryClient.invalidateQueries("professores")
      queryClient.invalidateQueries(["professor", updatedProfessor.id])
      showToast.success("Professor atualizado com sucesso!")
    },
    onError: (error: any) => {
      console.error("❌ Erro ao atualizar professor:", error)
      showToast.error(error.message || "Erro ao atualizar professor")
    },
  })
}

export const useDeleteProfessor = (): UseMutationResult<
  void,
  Error,
  string
> => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>((id) => professoresApi.delete(id), {
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Professor[]>("professores", (old) => {
        if (!old) return []
        return old.filter((prof) => prof.id !== deletedId)
      })

      queryClient.removeQueries(["professor", deletedId])
      queryClient.invalidateQueries("professores")
      showToast.success("Professor excluído com sucesso!")
    },
    onError: (error: any) => {
      console.error("❌ Erro ao deletar professor:", error)
      showToast.error(error.message || "Erro ao excluir professor")
    },
  })
}
