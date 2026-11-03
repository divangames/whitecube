import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import GumButton from './GumButton'
import { usePerfTier } from '@/context/PerfTierContext'
import { fadeUpMotion } from '@/lib/motionByTier'

const labelClass = 'block mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-soft'

const fieldBase =
  'w-full rounded-2xl border px-4 py-3.5 text-cream placeholder:text-dim/65 text-base outline-none transition-all duration-300 ' +
  'border-white/[0.08] bg-black/35 shadow-inner shadow-black/40 ' +
  'hover:border-fire/30 hover:bg-black/45 ' +
  'focus:border-fire/55 focus:bg-black/50 focus:shadow-[0_0_0_3px_rgba(34,183,216,0.14)]'

export default function Contact() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const tier = usePerfTier()
  const minimal = tier === 'minimal'

  const [form, setForm] = useState({ name: '', message: '' })
  const [contactRaw, setContactRaw] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === 'name' || name === 'message') {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (contactRaw.trim().length < 3) {
      setError('Укажите контакты: телефон, tg или max.')
      return
    }

    setLoading(true)

    try {
      const body = new URLSearchParams()
      body.set('name', form.name)
      body.set('phone', contactRaw.trim())
      body.set('message', form.message)

      const res = await fetch('/php/send.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: body.toString(),
      })

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean
        message?: string
      }

      if (!res.ok || !data.success) {
        setError(data.message || 'Не удалось отправить заявку. Попробуйте ещё раз.')
        return
      }

      setSent(true)
      setForm({ name: '', message: '' })
      setContactRaw('')
    } catch {
      setError('Ошибка сети при отправке заявки.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" ref={ref} className="border-t border-edge py-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-32 items-start">
          <motion.div
            {...fadeUpMotion(tier, inView, 0)}
          >
            <span className="tag block mb-6">Связаться</span>
            <h2 className="font-display font-black text-5xl sm:text-6xl text-cream uppercase leading-[1.0] mb-8">
              Начнем<br />сегодня?
            </h2>
            <p className="text-mid text-base leading-relaxed max-w-sm mb-10">
              Оставьте заявку - мы перезвоним и разберем задачу - предложим решение. Бесплатно.
            </p>

            <div className="flex flex-col gap-4">
              <a href="mailto:manager@cdek-ozon.ru" className="group inline-flex items-center gap-3 text-soft hover:text-cream transition-colors">
                <span className="w-8 h-8 rounded-full border border-edge flex items-center justify-center group-hover:border-fire group-hover:bg-fire/10 transition-all">@</span>
                manager@cdek-ozon.ru
              </a>
              <p className="text-xs text-dim">Работаем 5/2, 9:00-18:00 г. Красноярск</p>
            </div>
          </motion.div>

          <motion.div {...fadeUpMotion(tier, inView, 0.15)}>
            {sent ? (
              <motion.div
                {...(minimal
                  ? { initial: false as const, animate: { opacity: 1, scale: 1 } as const }
                  : { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } })}
                className="flex flex-col items-center text-center py-16 gap-5"
              >
                <CheckCircle2 size={36} className="text-fire" />
                <h3 className="font-display font-black text-2xl text-cream">Заявка отправлена!</h3>
                <p className="text-mid text-sm max-w-xs">Мы получили заявку в Telegram и скоро свяжемся.</p>
                <GumButton onClick={() => setSent(false)} variant="fire" showArrow={false} className="text-sm">Отправить еще одну</GumButton>
              </motion.div>
            ) : (
              <div className="group/form relative">
                {/* Внешнее свечение — заметно на тёмном фоне */}
                <div
                  className="pointer-events-none absolute -inset-[1px] rounded-[28px] opacity-60 blur-xl transition-opacity duration-500 md:group-hover/form:opacity-90 md:group-focus-within/form:opacity-100"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(34,183,216,0.35) 0%, transparent 42%, rgba(167,139,250,0.12) 100%)',
                  }}
                  aria-hidden
                />
                <div className="relative overflow-hidden rounded-[26px] border border-white/[0.09] bg-gradient-to-br from-white/[0.07] via-[#0a0a0a] to-[#050507] shadow-[0_28px_90px_-28px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
                  {/* Декоративные блики */}
                  <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-fire/20 blur-3xl" aria-hidden />
                  <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" aria-hidden />
                  <div className="pointer-events-none absolute right-8 top-0 h-px w-24 bg-gradient-to-r from-transparent via-fire/40 to-transparent" aria-hidden />

                  <form onSubmit={submit} className="relative z-10 flex flex-col gap-6 p-7 sm:p-9">
                    <div className="flex items-center gap-3 border-b border-white/[0.06] pb-5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-fire/35 bg-fire/10 font-display text-sm font-black text-fire">
                        →
                      </span>
                      <div>
                        <p className="font-display text-lg font-bold tracking-tight text-cream">Заявка</p>
                        <p className="text-[12px] text-dim">Ответим в рабочее время</p>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="name" className={labelClass}>Имя</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={change}
                        required
                        placeholder="Как к вам обращаться"
                        className={fieldBase}
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className={labelClass}>Телефон / tg / max</label>
                      <input
                        id="phone"
                        name="phone"
                        type="text"
                        autoComplete="off"
                        value={contactRaw}
                        onChange={(e) => setContactRaw(e.target.value)}
                        placeholder="+7..., @username или max"
                        className={fieldBase}
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className={labelClass}>Задача</label>
                      <textarea
                        id="message"
                        name="message"
                        rows={3}
                        value={form.message}
                        onChange={change}
                        placeholder="Коротко опишите задачу — перезвоним и уточним детали"
                        className={`${fieldBase} min-h-[108px] resize-none`}
                      />
                    </div>

                    {error && <p className="text-sm text-red-300/95 border border-red-500/35 rounded-xl bg-red-950/40 px-4 py-3">{error}</p>}

                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-6">
                      <p className="text-[11px] text-dim max-w-[280px] leading-relaxed">
                        Нажимая «Отправить», вы соглашаетесь с{' '}
                        <Link
                          to="/privacy"
                          className="text-soft underline underline-offset-2 decoration-white/25 transition-colors hover:text-cream hover:decoration-fire/45"
                        >
                          политикой конфиденциальности
                        </Link>{' '}
                        и{' '}
                        <Link
                          to="/terms"
                          className="text-soft underline underline-offset-2 decoration-white/25 transition-colors hover:text-cream hover:decoration-fire/45"
                        >
                          условиями соглашения
                        </Link>
                      </p>

                      {loading ? (
                        <div className="inline-flex items-center gap-2 rounded-full bg-fire px-6 py-3 font-semibold text-sm text-cream opacity-70">
                          {minimal ? (
                            <span className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-cream/30 border-t-cream" />
                          ) : (
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                              className="block h-4 w-4 rounded-full border-2 border-cream/30 border-t-cream"
                            />
                          )}
                        </div>
                      ) : (
                        <GumButton type="submit" disabled={loading} variant="fire">
                          Отправить
                        </GumButton>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

    </section>
  )
}
