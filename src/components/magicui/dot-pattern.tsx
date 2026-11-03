import React, { useEffect, useId, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number
  height?: number
  x?: number
  y?: number
  cx?: number
  cy?: number
  cr?: number
  className?: string
  glow?: boolean
}

export function DotPattern({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  glow = false,
  ...props
}: DotPatternProps) {
  const id = useId()
  const containerRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width: w, height: h } = containerRef.current.getBoundingClientRect()
        setDimensions({ width: w, height: h })
      }
    }
    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  const dots = Array.from(
    { length: Math.ceil(dimensions.width / width) * Math.ceil(dimensions.height / height) },
    (_, i) => {
      const col = i % Math.ceil(dimensions.width / width)
      const row = Math.floor(i / Math.ceil(dimensions.width / width))
      return { x: col * width + cx + x, y: row * height + cy + y }
    },
  )

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
      {...props}
    >
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
          <circle id={`${id}-circle`} cx={cx} cy={cy} r={cr} />
        </pattern>
      </defs>
      {glow ? (
        dots.map((dot, i) => (
          <circle key={i} cx={dot.x} cy={dot.y} r={cr} className="fill-current opacity-20" />
        ))
      ) : (
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      )}
    </svg>
  )
}
