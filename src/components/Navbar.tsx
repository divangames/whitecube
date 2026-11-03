import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import logoCube from '../../images/logo_cube.svg'
import GumButton from './GumButton'
import { usePerfTier } from '@/context/PerfTierContext'

const links: { href: string; label: string; external?: boolean }[] = [
  { href: '#services', label: 'Услуги' },
  { href: 'https://белая-коробка.рф/статьи', label: 'Блог', external: true },
  { href: '#about', label: 'О нас' },
  { href: '#reviews', label: 'Отзывы' },
  { href: '#contact', label: 'Контакты' },
]

export default function Navbar() {
  const tier = usePerfTier()
  const minimal = tier === 'minimal'
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    minimal ? (
      <header
        className={`fixed top-0 inset-x-0 z-50 ${
          scrolled ? 'bg-ink/90 backdrop-blur-xl border-b border-edge' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 group">
            <img src={logoCube} alt="Whitecube logo" className="h-6 w-6" />
            <span className="font-display font-black text-base tracking-tight text-cream">
              WHITE<span className="text-fire">CUBE</span>
            </span>
          </a>
          <nav className="hidden md:flex items-center gap-10">
            {links.map(l => (
              <a
                key={l.href}
                href={l.href}
                target={l.external ? '_blank' : undefined}
                rel={l.external ? 'noopener noreferrer' : undefined}
                className="text-sm text-dim hover:text-cream transition-colors duration-200 tracking-wide"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="hidden md:flex">
            <GumButton href="#contact" variant="cream">Аудит бесплатно</GumButton>
          </div>
          <button onClick={() => setOpen(!open)} className="md:hidden text-cream p-1" type="button" aria-expanded={open}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {open && (
          <div className="md:hidden bg-ink border-b border-edge overflow-hidden">
            <div className="px-5 py-4 flex flex-col gap-1">
              {links.map(l => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  target={l.external ? '_blank' : undefined}
                  rel={l.external ? 'noopener noreferrer' : undefined}
                  className="text-soft py-3 text-sm border-b border-edge last:border-0"
                >
                  {l.label}
                </a>
              ))}
              <GumButton href="#contact" variant="cream" className="mt-3 w-full justify-center" onClick={() => setOpen(false)}>
                Аудит бесплатно
              </GumButton>
            </div>
          </div>
        )}
      </header>
    ) : (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-ink/90 backdrop-blur-xl border-b border-edge' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <img src={logoCube} alt="Whitecube logo" className="h-6 w-6" />
          <span className="font-display font-black text-base tracking-tight text-cream">
            WHITE<span className="text-fire">CUBE</span>
          </span>
        </a>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-10">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              target={l.external ? '_blank' : undefined}
              rel={l.external ? 'noopener noreferrer' : undefined}
              className="text-sm text-dim hover:text-cream transition-colors duration-200 tracking-wide"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex">
          <GumButton href="#contact" variant="cream">Аудит бесплатно</GumButton>
        </div>

        {/* Mobile */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-cream p-1">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-ink border-b border-edge overflow-hidden"
          >
            <div className="px-5 py-4 flex flex-col gap-1">
              {links.map(l => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  target={l.external ? '_blank' : undefined}
                  rel={l.external ? 'noopener noreferrer' : undefined}
                  className="text-soft py-3 text-sm border-b border-edge last:border-0"
                >
                  {l.label}
                </a>
              ))}
              <GumButton href="#contact" variant="cream" className="mt-3 w-full justify-center" onClick={() => setOpen(false)}>
                Аудит бесплатно
              </GumButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
    )
  )
}
