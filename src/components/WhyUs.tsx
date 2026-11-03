import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { usePerfTier } from '@/context/PerfTierContext'
import { fadeUpMotion } from '@/lib/motionByTier'

const points = [
  { n: '—', title: 'Официальный партнёр СДЭК', desc: 'В сфере IT и маркетинга' },
  { n: '—', title: '7 лет работы', desc: 'В сфере рекламы и IT' },
  { n: '—', title: '15 лет опыта', desc: 'В онлайн и офлайн продажах' },
  { n: '—', title: 'Бизнес под ключ', desc: 'Поиск и доставка товара, запуск продаж, ведение бухгалтерии и поиск сотрудников' },
  { n: '—', title: '7 команд в одной компании', desc: 'IT, бухгалтерия, логистика, реклама, отдел продаж, маркетплейсы и контент отдел — каждая команда эксперт в своей области' },
]

export default function WhyUs() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const tier = usePerfTier()
  const minimal = tier === 'minimal'

  return (
    <section ref={ref} className="border-t border-edge py-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">

          {/* Left */}
          <motion.div
            {...(minimal
              ? { initial: false as const, animate: { opacity: 1, x: 0 } as const, transition: { duration: 0 } }
              : {
                  initial: { opacity: 0, x: -24 },
                  animate: inView ? { opacity: 1, x: 0 } : {},
                  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                })}
          >
            <span className="tag block mb-6">Почему мы</span>
            <h2 className="font-display font-black text-4xl sm:text-5xl text-cream uppercase leading-[1.05] mb-8">
              Не просто<br />исполнители
            </h2>
            <p className="text-mid text-base leading-relaxed max-w-sm">
              Мы работаем как внутренняя команда — думаем о росте вашего бизнеса, а не о закрытии задачи из тикета.
            </p>

            {/* Big accent quote */}
            <div className="mt-12 pl-6 border-l-2 border-fire">
              <p className="font-display font-black text-2xl text-cream leading-snug">
                Агентство, которое думает о вашей прибыли и о своём результате.
              </p>
            </div>
          </motion.div>

          {/* Right — list */}
          <div className="flex flex-col">
            {points.map((p, i) => (
              <motion.div
                key={p.title}
                {...fadeUpMotion(tier, inView, 0.1 + i * 0.07, 20)}
                className="flex gap-5 py-5 border-b border-edge last:border-0 group"
              >
                <span className="text-dim text-sm mt-0.5 w-4 shrink-0">{p.n}</span>
                <div>
                  <span className="font-semibold text-cream text-base group-hover:text-fire transition-colors duration-200">
                    {p.title}
                  </span>
                  <p className="text-dim text-sm mt-0.5 leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
