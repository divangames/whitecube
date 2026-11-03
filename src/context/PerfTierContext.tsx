import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useHardwareTier, type HardwareTier } from '@/hooks/usePerfBudget'

/** Доступ к автоматически выбранному уровню производительности (без ручных настроек). */

const PerfTierContext = createContext<HardwareTier>('full')

export function PerfTierProvider({ children }: { children: ReactNode }) {
  const tier = useHardwareTier()

  useEffect(() => {
    document.documentElement.dataset.hardwareTier = tier
    return () => {
      delete document.documentElement.dataset.hardwareTier
    }
  }, [tier])

  return <PerfTierContext.Provider value={tier}>{children}</PerfTierContext.Provider>
}

export function usePerfTier(): HardwareTier {
  return useContext(PerfTierContext)
}
