import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { NumberTicker } from './magicui/number-ticker'
import { usePerfTier } from '@/context/PerfTierContext'
import { fadeUpMotion } from '@/lib/motionByTier'

const stats = [
  { value: 7, label: 'лет на рынке', sub: 'Экспертиза и опыт' },
  { value: 167, label: 'клиентов', sub: 'Доверяют нам' },
  { value: 34, label: 'человека', sub: 'В команде' },
  { value: 5, suffix: '', label: 'планерок в день', sub: '(помогите)' },
]

export default function Stats() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const tier = usePerfTier()
  const minimal = tier === 'minimal'

  return (
    <section id="about" ref={ref} className="border-t border-edge py-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        <div className="flex items-center gap-4 mb-16">
          <span className="tag">Whitecube в цифрах</span>

        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-10">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              {...fadeUpMotion(tier, inView, i * 0.1)}
              className="min-w-0"
            >
              <div className="font-display font-black text-[clamp(3rem,5vw,5.5rem)] leading-none text-cream mb-2 whitespace-nowrap overflow-hidden">
                {(inView && !minimal) ? <NumberTicker value={s.value} /> : s.value}
                <span className="text-fire">{s.suffix}</span>
              </div>
              <div className="font-semibold text-soft text-base mb-1">{s.label}</div>
              <div className="text-dim text-xs">{s.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Wide text block */}

      </div>
    </section>
  )
}
