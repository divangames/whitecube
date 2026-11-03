////////////////////////////////////////////////////////
//
// Падающие коробки BOX_ВЗВ на карточке DPD (лёгкая 2D-физика)
//
////////////////////////////////////////////////////////

import { useEffect, useRef } from 'react'
import boxSvg from '../../../images/BOX_ВЗВ.svg'

type BoxBody = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  vr: number
  w: number
  h: number
  el: HTMLImageElement
}

type DpdFallingBoxesProps = {
  /** Ховер активен — спавн и обычная физика */
  active: boolean
  /** Урезанный режим: меньше коробок / слабее эффекты */
  reduced: boolean
}

const GRAVITY = 1800
const FLOOR_RESTITUTION = 0.42
const WALL_RESTITUTION = 0.35
const FRICTION = 0.985
const SPAWN_MS = 160
const LEAVE_PAUSE_MS = 420
const MAX_BOXES_FULL = 18
const MAX_BOXES_REDUCED = 8

/**
 * Слой коробок: при ховере сыпятся сверху, при уходе курсора —
 * короткая пауза, затем провал вниз и удаление.
 */
export function DpdFallingBoxes({ active, reduced }: DpdFallingBoxesProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const bodiesRef = useRef<BoxBody[]>([])
  const nextIdRef = useRef(0)
  const activeRef = useRef(active)
  const drainingRef = useRef(false)
  const floorOpenRef = useRef(false)
  const rafRef = useRef(0)
  const lastTsRef = useRef(0)
  const spawnAccRef = useRef(0)
  const leaveTimerRef = useRef(0)

  activeRef.current = active

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const maxBoxes = reduced ? MAX_BOXES_REDUCED : MAX_BOXES_FULL
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const clearBodies = () => {
      for (const b of bodiesRef.current) b.el.remove()
      bodiesRef.current = []
    }

    const spawnBox = (W: number) => {
      if (prefersReduced) return
      if (bodiesRef.current.length >= maxBoxes) return

      const scale = 0.55 + Math.random() * 0.55
      const w = (reduced ? 36 : 44) * scale
      const h = w * (45.75 / 39.26)
      const el = document.createElement('img')
      el.src = boxSvg
      el.alt = ''
      el.setAttribute('aria-hidden', 'true')
      el.draggable = false
      el.style.cssText = [
        'position:absolute',
        'left:0',
        'top:0',
        `width:${w}px`,
        `height:${h}px`,
        'pointer-events:none',
        'user-select:none',
        'will-change:transform',
        'opacity:0.92',
        'filter:drop-shadow(0 8px 14px rgba(0,0,0,0.28))',
      ].join(';')

      const body: BoxBody = {
        id: nextIdRef.current++,
        x: 12 + Math.random() * Math.max(24, W - w - 24),
        y: -h - Math.random() * 40,
        vx: (Math.random() - 0.5) * 220,
        vy: 40 + Math.random() * 80,
        rot: (Math.random() - 0.5) * 0.6,
        vr: (Math.random() - 0.5) * 4,
        w,
        h,
        el,
      }
      root.appendChild(el)
      bodiesRef.current.push(body)
    }

    const resolveBoxCollisions = () => {
      const list = bodiesRef.current
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i]
          const b = list[j]
          const dx = b.x + b.w / 2 - (a.x + a.w / 2)
          const dy = b.y + b.h / 2 - (a.y + a.h / 2)
          const minX = (a.w + b.w) * 0.42
          const minY = (a.h + b.h) * 0.42
          if (Math.abs(dx) >= minX || Math.abs(dy) >= minY) continue

          if (Math.abs(dx) / minX > Math.abs(dy) / minY) {
            const push = (minX - Math.abs(dx)) * 0.5 * Math.sign(dx || 1)
            a.x -= push
            b.x += push
            const avx = a.vx
            a.vx = b.vx * 0.85
            b.vx = avx * 0.85
            a.vr += (Math.random() - 0.5) * 0.8
            b.vr += (Math.random() - 0.5) * 0.8
          } else {
            const push = (minY - Math.abs(dy)) * 0.5 * Math.sign(dy || 1)
            a.y -= push
            b.y += push
            const avy = a.vy
            a.vy = b.vy * 0.7
            b.vy = avy * 0.7
          }
        }
      }
    }

    const tick = (ts: number) => {
      rafRef.current = requestAnimationFrame(tick)
      const last = lastTsRef.current || ts
      const dt = Math.min(0.033, (ts - last) / 1000)
      lastTsRef.current = ts

      const W = root.clientWidth
      const H = root.clientHeight
      if (W < 8 || H < 8) return

      const hovering = activeRef.current && !drainingRef.current && !floorOpenRef.current

      if (hovering && !prefersReduced) {
        spawnAccRef.current += dt * 1000
        while (spawnAccRef.current >= SPAWN_MS) {
          spawnAccRef.current -= SPAWN_MS
          spawnBox(W)
        }
      }

      const g = floorOpenRef.current ? GRAVITY * 2.4 : GRAVITY
      const floorY = floorOpenRef.current ? H + 400 : H - 10

      for (const b of bodiesRef.current) {
        b.vy += g * dt
        b.vx *= FRICTION
        b.vr *= 0.995
        b.x += b.vx * dt
        b.y += b.vy * dt
        b.rot += b.vr * dt

        if (!floorOpenRef.current) {
          if (b.x < 4) {
            b.x = 4
            b.vx = Math.abs(b.vx) * WALL_RESTITUTION
            b.vr += 0.4
          } else if (b.x + b.w > W - 4) {
            b.x = W - 4 - b.w
            b.vx = -Math.abs(b.vx) * WALL_RESTITUTION
            b.vr -= 0.4
          }

          if (b.y + b.h > floorY) {
            b.y = floorY - b.h
            if (Math.abs(b.vy) > 40) {
              b.vy = -Math.abs(b.vy) * FLOOR_RESTITUTION
              b.vx += (Math.random() - 0.5) * 60
              b.vr += (Math.random() - 0.5) * 3
            } else {
              b.vy = 0
              b.vx *= 0.88
              b.vr *= 0.9
            }
          }
        }

        b.el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) rotate(${b.rot}rad)`
      }

      if (!floorOpenRef.current) resolveBoxCollisions()

      if (floorOpenRef.current || drainingRef.current) {
        bodiesRef.current = bodiesRef.current.filter((b) => {
          if (b.y > H + 80) {
            b.el.remove()
            return false
          }
          return true
        })
        if (bodiesRef.current.length === 0) {
          drainingRef.current = false
          floorOpenRef.current = false
        }
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.clearTimeout(leaveTimerRef.current)
      clearBodies()
    }
  }, [reduced])

  useEffect(() => {
    window.clearTimeout(leaveTimerRef.current)

    if (active) {
      drainingRef.current = false
      floorOpenRef.current = false
      spawnAccRef.current = SPAWN_MS
      return
    }

    // Курсор ушёл: пауза, затем пол «открывается» — коробки проваливаются.
    if (bodiesRef.current.length === 0) return
    drainingRef.current = true
    leaveTimerRef.current = window.setTimeout(() => {
      floorOpenRef.current = true
      for (const b of bodiesRef.current) {
        b.vy = Math.max(b.vy, 120) + Math.random() * 80
        b.vr += (Math.random() - 0.5) * 2
      }
    }, LEAVE_PAUSE_MS)

    return () => window.clearTimeout(leaveTimerRef.current)
  }, [active])

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl"
      aria-hidden="true"
    />
  )
}
