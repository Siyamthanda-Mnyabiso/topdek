/** Threads a pending "book this service" intent through the login/signup
 * redirect via a URL search param, since there's no router-state object
 * that survives a server redirect the way React Router's `navigate(path,
 * {state}) does. */
export function withBookServiceParam(path: string, bookServiceId?: string | null): string {
  if (!bookServiceId) return path
  const [base, query] = path.split('?')
  const params = new URLSearchParams(query)
  params.set('bookService', bookServiceId)
  return `${base}?${params.toString()}`
}
