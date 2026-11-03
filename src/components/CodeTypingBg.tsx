import { useState, useEffect, useRef, useMemo } from 'react'
import { DotPattern } from './magicui/dot-pattern'
import { useInViewport, usePrefersReducedMotion } from '@/hooks/useInViewport'
import { useSaveGpuMode } from '@/hooks/usePerfBudget'

const CODE = `import requests
from dataclasses import dataclass
@dataclass
class Service:
    name: str
    price: int
    active: bool = True
def fetch(url: str) -> list:
    res = requests.get(url)
    if res.status_code != 200:
        return []
    return res.json()
def active_only(items: list) -> list:
    return [s for s in items
            if s.get("active")]
def fmt(amount: int) -> str:
    return f"{amount:,} ₽".replace(",", " ")
class ApiClient:
    BASE = "https://object8.io/api"
    def __init__(self, token: str):
        self.token = token
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {token}",
        })
    def get(self, path: str) -> dict:
        url = f"{self.BASE}{path}"
        res = self.session.get(url)
        res.raise_for_status()
        return res.json()
    def post(self, path: str, data: dict):
        return self.session.post(
            f"{self.BASE}{path}", json=data)
client = ApiClient(token="sk-whitecube")
services = client.get("/services")
active = active_only(services)
for item in active:
    print(f"{item['name']}: {fmt(item['price'])}")
total = sum(s["price"] for s in active)
print(f"Итого: {fmt(total)}")
`

// ─── Tokenizer ───────────────────────────────────────────
type Token = { text: string; color: string }

const KW = new Set([
  'import','from','def','class','return','if','else','elif',
  'for','while','in','not','and','or','True','False','None',
  'with','as','try','except','pass','self','raise',
])
const BUILTIN = new Set([
  'print','len','range','list','dict','str','int','float',
  'bool','sum','requests','dataclass','Optional',
])

function tokenizeLine(line: string): Token[] {
  const out: Token[] = []
  let rest = line
  while (rest.length) {
    if (rest[0] === '#') { out.push({ text: rest, color: '#4b5563' }); break }
    if (rest[0] === '@') {
      const m = rest.match(/^@[A-Za-z_]\w*/)
      if (m) { out.push({ text: m[0], color: '#f472b6' }); rest = rest.slice(m[0].length); continue }
      out.push({ text: '@', color: '#f472b6' }); rest = rest.slice(1); continue
    }
    const strM = rest.match(/^(f?)(["'])((?:\\.|(?!\2).)*?)(\2|$)/)
    if (strM) {
      out.push({ text: strM[0], color: strM[1] === 'f' ? '#34d399' : '#fbbf24' })
      rest = rest.slice(strM[0].length); continue
    }
    const numM = rest.match(/^\d+\.?\d*/)
    if (numM) { out.push({ text: numM[0], color: '#fb923c' }); rest = rest.slice(numM[0].length); continue }
    const wordM = rest.match(/^[A-Za-z_]\w*/)
    if (wordM) {
      const w = wordM[0]
      out.push({ text: w, color: KW.has(w) ? '#a78bfa' : BUILTIN.has(w) ? '#22d3ee' : '#e2e8f0' })
      rest = rest.slice(w.length); continue
    }
    const pM = rest.match(/^[^\w\s#@'"]+/)
    if (pM) { out.push({ text: pM[0], color: '#475569' }); rest = rest.slice(pM[0].length); continue }
    out.push({ text: rest[0], color: '' }); rest = rest.slice(1)
  }
  return out
}

// ─── Component ───────────────────────────────────────────

export default function CodeTypingBg({ active = true }: { active?: boolean }) {
  const [count, setCount] = useState(0)
  const outerRef = useRef<HTMLDivElement>(null)
  const wrapRef  = useRef<HTMLDivElement>(null)
  const inView = useInViewport(outerRef, { rootMargin: '120px' })
  const reduced = usePrefersReducedMotion()
  const saveGpu = useSaveGpuMode()

  // Токенизуем все строки один раз — потом просто берём первые N и обрезаем последнюю.
  const tokenizedLines = useMemo(() => {
    const lines = CODE.split('\n')
    return lines.map(line => ({ raw: line, tokens: tokenizeLine(line) }))
  }, [])

  useEffect(() => {
    // Если уже всё-всё готово (reduced motion) — рисуем сразу полный код.
    if (reduced) { setCount(CODE.length); return }
    // Слабое железо — без таймеров и постоянных setState.
    if (saveGpu) { setCount(CODE.length); return }
    // Анимация запускается только на hover карточки и когда блок в видимости.
    if (!active || !inView) return

    let alive = true
    const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

    const run = async () => {
      let pos = count
      while (alive) {
        if (pos >= CODE.length) {
          // Pause then restart
          await wait(900)
          pos = 0
          setCount(0)
          continue
        }

        pos++
        setCount(pos)

        const ch = CODE[pos - 1]
        const think = Math.random() < 0.02 ? 220 + Math.random() * 240 : 0
        // Базовая скорость замедлена примерно вдвое — глазу не критично,
        // ре-рендеров React в 2× меньше.
        const ms = think || (
          ch === '\n'                    ? 220 + Math.random() * 240
          : /[.,:;(){}\[\]=>]/.test(ch)  ? 80  + Math.random() * 70
          : ch === ' '                   ? 35  + Math.random() * 25
          :                                50  + Math.random() * 35
        )
        await wait(ms)
      }
    }

    run()
    return () => { alive = false }
  }, [active, inView, reduced, saveGpu])

  // Срез токенов до текущего количества символов.
  const visibleLines = useMemo(() => {
    if (count >= CODE.length) return tokenizedLines
    let remaining = count
    const result: { raw: string; tokens: Token[] }[] = []
    for (const line of tokenizedLines) {
      const lineLen = line.raw.length + 1 // +1 за \n
      if (remaining <= 0) break
      if (remaining >= lineLen) {
        result.push(line)
        remaining -= lineLen
      } else {
        // Обрезаем последнюю строку до remaining символов.
        let acc = 0
        const partial: Token[] = []
        for (const tok of line.tokens) {
          if (acc + tok.text.length <= remaining) {
            partial.push(tok)
            acc += tok.text.length
          } else {
            partial.push({ text: tok.text.slice(0, remaining - acc), color: tok.color })
            break
          }
        }
        result.push({ raw: line.raw.slice(0, remaining), tokens: partial })
        remaining = 0
      }
    }
    return result
  }, [count, tokenizedLines])

  // Scroll up only when content overflows the bottom of the container
  useEffect(() => {
    const wrap = wrapRef.current
    const outer = outerRef.current
    if (!wrap || !outer) return

    if (visibleLines.length <= 1) {
      wrap.style.transition = 'none'
      wrap.style.transform = 'translateY(0px)'
      return
    }

    const TOP_PAD = 20  // pt-5
    const availH = outer.clientHeight - TOP_PAD
    const contentH = wrap.scrollHeight  // actual rendered height

    if (contentH > availH) {
      wrap.style.transition = 'transform 0.18s linear'
      wrap.style.transform = `translateY(-${contentH - availH}px)`
    }
  }, [visibleLines.length])

  return (
    <div ref={outerRef} className="absolute inset-0 overflow-hidden pointer-events-none select-none rounded-2xl">

      {/* На мобильных код приглушён (opacity-60); от md — заметно ярче для читаемости */}
      <pre className="absolute inset-x-0 top-0 px-6 pt-5 text-[16px] leading-[1.85] font-mono opacity-60 md:opacity-[0.88] lg:opacity-100">
        <div ref={wrapRef}>
          {visibleLines.map((line, i) => {
            const isLast = i === visibleLines.length - 1
            return (
              <div key={i}>
              {line.tokens.map((t, j) => (
                t.color
                  ? <span key={j} style={{ color: t.color }}>{t.text}</span>
                  : <span key={j}>{t.text}</span>
              ))}
                {isLast && !reduced && !saveGpu && (
                  <span className="animate-pulse" style={{ color: '#22b7d8' }}>▋</span>
                )}
              </div>
            )
          })}
        </div>
      </pre>

      <DotPattern width={18} height={18} cr={0.8} className="opacity-[0.15] fill-white" />
      <div className="absolute inset-0 bg-gradient-to-r from-card via-transparent to-card/70 md:from-card/45 md:to-card/55" />
      <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-card to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-card to-transparent" />
    </div>
  )
}
