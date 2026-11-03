import { useRef, useEffect } from 'react'
import { useInViewport, usePrefersReducedMotion } from '@/hooks/useInViewport'

interface Particle {
  bx: number; by: number; bz: number
  dx: number; dy: number; dz: number
  vx: number; vy: number; vz: number
  size: number
}

const SPRING_K      = 0.035
const DAMPING       = 0.83
const MAGNET_RADIUS = 140
const MAGNET_STR    = 0.10

// Fixed tilt — ~30° around X so cube always shows 3 faces
const TILT_X = 0.52

function rotateY(x: number, y: number, z: number, a: number) {
  const c = Math.cos(a), s = Math.sin(a)
  return { x: x*c + z*s, y, z: -x*s + z*c }
}
function rotateX(x: number, y: number, z: number, a: number) {
  const c = Math.cos(a), s = Math.sin(a)
  return { x, y: y*c - z*s, z: y*s + z*c }
}

// Плотности подобраны под визуальное равновесие
// при заметно меньшем количестве частиц (≈ 1450 против старых 5180).
const EDGE_PER = 35      // было 80
const FACE_TOTAL = 1200  // было 4200

function buildParticles(): Particle[] {
  const list: Particle[] = []
  const rnd = () => Math.random() * 2 - 1

  // 12 ребер × (EDGE_PER + 1)
  const edges: [number,number,number,number,number,number][] = [
    [-1,-1,-1,  1,-1,-1], [-1, 1,-1,  1, 1,-1],
    [-1,-1, 1,  1,-1, 1], [-1, 1, 1,  1, 1, 1],
    [-1,-1,-1, -1, 1,-1], [ 1,-1,-1,  1, 1,-1],
    [-1,-1, 1, -1, 1, 1], [ 1,-1, 1,  1, 1, 1],
    [-1,-1,-1, -1,-1, 1], [ 1,-1,-1,  1,-1, 1],
    [-1, 1,-1, -1, 1, 1], [ 1, 1,-1,  1, 1, 1],
  ]
  for (const [x1,y1,z1,x2,y2,z2] of edges) {
    for (let i = 0; i <= EDGE_PER; i++) {
      const t = i / EDGE_PER
      list.push({
        bx: x1+(x2-x1)*t, by: y1+(y2-y1)*t, bz: z1+(z2-z1)*t,
        dx:0, dy:0, dz:0, vx:0, vy:0, vz:0,
        size: 1.5 + Math.random()*0.4,
      })
    }
  }

  // 8 corners — larger dots
  for (const cx of [-1,1]) for (const cy of [-1,1]) for (const cz of [-1,1]) {
    list.push({ bx:cx, by:cy, bz:cz, dx:0,dy:0,dz:0, vx:0,vy:0,vz:0, size:3.2 })
  }

  // Грани — равномерно по 6 сторонам
  for (let i = 0; i < FACE_TOTAL; i++) {
    const face = (Math.random()*6)|0
    let bx=0, by=0, bz=0
    if      (face===0){ bx= 1; by=rnd(); bz=rnd() }
    else if (face===1){ bx=-1; by=rnd(); bz=rnd() }
    else if (face===2){ by= 1; bx=rnd(); bz=rnd() }
    else if (face===3){ by=-1; bx=rnd(); bz=rnd() }
    else if (face===4){ bz= 1; bx=rnd(); by=rnd() }
    else              { bz=-1; bx=rnd(); by=rnd() }
    list.push({
      bx, by, bz, dx:0, dy:0, dz:0, vx:0, vy:0, vz:0,
      size: 0.45 + Math.random()*0.55,
    })
  }

  return list
}

// 16 уровней прозрачности — батчим draw по этим бакетам, чтобы не менять fillStyle на каждой точке.
const ALPHA_LEVELS = 16
const FILL_STYLES: string[] = Array.from({ length: ALPHA_LEVELS }, (_, i) => {
  const a = (i + 1) / ALPHA_LEVELS
  return `rgba(34,183,216,${a.toFixed(3)})`
})

export default function ParticleCube() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inView = useInViewport(wrapperRef, { rootMargin: '120px' })
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })!

    // Cap DPR на 1.5: на retina-экранах больше деталей не нужно, экономим заливку.
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5)

    let cssW = canvas.offsetWidth
    let cssH = canvas.offsetHeight
    const setCanvasSize = () => {
      cssW = canvas.offsetWidth
      cssH = canvas.offsetHeight
      canvas.width  = Math.round(cssW * DPR)
      canvas.height = Math.round(cssH * DPR)
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    }
    setCanvasSize()

    const SIZE = Math.min(cssW, cssH) * 0.28
    const FOV  = Math.min(cssW, cssH) * 1.5

    const particles = buildParticles()

    // Если включён reduce-motion — рисуем один статичный кадр и выходим.
    let angleY = Math.PI / 4
    let mx = -9999, my = -9999
    let hovering = false
    let raf = 0
    let running = false

    type Pt = { px: number; py: number; wz: number; sc: number; size: number; rx: number; ry: number; rz: number; p: Particle }
    // Переиспользуем массив между кадрами, без аллокаций.
    const pts: Pt[] = particles.map((p) => ({ px:0, py:0, wz:0, sc:0, size:p.size, rx:0, ry:0, rz:0, p }))
    // Бакеты для batch-рисования — по индексам в pts.
    const buckets: number[][] = Array.from({ length: ALPHA_LEVELS }, () => [])

    const draw = () => {
      ctx.clearRect(0, 0, cssW, cssH)
      const ccx = cssW / 2
      const ccy = cssH / 2

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const y1 = rotateY(p.bx*SIZE, p.by*SIZE, p.bz*SIZE, angleY)
        const r  = rotateX(y1.x, y1.y, y1.z, TILT_X)

        const wx = r.x + p.dx
        const wy = r.y + p.dy
        const wz = r.z + p.dz

        const sc = FOV / (FOV + wz)
        const pt = pts[i]
        pt.px = wx*sc + ccx
        pt.py = wy*sc + ccy
        pt.wz = wz
        pt.sc = sc
        pt.rx = r.x; pt.ry = r.y; pt.rz = r.z
      }

      // Очищаем бакеты.
      for (let b = 0; b < ALPHA_LEVELS; b++) buckets[b].length = 0

      // Распределяем точки по бакетам прозрачности (без сортировки!).
      const inv = 1 / (SIZE * 3.6)
      for (let i = 0; i < pts.length; i++) {
        const wz = pts[i].wz
        let depth = (wz + SIZE*1.8) * inv
        if (depth < 0) depth = 0; else if (depth > 1) depth = 1
        const alpha = 0.08 + depth * 0.92
        let bi = (alpha * ALPHA_LEVELS) | 0
        if (bi >= ALPHA_LEVELS) bi = ALPHA_LEVELS - 1
        buckets[bi].push(i)
      }

      // Один fillStyle на бакет, fillRect вместо arc — кратно быстрее.
      for (let b = 0; b < ALPHA_LEVELS; b++) {
        const bucket = buckets[b]
        if (bucket.length === 0) continue
        ctx.fillStyle = FILL_STYLES[b]
        for (let k = 0; k < bucket.length; k++) {
          const pt = pts[bucket[k]]
          const r = pt.size * pt.sc
          if (r < 0.3) continue
          const d = r * 2
          ctx.fillRect(pt.px - r, pt.py - r, d, d)
        }
      }
    }

    const step = () => {
      angleY += 0.0018
      draw()

      // Физика — на тех же pts, без повторных аллокаций.
      const ccx = cssW / 2
      const ccy = cssH / 2
      for (let i = 0; i < pts.length; i++) {
        const pt = pts[i]
        const p = pt.p
        const sdx = pt.px - mx
        const sdy = pt.py - my
        const sd  = Math.hypot(sdx, sdy)

        let fx = -p.dx * SPRING_K
        let fy = -p.dy * SPRING_K
        let fz = -p.dz * SPRING_K

        if (hovering && sd < MAGNET_RADIUS) {
          const t = (1 - sd / MAGNET_RADIUS) ** 2 * MAGNET_STR
          fx += ((mx - ccx) - pt.rx - p.dx) * t
          fy += ((my - ccy) - pt.ry - p.dy) * t
          fz += (            -pt.rz - p.dz) * t * 0.4
        }

        p.vx = (p.vx + fx) * DAMPING
        p.vy = (p.vy + fy) * DAMPING
        p.vz = (p.vz + fz) * DAMPING
        p.dx += p.vx
        p.dy += p.vy
        p.dz += p.vz
      }

      raf = requestAnimationFrame(step)
    }

    const start = () => {
      if (running) return
      running = true
      raf = requestAnimationFrame(step)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    if (reduced) {
      // Один статичный кадр, без RAF.
      draw()
    } else if (inView) {
      start()
    }

    const onMove  = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mx = e.clientX - r.left
      my = e.clientY - r.top
    }
    const onEnter = () => { hovering = true }
    const onLeave = () => { hovering = false; mx = -9999; my = -9999 }
    const onResize = () => {
      setCanvasSize()
    }

    canvas.addEventListener('mousemove',  onMove)
    canvas.addEventListener('mouseenter', onEnter)
    canvas.addEventListener('mouseleave', onLeave)
    window.addEventListener('resize', onResize)

    // Реакция на смену видимости
    if (!reduced && !inView) stop()

    return () => {
      stop()
      canvas.removeEventListener('mousemove',  onMove)
      canvas.removeEventListener('mouseenter', onEnter)
      canvas.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('resize', onResize)
    }
  }, [inView, reduced])

  return (
    <div ref={wrapperRef} className="w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
