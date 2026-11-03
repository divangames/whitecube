import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Star, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Marquee } from '@/components/magicui/marquee'
import { usePerfTier } from '@/context/PerfTierContext'
import { fadeUpMotion } from '@/lib/motionByTier'
import reviewsData from '@/data/reviews.json'

type Review = {
  id: number
  author: string
  rating: number
  date: string
  text: string
  firm?: string
  source: string
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Чередует отзывы разных фирм — одна фирма не идёт подряд */
function interleave(arr: Review[]): Review[] {
  // Группируем по фирме, каждую группу перемешиваем
  const groups: Record<string, Review[]> = {}
  for (const r of arr) {
    const key = r.firm ?? 'other'
    if (!groups[key]) groups[key] = []
    groups[key].push(r)
  }
  const queues = Object.values(groups).map(g => shuffle(g))

  const result: Review[] = []
  let lastFirm = ''

  while (queues.some(q => q.length > 0)) {
    // Выбираем очередь у которой есть элементы и фирма отличается от предыдущей
    const available = queues.filter(q => q.length > 0 && (q[0].firm ?? 'other') !== lastFirm)
    const pool = available.length > 0 ? available : queues.filter(q => q.length > 0)
    // Случайно выбираем из доступных
    const chosen = pool[Math.floor(Math.random() * pool.length)]
    const item = chosen.shift()!
    lastFirm = item.firm ?? 'other'
    result.push(item)
  }

  return result
}

const REVIEWS: Review[] = interleave(reviewsData as Review[])

const avgRating = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1)

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

const PALETTE = [
  '#22b7d8', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444',
  '#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
]
function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function ReviewCard({ r, onClick }: { r: Review; onClick: () => void }) {
  const color = avatarColor(r.author)
  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-2 w-[280px] sm:w-[300px] shrink-0 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 flex flex-col gap-3 text-left cursor-pointer hover:border-white/[0.18] hover:bg-white/[0.06] transition-colors duration-300"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="h-9 w-9 rounded-full shrink-0 flex items-center justify-center text-[13px] font-bold text-ink"
          style={{ backgroundColor: color }}
        >
          {initials(r.author)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-cream leading-tight truncate">{r.author}</p>
          <p className="text-[11px] text-dim mt-0.5">{formatDate(r.date)}</p>
        </div>
      </div>

      {/* Stars */}
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(i => (
          <Star
            key={i}
            size={13}
            className={i <= r.rating ? 'text-amber-400' : 'text-white/15'}
            fill={i <= r.rating ? 'currentColor' : 'none'}
          />
        ))}
      </div>

      {/* Превью — фиксированная высота */}
      <p className="text-xs sm:text-[13px] leading-relaxed text-mid line-clamp-3">{r.text}</p>

      {/* Footer: фирма + источник */}
      <div className="mt-auto pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
        {r.firm ? (
          <span className="text-[11px] font-semibold text-fire/80 truncate">{r.firm}</span>
        ) : (
          <span />
        )}
        <span className="text-[10px] text-dim shrink-0">{r.source === 'Яндекс.Карты' ? 'Яндекс.Карты' : '2ГИС'}</span>
      </div>
    </button>
  )
}

function ReviewModal({
  index,
  onClose,
  onPrev,
  onNext,
}: {
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const r = REVIEWS[index]
  const color = avatarColor(r.author)
  const touchStart = useRef<number | null>(null)

  // Клавиатура
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  onPrev()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'Escape')     onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onPrev, onNext, onClose])

  // Свайп
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return
    const delta = e.changedTouches[0].clientX - touchStart.current
    if (delta > 50)  onPrev()
    if (delta < -50) onNext()
    touchStart.current = null
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Стрелки по бокам (десктоп) */}
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onPrev() }}
        className="absolute left-4 sm:left-8 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/60 text-dim hover:text-cream hover:border-white/30 transition-all"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onNext() }}
        className="absolute right-4 sm:right-8 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/60 text-dim hover:text-cream hover:border-white/30 transition-all"
      >
        <ChevronRight size={20} />
      </button>

      {/* Панель */}
      <motion.div
        key={r.id}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative w-full max-w-md rounded-2xl border border-white/15 bg-black/85 backdrop-blur-lg p-6 shadow-[0_18px_55px_-18px_rgba(0,0,0,0.85)] flex flex-col gap-4"
      >
        {/* Закрыть */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-dim hover:text-cream transition-colors"
        >
          <X size={18} />
        </button>

        {/* Счётчик */}
        <p className="text-[10px] text-dim tracking-widest uppercase">
          {index + 1} / {REVIEWS.length}
        </p>

        {/* Header */}
        <div className="flex items-center gap-3 pr-6">
          <div
            className="h-10 w-10 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-ink"
            style={{ backgroundColor: color }}
          >
            {initials(r.author)}
          </div>
          <div>
            <p className="text-sm font-semibold text-cream">{r.author}</p>
            <p className="text-[11px] text-dim mt-0.5">{formatDate(r.date)}</p>
          </div>
        </div>

        {/* Stars */}
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map(i => (
            <Star key={i} size={14}
              className={i <= r.rating ? 'text-amber-400' : 'text-white/15'}
              fill={i <= r.rating ? 'currentColor' : 'none'}
            />
          ))}
        </div>

        {/* Полный текст */}
        <p className="text-sm leading-relaxed text-mid">{r.text}</p>

        {/* Навигация (мобиль) + источник */}
        <div className="pt-3 border-t border-white/[0.08] flex flex-wrap items-center gap-3">
          {r.firm && (
            <span className="text-xs font-semibold text-fire/80">{r.firm}</span>
          )}
          <a
            href="https://2gis.ru/krasnoyarsk/search/%D0%A2%D0%B2%D0%BE%D1%8F%20%D0%91%D1%83%D1%85%D0%B3%D0%B0%D0%BB%D1%82%D0%B5%D1%80%D0%B8%D1%8F%20%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%BE%D1%8F%D1%80%D1%81%D0%BA/firm/70000001104621378/tab/reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-dim hover:text-cream transition-colors"
            onClick={e => e.stopPropagation()}
          >
            Посмотреть на 2ГИС →
          </a>
          {/* Стрелки (мобиль) */}
          <div className="flex gap-2 sm:hidden">
            <button
              type="button"
              onClick={onPrev}
              className="h-8 w-8 flex items-center justify-center rounded-full border border-white/15 text-dim hover:text-cream transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={onNext}
              className="h-8 w-8 flex items-center justify-center rounded-full border border-white/15 text-dim hover:text-cream transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

const half = Math.ceil(REVIEWS.length / 2)
const row1 = REVIEWS.slice(0, half)
const row2 = REVIEWS.slice(half)

export default function Reviews() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const tier = usePerfTier()
  const minimal = tier === 'minimal'
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const prev = useCallback(() => setActiveIdx(i => i === null ? null : (i - 1 + REVIEWS.length) % REVIEWS.length), [])
  const next = useCallback(() => setActiveIdx(i => i === null ? null : (i + 1) % REVIEWS.length), [])

  return (
    <section id="reviews" ref={ref} className="border-t border-edge py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 mb-12">
        <motion.div {...fadeUpMotion(tier, inView, 0)} className="flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-12">
          <div>
            <span className="tag block mb-4">Отзывы</span>
            <h2 className="font-display font-black text-4xl sm:text-5xl text-cream uppercase leading-[1.0]">
              Что говорят<br />клиенты
            </h2>
          </div>

          {/* Итоговый рейтинг */}
          <motion.div {...fadeUpMotion(tier, inView, 0.1)} className="flex items-center gap-4 pb-1">
            <span
              className="font-display font-black leading-none"
              style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', color: '#22b7d8' }}
            >
              {avgRating}
            </span>
            <div className="flex flex-col gap-1">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={16} className="text-amber-400" fill="currentColor" />
                ))}
              </div>
              <span className="text-xs text-dim">{REVIEWS.length} отзывов · 2ГИС и Яндекс.Карты</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Ряд 1 — вперёд */}
      <motion.div {...fadeUpMotion(tier, inView, 0.15)}>
        <Marquee pauseOnHover speed={260} pause={minimal} repeat={3}>
          {row1.map((r, i) => <ReviewCard key={r.id} r={r} onClick={() => setActiveIdx(i)} />)}
        </Marquee>
      </motion.div>

      {/* Ряд 2 — назад */}
      <motion.div {...fadeUpMotion(tier, inView, 0.2)} className="mt-3">
        <Marquee pauseOnHover reverse speed={220} pause={minimal} repeat={3}>
          {row2.map((r, i) => <ReviewCard key={r.id} r={r} onClick={() => setActiveIdx(half + i)} />)}
        </Marquee>
      </motion.div>

      {/* Попап */}
      <AnimatePresence>
        {activeIdx !== null && (
          <ReviewModal
            index={activeIdx}
            onClose={() => setActiveIdx(null)}
            onPrev={prev}
            onNext={next}
          />
        )}
      </AnimatePresence>

    </section>
  )
}
