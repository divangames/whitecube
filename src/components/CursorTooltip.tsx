import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  text: string
  children: React.ReactNode
}

function useHasHover() {
  const [hasHover, setHasHover] = useState(true)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setHasHover(mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [])
  return hasHover
}

export function CursorTooltip({ text, children }: Props) {
  const hasHover = useHasHover()
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: React.MouseEvent) => {
    setPos({ x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    if (!visible) return
    const onGlobalMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', onGlobalMove)
    return () => window.removeEventListener('mousemove', onGlobalMove)
  }, [visible])

  if (!hasHover) return <>{children}</>

  return (
    <div
      ref={ref}
      className="contents"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onMouseMove={onMove}
    >
      {children}

      {createPortal(
        <AnimatePresence>
          {visible && (
            <motion.div
              key="tip"
              initial={{ opacity: 0, scale: 0.94, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none fixed z-[9999] max-w-[260px] rounded-2xl border border-white/15 bg-black/85 px-4 py-3 text-xs leading-relaxed text-mid backdrop-blur-lg"
              style={{
                left: pos.x + 16,
                top: pos.y + 16,
                boxShadow: '0 18px 55px -18px rgba(0,0,0,0.85)',
              }}
            >
              {text}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
