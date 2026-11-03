import { motion, useMotionValue, useTransform, animate, useInView, type MotionValue } from 'framer-motion'
import { ArrowRight, ArrowDown } from 'lucide-react'
import { useState, useRef, useLayoutEffect, useEffect } from 'react'
import { SectionedMeshShaderBg } from '@/components/ui/hero-shader'
import { usePrefersReducedMotion } from '@/hooks/useInViewport'
import { usePerfTier } from '@/context/PerfTierContext'

const up = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
})

const navLinks = [
  { id: 'start',    href: '#contact',           label: 'Начать сейчас', icon: 'arrow' },
  { id: 'services', href: '#our-services',      label: 'Наши продукты', icon: 'down' },
  { id: 'all',      href: '#our-all-services',  label: 'Наши услуги', icon: 'down' },
]

function NavButtons() {
  const tier = usePerfTier()
  const minimal = tier === 'minimal'
  const reducedMotion = usePrefersReducedMotion()
  const subtleMotion = tier === 'full' && !reducedMotion

  const [active, setActive] = useState('start')
  const containerRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef<Record<string, HTMLAnchorElement | null>>({})

  // Left and right edges of the pill — animated independently
  const leftEdge  = useMotionValue(0)
  const rightEdge = useMotionValue(0)
  const pillWidth = useTransform(
    [leftEdge, rightEdge] as MotionValue<number>[],
    ([l, r]: number[]) => r - l
  )

  const getRect = (id: string) => {
    const container = containerRef.current
    const el = btnRefs.current[id]
    if (!container || !el) return null
    const cRect = container.getBoundingClientRect()
    const eRect = el.getBoundingClientRect()
    return { left: eRect.left - cRect.left, right: eRect.right - cRect.left }
  }

  // Set initial pill to "start" without animation
  useLayoutEffect(() => {
    const r = getRect('start')
    if (r) { leftEdge.set(r.left); rightEdge.set(r.right) }
  }, [])

  const movePill = (id: string) => {
    const target = getRect(id)
    if (!target) return

    if (minimal) {
      leftEdge.set(target.left)
      rightEdge.set(target.right)
      return
    }

    const goingRight = target.left >= leftEdge.get()

    // Leading edge snaps fast, trailing edge stretches slow → gum effect
    const fast = { type: 'spring' as const, stiffness: 600, damping: 30, mass: 0.5 }
    const slow = { type: 'spring' as const, stiffness: 180, damping: 22, mass: 0.9 }

    if (goingRight) {
      animate(rightEdge, target.right, fast)
      animate(leftEdge,  target.left,  slow)
    } else {
      animate(leftEdge,  target.left,  fast)
      animate(rightEdge, target.right, slow)
    }
  }

  const handleEnter = (id: string) => {
    setActive(id)
    movePill(id)
  }

  const handleLeave = () => {
    setActive('start')
    movePill('start')
  }

  return (
    <div ref={containerRef} className="relative flex items-center gap-1">
      {/* Single gum pill */}
      <motion.span
        className="absolute inset-y-0 rounded-full bg-fire pointer-events-none"
        style={{ left: leftEdge, width: pillWidth }}
      />

      {navLinks.map(({ id, href, label, icon }) => (
        <a
          key={id}
          href={href}
          ref={(el) => { btnRefs.current[id] = el }}
          onMouseEnter={() => handleEnter(id)}
          onMouseLeave={handleLeave}
          className="relative text-sm px-4 py-2 rounded-full z-10 font-semibold"
        >
          <span
            className="relative z-10 flex items-center gap-1.5"
            style={{ color: active === id ? '#fff' : '#666' }}
          >
            {label}
            {icon === 'arrow' ? (
              <motion.span
                animate={{ x: active === id ? [0, 4, 0] : 0 }}
                transition={{
                  duration: 0.6,
                  repeat: subtleMotion && active === id ? Infinity : 0,
                  ease: 'easeInOut',
                }}
              >
                <ArrowRight size={13} />
              </motion.span>
            ) : (
              <motion.span
                animate={{ y: active === id ? [0, 4, 0] : 0 }}
                transition={{
                  duration: 0.6,
                  repeat: subtleMotion && active === id ? Infinity : 0,
                  ease: 'easeInOut',
                }}
              >
                <ArrowDown size={13} />
              </motion.span>
            )}
          </span>
        </a>
      ))}
    </div>
  )
}

const STATS = [
  { target: 7,   suffix: '',  label: 'лет на рынке',    sub: 'Экспертиза и опыт',  accent: false },
  { target: 167, suffix: '+', label: 'клиентов',         sub: 'Доверяют нам',        accent: true  },
  { target: 34,  suffix: '',  label: 'человека',         sub: 'В команде',           accent: false },
  { target: 5,   suffix: '',  label: 'планерок в день',  sub: '(помогите)',          accent: false },
]

function CountUp({ target, suffix, accent, run }: { target: number; suffix: string; accent: boolean; run: boolean }) {
  const reduced = usePrefersReducedMotion()
  const [display, setDisplay] = useState(reduced ? target : 0)

  useEffect(() => {
    if (!run || reduced) { setDisplay(target); return }
    let start: number | null = null
    const duration = 1600
    const ease = (t: number) => 1 - Math.pow(1 - t, 3)
    const step = (ts: number) => {
      if (!start) start = ts
      const t = Math.min((ts - start) / duration, 1)
      setDisplay(Math.round(ease(t) * target))
      if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [run, target, reduced])

  return (
    <span
      className="font-display font-black leading-none tabular-nums"
      style={{
        fontSize: 'clamp(2.4rem, 5vw, 4rem)',
        color: accent ? '#22b7d8' : '#F0EDE6',
        textShadow: accent ? '0 0 40px rgba(34,183,216,0.55)' : undefined,
      }}
    >
      {display}{suffix}
    </span>
  )
}

function StatsStrip({ minimal }: { minimal: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20px' })

  return (
    <motion.div
      ref={ref}
      initial={minimal ? false : { opacity: 0, y: 16 }}
      animate={minimal ? false : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={minimal ? undefined : { duration: 0.7, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10"
    >
      {/* Тонкая разделительная линия */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-fire/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={minimal ? false : { opacity: 0, y: 24 }}
              animate={minimal ? false : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={minimal ? undefined : { duration: 0.6, delay: 1.0 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col items-start py-6 px-4 sm:px-8 group"
            >
              {/* Вертикальный разделитель */}
              {i > 0 && (
                <span
                  className="absolute left-0 top-1/4 h-1/2 w-px"
                  style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.12), transparent)' }}
                />
              )}

              {/* Тонкая линия-акцент сверху над каждым числом */}
              <span
                className="block mb-3 h-0.5 w-8 rounded-full transition-all duration-500 group-hover:w-14"
                style={{ background: s.accent ? '#22b7d8' : 'rgba(240,237,230,0.2)' }}
              />

              <CountUp target={s.target} suffix={s.suffix} accent={s.accent} run={inView} />

              {/* Основная подпись */}
              <span
                className="mt-2 text-xs sm:text-sm font-semibold leading-snug"
                style={{ color: s.accent ? 'rgba(34,183,216,0.9)' : 'rgba(240,237,230,0.65)' }}
              >
                {s.label}
              </span>
              {/* Вторичная подпись */}
              <span
                className="mt-0.5 text-[11px] leading-snug"
                style={{ color: s.accent ? 'rgba(34,183,216,0.45)' : 'rgba(240,237,230,0.25)' }}
              >
                {s.sub}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function Hero() {
  const minimal = usePerfTier() === 'minimal'

  return (
    <section className="relative min-h-screen flex flex-col justify-between pt-14 overflow-hidden" style={{ backgroundColor: '#000000' }}>
      <SectionedMeshShaderBg progress={0.45} showDots={false} single />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 w-full flex-1 flex flex-col justify-center py-20">

        {/* Top line */}
        <motion.div
          className="flex items-center gap-4 mb-12"
          {...(!minimal ? up(0.1) : { initial: false })}
        >
          <span className="tag text-fire">Официальный партнёр СДЭК по IT и маркетингу</span>
        </motion.div>

        {/* Giant headline */}
        <div className="overflow-hidden mb-4">
          <motion.h1
            initial={minimal ? false : { y: '110%' }}
            animate={minimal ? false : { y: 0 }}
            transition={minimal ? undefined : { duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-black leading-[0.95] text-[clamp(3.5rem,10vw,9rem)] text-cream uppercase tracking-tight"
          >
            Растим
          </motion.h1>
        </div>
        <div className="overflow-hidden mb-4">
          <motion.h1
            initial={minimal ? false : { y: '110%' }}
            animate={minimal ? false : { y: 0 }}
            transition={minimal ? undefined : { duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-black leading-[0.95] text-[clamp(3.5rem,10vw,9rem)] uppercase tracking-tight"
            style={{ WebkitTextStroke: '1.5px #F0EDE6', color: 'transparent' }}
          >
            бизнес
          </motion.h1>
        </div>
        <div className="hidden overflow-hidden mb-12">
          <motion.h1
            initial={minimal ? false : { y: '110%' }}
            animate={minimal ? false : { y: 0 }}
            transition={minimal ? undefined : { duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-black leading-[0.95] text-[clamp(3.5rem,10vw,9rem)] text-fire uppercase tracking-tight"
          >
            УМНО
          </motion.h1>
        </div>

        {/* Bottom bar */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-16"
          {...(!minimal ? up(0.6) : { initial: false })}
        >
          <p className="text-mid text-base max-w-xs leading-relaxed">
            IT-продукты, аутсорс бухгалтерии, логистика из Китая, маркетплейсы, рекламное агентство, SERM
          </p>
          <NavButtons />
        </motion.div>
      </div>

      {/* Bottom stats strip */}
      <StatsStrip minimal={minimal} />
    </section>
  )
}
