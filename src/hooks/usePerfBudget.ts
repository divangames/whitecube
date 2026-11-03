import { useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/useInViewport'

/**
 * Производительность: автоматическая оптимизация под железо ПК и других клиентов.
 *
 * При загрузке страницы без действий пользователя выбирается уровень нагрузки на GPU/CPU
 * (см. detectHardwareTier / useHardwareTier). Слабые конфигурации получают упрощённые
 * фоны, меньше анимаций и т.д. Ручной переключатель не используется — поведение всегда такое.
 */

/** Полная графика · частичные оптимизации · максимально облегчённый режим */
export type HardwareTier = 'full' | 'reduced' | 'minimal'

/**
 * Синхронная эвристика без React (для начального состояния и тестов).
 * minimal: очень слабые конфигурации и экономия трафика.
 * reduced: типичные офисные ПК / старые ноуты.
 */
export function detectHardwareTier(): HardwareTier {
  if (typeof navigator === 'undefined') return 'full'

  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }

  if (nav.connection?.saveData === true) return 'minimal'

  const hc = navigator.hardwareConcurrency
  const mem = nav.deviceMemory

  const cores = typeof hc === 'number' && hc > 0 ? hc : null

  /* Очень слабо: мало ядер или мало ОЗУ (Chrome) */
  if (cores !== null && cores <= 2) return 'minimal'
  if (typeof mem === 'number' && mem <= 2) return 'minimal'

  /* Средняя слабость */
  if (cores !== null && cores <= 4) return 'reduced'
  if (typeof mem === 'number' && mem <= 4) return 'reduced'

  return 'full'
}

/**
 * Итоговый tier: системное «уменьшить анимации» всегда переводит в minimal.
 */
export function useHardwareTier(): HardwareTier {
  const reduced = usePrefersReducedMotion()
  const [hwTier] = useState(detectHardwareTier)
  return reduced ? 'minimal' : hwTier
}

/** Как раньше: всё, что не полный tier — упрощаем шейдеры и тяжёлые эффекты. */
export function useSaveGpuMode(): boolean {
  return useHardwareTier() !== 'full'
}

export function usePerfIsMinimal(): boolean {
  return useHardwareTier() === 'minimal'
}
