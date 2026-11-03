import { Marquee } from './magicui/marquee'
import { useSaveGpuMode } from '@/hooks/usePerfBudget'

const items = [
  'Интеграция СДЭК × Ozon',
  'Wildberries под ключ',
  'Контекстная реклама',
  'Выкуп из Китая',
  'Бухгалтерия',
  'Репутация в 2ГИС',
  'Сайты и дизайн',
  'HR-аутсорс',
  'Яндекс Директ',
  'Логистика',
]

const Sep = () => (
  <span className="w-1 h-1 rounded-full bg-fire flex-shrink-0 opacity-60" />
)

export default function Ticker() {
  const saveGpu = useSaveGpuMode()

  return (
    <div className="border-y border-edge bg-card py-2.5 group">
      {/* Mobile fallback: без бесконечной анимации, просто горизонтальный скролл-чипсы */}
      <div className="sm:hidden overflow-x-auto no-scrollbar px-4">
        <div className="inline-flex items-center gap-3 min-w-max">
          {items.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2 rounded-full border border-edge px-3 py-1 text-[11px] font-medium tracking-wide text-dim">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="hidden sm:block">
        <Marquee speed={35} repeat={4} pauseOnHover pause={saveGpu}>
          {items.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-6 text-xs font-medium tracking-wide text-dim group-hover:[animation-play-state:paused] select-none ml-6"
            >
              {item}
              <Sep />
            </span>
          ))}
        </Marquee>
      </div>
    </div>
  )
}
