import { motion, useSpring, animate } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'

interface GumButtonProps {
  href?: string
  onClick?: () => void
  children?: React.ReactNode
  type?: 'button' | 'submit'
  disabled?: boolean
  variant?: 'fire' | 'cream'
  className?: string
  showArrow?: boolean
}

export default function GumButton({
  href,
  onClick,
  children,
  type = 'button',
  disabled = false,
  variant = 'fire',
  className = '',
  showArrow = true,
}: GumButtonProps) {
  const [hovered, setHovered] = useState(false)

  const scaleX = useSpring(1, { stiffness: 500, damping: 14, mass: 0.4 })
  const scaleY = useSpring(1, { stiffness: 500, damping: 14, mass: 0.4 })

  const onHoverStart = () => {
    setHovered(true)
    animate(scaleX, 1.07, { type: 'spring', stiffness: 500, damping: 10 })
    animate(scaleY, 0.92, { type: 'spring', stiffness: 500, damping: 10 })
  }

  const onHoverEnd = () => {
    setHovered(false)
    animate(scaleX, 1, { type: 'spring', stiffness: 350, damping: 14 })
    animate(scaleY, 1, { type: 'spring', stiffness: 350, damping: 14 })
  }

  const onTap = () => {
    animate(scaleX, 1.15, { type: 'spring', stiffness: 700, damping: 10 })
    animate(scaleY, 0.80, { type: 'spring', stiffness: 700, damping: 10 })
    setTimeout(() => {
      animate(scaleX, 1, { type: 'spring', stiffness: 280, damping: 12 })
      animate(scaleY, 1, { type: 'spring', stiffness: 280, damping: 12 })
    }, 100)
  }

  const isFire = variant === 'fire'

  const baseClass = `inline-flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-full cursor-pointer select-none outline-none ${
    isFire
      ? 'bg-fire text-cream'
      : 'bg-cream text-ink'
  } ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`

  const inner = (
    <>
      {children}
      {showArrow && (
        <motion.span
          className="flex"
          animate={{ x: hovered ? [0, 4, 0] : 0 }}
          transition={{
            duration: 0.55,
            repeat: hovered ? Infinity : 0,
            ease: 'easeInOut',
          }}
        >
          <ArrowRight size={14} />
        </motion.span>
      )}
    </>
  )

  if (href) {
    return (
      <motion.a
        href={href}
        style={{ scaleX, scaleY }}
        onHoverStart={disabled ? undefined : onHoverStart}
        onHoverEnd={disabled ? undefined : onHoverEnd}
        onTap={disabled ? undefined : onTap}
        className={baseClass}
      >
        {inner}
      </motion.a>
    )
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{ scaleX, scaleY }}
      onHoverStart={disabled ? undefined : onHoverStart}
      onHoverEnd={disabled ? undefined : onHoverEnd}
      onTap={disabled ? undefined : onTap}
      className={baseClass}
    >
      {inner}
    </motion.button>
  )
}
