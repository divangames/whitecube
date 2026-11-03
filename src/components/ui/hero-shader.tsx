import { useRef, type CSSProperties, type ReactNode } from 'react'
import { MeshGradient } from '@paper-design/shaders-react'
import { useInViewport, usePrefersReducedMotion } from '@/hooks/useInViewport'
import { useHardwareTier } from '@/hooks/usePerfBudget'

/** Тот же data-URL, что и зернистость в Hero — визуальный шум поверх шейдера */
const GRAIN_DATA_URL = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`

interface ShaderBackgroundProps {
  children?: ReactNode
  className?: string
}

/** Полноразмерный фон (как в демо) */
export function ShaderBackground({ children, className }: ShaderBackgroundProps) {
  return (
    <div className={`relative w-full overflow-hidden ${className ?? 'min-h-[650px]'}`}>
      <svg className="absolute inset-0 size-0" aria-hidden>
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="absolute inset-0 bg-black" />
      <MeshGradient
        className="absolute inset-0 size-full"
        colors={['#000000', '#8b5cf6', '#ffffff', '#1e1b4b', '#4c1d95']}
        speed={0.3}
        distortion={0.75}
        swirl={0.12}
        grainMixer={0.14}
        grainOverlay={0.11}
      />
      <MeshGradient
        className="absolute inset-0 size-full opacity-60"
        colors={['#000000', '#ffffff', '#8b5cf6', '#000000']}
        speed={0.2}
        distortion={0.85}
        swirl={0.08}
        grainMixer={0.1}
        grainOverlay={0.09}
      />

      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.085] mix-blend-overlay"
        style={{
          backgroundImage: GRAIN_DATA_URL,
          backgroundSize: '200px 200px',
        }}
        aria-hidden
      />

      {children}
    </div>
  )
}

/**
 * Двухпалитровый «сквозной» шейдер-фон для секции «Направления» + «Услуги».
 * Палитры кросс-фейдятся по скроллу, поверх — лёгкая точечная сетка.
 *   progress: 0 → палитра A (Направления), 1 → палитра B (Услуги)
 */
const DOT_OVERLAY = `radial-gradient(circle, rgba(255,255,255,0.13) 1px, rgba(255,255,255,0) 1.6px)`

/** CSS-имитация mesh без WebGL — для слабых GPU и режима экономии. */
function MeshStaticFallback({ colors, style }: { colors: string[]; style?: CSSProperties }) {
  const [c0, c1, c2, , c4] = colors
  const cGlow = c4 ?? c2
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        ...style,
        background: `
          radial-gradient(ellipse 95% 75% at 72% 18%, ${c1}72 0%, transparent 52%),
          radial-gradient(ellipse 85% 55% at 18% 82%, ${cGlow}58 0%, transparent 48%),
          radial-gradient(circle at 42% 48%, ${c2}40 0%, transparent 58%),
          linear-gradient(168deg, ${c0} 0%, #030303 55%, #000000 100%)`,
      }}
    />
  )
}

const CARD_MESH_COLORS = ['#000000', '#8b5cf6', '#ffffff', '#1e1b4b', '#4c1d95'] as const

export function SectionedMeshShaderBg({
  progress,
  colorsA = ['#0b0b0b', '#22b7d8', '#0b0b0b', '#155a6b', '#22b7d8'],
  colorsB = ['#030403', '#aa7def', '#030403', '#3d2a5e', '#aa7def'],
  showDots = true,
  single = false,
}: {
  progress: number
  colorsA?: string[]
  colorsB?: string[]
  showDots?: boolean
  /**
   * Если true — рендерится только палитра A (один WebGL-шейдер).
   * Используется на Hero, где `progress` фиксирован и кросс-фейд не нужен.
   * Экономит ~50% GPU.
   */
  single?: boolean
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const inView = useInViewport(wrapRef, { rootMargin: '120px' })
  const reduced = usePrefersReducedMotion()
  const tier = useHardwareTier()
  const t = Math.max(0, Math.min(1, progress))

  const useShader = tier === 'full'
  const showNoiseDots = showDots && tier !== 'minimal'

  // Когда не виден или включён reduced-motion — шейдер замораживаем (speed: 0).
  // Само DOM оставляем, чтобы статичный кадр был виден.
  const speedA = !inView || reduced ? 0 : 0.25
  const speedB = !inView || reduced ? 0 : 0.22

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-black" />

      {useShader ? (
        <>
          {/* Палитра A — Направления */}
          <div className="absolute inset-0" style={{ opacity: single ? 1 : 1 - t, transition: 'opacity 0.18s linear' }}>
            <MeshGradient
              className="absolute inset-0 size-full"
              colors={colorsA}
              speed={speedA}
              distortion={0.85}
              swirl={0.1}
              grainMixer={0.12}
              grainOverlay={0.09}
            />
          </div>

          {/* Палитра B — Услуги (только если не single) */}
          {!single && (
            <div className="absolute inset-0" style={{ opacity: t, transition: 'opacity 0.18s linear' }}>
              <MeshGradient
                className="absolute inset-0 size-full"
                colors={colorsB}
                speed={speedB}
                distortion={0.85}
                swirl={0.12}
                grainMixer={0.12}
                grainOverlay={0.09}
              />
            </div>
          )}
        </>
      ) : (
        <>
          <MeshStaticFallback
            colors={colorsA}
            style={{ opacity: single ? 1 : 1 - t, transition: 'opacity 0.18s linear' }}
          />
          {!single && (
            <MeshStaticFallback colors={colorsB} style={{ opacity: t, transition: 'opacity 0.18s linear' }} />
          )}
        </>
      )}

      {/* Полупрозрачное затемнение — чтобы карточки и текст всегда хорошо читались */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Точечная сетка как на референсе — отключена в minimal (композитинг). */}
      {showNoiseDots && (
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            backgroundImage: DOT_OVERLAY,
            backgroundSize: '22px 22px',
            backgroundPosition: '0 0',
            opacity: 0.55,
            mixBlendMode: 'screen',
          }}
        />
      )}
    </div>
  )
}

/** Фон для карточки SERM: один слой mesh + статический фолбэк вне экрана / на слабом железе. */
export function CardMeshShaderBg() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const inView = useInViewport(wrapRef, { rootMargin: '100px', initialInView: false })
  const reduced = usePrefersReducedMotion()
  const tier = useHardwareTier()

  const runShader = tier === 'full' && inView && !reduced
  const speed = runShader ? 0.26 : 0

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
      <div className="absolute inset-0 bg-black" />
      {runShader ? (
        <MeshGradient
          className="absolute inset-0 size-full"
          colors={[...CARD_MESH_COLORS]}
          speed={speed}
          distortion={0.78}
          swirl={0.1}
          grainMixer={0.1}
          grainOverlay={0.08}
        />
      ) : (
        <MeshStaticFallback colors={[...CARD_MESH_COLORS]} />
      )}
      {tier === 'full' && (
        <div
          className="pointer-events-none absolute inset-0 z-[1] opacity-[0.09] mix-blend-overlay"
          style={{
            backgroundImage: GRAIN_DATA_URL,
            backgroundSize: '200px 200px',
          }}
          aria-hidden
        />
      )}
    </div>
  )
}
