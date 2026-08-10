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

// 4.000.000 bytes, e nao 4 * 1024 * 1024. Na AWS o backend roda com
// MAX_FILE_SIZE = 4 MiB (4.194.304) aplicado tanto ao `bodyLimit` do Fastify
// quanto ao `limits.fileSize` do multipart. Um arquivo de exatamente 4 MiB
// estoura o teto assim que o envelope multipart (boundary, headers, campos) e
// somado. Os ~194 KB de folga cobrem esse envelope, e o numero arredondado
// mantem a mensagem ("Máximo 4MB") igual a que o backend devolve.
const MAX_MIDIA_EXERCICIO_BYTES = 4_000_000

export function validarMidiaExercicio(
  file: File,
  tipo: "execucao" | "aparelho",
): string | null {
  const MAX_SIZE = MAX_MIDIA_EXERCICIO_BYTES

  if (tipo === "execucao") {
    const tiposPermitidos = ["image/gif", "image/webp"]

    if (!tiposPermitidos.includes(file.type)) {
      return "Use GIF ou WebP para a demonstração de execução"
    }
  } else {
    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"]

    if (!tiposPermitidos.includes(file.type)) {
      return "Use JPG, PNG ou WebP para a foto do aparelho"
    }
  }

  if (file.size > MAX_SIZE) {
    return "Arquivo muito grande. Máximo 4MB"
  }

  return null
}
