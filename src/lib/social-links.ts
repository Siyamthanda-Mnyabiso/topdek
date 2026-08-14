export function withScheme(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

export function toWhatsAppLink(number: string): string {
  return `https://wa.me/${number.replace(/\D/g, '')}`
}
