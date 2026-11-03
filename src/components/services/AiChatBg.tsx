////////////////////////////////////////////////////////
//
// Фон карточки «Продвижение в ИИ»: чат с вопросами и ответом бота
//
////////////////////////////////////////////////////////

import { useEffect, useRef, useState } from 'react'
import { useInViewport, usePrefersReducedMotion } from '@/hooks/useInViewport'
import { usePerfTier } from '@/context/PerfTierContext'

type Dialog = {
  question: string
  answer: string
  brand: string
}

const DIALOGS: Dialog[] = [
  {
    question: 'Посоветуй ресторан для деловой встречи в центре Питера?',
    brand: 'Гранд Петергоф',
    answer: 'Рекомендую «Гранд Петергоф» на Невском. Спокойная атмосфера, приватные кабинеты, высокий рейтинг. Средний чек — 2500₽.',
  },
  {
    question: 'Какая стоматология в Красноярске лучше для семьи?',
    brand: 'Клиника Севера',
    answer: 'Рекомендую «Клинику Севера»: детский приём, прозрачные цены и стабильно высокий рейтинг в картах.',
  },
  {
    question: 'Кто делает сайты под ключ в Москве быстро?',
    brand: 'White Cube',
    answer: 'Рекомендую White Cube: дизайн и разработка с ИИ, сроки от 5 дней, понятный бюджет без сюрпризов.',
  },
  {
    question: 'Надёжная логистика товара из Китая под ключ?',
    brand: 'CARGO 575',
    answer: 'Рекомендую CARGO 575: поиск, проверка, выкуп и доставка — полное сопровождение для продавцов.',
  },
  {
    question: 'Кто ведёт рекламу на Wildberries и Ozon?',
    brand: 'OzonWB',
    answer: 'Рекомендую OzonWB: запуск и ведение под ключ с упором на результат, а не на отчёт ради отчёта.',
  },
]

type Phase = 'ask' | 'typing' | 'answer' | 'hold'

/**
 * Печатает текст по символам; возвращает true, если цикл не отменили.
 */
async function typeText(
  full: string,
  wait: (ms: number) => Promise<void>,
  setTyped: (value: string) => void,
  isCancelled: () => boolean,
  stepMs: number,
): Promise<boolean> {
  for (let i = 1; i <= full.length; i += 1) {
    if (isCancelled()) return false
    setTyped(full.slice(0, i))
    await wait(stepMs)
  }
  return !isCancelled()
}

/**
 * Тёмный чат: один вопрос пользователя, затем набор и ответ бота. Пять диалогов по кругу.
 */
export function AiChatBg() {
  const rootRef = useRef<HTMLDivElement>(null)
  const visible = useInViewport(rootRef, { initialInView: false, rootMargin: '80px' })
  const reduced = usePrefersReducedMotion()
  const tier = usePerfTier()
  const staticMode = reduced || tier === 'minimal' || !visible

  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('hold')
  const [typedQuestion, setTypedQuestion] = useState(DIALOGS[0].question)
  const [typedAnswer, setTypedAnswer] = useState(DIALOGS[0].answer)
  const indexRef = useRef(0)

  useEffect(() => {
    if (staticMode) {
      const item = DIALOGS[indexRef.current]
      setPhase('hold')
      setTypedQuestion(item.question)
      setTypedAnswer(item.answer)
      return
    }

    let cancelled = false
    let timeoutId = 0
    let dialogIndex = indexRef.current

    /** Пауза с отменой при размонтировании. */
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timeoutId = window.setTimeout(resolve, ms)
      })
    const isCancelled = () => cancelled

    const run = async () => {
      while (!cancelled) {
        const dialog = DIALOGS[dialogIndex]
        setPhase('ask')
        setTypedQuestion('')
        setTypedAnswer('')
        const asked = await typeText(dialog.question, wait, setTypedQuestion, isCancelled, 22)
        if (!asked) return

        await wait(380)
        if (cancelled) return

        setPhase('typing')
        await wait(900)
        if (cancelled) return

        setPhase('answer')
        const answered = await typeText(dialog.answer, wait, setTypedAnswer, isCancelled, 16)
        if (!answered) return

        setPhase('hold')
        await wait(2600)
        if (cancelled) return

        dialogIndex = (dialogIndex + 1) % DIALOGS.length
        indexRef.current = dialogIndex
        setIndex(dialogIndex)
      }
    }

    void run()
    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [staticMode])

  const current = DIALOGS[index]
  const showBot = phase !== 'ask'

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ background: '#1c1c1e' }}
      aria-hidden
    >
      <div className="absolute inset-x-0 top-0 px-4 pt-4 pr-12 sm:px-5 sm:pt-5 flex flex-col gap-3 sm:gap-4">
        <UserBubble text={typedQuestion} showCaret={phase === 'ask'} />

        {showBot && (
          <div className="flex items-end gap-2.5 pr-10 sm:pr-16">
            <BotAvatar />
            <div
              className="rounded-[1.25rem] rounded-bl-md px-3.5 py-2.5 sm:px-4 sm:py-3 max-w-[90%]"
              style={{ background: '#3d4454' }}
            >
              {phase === 'typing' ? (
                <TypingDots />
              ) : (
                <BotAnswer text={typedAnswer} brand={current.brand} showCaret={phase === 'answer'} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Пузырь вопроса пользователя справа.
 */
function UserBubble({ text, showCaret }: { text: string; showCaret: boolean }) {
  return (
    <div className="flex items-end justify-end gap-2.5 pl-8 sm:pl-16">
      <p
        className="rounded-[1.25rem] rounded-br-md px-3.5 py-2.5 sm:px-4 sm:py-3 text-[13px] sm:text-[15px] leading-relaxed text-white/95"
        style={{ background: '#2c2c2e' }}
      >
        {text || '\u00a0'}
        {showCaret && <Caret />}
      </p>
      <UserAvatar />
    </div>
  )
}

/**
 * Ответ бота с подсветкой бренда и курсором набора.
 */
function BotAnswer({ text, brand, showCaret }: { text: string; brand: string; showCaret: boolean }) {
  const idx = text.indexOf(brand)
  const hasBrand = idx >= 0

  return (
    <p className="text-[13px] sm:text-[15px] leading-relaxed text-white/95">
      {hasBrand ? (
        <>
          {text.slice(0, idx)}
          <span className="text-[#7eb6ff] underline underline-offset-2">{brand}</span>
          {text.slice(idx + brand.length)}
        </>
      ) : (
        text
      )}
      {showCaret && <Caret />}
    </p>
  )
}

/** Мигающий курсор набора. */
function Caret() {
  return (
    <span className="inline-block w-0.5 h-[1em] ml-1 align-[-2px] bg-white/85 animate-pulse" />
  )
}

/** Три точки «бот печатает рекомендацию». */
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 h-6 px-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white/75"
          style={{
            animation: 'ai-dot 1s ease-in-out infinite',
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
    </div>
  )
}

function UserAvatar() {
  return (
    <span
      className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
      style={{ background: '#7c5cff' }}
    >
      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="8" r="3.2" fill="white" />
        <path d="M5 19c1.4-3.4 4-5 7-5s5.6 1.6 7 5" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  )
}

function BotAvatar() {
  return (
    <span
      className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
      style={{ background: '#c084fc' }}
    >
      <svg className="w-[18px] h-[18px] sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="5" y="8" width="14" height="11" rx="3" fill="white" />
        <circle cx="9.5" cy="13" r="1.3" fill="#c084fc" />
        <circle cx="14.5" cy="13" r="1.3" fill="#c084fc" />
        <path d="M12 5v3" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="4" r="1.2" fill="white" />
      </svg>
    </span>
  )
}
