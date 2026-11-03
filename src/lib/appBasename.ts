////////////////////////////////////////////////////////
//
// Базовый путь приложения для React Router и GitVerse Pages
//
////////////////////////////////////////////////////////

/**
 * Basename без завершающего слэша. Для корня домена возвращает undefined.
 */
export function appBasename(): string | undefined {
  const base = import.meta.env.BASE_URL
  if (!base || base === '/') return undefined
  return base.replace(/\/$/, '')
}

/**
 * Префикс для внутренних путей вида `/avito` при деплое не в корень домена.
 */
export function withBasePath(href: string): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href
  const base = appBasename()
  if (!base) return href
  return `${base}${href}`
}
