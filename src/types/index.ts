export type UserRole = "ADMIN" | "PROFESSOR" | "ALUNO"
export type SexoBiologico = "MASCULINO" | "FEMININO"

export interface User {
  id: string
  nome: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface LoginDTO {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterDTO {
  nome: string
  email: string
  password: string
  role?: UserRole
  inviteCode?: string
  telefone?: string
  especialidade?: string
  leadSlug?: string
}

export interface InviteCode {
  id: string
  code: string
  role: UserRole
  usedBy: string | null
  usedAt: string | null
  expiresAt: string | null
  createdBy: string
  createdAt: string
}

export interface CreateInviteCodeDTO {
  role: "PROFESSOR" | "ADMIN"
  expiresInDays?: number
}

export interface LeadLink {
  id: string
  slug: string
  nome: string
  canal?: string | null
  origem?: string | null
  ativo: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
  landingPath: string
  clicksTotal: number
  clicksUnique: number
  novosCadastros: number
  conversao: number
}

export interface CreateLeadLinkDTO {
  nome: string
  canal?: string
  origem?: string
  slug?: string
}

export interface UpdateLeadLinkDTO {
  nome?: string
  canal?: string | null
  origem?: string | null
  slug?: string
  ativo?: boolean
}

export interface TrackLeadClickDTO {
  leadSlug: string
  referrer?: string
  path?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
}

export interface LeadLinksListResponse {
  rangeDays: number
  items: LeadLink[]
}

export interface LeadAnalyticsPoint {
  date: string
  clicksTotal: number
  clicksUnique: number
  novosCadastros: number
}

export interface LeadAnalyticsTopLink {
  leadLinkId: string
  slug: string
  nome: string
  canal?: string | null
  origem?: string | null
  ativo: boolean
  landingPath: string
  clicksTotal: number
  clicksUnique: number
  novosCadastros: number
  conversao: number
}

export interface LeadAnalytics {
  rangeDays: number
  cards: {
    clicksTotal: number
    clicksUnique: number
    novosCadastros: number
    conversao: number
  }
  series: LeadAnalyticsPoint[]
  topLinks: LeadAnalyticsTopLink[]
}

export interface YoutubeLatestVideo {
  videoId: string
  title: string
  publishedAt: string
  thumbnailUrl: string
  watchUrl: string
  embedUrl: string
  channelTitle: string
}

export interface YoutubeLatestContentResponse {
  video: YoutubeLatestVideo | null
  channelUrl: string
  cached: boolean
  fetchedAt: string | null
  stale: boolean
}

export type FinanceRenewalPlanType = "COMPLETO" | "TREINO" | "DIETA"
export type FinanceEntryType = "RECEITA" | "DESPESA"
export type FinanceEntryCategory =
  | "CAMISA"
  | "YOUTUBE"
  | "PARCERIA"
  | "OUTRA_RECEITA"
  | "CUSTO_OPERACIONAL"
  | "OUTRA_DESPESA"
export type FinanceMonthStatus = "ABERTO" | "FECHADO"

export interface FinanceRenewal {
  id: string
  alunoId: string
  month: string
  tipoPlano: FinanceRenewalPlanType
  valor: number
  renovadoEm: string
  observacao?: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
  aluno?: {
    id: string
    user?: {
      nome?: string
      email?: string
    }
  }
}

export interface FinanceEntry {
  id: string
  month: string
  tipo: FinanceEntryType
  categoria: FinanceEntryCategory
  valor: number
  quantidade?: number | null
  descricao?: string | null
  dataLancamento: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface FinanceMonthSummary {
  month: string
  status: FinanceMonthStatus
  receitas: number
  despesas: number
  saldo: number
  saldoAcumulado: number
  renewals: {
    total: number
    completo: number
    treino: number
    dieta: number
  }
  camisasVendidas: number
}

export interface FinanceProjectionTotals {
  receitas: number
  despesas: number
  saldo: number
}

export interface FinanceDashboardResponse {
  period: {
    from: string
    to: string
  }
  months: FinanceMonthSummary[]
  totals: {
    receitas: number
    despesas: number
    saldo: number
    camisasVendidas: number
    renewals: {
      total: number
      completo: number
      treino: number
      dieta: number
    }
  }
  charts: {
    receitasVsDespesas: Array<{
      month: string
      receitas: number
      despesas: number
    }>
    saldoAcumulado: Array<{
      month: string
      saldoAcumulado: number
    }>
    composicaoReceitas: Array<{
      categoria: FinanceEntryCategory
      valor: number
    }>
    projecoes: Array<{
      horizonMonths: 3 | 6
      receitas: number
      despesas: number
      saldo: number
    }>
  }
  projections: {
    method: string
    baseMonths: string[]
    months3: FinanceProjectionTotals
    months6: FinanceProjectionTotals
  }
  systemMetrics: {
    alunos: {
      total: number
      ativos: number
      inativos: number
    }
    novosAlunosPorMes: Array<{
      month: string
      count: number
    }>
    professores: Array<{
      professorId: string
      professorNome: string
      total: number
      ativos: number
      inativos: number
    }>
    aquisicaoPorCanal: Array<{
      canal: string
      cadastros: number
    }>
  }
}

export interface CreateFinanceRenewalDTO {
  alunoId: string
  tipoPlano: FinanceRenewalPlanType
  valor: number
  renovadoEm: string
  observacao?: string | null
}

export interface UpdateFinanceRenewalDTO {
  alunoId?: string
  tipoPlano?: FinanceRenewalPlanType
  valor?: number
  renovadoEm?: string
  observacao?: string | null
}

export interface CreateFinanceEntryDTO {
  tipo: FinanceEntryType
  categoria: FinanceEntryCategory
  valor: number
  quantidade?: number | null
  descricao?: string | null
  dataLancamento: string
}

export interface UpdateFinanceEntryDTO {
  tipo?: FinanceEntryType
  categoria?: FinanceEntryCategory
  valor?: number
  quantidade?: number | null
  descricao?: string | null
  dataLancamento?: string
}

export interface FinanceMonthState {
  month: string
  status: FinanceMonthStatus
  closedAt?: string | null
  closedBy?: string | null
  reopenedAt?: string | null
  reopenedBy?: string | null
  createdAt: string
  updatedAt: string
}

export interface Professor {
  id: string
  userId: string
  telefone?: string | null
  especialidade?: string | null
  totalAlunos?: number 
  createdAt: string
  updatedAt: string
  user?: User
}

export interface CreateProfessorDTO {
  nome: string
  email: string
  password: string
  telefone?: string
  especialidade?: string
}

export interface Aluno {
  id: string
  userId: string
  professorId: string
  ativo: boolean
  sexoBiologico?: SexoBiologico | null
  telefone?: string | null
  alturaCm?: number | null
  pesoKg?: number | null
  idade?: number | null
  cinturaCm?: number | null
  quadrilCm?: number | null
  pescocoCm?: number | null
  alimentos_quer_diario?: string[] | null
  alimentos_nao_comem?: string[] | null
  alergias_alimentares?: string[] | null
  dores_articulares?: string | null
  suplementos_consumidos?: string[] | null
  dias_treino_semana?: number | null
  frequencia_horarios_refeicoes?: string | null
  objetivos_atuais?: string | null
  toma_remedio?: boolean | null
  remedios_uso?: string | null
  createdAt: string
  updatedAt: string
  user?: User
  professor?: Professor
}

export interface CreateAlunoDTO {
  nome: string
  email: string
  password: string

  professorId?: string

  sexoBiologico?: SexoBiologico
  telefone?: string
  alturaCm?: number
  pesoKg?: number
  idade?: number
  cinturaCm?: number
  quadrilCm?: number
  pescocoCm?: number

  alimentos_quer_diario?: string[]
  alimentos_nao_comem?: string[]
  alergias_alimentares?: string[]
  suplementos_consumidos?: string[]

  dores_articulares?: string
  dias_treino_semana?: number
  frequencia_horarios_refeicoes?: string
  objetivos_atuais?: string
  toma_remedio?: boolean
  remedios_uso?: string
}

export interface UpdateAlunoDTO {
  sexoBiologico?: SexoBiologico
  telefone?: string
  alturaCm?: number
  pesoKg?: number
  idade?: number
  cinturaCm?: number
  quadrilCm?: number
  pescocoCm?: number
  alimentos_quer_diario?: string[]
  alimentos_nao_comem?: string[]
  alergias_alimentares?: string[]
  suplementos_consumidos?: string[]
  dores_articulares?: string
  dias_treino_semana?: number
  frequencia_horarios_refeicoes?: string
  objetivos_atuais?: string
  toma_remedio?: boolean
  remedios_uso?: string
}

export interface UpdateAlunoStatusDTO {
  ativo: boolean
}

export interface UserAnswer {
  id: string
  createdAt: string
  nome: string
  email: string
  telefone?: string | null
  alturaCm?: number | null
  pesoKg?: number | null
  idade?: number | null
  cinturaCm?: number | null
  quadrilCm?: number | null
  pescocoCm?: number | null
  alimentos_quer_diario?: string[] | null
  alimentos_nao_comem?: string[] | null
  alergias_alimentares?: string[] | null
  dores_articulares?: string | null
  suplementos_consumidos?: string[] | null
  dias_treino_semana?: number | null
  frequencia_horarios_refeicoes?: string | null
}

export interface CreateUserAnswerDTO {
  nome: string
  email: string
  telefone?: string
  alturaCm?: number
  pesoKg?: number
  idade?: number
  cinturaCm?: number
  quadrilCm?: number
  pescocoCm?: number
  alimentos_quer_diario?: string[]
  alimentos_nao_comem?: string[]
  alergias_alimentares?: string[]
  dores_articulares?: string
  suplementos_consumidos?: string[]
  dias_treino_semana?: number
  frequencia_horarios_refeicoes?: string
}

export type UpdateUserAnswerDTO = Partial<CreateUserAnswerDTO>

export interface ApiError {
  error: string
  details?: Array<{
    campo: string
    mensagem: string
  }>
}

export type GrupamentoMuscular =
  | "PEITO"
  | "COSTAS"
  | "PERNAS"
  | "OMBRO"
  | "BICEPS"
  | "TRICEPS"
  | "ABDOMEN"
  | "GLUTEOS"
  | "CARDIO"
  | "OUTRO"

export type OrigemExercicio = "SISTEMA" | "EXTERNO" | "PROFESSOR"
export type CheckinStatus = "INICIADO" | "CONCLUIDO"

export interface Exercicio {
  id: string
  nome: string
  descricao?: string | null
  grupamentoMuscular: GrupamentoMuscular
  origem: OrigemExercicio
  externalId?: string | null
  externalSource?: string | null
  professorId?: string | null
  createdAt: string
  updatedAt: string
}

export interface ExercicioExterno {
  externalId: string
  nome: string
  descricao?: string
  grupamentoMuscular: GrupamentoMuscular
  externalSource: string
}

export interface TreinoDiaExercicio {
  id: string
  treinoDiaId: string
  exercicioId: string
  ordem: number
  series?: number | null
  repeticoes?: string | null
  cargaSugerida?: number | null
  observacoes?: string | null
  metodo?: string | null
  createdAt: string
  updatedAt: string
  exercicio: Exercicio
}

export interface TreinoDia {
  id: string
  planoTreinoId: string
  titulo: string
  ordem: number
  diaSemana?: number | null
  observacoes?: string | null
  metodo?: string | null
  createdAt: string
  updatedAt: string
  exercicios: TreinoDiaExercicio[]
}

export interface PlanoTreino {
  id: string
  alunoId: string
  professorId: string
  nome: string
  observacoes?: string | null
  ativo: boolean
  createdAt: string
  updatedAt: string
  dias: TreinoDia[]
}

export interface TreinoExercicioCheckin {
  id: string
  checkinId: string
  treinoDiaExercicioId: string
  exercicioId: string
  concluido: boolean
  cargaReal?: number | null
  repeticoesReal?: string | null
  comentarioAluno?: string | null
  createdAt: string
  updatedAt: string
  exercicio: Exercicio
  treinoDiaExercicio: TreinoDiaExercicio
}

export interface TreinoCheckin {
  id: string
  alunoId: string
  professorId: string
  planoTreinoId: string
  treinoDiaId: string
  status: CheckinStatus
  iniciadoEm: string
  finalizadoEm?: string | null
  dataTreino: string
  comentarioAluno?: string | null
  comentarioProfessor?: string | null
  createdAt: string
  updatedAt: string
  treinoDia: TreinoDia
  exercicios: TreinoExercicioCheckin[]
}

export interface TimelineEventoTreino {
  id: string
  tipo:
    | "TREINO_INICIADO"
    | "EXERCICIO_CONCLUIDO"
    | "TREINO_FINALIZADO"
    | "COMENTARIO_PROFESSOR"
  dataHora: string
  checkinId: string
  treinoDiaTitulo: string
  descricao: string
  exercicioNome?: string
  cargaReal?: number | null
  repeticoesReal?: string | null
}

export interface ProgressPontoTreino {
  data: string
  cargaReal: number | null
  repeticoesReal: string | null
}

export interface ProgressSerieTreino {
  exercicioId: string
  exercicioNome: string
  grupamentoMuscular: GrupamentoMuscular
  pontos: ProgressPontoTreino[]
}

export interface CreateExercicioDTO {
  nome: string
  descricao?: string
  grupamentoMuscular: GrupamentoMuscular
}

export interface ImportExercicioExternoDTO {
  externalId: string
  nome: string
  descricao?: string
  grupamentoMuscular: GrupamentoMuscular
  externalSource: string
}

export interface UpsertPlanoTreinoDTO {
  alunoId: string
  nome: string
  observacoes?: string
  dias: Array<{
    titulo: string
    ordem: number
    diaSemana?: number
    observacoes?: string
    metodo?: string
    exercicios: Array<{
      exercicioId: string
      ordem: number
      series?: number
      repeticoes?: string
      cargaSugerida?: number
      observacoes?: string
      metodo?: string
    }>
  }>
}

export interface StartCheckinDTO {
  treinoDiaId: string
}

export interface UpdateExercicioCheckinDTO {
  concluido?: boolean
  cargaReal?: number
  repeticoesReal?: string
  comentarioAluno?: string
}

export interface FinalizeCheckinDTO {
  comentarioAluno?: string
}

export interface ComentarProfessorCheckinDTO {
  comentarioProfessor: string
}

export type ObjetivoDieta = "MANTER" | "PERDER" | "GANHAR"
export type OrigemAlimento = "SISTEMA" | "EXTERNO" | "PROFESSOR"
export type AlimentoExternalSource = "USDA" | "TACO"

export interface AlimentoDieta {
  id: string
  nome: string
  descricao?: string | null
  origem: OrigemAlimento
  externalId?: string | null
  fonteExterna?: string | null
  calorias100g: number
  proteinas100g: number
  carboidratos100g: number
  gorduras100g: number
  fibras100g?: number | null
  professorId?: string | null
  createdAt: string
  updatedAt: string
}

export interface AlimentoExterno {
  externalId: string
  nome: string
  descricao?: string
  calorias100g: number
  proteinas100g: number
  carboidratos100g: number
  gorduras100g: number
  fibras100g?: number
  source: AlimentoExternalSource
}

export interface DietaRefeicaoItem {
  id: string
  dietaRefeicaoId: string
  alimentoId: string
  ordem: number
  quantidadeGramas: number
  calorias: number
  proteinas: number
  carboidratos: number
  gorduras: number
  fibras?: number | null
  observacoes?: string | null
  createdAt: string
  updatedAt: string
  alimento: AlimentoDieta
}

export interface DietaRefeicao {
  id: string
  dietaDiaId: string
  nome: string
  ordem: number
  horario?: string | null
  observacoes?: string | null
  createdAt: string
  updatedAt: string
  itens: DietaRefeicaoItem[]
}

export interface DietaDia {
  id: string
  planoDietaId: string
  titulo: string
  ordem: number
  diaSemana?: number | null
  observacoes?: string | null
  createdAt: string
  updatedAt: string
  refeicoes: DietaRefeicao[]
}

export interface PlanoDieta {
  id: string
  alunoId: string
  professorId: string
  nome: string
  objetivo: ObjetivoDieta
  percentualGordura?: number | null
  massaMagraKg?: number | null
  tmbKcal?: number | null
  fatorAtividade?: number | null
  caloriasMeta: number
  proteinasMetaG: number
  carboidratosMetaG: number
  gordurasMetaG: number
  observacoes?: string | null
  ativo: boolean
  createdAt: string
  updatedAt: string
  dias: DietaDia[]
}

export interface DietaRefeicaoCheckin {
  id: string
  checkinId: string
  dietaRefeicaoId: string
  concluida: boolean
  observacaoAluno?: string | null
  createdAt: string
  updatedAt: string
  dietaRefeicao: DietaRefeicao
}

export interface DietaCheckin {
  id: string
  alunoId: string
  professorId: string
  planoDietaId: string
  dietaDiaId: string
  status: CheckinStatus
  iniciadoEm: string
  finalizadoEm?: string | null
  dataDieta: string
  observacaoDia?: string | null
  comentarioProfessor?: string | null
  createdAt: string
  updatedAt: string
  dietaDia: DietaDia
  refeicoes: DietaRefeicaoCheckin[]
}

export interface DietaRecomendacao {
  alunoId: string
  objetivo: ObjetivoDieta
  origemHistoricoId?: string | null
  percentualGordura?: number | null
  massaMagraKg?: number | null
  tmbKcal?: number | null
  fatorAtividade?: number | null
  caloriasManutencao?: number | null
  caloriasMeta?: number | null
  proteinasMetaG: number
  carboidratosMetaG: number
  gordurasMetaG: number
  missingFields: string[]
  dadosBase: {
    pesoKg?: number | null
    alturaCm?: number | null
    idade?: number | null
    cinturaCm?: number | null
    quadrilCm?: number | null
    pescocoCm?: number | null
    sexoBiologico?: SexoBiologico | null
  }
}

export interface CreateAlimentoDietaDTO {
  nome: string
  descricao?: string
  calorias100g: number
  proteinas100g: number
  carboidratos100g: number
  gorduras100g: number
  fibras100g?: number
}

export interface ImportAlimentoExternoDTO {
  externalId: string
  nome: string
  descricao?: string
  calorias100g: number
  proteinas100g: number
  carboidratos100g: number
  gorduras100g: number
  fibras100g?: number
  source: AlimentoExternalSource
}

export interface UpsertPlanoDietaDTO {
  alunoId: string
  nome: string
  objetivo: ObjetivoDieta
  fatorAtividade?: number
  caloriasMeta?: number
  proteinasMetaG?: number
  carboidratosMetaG?: number
  gordurasMetaG?: number
  observacoes?: string
  dias: Array<{
    titulo: string
    ordem: number
    diaSemana?: number
    observacoes?: string
    refeicoes: Array<{
      nome: string
      ordem: number
      horario?: string
      observacoes?: string
      itens: Array<{
        alimentoId: string
        ordem: number
        quantidadeGramas: number
        observacoes?: string
      }>
    }>
  }>
}

export interface StartDietaCheckinDTO {
  dietaDiaId: string
}

export interface UpdateDietaRefeicaoCheckinDTO {
  concluida?: boolean
  observacaoAluno?: string
}

export interface FinalizeDietaCheckinDTO {
  observacaoDia?: string
}
