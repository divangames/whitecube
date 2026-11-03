import React, { useRef, useState, useEffect } from 'react'
import CodeTypingBg from './CodeTypingBg'
import { CardMeshShaderBg } from '@/components/ui/hero-shader'
import { motion, useInView } from 'framer-motion'
import { ArrowUpRight, ExternalLink, Star } from 'lucide-react'
import { CursorTooltip } from './CursorTooltip'
import { ZebraBg } from './ZebraBg'
import catImg from '../../images/cat.webp'
import likeImg from '../../images/like.webp'
import { Waves } from './Waves'
import pochtaRusImg from '../../images/pochta_rus.svg'
import cdekLogoWhite from '../../images/cdek-logo_white.svg'
import { DpdCard } from '@/components/services/DpdCard'
import tgLogo from '../../images/tg_logo.svg'
import dronImg from '../../images/dron_04.png'
import { useInViewport } from '@/hooks/useInViewport'
import { useSaveGpuMode } from '@/hooks/usePerfBudget'
import { usePerfTier } from '@/context/PerfTierContext'
import { cardEnterMotion, sectionHeaderMotion } from '@/lib/motionByTier'
import { AiPromoCard } from '@/components/services/AiPromoCard'
import type { ServiceAllItem, ServiceAllVariant } from '@/types/services'
import { withBasePath } from '@/lib/appBasename'

function ArrowCard({ s, inView, delay }: { s: typeof services[0]; inView: boolean; delay: number }) {
  const [hovered, setHovered] = useState(false)
  const tier = usePerfTier()

  return (
    <motion.a
      href={(s as any).link ?? '#contact'}
      target={(s as any).link ? '_blank' : undefined}
      rel={(s as any).link ? 'noopener noreferrer' : undefined}
      {...cardEnterMotion(tier, inView, delay)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-2xl p-6 flex flex-col justify-between overflow-hidden cursor-pointer border border-[#4a72f5]"
      style={{ backgroundColor: '#315bea' }}
    >
      {/* Arrow — slides in on hover, clipped to card bounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
        <motion.svg
          viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"
          className="absolute"
          style={{ width: '150%', height: '150%', top: '75%', translateY: '-50%' }}
          animate={{ right: hovered ? 'calc(14% - 25px)' : 'calc(-18% - 25px)' }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          <line x1="18" y1="85" x2="78" y2="22" stroke="#ffe11f" strokeWidth="20" strokeLinecap="round"/>
          <line x1="40" y1="22" x2="78" y2="22" stroke="#ffe11f" strokeWidth="20" strokeLinecap="round"/>
          <line x1="78" y1="22" x2="78" y2="60" stroke="#ffe11f" strokeWidth="20" strokeLinecap="round"/>
        </motion.svg>
      </div>

      <div className="flex items-start justify-between relative z-20">
        <span className="hidden font-display font-black text-4xl leading-none text-white/40">{s.n}</span>
        <ArrowUpRight size={16} className="text-white/60" />
      </div>
      <div className="relative z-20">
        <div className="bg-black/30 backdrop-blur-sm rounded-xl px-3 py-2 flex flex-col gap-1.5">
          <span className="service-card-tag tag text-white/80">{s.tag}</span>
          <h3 className="service-card-title text-white whitespace-pre-line">{s.title}</h3>
          <p className="service-card-copy text-white/90 line-clamp-2">{s.desc}</p>
          <span className="service-card-price text-[#ffe11f]">{s.price}</span>
        </div>
      </div>
    </motion.a>
  )
}

function LogisticsCard({ s, inView, delay }: { s: any; inView: boolean; delay: number }) {
  const tier = usePerfTier()
  return (
    <motion.a href={(s as any).link ?? '#contact'}
      target={(s as any).link ? '_blank' : undefined}
      rel={(s as any).link ? 'noopener noreferrer' : undefined}
      {...cardEnterMotion(tier, inView, delay)}
      className="relative lg:col-span-2 lg:row-span-2 h-full rounded-2xl p-7 flex flex-col justify-between overflow-hidden group cursor-pointer border-2 border-[#6db7ff]/30"
      style={{ backgroundColor: '#0088d8' }}
    >
      <Waves strokeColor="#6db7ff" backgroundColor="#0088d8" />

      {/* Топографический атлас — скрыт, заменён на Waves */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none hidden" viewBox="0 0 600 420" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="#6db7ff" strokeWidth="1" opacity="0.75">

          {/* Главный массив — уходит за левый и верхний края */}
          <g style={{animation:'atlas-drift 14s ease-in-out infinite'}}>
            <path d="M -10,110 C 5,38 65,-8 148,6 C 231,20 298,-2 346,44 C 394,90 392,162 368,212 C 344,262 292,294 235,298 C 178,302 112,285 68,252 C 24,219 -10,190 -10,110 Z"/>
            <path d="M 14,118 C 28,60 82,22 158,34 C 234,46 294,28 336,68 C 378,108 376,167 354,210 C 332,253 286,280 235,284 C 184,288 124,272 84,244 C 44,216 0,182 14,118 Z"/>
            <path d="M 40,126 C 52,80 98,48 166,58 C 234,68 288,54 324,89 C 360,124 358,173 339,209 C 320,245 279,267 233,271 C 187,275 133,260 97,236 C 61,212 28,176 40,126 Z"/>
            <path d="M 65,135 C 75,100 114,74 174,83 C 234,92 282,80 312,110 C 342,140 340,178 323,208 C 306,238 270,256 231,259 C 192,262 143,248 111,228 C 79,208 55,170 65,135 Z"/>
            <path d="M 89,144 C 97,118 130,99 182,107 C 234,115 275,105 300,131 C 325,157 323,184 308,208 C 293,232 263,246 230,249 C 197,252 153,238 125,221 C 97,204 81,164 89,144 Z"/>
            <path d="M 112,153 C 118,133 146,117 189,124 C 232,131 267,124 287,147 C 307,170 305,191 292,210 C 279,229 254,240 228,243 C 202,246 163,233 139,218 C 115,203 106,167 112,153 Z"/>
            <path d="M 133,162 C 138,147 161,135 197,141 C 233,147 261,142 278,162 C 295,182 293,199 281,215 C 269,231 248,239 226,241 C 204,243 172,232 152,218 C 132,204 128,171 133,162 Z"/>
            <path d="M 154,172 C 158,160 176,151 205,156 C 234,161 255,158 269,174 C 283,190 281,205 270,219 C 259,233 241,239 223,241 C 205,243 180,233 165,221 C 150,209 150,178 154,172 Z"/>
          </g>

          {/* Правый хребет — уходит за верхний и правый края */}
          <g style={{animation:'atlas-drift2 11s ease-in-out infinite'}}>
            <path d="M 440,-10 C 492,-8 572,24 596,78 C 620,132 608,198 577,232 C 546,266 508,270 472,255 C 436,240 412,208 408,170 C 404,132 412,96 440,-10 Z"/>
            <path d="M 454,8 C 502,4 572,34 593,84 C 614,134 604,193 575,224 C 546,255 510,259 476,245 C 442,231 421,202 418,167 C 415,132 422,98 454,8 Z"/>
            <path d="M 468,26 C 512,22 572,50 590,96 C 608,142 598,188 572,216 C 546,244 512,248 480,235 C 448,222 430,196 428,164 C 426,132 432,100 468,26 Z"/>
            <path d="M 481,44 C 521,42 570,66 586,108 C 602,150 593,188 568,212 C 543,236 512,239 482,227 C 452,215 437,191 436,162 C 435,133 442,98 481,44 Z"/>
            <path d="M 493,64 C 529,62 568,84 582,122 C 596,160 588,190 564,210 C 540,230 512,233 484,222 C 456,211 444,188 443,162 C 442,136 450,100 493,64 Z"/>
            <path d="M 505,84 C 537,82 566,102 578,136 C 590,170 583,196 561,213 C 539,230 513,232 487,222 C 461,212 450,191 450,166 C 450,141 458,104 505,84 Z"/>
          </g>

          {/* Изолированный холм центр */}
          <g style={{animation:'atlas-drift 9s ease-in-out infinite reverse'}}>
            <path d="M 248,310 C 238,278 255,250 292,240 C 329,230 366,240 382,264 C 398,288 392,318 372,334 C 352,350 322,352 298,342 C 274,332 258,342 248,310 Z"/>
            <path d="M 260,313 C 252,286 267,262 299,253 C 331,244 363,253 377,274 C 391,295 385,321 367,335 C 349,349 323,351 301,342 C 279,333 268,340 260,313 Z"/>
            <path d="M 271,316 C 264,293 277,273 305,265 C 333,257 360,265 372,284 C 384,303 378,325 362,337 C 346,349 323,350 303,342 C 283,334 278,339 271,316 Z"/>
            <path d="M 282,320 C 276,301 287,283 311,276 C 335,269 358,277 368,294 C 378,311 372,330 357,340 C 342,350 322,350 305,342 C 288,334 288,339 282,320 Z"/>
            <path d="M 292,324 C 287,309 296,294 316,288 C 336,282 355,290 363,304 C 371,318 365,334 352,342 C 339,350 322,349 307,342 C 292,335 297,339 292,324 Z"/>
          </g>

          {/* Нижний рельеф уходит за край */}
          <g style={{animation:'atlas-drift2 17s ease-in-out infinite'}} opacity="0.8">
            <path d="M 80,430 C 70,400 90,374 138,362 C 186,350 244,358 288,376 C 332,394 356,422 370,450"/>
            <path d="M 90,430 C 82,406 100,382 144,371 C 188,360 244,367 286,384 C 328,401 350,426 362,450"/>
            <path d="M 102,430 C 95,410 111,389 152,379 C 193,369 244,376 284,392 C 324,408 345,430 354,450"/>
            <path d="M 116,430 C 110,414 124,396 161,387 C 198,378 244,385 282,400 C 320,415 340,434 346,450"/>
          </g>

          {/* Тонкие фоновые горизонтали */}
          <g style={{animation:'atlas-drift 28s ease-in-out infinite'}} opacity="0.35" strokeWidth="0.8">
            <path d="M -10,44 C 55,28 125,50 195,36 C 265,22 340,46 415,32 C 490,18 555,40 620,28"/>
            <path d="M -10,68 C 60,54 130,74 200,62 C 270,50 345,72 418,60 C 491,48 555,68 620,57"/>
            <path d="M -10,360 C 58,348 128,366 198,356 C 268,346 342,364 415,354 C 488,344 554,360 620,351"/>
            <path d="M -10,385 C 60,374 130,391 200,382 C 270,373 342,389 415,380 C 488,371 554,386 620,378"/>
          </g>
        </g>
      </svg>

      {/* Котик */}
      <img
        src={catImg}
        alt="cat"
        className="absolute pointer-events-none"
        style={{ right: '-8%', bottom: 0, height: '85%', width: 'auto', objectFit: 'contain', objectPosition: 'bottom right', zIndex: 1 }}
      />

      <div className="flex items-start justify-between relative z-10">
        <span className="hidden font-display font-black text-6xl text-white/20 leading-none">{s.n}</span>
        <ArrowUpRight size={20} className="text-white/60 group-hover:text-white transition-colors" />
      </div>
      <div className="relative z-10">
        <span className="service-card-tag tag text-white/60 block mb-3">{s.tag}</span>
        <h3 className="service-card-title text-white mb-3 whitespace-pre-line">{s.title}</h3>
        <p className="service-card-copy text-white/70 mb-4 max-w-xs">{s.desc}</p>
        <span className="service-card-price text-white">{s.price}</span>
      </div>
    </motion.a>
  )
}

// ── Переиспользуемая карточка featured (01) ──────────────
function FeaturedCard({ s0, inView, delay, bg, showRuble, videoBg, logoSrc, logoFilter, extraClass = 'lg:col-span-2 lg:row-span-2', rubleCompact = false }: {
  s0: typeof services[0]; inView: boolean; delay: number
  bg: string; showRuble: boolean
  videoBg?: string
  logoSrc?: string
  /** Фильтр декоративного логотипа (например, белый силуэт на цветном фоне) */
  logoFilter?: string
  extraClass?: string
  rubleCompact?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const tier = usePerfTier()
  const href = (s0 as { link?: string }).link
  const isLink = Boolean(href)
  const Wrapper = isLink ? motion.a : motion.div
  const linkProps = isLink
    ? { href, target: '_blank' as const, rel: 'noopener noreferrer' }
    : {}
  const soon = Boolean((s0 as { soon?: boolean }).soon)

  return (
    <CursorTooltip text={s0.desc}>
      <Wrapper
        {...linkProps}
        {...cardEnterMotion(tier, inView, delay)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`relative border-2 border-cream/30 rounded-2xl p-7 flex flex-col justify-between overflow-hidden group ${isLink ? 'cursor-pointer' : 'cursor-default'} ${extraClass}`}
        style={{ background: bg }}
      >
        {videoBg && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
            {/* Обёртка с blur: при размытии края «светятся» — слегка увеличиваем слой */}
            <div
              className="absolute"
              style={{
                inset: '-8%',
                filter: hovered ? 'blur(11px)' : 'blur(3px)',
                transition: 'filter 0.55s cubic-bezier(0.22, 0.8, 0.2, 1)',
              }}
            >
              <iframe
                src={`${videoBg}?autoplay=1&loop=1&muted=1&controls=0&playsinline=1`}
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write;"
                title="background video"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  minWidth: '100%',
                  minHeight: '100%',
                  width: 'auto',
                  height: 'auto',
                  aspectRatio: '16 / 9',
                  transform: 'translate(-50%, -50%)',
                  border: 0,
                  pointerEvents: 'none',
                }}
              />
            </div>
            {/* Затемнение для читаемости текста поверх видео */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.7) 100%)',
              }}
            />
          </div>
        )}
        {logoSrc && (
          <div className="absolute pointer-events-none select-none inset-0 overflow-hidden rounded-2xl">
            <img
              src={logoSrc}
              alt=""
              aria-hidden="true"
              className="absolute"
              style={{
                right: '-6%',
                bottom: '-8%',
                width: '70%',
                height: 'auto',
                opacity: 1,
                transform: hovered ? 'scale(1.06) rotate(-3deg)' : 'scale(1) rotate(-3deg)',
                transition: 'transform 0.8s cubic-bezier(0.22, 0.8, 0.2, 1)',
                filter: logoFilter,
              }}
            />
          </div>
        )}
        {showRuble && (
          <div className="absolute pointer-events-none select-none font-black leading-none"
            style={{
              right: '-4%', bottom: 'calc(-18% - 12px)',
              fontSize: rubleCompact ? 'clamp(280px, 38vw, 520px)' : 'clamp(280px, 35vw, 520px)',
              fontFamily: 'Unbounded, sans-serif',
              transform: hovered ? 'scale(1.5)' : 'scale(1)',
              transformOrigin: 'right bottom',
              transition: hovered ? 'transform 120s cubic-bezier(0.25,0,0,1)' : 'transform 6s cubic-bezier(0.25,0,0,1)',
              textShadow: ['2px 2px 0 #e04800','4px 4px 0 #cc4000','6px 6px 0 #b83800','8px 8px 0 #a43000','10px 10px 0 #902800','12px 12px 0 #7c2000','14px 14px 20px rgba(0,0,0,0.4)'].join(', '),
            }}
          ><span className="ruble-char">₽</span></div>
        )}
        <div className="relative z-10 flex items-start justify-between">
          <span className="hidden font-display font-black text-6xl text-cream/20 leading-none">{s0.n}</span>
          {isLink ? (
            <ArrowUpRight size={20} className="text-cream/60 group-hover:text-cream transition-colors" />
          ) : (
            <span aria-hidden="true" className="w-5 h-5" />
          )}
        </div>
        <div className="relative z-10">
          <span className="service-card-tag tag text-cream/50 block mb-3">{s0.tag}</span>
          <h3 className="service-card-title text-cream mb-3 whitespace-pre-line">{s0.title}</h3>
          <p className="service-card-copy text-cream/70 mb-4 max-w-xs">{s0.desc}</p>
          {soon ? (
            <span className="service-card-price uppercase tracking-[0.14em] text-cream">
              УЖЕ СКОРО
            </span>
          ) : (
            <span className="service-card-price text-cream">{s0.price}</span>
          )}
        </div>
      </Wrapper>
    </CursorTooltip>
  )
}

// ── Стандартная карточка ──────────────────────────────────
function StandardCard({ s, inView, delay, extraClass = '', bgLayer, theme = 'auto', invertOnHover = false }: { s: typeof services[0]; inView: boolean; delay: number; extraClass?: string; bgLayer?: React.ReactNode; theme?: 'auto' | 'dark' | 'light'; invertOnHover?: boolean }) {
  const resolvedTheme: 'dark' | 'light' = theme === 'auto' ? (bgLayer ? 'dark' : 'light') : theme
  const isLight = resolvedTheme === 'light' && bgLayer
  const isDarkBg = resolvedTheme === 'dark' && bgLayer
  // На ховере (для карточки 02) меняем белый текст на синий — как фон у орла
  const inv = invertOnHover && isDarkBg
  const tier = usePerfTier()
  return (
    <CursorTooltip text={s.desc}>
      <motion.a href={(s as any).link ?? '#contact'}
        target={(s as any).link ? '_blank' : undefined}
        rel={(s as any).link ? 'noopener noreferrer' : undefined}
        {...cardEnterMotion(tier, inView, delay)}
        className={`relative rounded-2xl p-6 flex flex-col justify-between overflow-hidden group cursor-pointer border border-edge hover:border-muted transition-colors duration-300 ${bgLayer ? '' : 'bg-card'} ${extraClass}`}
      >
        {bgLayer}
        <div className="flex items-start justify-between relative z-10">
          <span className={`hidden font-display font-black text-4xl leading-none transition-colors duration-500 ${
            isDarkBg
              ? `text-white/30 ${inv ? 'group-hover:text-[#1928dc]/40' : ''}`
              : isLight ? 'text-ink/30' : 'text-muted'
          }`}>{s.n}</span>
          <ArrowUpRight size={16} className={
            isDarkBg
              ? `text-white/50 transition-colors duration-500 ${inv ? 'group-hover:text-[#1928dc]' : 'group-hover:text-white'}`
              : isLight ? 'text-ink/40 group-hover:text-ink transition-colors'
              : 'text-muted group-hover:text-fire transition-colors'
          } />
        </div>
        <div className="relative z-10">
          <span className={`service-card-tag tag block mb-2 transition-colors duration-500 ${
            isDarkBg ? `text-white/60 ${inv ? 'group-hover:text-[#1928dc]/70' : ''}` : isLight ? 'text-ink/60' : ''
          }`}>{s.tag}</span>
          <h3 className={`service-card-title mb-2 whitespace-pre-line transition-colors duration-500 ${
            isDarkBg ? `text-white ${inv ? 'group-hover:text-[#1928dc]' : ''}` : isLight ? 'text-ink' : 'text-cream'
          }`}>{s.title}</h3>
          <p className={`service-card-copy mb-3 line-clamp-3 transition-colors duration-500 ${
            isDarkBg ? `text-white/70 ${inv ? 'group-hover:text-[#1928dc]/80' : ''}` : isLight ? 'text-ink/70' : 'text-dim'
          }`}>{s.desc}</p>
          <span className={`service-card-price transition-colors duration-500 ${
            isDarkBg ? `text-white/90 ${inv ? 'group-hover:text-[#1928dc]' : ''}` : isLight ? 'text-ink/80' : 'text-mid'
          }`}>{s.price}</span>
        </div>
      </motion.a>
    </CursorTooltip>
  )
}

function LiquidAuroraWhiteBg() {
  const tier = usePerfTier()
  const minimal = tier === 'minimal'
  const rootRef = useRef<HTMLDivElement>(null)
  const inView = useInViewport(rootRef, { rootMargin: '100px' })
  const saveGpu = useSaveGpuMode()
  const [hovered, setHovered] = useState(false)
  const motionOff = !inView || !hovered || saveGpu || minimal

  useEffect(() => {
    if (saveGpu || minimal) return
    const root = rootRef.current
    if (!root) return
    const card = root.parentElement as HTMLElement | null
    if (!card) return

    let raf = 0
    const setVars = (nx: number, ny: number) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        root.style.setProperty('--mx', String(nx))
        root.style.setProperty('--my', String(ny))
      })
    }
    const onMove = (e: MouseEvent) => {
      setHovered(true)
      const r = card.getBoundingClientRect()
      const nx = (e.clientX - r.left - r.width / 2) / (r.width / 2)
      const ny = (e.clientY - r.top - r.height / 2) / (r.height / 2)
      setVars(Math.max(-1, Math.min(1, nx)), Math.max(-1, Math.min(1, ny)))
    }
    const onLeave = () => {
      setHovered(false)
      setVars(0, 0)
    }

    card.addEventListener('mousemove', onMove)
    card.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      card.removeEventListener('mousemove', onMove)
      card.removeEventListener('mouseleave', onLeave)
    }
  }, [saveGpu, minimal])

  if (minimal) {
    return (
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#dff6ff] via-white to-[#ffe8ef]"
        aria-hidden
      />
    )
  }

  return (
    <div
      ref={rootRef}
      className={`liquid-aurora-card absolute inset-0 ${motionOff ? 'is-paused' : ''} ${saveGpu ? 'liquid-aurora-lite' : ''}`}
    >
      <div className="liquid-shape-pos shape-1"><div className="liquid-shape" /></div>
      <div className="liquid-shape-pos shape-2"><div className="liquid-shape" /></div>
      <div className="liquid-shape-pos shape-3"><div className="liquid-shape" /></div>
      <div className="liquid-shape-pos shape-4"><div className="liquid-shape" /></div>
    </div>
  )
}

function RussiaCrestBg() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const card = root.parentElement as HTMLElement | null
    if (!card) return
    const onEnter = () => setHovered(true)
    const onLeave = () => setHovered(false)
    card.addEventListener('mouseenter', onEnter)
    card.addEventListener('mouseleave', onLeave)
    return () => {
      card.removeEventListener('mouseenter', onEnter)
      card.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  const BG_BLUE = '#1928dc'
  const BG_WHITE = '#ffffff'

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 overflow-hidden"
      style={{
        backgroundColor: hovered ? BG_WHITE : BG_BLUE,
        transition: 'background-color 0.6s ease',
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        style={{
          opacity: hovered ? 1 : 0.28,
          backgroundColor: hovered ? BG_BLUE : BG_WHITE,
          WebkitMaskImage: `url(${pochtaRusImg})`,
          maskImage: `url(${pochtaRusImg})`,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center center',
          maskPosition: 'center center',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          transformOrigin: 'center center',
          transform: hovered
            ? 'translate(50%, -10%) scale(1.75)'
            : 'translate(50%, -10%) scale(1)',
          transition: hovered
            ? 'transform 60s linear, background-color 0.6s ease, opacity 0.6s ease'
            : 'transform 0.6s cubic-bezier(.2,.8,.2,1), background-color 0.6s ease, opacity 0.6s ease',
        }}
      />
    </div>
  )
}

function AvitoCard({ s, inView, delay }: { s: typeof services[0]; inView: boolean; delay: number }) {
  const tier = usePerfTier()
  const minimal = tier === 'minimal'
  const [hovered, setHovered] = useState(false)

  return (
    <CursorTooltip text={s.desc}>
      <motion.a
        href={withBasePath((s as { link?: string }).link ?? '/avito')}
        {...cardEnterMotion(tier, inView, delay)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative rounded-2xl p-6 flex flex-col justify-between overflow-hidden group cursor-pointer border border-white/40 hover:border-white transition-colors duration-300"
      >
        <LiquidAuroraWhiteBg />

        <div className="flex items-start justify-between relative z-[1]">
          <span className="hidden font-display font-black text-4xl leading-none text-ink/30">{s.n}</span>
          <ArrowUpRight size={16} className="text-ink/40 group-hover:text-ink transition-colors" />
        </div>
        <div className="relative z-[1]">
          <span className="service-card-tag tag block mb-2 text-ink/60">{s.tag}</span>
          <h3 className="service-card-title text-ink mb-2 whitespace-pre-line">{s.title}</h3>
          <p className="service-card-copy text-ink/70 mb-3 line-clamp-3">{s.desc}</p>
          <span className="service-card-price text-ink/80">{s.price}</span>
        </div>

        {!minimal && (
          <motion.div
            className="absolute pointer-events-none z-20"
            style={{ right: '-4%', bottom: 0, width: '78%' }}
            initial={false}
            animate={{
              y: hovered ? '0%' : '92%',
              opacity: hovered ? 1 : 0,
            }}
            transition={{
              y: { duration: hovered ? 0.55 : 0.45, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.35 },
            }}
          >
            <motion.img
              src={dronImg}
              alt=""
              className="w-full h-auto select-none block"
              draggable={false}
              animate={{
                y: hovered ? [0, -7, -3, -10, -5, -8, 0] : 0,
              }}
              transition={{
                y: { duration: 4.8, repeat: hovered ? Infinity : 0, ease: 'easeInOut' },
              }}
            />
          </motion.div>
        )}
        {minimal && (
          <img
            src={dronImg}
            alt=""
            className="absolute pointer-events-none z-20 w-[78%] h-auto right-[-4%] bottom-0 select-none"
            draggable={false}
          />
        )}
      </motion.a>
    </CursorTooltip>
  )
}

function TelegramPlaneBg() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-card">
      <img
        src={tgLogo}
        alt=""
        aria-hidden="true"
        className="tg-plane absolute pointer-events-none select-none"
        style={{
          right: '-6%',
          bottom: '-7%',
          width: '56%',
          height: 'auto',
          opacity: 0.25,
          filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.45))',
          transform: 'translate3d(0, 0, 0) rotate(-8deg) scale(1)',
          transformOrigin: '65% 65%',
        }}
      />
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// BentoGridServices — блок «04 сервиса»
// ══════════════════════════════════════════════════════════
function BentoGridServices({ items, inView }: { items: typeof services; inView: boolean }) {
  // Скрытые карточки остаются в данных, но не рисуются — их вернём позже.
  const visible = items.filter((s) => !s.hidden)
  const compact = visible.length <= 3

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${compact ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} auto-rows-[minmax(200px,auto)] gap-3`}>
      <FeaturedCard
        s0={visible[0]}
        inView={inView}
        delay={0}
        bg="#1ab248"
        showRuble={false}
        logoSrc={cdekLogoWhite}
        extraClass={visible.length <= 2 ? 'lg:col-span-2 lg:row-span-2' : 'lg:row-span-2'}
      />
      {visible.slice(1).map((s, i) => {
        if (s.n === '02') {
          return (
            <StandardCard
              key={s.n}
              s={s}
              inView={inView}
              delay={(i + 1) * 0.06}
              extraClass="lg:row-span-2 border-[#2b39ea] hover:border-[#4453ff]"
              bgLayer={<RussiaCrestBg />}
              invertOnHover
            />
          )
        }
        if (s.n === '05') {
          return (
            <DpdCard
              key={s.n}
              s={s}
              inView={inView}
              delay={(i + 1) * 0.06}
            />
          )
        }
        if (s.n === '03') {
          return (
            <AvitoCard
              key={s.n}
              s={s}
              inView={inView}
              delay={(i + 1) * 0.06}
            />
          )
        }
        if (s.n === '04') {
          return (
            <StandardCard
              key={s.n}
              s={s}
              inView={inView}
              delay={(i + 1) * 0.06}
              bgLayer={<TelegramPlaneBg />}
            />
          )
        }
        return <StandardCard key={s.n} s={s} inView={inView} delay={(i + 1) * 0.06} />
      })}
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// BentoGridAll — блок «Услуги»
// ══════════════════════════════════════════════════════════
function SermCard({ s, inView, delay }: { s: any; inView: boolean; delay: number }) {
  const tier = usePerfTier()
  const minimal = tier === 'minimal'
  const [hovered, setHovered] = useState(false)
  const [starsGold, setStarsGold] = useState([false, false, false, false, false])

  useEffect(() => {
    if (!hovered) {
      setStarsGold([false, false, false, false, false])
      return
    }
    setStarsGold([false, false, false, false, false])
    const timers = [0, 1, 2, 3, 4].map((i) =>
      window.setTimeout(() => {
        setStarsGold((prev) => {
          const next = [...prev]
          next[i] = true
          return next
        })
      }, 260 + i * 120)
    )
    return () => timers.forEach(clearTimeout)
  }, [hovered])
  return (
    <motion.a href={(s as any).link ?? '#contact'}
      target={(s as any).link ? '_blank' : undefined}
      rel={(s as any).link ? 'noopener noreferrer' : undefined}
      {...cardEnterMotion(tier, inView, delay)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-2xl p-6 flex flex-col justify-between overflow-hidden group cursor-pointer bg-[#f0ede6] border border-transparent hover:border-[#e0ddd6] transition-colors duration-300"
    >
      {!minimal && (
        <>
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-2xl"
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background: 'radial-gradient(ellipse 80% 70% at 70% 30%, rgba(255,180,0,0.28) 0%, transparent 70%)',
              filter: 'blur(12px)',
            }}
          />
          <motion.div
            className="absolute pointer-events-none"
            style={{ width: '60%', right: '-5%', top: '-8%' }}
            animate={{
              filter: hovered
                ? 'drop-shadow(0 0 22px rgba(255,190,80,0.55)) drop-shadow(0 18px 36px rgba(0,0,0,0.24))'
                : 'drop-shadow(0 16px 32px rgba(0,0,0,0.22))',
            }}
            transition={{ duration: hovered ? 1.35 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.img
              src={likeImg}
              alt=""
              className="w-full h-auto select-none block"
              animate={{
                y: hovered ? [0, -5, -2, -8, -4, -6, 0] : 0,
                rotate: hovered ? [-8, -6.6, -7.2, -5.9, -6.8, -6.2, -8] : -8,
                scale: hovered ? 1.05 : 1,
              }}
              transition={{
                y: { duration: 5.2, repeat: hovered ? Infinity : 0, ease: 'easeInOut' },
                rotate: { duration: 5.2, repeat: hovered ? Infinity : 0, ease: 'easeInOut' },
                scale: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
              }}
            />
          </motion.div>
        </>
      )}
      {minimal && (
        <img
          src={likeImg}
          alt=""
          className="absolute pointer-events-none w-[60%] h-auto right-[-5%] top-[-8%] select-none"
        />
      )}

      <div className="flex items-start justify-between relative z-10">
        <span className="hidden font-display font-black text-4xl leading-none text-ink/20">{s.n}</span>
        <ArrowUpRight size={16} className="text-ink/40 group-hover:text-ink transition-colors" />
      </div>
      <div className="relative z-10">
        <span className="service-card-tag tag block mb-2 text-ink/50">{s.tag}</span>
        <div className="flex items-center flex-wrap gap-x-1.5 gap-y-1 mb-2">
          <h3 className="service-card-title text-ink shrink-0">{s.title}</h3>
          {!minimal && (
          <motion.div
            className="flex gap-1 items-center shrink-0 overflow-hidden"
            initial={false}
            animate={{
              opacity: hovered ? 1 : 0,
              x: hovered ? 0 : 10,
              maxWidth: hovered ? 160 : 0,
            }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <Star
                key={i}
                size={17}
                strokeWidth={1.9}
                className="shrink-0 transition-[fill,stroke] duration-[480ms] ease-out"
                fill={starsGold[i] ? '#facc15' : '#171717'}
                stroke={starsGold[i] ? '#ca8a04' : '#171717'}
              />
            ))}
          </motion.div>
          )}
          {minimal && (
            <div className="flex gap-1 items-center shrink-0" aria-hidden>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={17} strokeWidth={1.9} className="shrink-0" fill="#171717" stroke="#171717" />
              ))}
            </div>
          )}
        </div>
        <p className="service-card-copy text-ink/60 mb-3 line-clamp-2">{s.desc}</p>
        <span className="service-card-price text-ink/70">{s.price}</span>
      </div>
    </motion.a>
  )
}

function Object8Card({ s, inView, delay }: { s: any; inView: boolean; delay: number }) {
  const tier = usePerfTier()

  return (
    <CursorTooltip text={s.desc}>
      <motion.a
        href={(s as any).link}
        target="_blank"
        rel="noopener noreferrer"
        {...cardEnterMotion(tier, inView, delay)}
        className="relative col-span-full rounded-2xl overflow-hidden group cursor-pointer bg-card border border-[#89e526] transition-colors duration-300 hover:border-[#27e6e9] px-5 py-5 sm:px-7 sm:py-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
      >
        <div className="absolute inset-0 hidden sm:block">
          <CodeTypingBg active={true} />
        </div>

        <ArrowUpRight size={16} className="absolute top-4 right-4 z-10 text-[#89e526] group-hover:text-[#27e6e9] transition-colors" />

        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-edge px-2 text-[11px] font-display font-black leading-none text-mid sm:hidden">
          •
        </span>

        <div className="hidden sm:block flex-1" />
        <span className="hidden font-display font-black text-4xl leading-none text-muted shrink-0 relative z-10">{s.n}</span>
        <div className="hidden sm:block w-px h-10 bg-edge shrink-0 relative z-10" />

        <div className="shrink-0 flex flex-col gap-1 relative z-10 max-w-full sm:max-w-[420px]">
          <span className="service-card-tag tag">{s.tag}</span>
          <h3 className="service-card-title" style={{ color: '#27E7EA' }}>{s.title}</h3>
          <p className="service-card-copy text-dim mt-0.5 sm:max-w-[260px]">{s.desc}</p>
          <span className="service-card-price mt-2" style={{ color: '#27e6e9' }}>
            Подробнее <ExternalLink size={12} aria-hidden="true" />
          </span>
        </div>
      </motion.a>
    </CursorTooltip>
  )
}

function BentoGridAll({ items, inView }: { items: ServiceAllItem[]; inView: boolean }) {
  const tier = usePerfTier()
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(200px,auto)] gap-3">
      {items.map((s, i) => {
        const delay = i * 0.06
        const variant: ServiceAllVariant = s.variant

        switch (variant) {
          case 'ai':
            return <AiPromoCard key={s.n} s={s} inView={inView} delay={delay} />
          case 'zebra':
            return (
              <CursorTooltip key={s.n} text={s.desc}>
                <motion.a href={s.link ?? '#contact'}
                  target={s.link ? '_blank' : undefined}
                  rel={s.link ? 'noopener noreferrer' : undefined}
                  {...cardEnterMotion(tier, inView, delay)}
                  className="relative rounded-2xl p-6 flex flex-col justify-between overflow-hidden group cursor-pointer border-2 border-white/20"
                >
                  <ZebraBg />
                  <div className="flex items-start justify-between relative z-20">
                    <span className="hidden font-display font-black text-4xl leading-none text-white/50">{s.n}</span>
                    <ArrowUpRight size={16} className="text-white/80" />
                  </div>
                  <div className="relative z-20 flex flex-col items-start gap-2">
                    <span className="service-card-tag tag text-white/80 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded max-w-full">{s.tag}</span>
                    <h3 className="service-card-title text-white whitespace-pre-line bg-black/30 backdrop-blur-sm px-2 py-1 rounded max-w-full">{s.title}</h3>
                    <p className="service-card-copy line-clamp-2 text-white/90 bg-black/30 backdrop-blur-sm px-2 py-1 rounded max-w-full">{s.desc}</p>
                    <span className="service-card-price text-white">{s.price}</span>
                  </div>
                </motion.a>
              </CursorTooltip>
            )
          case 'arrow':
            return <CursorTooltip key={s.n} text={s.desc}><ArrowCard s={s as typeof services[0]} inView={inView} delay={delay} /></CursorTooltip>
          case 'logistics':
            return <CursorTooltip key={s.n} text={s.desc}><LogisticsCard s={s} inView={inView} delay={delay} /></CursorTooltip>
          case 'designer':
            return (
              <StandardCard
                key={s.n}
                s={s as typeof services[0]}
                inView={inView}
                delay={delay}
                extraClass="lg:col-span-2"
                bgLayer={<CardMeshShaderBg />}
              />
            )
          case 'accounting':
            return (
              <FeaturedCard
                key={s.n}
                s0={s as typeof services[0]}
                inView={inView}
                delay={delay}
                bg="#ff5a00"
                showRuble
                extraClass="lg:col-span-3"
                rubleCompact
              />
            )
          case 'serm':
            return (
              <CursorTooltip key={s.n} text={s.desc}>
                <SermCard s={s} inView={inView} delay={delay} />
              </CursorTooltip>
            )
          case 'it':
            return <Object8Card key={s.n} s={s} inView={inView} delay={delay} />
          default: {
            const exhaustive: never = variant
            return exhaustive
          }
        }
      })}
    </div>
  )
}

const services = [
  {
    n: '01', tag: 'Автоматизация',
    title: 'Интеграция\nСДЭК × Ozon',
    price: 'от 3 800 ₽/мес',
    desc: 'Сервис для продавцов OZON, который автоматически создаёт накладные в Вашем ЛК СДЭК.',
    size: 'lg',
    accent: true,
    link: 'https://cdek-ozon.ru/',
  },
  {
    n: '02', tag: 'Автоматизация',
    title: 'Интеграция\nПочта России × Ozon',
    price: 'от 3 800 ₽/мес',
    desc: 'Сервис для продавцов OZON, который автоматически создаёт накладные в Вашем ЛК Почты РФ.',
    size: 'md',
  },
  {
    n: '05', tag: 'Автоматизация',
    title: 'Интеграция\nDPD × Ozon',
    price: 'БЕСПЛАТНО',
    desc: 'Сервис для продавцов OZON, который автоматически создаёт накладные в Вашем ЛК DPD.',
    size: 'md',
    link: 'https://dpd-ozon.ru',
  },
  // Временно скрыты с сайта — карточки и код не удалять.
  {
    n: '03', tag: 'Коммуникация',
    title: 'Авито мультичат',
    price: 'от 1 000 ₽',
    desc: 'Собирает все чаты магазинов Авито в один чат Telegram — отвечайте покупателям из одного окна.',
    size: 'sm',
    link: '/avito',
    hidden: true,
  },
  {
    n: '04', tag: 'Лидогенерация',
    title: 'Парсер\nТелеграм-бот',
    price: 'от 10 000 ₽',
    desc: 'Генерация лидов под Вашу нишу из тематических ТГ-чатов.',
    size: 'sm',
    hidden: true,
  },
]

const servicesAll: ServiceAllItem[] = [
  {
    n: '01', tag: 'GEO / AEO',
    title: 'Продвижение\nв ИИ',
    price: 'Под запрос',
    desc: 'Попадание в ответы ChatGPT, Алисы и Google AI. Нейросети рекомендуют вашу компанию.',
    size: 'lg',
    variant: 'ai',
    link: 'https://pro-adv.ru/geo-aeo-prodvizhenie',
  },
  {
    n: '02', tag: 'Продажи',
    title: 'Wildberries\nи Ozon',
    price: 'от 50 000 ₽',
    desc: 'Запуск и ведение под ключ с результатом.',
    size: 'md',
    variant: 'zebra',
    link: 'https://ozonwb.ru/',
  },
  {
    n: '03', tag: 'Продажи',
    title: 'Реклама в Яндекс',
    price: 'от 20 000 ₽/мес',
    desc: 'Настройка и сопровождение рекламных кампаний: снижаем долю нецелевых кликов, строим управляемый CPL.',
    size: 'sm',
    variant: 'arrow',
    link: 'https://белая-коробка.рф/target',
  },
  {
    n: '04', tag: 'Для продавцов',
    title: 'Логистика\n из Китая',
    price: 'Под запрос',
    desc: 'Поиск, проверка, выкуп и доставка товара из Китая - полное сопровождение.',
    size: 'lg',
    variant: 'logistics',
    link: 'https://575cargo.ru/',
  },
  {
    n: '05', tag: 'Лицо вашего бизнеса',
    title: 'Аутсорс\nдизайнера',
    price: 'от 5 000 ₽',
    desc: 'Сайт, приложение или софт любой сложности с современным дизайном — от 5 дней. Разрабатываем быстро и точно: в процессе работаем с ИИ. Кстати, этот сайт собрал наш Дизайнер. Хочешь такой же или лучше? Сделаем!',
    size: 'sm',
    variant: 'designer',
    link: 'https://riosite.ru/',
  },
  {
    n: '06', tag: 'Финансы',
    title: 'Аутсорсинг\nбухгалтерии',
    price: 'от 15 000 ₽',
    desc: 'Отчётность и налоги в ФНС. 10 лет работаем с малым и средним бизнесом.',
    size: 'lg',
    variant: 'accounting',
    accent: true,
    link: 'https://твоя-бухгалтерия.рф/',
  },
  {
    n: '07', tag: 'Репутация',
    title: 'SERM',
    price: 'от 15 000 ₽',
    desc: 'Управление репутацией в поиске и картах. Повышаем рейтинг и доверие клиентов.',
    size: 'sm',
    variant: 'serm',
    link: 'https://белая-коробка.рф/rating',
  },
  {
    n: '08', tag: 'IT',
    title: 'object8.io',
    price: 'Подробнее →',
    desc: 'Разработка IT-решений до 10 раз быстрее и дешевле, благодаря ИИ, а не чуду',
    size: 'sm',
    variant: 'it',
    link: 'https://object8.io/',
  },
]

export default function Services() {
  const ref = useRef(null)
  const ref2 = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const inView2 = useInView(ref2, { once: true, margin: '-60px' })
  const tier = usePerfTier()

  return (
    <section id="services" className="border-t border-edge">

      {/* ── Блок 1: УСЛУГИ ── */}
      <div id="our-all-services" ref={ref2} className="py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-end justify-between mb-12">
            <motion.div
              {...sectionHeaderMotion(tier, inView2)}
            >
              <span className="tag block mb-3">Направления</span>
              <h2 className="font-display font-black text-4xl sm:text-5xl text-cream uppercase leading-none">
                УСЛУГИ
              </h2>
            </motion.div>
            <motion.p
              {...sectionHeaderMotion(tier, inView2, 0.2)}
              className="hidden sm:block text-mid text-sm max-w-xs text-right leading-relaxed"
            >
              Каждое направление — отдельная команда экспертов, нацеленная на результат
            </motion.p>
          </div>
          <BentoGridAll items={servicesAll} inView={inView2} />
        </div>
      </div>

      {/* ── Разделитель ── */}
      <div className="border-t border-edge" />

      {/* ── Блок 2: ПРОДУКТЫ ── */}
      <div id="our-services" ref={ref} className="py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-end justify-between mb-12">
            <motion.div
              {...sectionHeaderMotion(tier, inView)}
            >
              <span className="tag block mb-3">IT-решения</span>
              <h2 className="font-display font-black text-4xl sm:text-5xl text-cream uppercase leading-none">
                ПРОДУКТЫ
              </h2>
            </motion.div>
            <motion.p
              {...sectionHeaderMotion(tier, inView, 0.2)}
              className="hidden sm:block text-mid text-sm max-w-xs text-right leading-relaxed"
            >
              IT-решения, которые экономят время и деньги
            </motion.p>
          </div>
          <BentoGridServices items={services} inView={inView} />
        </div>
      </div>

    </section>
  )
}
