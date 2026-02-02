export function validarFoto(file: File): string | null {
  const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"]
  const MAX_SIZE = 2 * 1024 * 1024 // 2MB

  if (!tiposPermitidos.includes(file.type)) {
    return "Apenas imagens JPG, PNG ou WebP são permitidas"
  }

  if (file.size > MAX_SIZE) {
    return "Foto muito grande. Máximo 2MB"
  }

  return null 
}

interface ValidarArquivoParams {
  file: File | null
  tipo: "TREINO" | "DIETA" | null
  titulo: string
  descricao?: string
}

export function validarArquivo(params: ValidarArquivoParams): string | null {
  if (!params.file) return "Selecione um arquivo PDF"
  if (params.file.type !== "application/pdf")
    return "Apenas arquivos PDF são permitidos"
  if (params.file.size > 5 * 1024 * 1024)
    return "Arquivo muito grande. Máximo 5MB"
  if (!params.tipo) return "Selecione o tipo: Treino ou Dieta"
  if (!params.titulo || params.titulo.trim().length < 2)
    return "Título é obrigatório"
  if (params.descricao && params.descricao.trim().length < 2)
    return "Descrição muito curta"

  return null 
}

export function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
