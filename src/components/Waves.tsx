import { useEffect, useRef } from 'react'
import { createNoise2D } from 'simplex-noise'
import { useSaveGpuMode } from '@/hooks/usePerfBudget'

interface Point {
  x: number
  y: number
  wave: { x: number; y: number }
  cursor: { x: number; y: number; vx: number; vy: number }
}

interface WavesProps {
  strokeColor?: string
  backgroundColor?: string
}

export function Waves({ strokeColor = '#6db7ff', backgroundColor = '#0088d8' }: WavesProps) {
  const saveGpu = useSaveGpuMode()
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const mouseRef = useRef({ x: -10, y: 0, lx: 0, ly: 0, sx: 0, sy: 0, v: 0, vs: 0, a: 0, set: false })
  const pathsRef = useRef<SVGPathElement[]>([])
  const linesRef = useRef<Point[][]>([])
  const noiseRef = useRef<((x: number, y: number) => number) | null>(null)
  const boundingRef = useRef<DOMRect | null>(null)

  useEffect(() => {
    if (saveGpu) return
    if (!containerRef.current || !svgRef.current) return
    noiseRef.current = createNoise2D()
    setSize()
    setLines()

    const container = containerRef.current

    const frameInterval = 1000 / 30
    let frameId: number | null = null
    let lastFrameTime: number | null = null
    let animationTime = 0
    let inView = false

    const stop = () => {
      if (frameId !== null) cancelAnimationFrame(frameId)
      frameId = null
      lastFrameTime = null
    }

    const tick = (time: number) => {
      if (!inView || document.hidden) {
        stop()
        return
      }
      if (lastFrameTime === null) lastFrameTime = time
      const elapsed = time - lastFrameTime
      if (elapsed >= frameInterval) {
        // Skip expensive point calculations and SVG writes between 30 fps frames.
        lastFrameTime = time - (elapsed % frameInterval)
        animationTime += frameInterval
        const m = mouseRef.current
        m.sx += (m.x - m.sx) * 0.1
        m.sy += (m.y - m.sy) * 0.1
        const dx = m.x - m.lx
        const dy = m.y - m.ly
        m.v = Math.hypot(dx, dy)
        m.vs += (m.v - m.vs) * 0.1
        m.vs = Math.min(100, m.vs)
        m.lx = m.x; m.ly = m.y
        m.a = Math.atan2(dy, dx)
        movePoints(animationTime)
        drawLines()
      }
      frameId = requestAnimationFrame(tick)
    }

    const syncPlayback = () => {
      if (inView && !document.hidden) {
        if (frameId === null) frameId = requestAnimationFrame(tick)
      } else {
        stop()
      }
    }

    container.addEventListener('mousemove', onContainerMouseMove)
    container.addEventListener('mouseleave', onContainerMouseLeave)
    container.addEventListener('touchmove', onTouchMove, { passive: true })
    document.addEventListener('visibilitychange', syncPlayback)

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio > 0
      syncPlayback()
    }, { rootMargin: '0px' })
    io.observe(container)

    const ro = new ResizeObserver(() => {
      setSize()
      setLines()
      movePoints(animationTime)
      drawLines()
    })
    ro.observe(container)

    return () => {
      stop()
      container.removeEventListener('mousemove', onContainerMouseMove)
      container.removeEventListener('mouseleave', onContainerMouseLeave)
      container.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('visibilitychange', syncPlayback)
      io.disconnect()
      ro.disconnect()
    }
  }, [saveGpu, strokeColor])

  const setSize = () => {
    if (!containerRef.current || !svgRef.current) return
    boundingRef.current = containerRef.current.getBoundingClientRect()
    const { width, height } = boundingRef.current
    svgRef.current.style.width = `${width}px`
    svgRef.current.style.height = `${height}px`
  }

  const setLines = () => {
    if (!svgRef.current || !boundingRef.current) return
    const { width, height } = boundingRef.current
    linesRef.current = []
    pathsRef.current.forEach(p => p.remove())
    pathsRef.current = []

    // gap 8 → 14 (количество вершин падает примерно в 3×, draw-цикл легче)
    const xGap = 14
    const yGap = 14
    const oWidth = width + 200
    const oHeight = height + 120
    const totalLines = Math.ceil(oWidth / xGap)
    const totalPoints = Math.ceil(oHeight / yGap)
    const xStart = (width - xGap * totalLines) / 2
    const yStart = (height - yGap * totalPoints) / 2

    for (let i = 0; i < totalLines; i++) {
      const points: Point[] = []
      for (let j = 0; j < totalPoints; j++) {
        points.push({ x: xStart + xGap * i, y: yStart + yGap * j, wave: { x: 0, y: 0 }, cursor: { x: 0, y: 0, vx: 0, vy: 0 } })
      }
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('fill', 'none')
      path.setAttribute('stroke', strokeColor)
      path.setAttribute('stroke-width', '1')
      svgRef.current.appendChild(path)
      pathsRef.current.push(path)
      linesRef.current.push(points)
    }
  }

  const onContainerMouseMove = (e: MouseEvent) => {
    if (!boundingRef.current) return
    const bounds = containerRef.current?.getBoundingClientRect()
    if (bounds) updateMouse(e.clientX - bounds.left, e.clientY - bounds.top)
  }
  const onContainerMouseLeave = () => updateMouse(-9999, -9999)
  const onTouchMove = (e: TouchEvent) => {
    if (!boundingRef.current) return
    const t = e.touches[0]
    const bounds = containerRef.current?.getBoundingClientRect()
    if (t && bounds) updateMouse(t.clientX - bounds.left, t.clientY - bounds.top)
  }

  const updateMouse = (x: number, y: number) => {
    const m = mouseRef.current
    m.x = x
    m.y = y
    if (!m.set) { m.sx = m.x; m.sy = m.y; m.lx = m.x; m.ly = m.y; m.set = true }
  }

  const movePoints = (time: number) => {
    const noise = noiseRef.current
    const mouse = mouseRef.current
    if (!noise) return
    linesRef.current.forEach(points => {
      points.forEach(p => {
        const move = noise((p.x + time * 0.008) * 0.003, (p.y + time * 0.003) * 0.002) * 8
        p.wave.x = Math.cos(move) * 12
        p.wave.y = Math.sin(move) * 6
        const dx = p.x - mouse.sx
        const dy = p.y - mouse.sy
        const d = Math.hypot(dx, dy)
        const l = Math.max(175, mouse.vs)
        if (d < l) {
          const s = 1 - d / l
          const f = Math.cos(d * 0.001) * s
          p.cursor.vx += Math.cos(mouse.a) * f * l * mouse.vs * 0.00035
          p.cursor.vy += Math.sin(mouse.a) * f * l * mouse.vs * 0.00035
        }
        p.cursor.vx += (0 - p.cursor.x) * 0.01
        p.cursor.vy += (0 - p.cursor.y) * 0.01
        p.cursor.vx *= 0.95
        p.cursor.vy *= 0.95
        p.cursor.x += p.cursor.vx
        p.cursor.y += p.cursor.vy
        p.cursor.x = Math.min(50, Math.max(-50, p.cursor.x))
        p.cursor.y = Math.min(50, Math.max(-50, p.cursor.y))
      })
    })
  }

  const moved = (p: Point, withCursor = true) => ({
    x: p.x + p.wave.x + (withCursor ? p.cursor.x : 0),
    y: p.y + p.wave.y + (withCursor ? p.cursor.y : 0),
  })

  const drawLines = () => {
    linesRef.current.forEach((points, i) => {
      if (points.length < 2 || !pathsRef.current[i]) return
      const first = moved(points[0], false)
      let d = `M ${first.x} ${first.y}`
      for (let j = 1; j < points.length; j++) {
        const c = moved(points[j])
        d += ` L ${c.x} ${c.y}`
      }
      pathsRef.current[i].setAttribute('d', d)
    })
  }

  if (saveGpu) {
    return (
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ backgroundColor }}
        aria-hidden
      />
    )
  }

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden" style={{ backgroundColor }}>
      <svg ref={svgRef} className="block" style={{ minWidth: '100%', minHeight: '100%' }} xmlns="http://www.w3.org/2000/svg" />
    </div>
  )
}
