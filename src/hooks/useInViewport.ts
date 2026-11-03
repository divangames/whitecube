import { useEffect, useState, type RefObject } from 'react'

export type UseInViewportOptions = IntersectionObserverInit & {
  /** Для тяжёлых эффектов задайте false — до первого срабатывания IO шейдер не стартует «вхолостую». */
  initialInView?: boolean
}

/**
 * Возвращает true, если элемент сейчас виден во вьюпорте.
 * Используется, чтобы ставить тяжёлые анимации (canvas, шейдеры, RAF-циклы) на паузу.
 */
export function useInViewport<T extends Element>(
  ref: RefObject<T>,
  options: UseInViewportOptions = {},
): boolean {
  const { initialInView = true, root, rootMargin, threshold } = options
  const [inView, setInView] = useState(initialInView)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setInView(e.isIntersecting)
      },
      { root, rootMargin, threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, root, rootMargin, threshold])

  return inView
}

/**
 * Уважает системную настройку «уменьшить анимации».
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [])
  return reduced
}
