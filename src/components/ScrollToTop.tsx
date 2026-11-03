import { motion, useSpring, useMotionValue } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { usePerfTier } from '@/context/PerfTierContext'

const FIRE = '#22b7d8'

function ScrollToTopMinimal() {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  if (!visible) return null
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed bottom-8 right-8 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-fire focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
      style={{
        background: hovered ? FIRE : '#0B0B0B',
        border: `1px solid ${hovered ? FIRE : 'rgba(255,255,255,0.18)'}`,
        color: '#fff',
      }}
      aria-label="Наверх"
    >
      <ArrowUp size={18} strokeWidth={2.4} />
    </button>
  )
}

function ScrollToTopFancy() {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const magnetAnchorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const magX = useMotionValue(0)
  const magY = useMotionValue(0)
  const springMagX = useSpring(magX, { stiffness: 160, damping: 14 })
  const springMagY = useSpring(magY, { stiffness: 160, damping: 14 })

  useEffect(() => {
    if (!visible) return
    const onMove = (e: MouseEvent) => {
      const anchor = magnetAnchorRef.current
      if (!anchor) return
      const rect = anchor.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.hypot(dx, dy)
      const radius = 140
      const maxPull = 32
      if (dist < radius && dist > 0.5) {
        const pull = (1 - dist / radius) * maxPull
        magX.set((dx / dist) * pull)
        magY.set((dy / dist) * pull)
      } else if (dist <= 0.5) {
        magX.set(0)
        magY.set(0)
      } else {
        magX.set(0)
        magY.set(0)
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [visible, magX, magY])

  useEffect(() => {
    if (!visible) {
      magX.set(0)
      magY.set(0)
    }
  }, [visible, magX, magY])

  return (
    <>
      <div
        ref={magnetAnchorRef}
        className="pointer-events-none fixed bottom-8 right-8 z-40 h-12 w-12 opacity-0"
        aria-hidden
      />
      <motion.div
        className="fixed bottom-8 right-8 z-50 pointer-events-none"
        style={{ x: springMagX, y: springMagY }}
        initial={false}
        animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      >
        <motion.button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full outline-none pointer-events-auto focus-visible:ring-2 focus-visible:ring-fire focus-visible:ring-offset-2 focus-visible:ring-offset-ink transition-colors duration-200"
          style={{
            background: hovered ? FIRE : '#0B0B0B',
            border: `1px solid ${hovered ? FIRE : 'rgba(255,255,255,0.18)'}`,
            boxSizing: 'border-box',
            color: '#fff',
          }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 420, damping: 24 }}
          aria-label="Наверх"
        >
          <motion.span
            animate={{ y: hovered ? [0, -3, 0] : 0 }}
            transition={{ duration: 0.9, repeat: hovered ? Infinity : 0, ease: 'easeInOut' }}
            className="flex"
          >
            <ArrowUp size={18} strokeWidth={2.4} />
          </motion.span>
        </motion.button>
      </motion.div>
    </>
  )
}

export default function ScrollToTop() {
  const tier = usePerfTier()
  if (tier === 'minimal') return <ScrollToTopMinimal />
  return <ScrollToTopFancy />
}
