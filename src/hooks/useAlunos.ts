import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
  UseQueryOptions,
} from "react-query"
import { alunosApi } from "../services/api"
import { type Aluno, type CreateAlunoDTO, type UpdateAlunoDTO } from "../types"

export const useAlunos = (): UseQueryResult<Aluno[], Error> => {
  return useQuery<Aluno[], Error>("alunos", alunosApi.getAll, {
    staleTime: 30000,
    cacheTime: 300000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
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
        queryClient.setQueryData<Aluno[]>("alunos", (old) => {
          if (!old) return [newAluno]
          return [newAluno, ...old]
        })

        queryClient.invalidateQueries("alunos")
      },
    }
  )
}

export const useUpdateAluno = (): UseMutationResult<
  Aluno,
  Error,
  { id: string; data: UpdateAlunoDTO }
> => {
  const queryClient = useQueryClient()

  return useMutation<Aluno, Error, { id: string; data: UpdateAlunoDTO }>(
    ({ id, data }) => alunosApi.update(id, data),
    {
      onSuccess: (updatedAluno) => {
        queryClient.setQueryData<Aluno[]>("alunos", (old) => {
          if (!old) return [updatedAluno]
          return old.map((aluno) =>
            aluno.id === updatedAluno.id ? updatedAluno : aluno
          )
        })

        queryClient.setQueryData(["aluno", updatedAluno.id], updatedAluno)

        queryClient.invalidateQueries("alunos")
        queryClient.invalidateQueries(["aluno", updatedAluno.id])
      },
    }
  )
}

export const useDeleteAluno = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>((id) => alunosApi.delete(id), {
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Aluno[]>("alunos", (old) => {
        if (!old) return []
        return old.filter((aluno) => aluno.id !== deletedId)
      })

      queryClient.removeQueries(["aluno", deletedId])
      queryClient.invalidateQueries("alunos")
    },
  })
}
