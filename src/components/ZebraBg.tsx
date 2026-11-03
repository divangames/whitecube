import { useEffect, useRef, useId } from 'react'

interface ZebraBgProps {
  color1?: string
  color2?: string
  speed?: number
}

export function ZebraBg({
  color1 = '#1669ff',
  color2 = '#f1117e',
  speed = 18,
}: ZebraBgProps) {
  const rawId = useId()
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, 'z')
  const patternRef = useRef<SVGPatternElement>(null)

  useEffect(() => {
    let raf: number
    let t = 0
    const SIZE = 90

    const tick = (ts: number) => {
      t = (ts * 0.001 * speed) % SIZE
      patternRef.current?.setAttribute(
        'patternTransform',
        `rotate(-44) translate(${t}, ${t})`
      )
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [speed])

  const fId = `${uid}f`
  const pId = `${uid}p`
  const SIZE = 90

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter
          id={fId}
          x="-50%" y="-50%"
          width="200%" height="200%"
          colorInterpolationFilters="sRGB"
        >
          {/* fractalNoise даёт плавные, вытянутые органические формы */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.007 0.003"
            numOctaves="2"
            seed="3"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="75"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        <pattern
          ref={patternRef}
          id={pId}
          x="0" y="0"
          width={SIZE} height={SIZE}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-44)"
        >
          <rect x="0"          y="0" width={SIZE * 0.5} height={SIZE} fill={color1} />
          <rect x={SIZE * 0.5} y="0" width={SIZE * 0.5} height={SIZE} fill={color2} />
        </pattern>
      </defs>

      {/* Rect намеренно больше карточки — overflow: hidden на родителе обрежет */}
      <rect
        x="-20%" y="-20%"
        width="140%" height="140%"
        fill={`url(#${pId})`}
        filter={`url(#${fId})`}
      />
    </svg>
  )
}
