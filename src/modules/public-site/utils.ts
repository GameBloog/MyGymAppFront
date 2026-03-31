export const buildWhatsAppUrl = (number: string, message: string) => {
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${number}?text=${encodedMessage}`
}

export const openWhatsApp = (number: string, message: string) => {
  window.open(buildWhatsAppUrl(number, message), "_blank", "noopener,noreferrer")
}

export const scrollToPublicSection = (id: string) => {
  const element = document.getElementById(id)
  if (!element) {
    return
  }

  const top = element.getBoundingClientRect().top + window.scrollY - 96
  window.scrollTo({ top, behavior: "smooth" })
}
