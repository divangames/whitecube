import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const COUNTER_ID = 89304451

declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: unknown[]) => void
  }
}

/** Отправляет просмотры при смене маршрута (SPA). Счётчик подключается в index.html. */
export default function YandexMetrika() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    const url = pathname + search
    window.ym?.(COUNTER_ID, 'hit', url, {
      title: document.title,
      referer: document.referrer,
    })
  }, [pathname, search])

  return null
}
