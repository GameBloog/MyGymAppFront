import { api, type OptionalNotFoundRequestConfig } from "./api"
import type {
  ComentarProfessorCheckinDTO,
  CreateExercicioDTO,
  Exercicio,
  ExercicioExterno,
  ExercicioMediaKind,
  FinalizeCheckinDTO,
  GrupamentoMuscular,
  ImportExercicioExternoDTO,
  PlanoTreino,
  ProgressSerieTreino,
  StartCheckinDTO,
  TimelineEventoTreino,
  TreinoCheckin,
  UpdateExercicioCheckinDTO,
  UpsertPlanoTreinoDTO,
} from "../types"

interface AssinaturaUploadMedia {
  uploadUrl: string
  apiKey: string
  params: Record<string, string | number>
  signature: string
  uploadToken: string
}

interface ListExerciciosParams {
  q?: string
  grupamento?: GrupamentoMuscular
}

interface SearchExternalParams {
  q?: string
  limit?: number
}

export const exerciciosApi = {
  list: async (params?: ListExerciciosParams): Promise<Exercicio[]> => {
    const response = await api.get<Exercicio[]>("/exercicios", { params })
    return response.data
  },

  listGrupamentos: async (): Promise<GrupamentoMuscular[]> => {
    const response = await api.get<GrupamentoMuscular[]>("/exercicios/grupamentos")
    return response.data
  },

  searchExternal: async (params?: SearchExternalParams): Promise<ExercicioExterno[]> => {
    const response = await api.get<ExercicioExterno[]>("/exercicios/externos", {
      params,
    })
    return response.data
  },

  create: async (data: CreateExercicioDTO): Promise<Exercicio> => {
    const response = await api.post<Exercicio>("/exercicios", data)
    return response.data
  },

  importExternal: async (data: ImportExercicioExternoDTO): Promise<Exercicio> => {
    const response = await api.post<Exercicio>("/exercicios/importar", data)
    return response.data
  },

  // Upload em tres passos: o arquivo vai do navegador direto ao Cloudinary,
  // sem atravessar a API. O caminho antigo (POST multipart na propria API)
  // esbarrava no teto de payload da Lambda - ~4,5MB uteis depois da inflacao
  // base64 do API Gateway. Por aqui, o tamanho deixa de depender da API.
  //
  // O servidor escolhe o destino e assina; o navegador nao consegue gravar em
  // outro lugar da conta Cloudinary sem invalidar a assinatura.
  uploadMedia: async (
    exercicioId: string,
    kind: ExercicioMediaKind,
    file: File,
  ): Promise<Exercicio> => {
    const { data: assinatura } = await api.post<AssinaturaUploadMedia>(
      `/exercicios/${exercicioId}/midia/${kind}/assinatura`,
      { mimetype: file.type },
    )

    const formData = new FormData()
    formData.append("file", file)
    formData.append("api_key", assinatura.apiKey)
    formData.append("signature", assinatura.signature)

    // Todo parametro assinado precisa ir junto e identico - o Cloudinary
    // recalcula a assinatura a partir do que recebe.
    Object.entries(assinatura.params).forEach(([chave, valor]) => {
      formData.append(chave, String(valor))
    })

    // fetch, e nao a instancia `api`: aquela carrega baseURL, interceptors de
    // autenticacao e withCredentials. Mandar credencial da aplicacao para um
    // terceiro seria vazamento. fetch usa credentials "same-origin" por
    // padrao, entao nada de cookie sai daqui.
    //
    // Tambem escapa do timeout de 10s do axios, que estrangularia arquivo
    // grande em conexao lenta.
    const envio = await fetch(assinatura.uploadUrl, {
      method: "POST",
      body: formData,
    })

    if (!envio.ok) {
      throw new Error("Falha ao enviar o arquivo. Tente novamente.")
    }

    // O que autoriza a gravacao e o token, nao a resposta do Cloudinary: o
    // servidor reconsulta o asset por conta propria antes de gravar.
    const { data } = await api.post<Exercicio>(
      `/exercicios/${exercicioId}/midia/${kind}/confirmacao`,
      { uploadToken: assinatura.uploadToken },
    )

    return data
  },

  clearMedia: async (
    exercicioId: string,
    kind: ExercicioMediaKind,
  ): Promise<Exercicio> => {
    const response = await api.delete<Exercicio>(
      `/exercicios/${exercicioId}/midia/${kind}`,
    )
    return response.data
  },
}

export const treinoApi = {
  upsertPlano: async (data: UpsertPlanoTreinoDTO): Promise<PlanoTreino> => {
    const response = await api.post<PlanoTreino>("/treinos/plano", data)
    return response.data
  },

  getPlanoAtivo: async (alunoId: string): Promise<PlanoTreino | null> => {
    const response = await api.get<PlanoTreino | null>(
      `/treinos/aluno/${alunoId}/ativo`,
      { allowNotFound: true } as OptionalNotFoundRequestConfig,
    )
    return response.data
  },

  listCheckins: async (alunoId: string, limit = 50): Promise<TreinoCheckin[]> => {
    const response = await api.get<TreinoCheckin[]>(
      `/treinos/aluno/${alunoId}/checkins`,
      { params: { limit } },
    )
    return response.data
  },

  timeline: async (alunoId: string, limit = 80): Promise<TimelineEventoTreino[]> => {
    const response = await api.get<TimelineEventoTreino[]>(
      `/treinos/aluno/${alunoId}/timeline`,
      { params: { limit } },
    )
    return response.data
  },

  progresso: async (alunoId: string, exercicioId?: string): Promise<ProgressSerieTreino[]> => {
    const response = await api.get<ProgressSerieTreino[]>(
      `/treinos/aluno/${alunoId}/progresso`,
      { params: { exercicioId } },
    )
    return response.data
  },

  startCheckin: async (data: StartCheckinDTO): Promise<TreinoCheckin> => {
    const response = await api.post<TreinoCheckin>("/treinos/checkins/start", data)
    return response.data
  },

  updateExercicioCheckin: async (
    checkinId: string,
    treinoDiaExercicioId: string,
    data: UpdateExercicioCheckinDTO,
  ): Promise<TreinoCheckin["exercicios"][number]> => {
    const response = await api.patch<TreinoCheckin["exercicios"][number]>(
      `/treinos/checkins/${checkinId}/exercicios/${treinoDiaExercicioId}`,
      data,
    )
    return response.data
  },

  finalizeCheckin: async (checkinId: string, data: FinalizeCheckinDTO): Promise<TreinoCheckin> => {
    const response = await api.patch<TreinoCheckin>(
      `/treinos/checkins/${checkinId}/finalizar`,
      data,
    )
    return response.data
  },

  comentarProfessor: async (
    checkinId: string,
    data: ComentarProfessorCheckinDTO,
  ): Promise<TreinoCheckin> => {
    const response = await api.patch<TreinoCheckin>(
      `/treinos/checkins/${checkinId}/comentario-professor`,
      data,
    )
    return response.data
  },
}
