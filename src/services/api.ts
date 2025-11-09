import axios from "axios"
import type { CreateUserAnswerDTO, UserAnswer } from "../types/userAnswer"

const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    "Content-Type": "application/json",
  },
})

export const answerApi = {
  getAll: async (): Promise<UserAnswer[]> => {
    const response = await api.get("/answers")
    return response.data
  },

  create: async (data: CreateUserAnswerDTO): Promise<UserAnswer> => {
    const response = await api.post("/answer", data)
    return response.data
  },

  getById: async (id: string): Promise<UserAnswer> => {
    const response = await api.get(`/answers/${id}`)
    return response.data
  },

  update: async (
    id: string,
    data: Partial<CreateUserAnswerDTO>
  ): Promise<UserAnswer> => {
    const response = await api.put(`/answers/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/answers/${id}`)
  },
}

export default api
