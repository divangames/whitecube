import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const KEY = 'whitecube-cookie-consent-v1'

export default function CookieConsentBar() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      const accepted = window.localStorage.getItem(KEY) === '1'
      setOpen(!accepted)
    } catch {
      setOpen(true)
    }
  }, [])

  const accept = () => {
    try {
      window.localStorage.setItem(KEY, '1')
    } catch {
      // no-op
    }
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-x-3 bottom-3 z-[90] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-[560px]">
      <div className="rounded-2xl border border-white/15 bg-black/85 p-4 shadow-[0_18px_55px_-18px_rgba(0,0,0,0.85)] backdrop-blur-lg">
        <p className="text-xs leading-relaxed text-mid">
          Мы используем cookie для корректной работы сайта и аналитики. Продолжая пользоваться сайтом, вы соглашаетесь с{' '}
          <Link to="/privacy" className="underline underline-offset-2 hover:text-cream transition-colors">
            политикой конфиденциальности
          </Link>
          .
        </p>
        <div className="mt-3 flex items-center justify-end">
          <button
            type="button"
            onClick={accept}
            className="rounded-full bg-fire px-4 py-2 text-xs font-semibold text-cream transition-opacity hover:opacity-90"
          >
            Принять
          </button>
        </div>
      </div>
    </div>
  )
}
