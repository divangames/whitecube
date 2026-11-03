////////////////////////////////////////////////////////
//
// Карточка «Продвижение в ИИ» — высокий блок слева в сетке услуг
//
////////////////////////////////////////////////////////

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { CursorTooltip } from '../CursorTooltip'
import { usePerfTier } from '@/context/PerfTierContext'
import { cardEnterMotion } from '@/lib/motionByTier'
import { AiChatBg } from '@/components/services/AiChatBg'
import type { ServiceAllItem } from '@/types/services'

type AiPromoCardProps = {
  s: ServiceAllItem
  inView: boolean
  delay: number
}

/**
 * Карточка GEO/AEO: чат нейросети сверху, оффер снизу, ссылка в новой вкладке.
 */
export function AiPromoCard({ s, inView, delay }: AiPromoCardProps) {
  const tier = usePerfTier()

  return (
    <CursorTooltip text={s.desc}>
      <motion.a
        href={s.link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${s.title.replace(/\n/g, ' ')}. Открыть в новой вкладке`}
        {...cardEnterMotion(tier, inView, delay)}
        className="relative lg:col-span-2 lg:row-span-2 h-full rounded-2xl flex flex-col overflow-hidden group cursor-pointer border-2 border-white/12"
        style={{ background: '#1c1c1e' }}
      >
        <ArrowUpRight
          size={20}
          className="absolute top-4 right-4 z-20 text-white/55 group-hover:text-white transition-colors"
        />

        <div className="relative min-h-[260px] flex-1 lg:min-h-0 overflow-hidden">
          <AiChatBg />
        </div>

        <div
          className="relative z-10 px-6 pb-6 pt-5"
          style={{
            background: 'linear-gradient(180deg, rgba(12,12,14,0) 0%, #0c0c0e 22%, #0c0c0e 100%)',
          }}
        >
          <span className="service-card-tag tag text-white/55 block mb-2">{s.tag}</span>
          <h3 className="service-card-title text-white mb-2 whitespace-pre-line">
            {s.title}
          </h3>
          <p className="service-card-copy text-white/70 mb-3 max-w-xs line-clamp-2">{s.desc}</p>
          <span className="service-card-price text-white">{s.price}</span>
        </div>
      </motion.a>
    </CursorTooltip>
  )
}
