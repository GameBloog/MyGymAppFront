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

// Midia de exercicio sobe direto para o Cloudinary (ver
// exerciciosApi.uploadMedia), entao nao passa pelo teto de payload da Lambda.
// O limite aqui e de produto, nao de infraestrutura: 5MB e o valor que sempre
// valeu, mantido para nao mudar o comportamento junto com a migracao. Da para
// aumentar sem tocar no backend - quem limita agora e o plano do Cloudinary.
const MAX_MIDIA_EXERCICIO_BYTES = 5 * 1024 * 1024

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
    return "Arquivo muito grande. Máximo 5MB"
  }

  return null
}
