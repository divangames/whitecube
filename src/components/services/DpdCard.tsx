////////////////////////////////////////////////////////
//
// Карточка бесплатной интеграции DPD × Ozon
//
////////////////////////////////////////////////////////

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { CursorTooltip } from '../CursorTooltip'
import { usePerfTier } from '@/context/PerfTierContext'
import { cardEnterMotion } from '@/lib/motionByTier'
import { DpdFallingBoxes } from '@/components/services/DpdFallingBoxes'
import dpdLogo from '../../../images/dpd_logo.svg'

export type DpdServiceItem = {
  n: string
  tag: string
  title: string
  desc: string
  price: string
  link?: string
}

type DpdCardProps = {
  s: DpdServiceItem
  inView: boolean
  delay: number
}

/**
 * Красная карточка DPD: логотип в правом верхнем углу,
 * стрелка-ссылка слева, на ховере — падающие коробки.
 */
export function DpdCard({ s, inView, delay }: DpdCardProps) {
  const [hovered, setHovered] = useState(false)
  const tier = usePerfTier()
  const physicsOff = tier === 'minimal'

  return (
    <CursorTooltip text={s.desc}>
      <motion.a
        href={s.link}
        target="_blank"
        rel="noopener noreferrer"
        {...cardEnterMotion(tier, inView, delay)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative border-2 border-cream/30 rounded-2xl p-7 flex flex-col justify-between overflow-hidden group cursor-pointer lg:row-span-2"
        style={{ background: '#E41C3F' }}
        aria-label={`${s.title.replace(/\n/g, ' ')}. ${s.price}`}
      >
        {/* Логотип — строго верхний правый угол */}
        <div className="absolute pointer-events-none select-none inset-0 overflow-hidden rounded-2xl">
          <img
            src={dpdLogo}
            alt=""
            aria-hidden="true"
            className="absolute"
            style={{
              top: '14px',
              right: '16px',
              width: 'min(48%, 200px)',
              height: 'auto',
              opacity: 0.95,
              filter: 'brightness(0) invert(1)',
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
              transformOrigin: 'top right',
              transition: 'transform 0.55s cubic-bezier(0.22, 0.8, 0.2, 1)',
            }}
          />
        </div>

        {!physicsOff && <DpdFallingBoxes active={hovered} reduced={tier === 'reduced'} />}

        <div className="relative z-10 flex items-start justify-between min-h-[28px]">
          <ArrowUpRight size={20} className="text-cream/60 group-hover:text-cream transition-colors" aria-hidden="true" />
        </div>

        <div className="relative z-10">
          <span className="service-card-tag tag text-cream/50 block mb-3">{s.tag}</span>
          <h3 className="service-card-title text-cream mb-3 whitespace-pre-line">
            {s.title}
          </h3>
          <p className="service-card-copy text-cream/70 mb-4 max-w-xs">{s.desc}</p>
          <span className="service-card-price uppercase tracking-[0.14em] text-cream">
            {s.price}
          </span>
        </div>
      </motion.a>
    </CursorTooltip>
  )
}
