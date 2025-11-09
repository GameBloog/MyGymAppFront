import { useMutation, useQuery, useQueryClient } from "react-query"
import { answerApi } from "../services/api"
import type { CreateUserAnswerDTO } from "../types/userAnswer"

export const useAnswers = () => {
  return useQuery("answers", answerApi.getAll)
}

export const useCreateAnswer = () => {
  const queryClient = useQueryClient()

  return useMutation((data: CreateUserAnswerDTO) => answerApi.create(data), {
    onSuccess: () => {
      queryClient.invalidateQueries("answers")
    },
  })
}

export const useDeleteAnswer = () => {
  const queryClient = useQueryClient()

  return useMutation((id: string) => answerApi.delete(id), {
    onSuccess: () => {
      queryClient.invalidateQueries("answers")
    },
  })
}
