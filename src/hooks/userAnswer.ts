import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "react-query"
import { answersApi } from "../services/api"
import {
  type UserAnswer,
  type CreateUserAnswerDTO,
  type UpdateUserAnswerDTO,
} from "../types/userAnswer"
import { showToast } from "../utils/toast"

// Hook para listar todas as respostas
export const useAnswers = (): UseQueryResult<UserAnswer[], Error> => {
  return useQuery<UserAnswer[], Error>("answers", answersApi.getAll, {
    staleTime: 30000,
    cacheTime: 300000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: 2,
    onError: (error) => {
      console.error("Erro ao buscar respostas:", error)
    },
  })
}

// Hook para buscar uma resposta por ID
export const useAnswer = (id: string): UseQueryResult<UserAnswer, Error> => {
  return useQuery<UserAnswer, Error>(
    ["answer", id],
    () => answersApi.getById(id),
    {
      enabled: !!id,
      staleTime: 30000,
      cacheTime: 300000,
      retry: 2,
      onError: (error) => {
        showToast.error("Erro ao carregar resposta")
        console.error("Erro ao buscar resposta:", error)
      },
    }
  )
}

// Hook para criar uma nova resposta
export const useCreateAnswer = (): UseMutationResult<
  UserAnswer,
  Error,
  CreateUserAnswerDTO
> => {
  const queryClient = useQueryClient()

  return useMutation<UserAnswer, Error, CreateUserAnswerDTO>(
    (data) => answersApi.create(data),
    {
      onSuccess: (newAnswer) => {
        queryClient.setQueryData<UserAnswer[]>("answers", (old) => {
          if (!old) return [newAnswer]
          return [newAnswer, ...old]
        })

        queryClient.invalidateQueries("answers")
      },
      onError: (error) => {
        console.error("Erro ao criar resposta:", error)
      },
    }
  )
}

// Hook para atualizar uma resposta
export const useUpdateAnswer = (): UseMutationResult<
  UserAnswer,
  Error,
  { id: string; data: UpdateUserAnswerDTO }
> => {
  const queryClient = useQueryClient()

  return useMutation<
    UserAnswer,
    Error,
    { id: string; data: UpdateUserAnswerDTO }
  >(({ id, data }) => answersApi.update(id, data), {
    onSuccess: (updatedAnswer) => {
      queryClient.setQueryData<UserAnswer[]>("answers", (old) => {
        if (!old) return [updatedAnswer]
        return old.map((answer) =>
          answer.id === updatedAnswer.id ? updatedAnswer : answer
        )
      })

      queryClient.setQueryData(["answer", updatedAnswer.id], updatedAnswer)

      queryClient.invalidateQueries("answers")
      queryClient.invalidateQueries(["answer", updatedAnswer.id])
    },
  })
}

// Hook para deletar uma resposta
export const useDeleteAnswer = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>((id) => answersApi.delete(id), {
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<UserAnswer[]>("answers", (old) => {
        if (!old) return []
        return old.filter((answer) => answer.id !== deletedId)
      })

      queryClient.removeQueries(["answer", deletedId])
      queryClient.invalidateQueries("answers")
    },
    onError: (error) => {
      console.error("Erro ao deletar resposta:", error)
    },
  })
}

// Hook para health check
export const useHealthCheck = () => {
  return useQuery("health", answersApi.healthCheck, {
    staleTime: 60000,
    retry: 3,
  })
}
