import type { HardwareTier } from '@/hooks/usePerfBudget'

/** Карточки и блоки: на minimal — без задержек и без скрытого initial. */
export function cardEnterMotion(tier: HardwareTier, inView: boolean, delay: number) {
  if (tier === 'minimal') {
    return {
      initial: false as const,
      animate: { opacity: 1, y: 0 } as const,
      transition: { duration: 0 },
    }
  }
  return {
    initial: { opacity: 0, y: 30 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.5, delay },
  }
}

export function sectionHeaderMotion(tier: HardwareTier, inView: boolean, delay = 0) {
  if (tier === 'minimal') {
    return {
      initial: false as const,
      animate: { opacity: 1, y: 0 } as const,
      transition: { duration: 0 },
    }
  }
  return {
    initial: { opacity: 0, y: 20 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.6, delay },
  }
}

export function fadeUpMotion(tier: HardwareTier, inView: boolean, delay: number, y = 24) {
  if (tier === 'minimal') {
    return {
      initial: false as const,
      animate: { opacity: 1, y: 0 } as const,
      transition: { duration: 0 },
    }
  }
  return {
    initial: { opacity: 0, y },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  }
}
