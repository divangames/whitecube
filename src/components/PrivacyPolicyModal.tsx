import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { usePerfTier } from '@/context/PerfTierContext'

type Props = {
  open: boolean
  onClose: () => void
}

function PolicyDivider() {
  return <div className="my-7 border-t border-white/[0.08]" role="separator" />
}

export default function PrivacyPolicyModal({ open, onClose }: Props) {
  const tier = usePerfTier()
  const minimal = tier === 'minimal'
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) panelRef.current?.focus()
  }, [open])

  const overlayMotion = minimal
    ? {}
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } }

  const panelMotion = minimal
    ? {}
    : {
        initial: { opacity: 0, y: 16, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 12, scale: 0.98 },
        transition: { type: 'spring', stiffness: 380, damping: 32 },
      }

  const node = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Закрыть"
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            onClick={onClose}
            {...overlayMotion}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="relative z-10 flex max-h-[min(88vh,820px)] w-full max-w-lg flex-col overflow-hidden rounded-[22px] border border-white/[0.1] bg-gradient-to-br from-[#121212] via-[#0a0a0a] to-[#050507] shadow-[0_32px_120px_-24px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.06)] outline-none sm:max-w-2xl"
            {...panelMotion}
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-fire/15 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" aria-hidden />

            <div className="relative flex shrink-0 items-start justify-between gap-4 border-b border-white/[0.07] px-5 py-4 sm:px-7 sm:py-5">
              <div className="min-w-0">
                <p id={titleId} className="font-display text-lg font-bold leading-snug text-cream sm:text-xl">
                  Политика конфиденциальности
                </p>
                <p className="mt-1 text-[13px] text-mid">для сервиса «БелаяКоробка.рф»</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-soft transition-colors hover:border-fire/40 hover:bg-fire/10 hover:text-cream"
              >
                <X size={20} strokeWidth={2} aria-hidden />
              </button>
            </div>

            <div className="relative flex-1 overflow-y-auto overscroll-contain px-5 pb-7 pt-5 sm:px-7 sm:pb-8 sm:pt-6">
              <div className="space-y-5 text-[13px] leading-relaxed text-mid sm:text-sm">
                <p className="text-[11px] uppercase tracking-[0.14em] text-dim">Дата вступления в силу: 08.05.2026</p>

                <p>
                  Настоящая Политика конфиденциальности определяет порядок обработки, хранения и защиты информации пользователей сайта «БелаяКоробка.рф», а также Telegram-ботов, Telegram-каналов,
                  Telegram-mini app и иных сервисов проекта «БелаяКоробка» (далее — «Сервис»).
                </p>
                <p>Используя Сервис, пользователь подтверждает согласие с условиями настоящей Политики.</p>

                <PolicyDivider />

                <section className="space-y-3">
                  <h3 className="font-display text-base font-bold text-cream">1. Общие положения</h3>
                  <p>
                    <span className="text-soft">1.1.</span> Администрация Сервиса уважает право пользователей на неприкосновенность личной жизни и обеспечивает защиту персональных данных в соответствии с
                    законодательством Российской Федерации и применимыми международными нормами.
                  </p>
                  <p>
                    <span className="text-soft">1.2.</span> Настоящая Политика применяется ко всей информации, которую Сервис может получить от пользователя:
                  </p>
                  <ul className="list-disc space-y-1.5 pl-5 marker:text-fire/80">
                    <li>через сайт;</li>
                    <li>через Telegram-ботов;</li>
                    <li>через Telegram Web Apps / Mini Apps;</li>
                    <li>через формы обратной связи;</li>
                    <li>через API Telegram;</li>
                    <li>при использовании функций авторизации и подписки.</li>
                  </ul>
                  <p>
                    <span className="text-soft">1.3.</span> Использование Сервиса означает согласие пользователя с настоящей Политикой.
                  </p>
                </section>

                <PolicyDivider />

                <section className="space-y-3">
                  <h3 className="font-display text-base font-bold text-cream">2. Какие данные могут собираться</h3>
                  <p>Сервис может собирать и обрабатывать следующие данные:</p>

                  <h4 className="pt-1 text-[13px] font-semibold text-soft sm:text-sm">2.1. Данные Telegram</h4>
                  <p>При использовании Telegram-функций могут обрабатываться:</p>
                  <ul className="list-disc space-y-1.5 pl-5 marker:text-fire/80">
                    <li>Telegram ID;</li>
                    <li>username;</li>
                    <li>имя и фамилия, указанные в Telegram;</li>
                    <li>язык интерфейса;</li>
                    <li>фотография профиля (если доступна через Telegram API);</li>
                    <li>данные взаимодействия с ботом или mini app.</li>
                  </ul>

                  <h4 className="pt-1 text-[13px] font-semibold text-soft sm:text-sm">2.2. Технические данные</h4>
                  <p>Автоматически могут собираться:</p>
                  <ul className="list-disc space-y-1.5 pl-5 marker:text-fire/80">
                    <li>IP-адрес;</li>
                    <li>тип браузера;</li>
                    <li>тип устройства;</li>
                    <li>операционная система;</li>
                    <li>cookie-файлы;</li>
                    <li>дата и время посещения;</li>
                    <li>страницы и действия внутри Сервиса;</li>
                    <li>технические логи и ошибки.</li>
                  </ul>

                  <h4 className="pt-1 text-[13px] font-semibold text-soft sm:text-sm">2.3. Данные, предоставленные пользователем</h4>
                  <p>Пользователь может добровольно предоставить:</p>
                  <ul className="list-disc space-y-1.5 pl-5 marker:text-fire/80">
                    <li>номер телефона;</li>
                    <li>email;</li>
                    <li>ссылки;</li>
                    <li>текстовые сообщения;</li>
                    <li>файлы и изображения;</li>
                    <li>иные данные, переданные через формы, чат или Telegram.</li>
                  </ul>
                </section>

                <PolicyDivider />

                <section className="space-y-3">
                  <h3 className="font-display text-base font-bold text-cream">3. Цели обработки данных</h3>
                  <p>Данные пользователей используются исключительно для:</p>
                  <ul className="list-disc space-y-1.5 pl-5 marker:text-fire/80">
                    <li>предоставления функционала Сервиса;</li>
                    <li>работы Telegram-ботов и mini app;</li>
                    <li>авторизации и идентификации пользователя;</li>
                    <li>обработки запросов и заявок;</li>
                    <li>обратной связи;</li>
                    <li>технической поддержки;</li>
                    <li>улучшения качества работы Сервиса;</li>
                    <li>аналитики и статистики;</li>
                    <li>предотвращения мошенничества и злоупотреблений;</li>
                    <li>обеспечения безопасности;</li>
                    <li>исполнения требований законодательства.</li>
                  </ul>
                </section>

                <PolicyDivider />

                <section className="space-y-3">
                  <h3 className="font-display text-base font-bold text-cream">4. Telegram и сторонние сервисы</h3>
                  <p>
                    <span className="text-soft">4.1.</span> Сервис может использовать инфраструктуру Telegram Messenger и Telegram API.
                  </p>
                  <p>
                    <span className="text-soft">4.2.</span> Пользователь понимает и соглашается, что Telegram является сторонним сервисом, работающим по собственным правилам и политике конфиденциальности.
                  </p>
                  <p>
                    <span className="text-soft">4.3.</span> Администрация Сервиса не несет ответственности за обработку данных Telegram со стороны Telegram Messenger LLP или связанных структур.
                  </p>
                </section>

                <PolicyDivider />

                <section className="space-y-3">
                  <h3 className="font-display text-base font-bold text-cream">5. Cookie и аналитика</h3>
                  <p>
                    <span className="text-soft">5.1.</span> Сервис может использовать cookie и аналогичные технологии.
                  </p>
                  <p>
                    <span className="text-soft">5.2.</span> Cookie применяются для:
                  </p>
                  <ul className="list-disc space-y-1.5 pl-5 marker:text-fire/80">
                    <li>корректной работы сайта;</li>
                    <li>авторизации;</li>
                    <li>сохранения настроек;</li>
                    <li>аналитики посещений;</li>
                    <li>улучшения пользовательского опыта.</li>
                  </ul>
                  <p>
                    <span className="text-soft">5.3.</span> Пользователь может отключить cookie в настройках браузера.
                  </p>
                </section>

                <PolicyDivider />

                <section className="space-y-3">
                  <h3 className="font-display text-base font-bold text-cream">6. Передача данных третьим лицам</h3>
                  <p>
                    <span className="text-soft">6.1.</span> Персональные данные не продаются и не передаются третьим лицам, за исключением случаев:
                  </p>
                  <ul className="list-disc space-y-1.5 pl-5 marker:text-fire/80">
                    <li>предусмотренных законодательством;</li>
                    <li>необходимых для работы Сервиса;</li>
                    <li>при наличии согласия пользователя;</li>
                    <li>при использовании хостинга, аналитики или облачных сервисов.</li>
                  </ul>
                  <p>
                    <span className="text-soft">6.2.</span> Сервис может использовать сторонние сервисы аналитики и инфраструктуры.
                  </p>
                </section>

                <PolicyDivider />

                <section className="space-y-3">
                  <h3 className="font-display text-base font-bold text-cream">7. Хранение и защита данных</h3>
                  <p>
                    <span className="text-soft">7.1.</span> Администрация Сервиса принимает разумные технические и организационные меры для защиты данных пользователей.
                  </p>
                  <p>
                    <span className="text-soft">7.2.</span> Несмотря на принимаемые меры, абсолютная безопасность передачи данных через интернет не может быть гарантирована.
                  </p>
                </section>

                <PolicyDivider />

                <section className="space-y-3">
                  <h3 className="font-display text-base font-bold text-cream">8. Права пользователя</h3>
                  <p>Пользователь имеет право:</p>
                  <ul className="list-disc space-y-1.5 pl-5 marker:text-fire/80">
                    <li>запросить информацию о своих данных;</li>
                    <li>потребовать изменение или удаление данных;</li>
                    <li>отозвать согласие на обработку данных;</li>
                    <li>прекратить использование Сервиса.</li>
                  </ul>
                </section>

                <PolicyDivider />

                <section className="space-y-3">
                  <h3 className="font-display text-base font-bold text-cream">9. Ограничение ответственности</h3>
                  <p>
                    <span className="text-soft">9.1.</span> Сервис предоставляется по принципу «как есть» («as is»).
                  </p>
                  <p>
                    <span className="text-soft">9.2.</span> Администрация не гарантирует бесперебойную работу Telegram, сайта, API или сторонних сервисов.
                  </p>
                  <p>
                    <span className="text-soft">9.3.</span> Пользователь самостоятельно несет ответственность за публикуемую и передаваемую информацию.
                  </p>
                </section>

                <PolicyDivider />

                <section className="space-y-3">
                  <h3 className="font-display text-base font-bold text-cream">10. Изменение политики</h3>
                  <p>Администрация Сервиса вправе изменять настоящую Политику без предварительного уведомления пользователей.</p>
                  <p>
                    Актуальная версия всегда публикуется на сайте:{' '}
                    <a
                      href="https://белая-коробка.рф"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-fire underline decoration-fire/35 underline-offset-2 transition-colors hover:text-cream hover:decoration-cream/40"
                    >
                      https://белая-коробка.рф
                    </a>
                  </p>
                </section>

                <PolicyDivider />

                <section className="space-y-3">
                  <h3 className="font-display text-base font-bold text-cream">11. Контакты</h3>
                  <p>
                    По вопросам, связанным с обработкой персональных данных и работой Сервиса, пользователь может обратиться через контакты, указанные на сайте или в Telegram.
                  </p>
                </section>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  if (typeof document === 'undefined') return null
  return createPortal(node, document.body)
}
