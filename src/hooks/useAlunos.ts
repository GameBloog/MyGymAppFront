import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
  type UseQueryOptions,
} from "react-query"
import { alunosApi } from "../services/api"
import { type Aluno, type CreateAlunoDTO, type UpdateAlunoDTO } from "../types"
import { showToast } from "../utils/toast"

interface UpdateAlunoContext {
  previousAlunos?: Aluno[]
  previousAluno?: Aluno
}

interface DeleteAlunoContext {
  previousAlunos?: Aluno[]
}

export const useAlunos = (): UseQueryResult<Aluno[], Error> => {
  return useQuery<Aluno[], Error>("alunos", alunosApi.getAll, {
    staleTime: 30000,
    cacheTime: 300000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
    onSuccess: (data) => {
      console.log("✅ Lista de alunos carregada:", data.length, "alunos")
    },
  })
}

export const useAluno = (
  id: string,
  options?: UseQueryOptions<Aluno, Error>
): UseQueryResult<Aluno, Error> => {
  return useQuery<Aluno, Error>(["aluno", id], () => alunosApi.getById(id), {
    enabled: !!id,
    staleTime: 30000,
    cacheTime: 300000,
    retry: 2,
    refetchOnMount: true,
    ...options,
  })
}

export const useCreateAluno = (): UseMutationResult<
  Aluno,
  Error,
  CreateAlunoDTO
> => {
  const queryClient = useQueryClient()

  return useMutation<Aluno, Error, CreateAlunoDTO>(
    (data) => alunosApi.create(data),
    {
      onSuccess: (newAluno) => {
        console.log("✅ Aluno criado:", newAluno.id)

        queryClient.setQueryData<Aluno[]>("alunos", (old) => {
          if (!old) return [newAluno]
          return [newAluno, ...old]
        })

        queryClient.invalidateQueries("alunos")

        showToast.success("Aluno criado com sucesso!")
      },
      onError: (error: any) => {
        console.error("❌ Erro ao criar aluno:", error)
        showToast.error(error.message || "Erro ao criar aluno")
      },
    }
  )
}

export const useUpdateAluno = (): UseMutationResult<
  Aluno,
  Error,
  { id: string; data: UpdateAlunoDTO },
  UpdateAlunoContext
> => {
  const queryClient = useQueryClient()

  return useMutation<
    Aluno,
    Error,
    { id: string; data: UpdateAlunoDTO },
    UpdateAlunoContext
  >(({ id, data }) => alunosApi.update(id, data), {
    onMutate: async ({ id, data }): Promise<UpdateAlunoContext> => {
      console.log("🔧 Iniciando atualização otimista do aluno:", id)

      await queryClient.cancelQueries("alunos")
      await queryClient.cancelQueries(["aluno", id])

      const previousAlunos = queryClient.getQueryData<Aluno[]>("alunos")
      const previousAluno = queryClient.getQueryData<Aluno>(["aluno", id])

      if (previousAlunos) {
        queryClient.setQueryData<Aluno[]>("alunos", (old) => {
          if (!old) return []
          return old.map((aluno) => {
            if (aluno.id === id) {
              return { ...aluno, ...data }
            }
            return aluno
          })
        })
      }

      if (previousAluno) {
        queryClient.setQueryData<Aluno>(["aluno", id], {
          ...previousAluno,
          ...data,
        })
      }

      console.log("✅ Cache atualizado otimisticamente")

      return { previousAlunos, previousAluno }
    },

    onSuccess: (updatedAluno) => {
      console.log("✅ Aluno atualizado no servidor:", updatedAluno.id)

      queryClient.setQueryData<Aluno[]>("alunos", (old) => {
        if (!old) return [updatedAluno]
        return old.map((aluno) =>
          aluno.id === updatedAluno.id ? updatedAluno : aluno
        )
      })

      queryClient.setQueryData(["aluno", updatedAluno.id], updatedAluno)

      queryClient.invalidateQueries("alunos")
      queryClient.invalidateQueries(["aluno", updatedAluno.id])

      console.log("✅ Queries invalidadas - lista será atualizada")

      showToast.success("Dados atualizados com sucesso!")
    },

    onError: (error: any, variables, context) => {
      console.error("❌ Erro ao atualizar aluno:", error)

      if (context?.previousAlunos) {
        queryClient.setQueryData("alunos", context.previousAlunos)
      }
      if (context?.previousAluno) {
        queryClient.setQueryData(["aluno", variables.id], context.previousAluno)
      }

      showToast.error(error.message || "Erro ao atualizar aluno")
    },

    onSettled: () => {
      console.log("✅ Atualização finalizada")
    },
  })
}

export const useDeleteAluno = (): UseMutationResult<
  void,
  Error,
  string,
  DeleteAlunoContext
> => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string, DeleteAlunoContext>(
    (id) => alunosApi.delete(id),
    {
      onMutate: async (deletedId): Promise<DeleteAlunoContext> => {
        console.log("🔧 Removendo aluno do cache:", deletedId)

        await queryClient.cancelQueries("alunos")

        const previousAlunos = queryClient.getQueryData<Aluno[]>("alunos")

        queryClient.setQueryData<Aluno[]>("alunos", (old) => {
          if (!old) return []
          return old.filter((aluno) => aluno.id !== deletedId)
        })

        return { previousAlunos }
      },

      onSuccess: (_, deletedId) => {
        console.log("✅ Aluno deletado no servidor:", deletedId)

        queryClient.removeQueries(["aluno", deletedId])
        queryClient.invalidateQueries("alunos")

        showToast.success("Aluno excluído com sucesso!")
      },

      onError: (error: any, deletedId, context) => {
        console.error("❌ Erro ao deletar aluno:", error)

        if (context?.previousAlunos) {
          queryClient.setQueryData("alunos", context.previousAlunos)
        }

        showToast.error(error.message || "Erro ao excluir aluno")
      },
    }
  )
}
