import { type ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  className?: string
  reverse?: boolean
  pauseOnHover?: boolean
  /** Полная пауза анимации (экономия CPU/GPU на слабых устройствах). */
  pause?: boolean
  children: React.ReactNode
  repeat?: number
  speed?: number
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  pause = false,
  children,
  repeat = 4,
  speed = 40,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn("group/marquee flex overflow-hidden", className)}
      style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex min-w-max shrink-0 items-center",
            )}
            style={{
              animation: `marquee-scroll ${speed}s linear infinite${reverse ? " reverse" : ""}`,
              animationPlayState: pause ? "paused" : "running",
            }}
            {...(pauseOnHover && {
              'data-pause-on-hover': 'true',
            })}
          >
            {children}
          </div>
        ))}
      {pauseOnHover && (
        <style>{`
          .group\\/marquee:hover [data-pause-on-hover] {
            animation-play-state: paused !important;
          }
        `}</style>
      )}
    </div>
  )
}
