/**
 * Парсер отзывов — адаптация parser.py под Node.js/Puppeteer.
 *
 * Источники:
 *   1. 2GIS — прямой API (быстро) + DOM-fallback (селекторы из parser.py)
 *   2. Яндекс.Карты — DOM (селекторы из parser.py)
 *
 * Запуск:            node scripts/fetch-reviews.mjs
 * Режим с браузером: node scripts/fetch-reviews.mjs --show
 */

import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

puppeteer.use(StealthPlugin())

const __dir = dirname(fileURLToPath(import.meta.url))
const OUT   = join(__dir, '..', 'src', 'data', 'reviews.json')
const SHOW  = process.argv.includes('--show')

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

// ─── Конфигурация фирм ────────────────────────────────────────────────────────
// Добавьте ссылки на Яндекс.Карты для каждой фирмы когда они будут известны.

const FIRMS = [
  {
    name:    'Твоя Бухгалтерия',
    gis_id:  '70000001104621378',
    gis_url: 'https://2gis.ru/krasnoyarsk/firm/70000001104621378/tab/reviews',
    ya_url:  'https://yandex.ru/maps/org/tvoya_bukhgalteriya/180802384735/reviews/',
  },
  {
    name:    'Белая Коробка',
    gis_id:  '70000001101154874',
    gis_url: 'https://2gis.ru/krasnoyarsk/firm/70000001101154874/tab/reviews',
    ya_url:  'https://yandex.ru/maps/org/whitecube/189634204560/reviews/',
  },
  {
    name:    'Карго 575',
    gis_id:  '',
    gis_url: '',
    ya_url:  'https://yandex.ru/maps/org/kargo575/210415284947/reviews/',
  },
  {
    name:    'СДЭК-ОЗОН',
    gis_id:  '70000001063417025',
    gis_url: 'https://2gis.ru/krasnoyarsk/firm/70000001063417025/tab/reviews',
    ya_url:  '',
  },
]

const API_KEY = '6e7e1929-4ea9-4a5d-8c05-d601860389bd'
const sleep   = ms => new Promise(r => setTimeout(r, ms))

// ─── 2GIS API (быстрый путь) ──────────────────────────────────────────────────

async function fetch2gisApi(firmId) {
  const params = new URLSearchParams({
    limit: '10', offset: '0', is_advertiser: 'false',
    fields: 'meta.providers,meta.branch_rating,meta.branch_reviews_count,meta.total_count,reviews.hiding_reason,reviews.emojis,reviews.trust_factors',
    rated: 'false', sort_by: 'date_edited', key: API_KEY, locale: 'ru_RU',
  })
  const url = `https://public-api.reviews.2gis.com/3.0/branches/${firmId}/reviews?${params}`
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept': 'application/json',
      'Origin': 'https://2gis.ru',
      'Referer': 'https://2gis.ru/',
    },
  })
  if (!res.ok) return []
  const json = await res.json()
  const items = (json.reviews ?? []).filter(r => r.text?.trim())
  console.log(`    [API] total_count=${json.meta?.total_count ?? '?'}, получено=${items.length}`)
  return items
}

// ─── 2GIS DOM (как в parser.py) ───────────────────────────────────────────────
// Селекторы:
//   Контейнер: div._1k5soqfl
//   Автор:     span._16s5yj36
//   Текст:     a._1msln3t
//   Рейтинг:   div._1fkin5c svg[fill="#ffb81c"]  (кол-во закрашенных)
//   Дата:      div._a5f6uz

async function parse2gisDom(browser, url) {
  const page = await browser.newPage()
  await page.setUserAgent(UA)
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'ru-RU,ru;q=0.9' })

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 })
    await sleep(2500)

    // Пропускаем заглушку «обнови браузер»
    const skip = await page.$('a[href*="tab/reviews"]')
    if (skip) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {}),
        skip.click(),
      ])
      await sleep(4000)
    }

    // Ждём появления первого отзыва
    await page.waitForSelector('div._1k5soqfl', { timeout: 15000 }).catch(() => {})

    // Прокручиваем как в _scroll_load из parser.py
    let prevHeight = 0
    for (let i = 0; i < 15; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await sleep(2000)
      const newHeight = await page.evaluate(() => document.body.scrollHeight)
      if (newHeight === prevHeight) break
      prevHeight = newHeight
    }

    // Парсим DOM по селекторам из parser.py
    const items = await page.evaluate(() => {
      const results = []
      document.querySelectorAll('div._1k5soqfl').forEach(item => {
        try {
          const authorEl = item.querySelector('span._16s5yj36')
          const author   = authorEl?.textContent?.trim() || 'Аноним'

          const textEl = item.querySelector('a._1msln3t')
          const text   = textEl?.textContent?.trim() || ''
          if (!text) return

          const starsWrap = item.querySelector('div._1fkin5c')
          const filled    = starsWrap
            ? [...starsWrap.querySelectorAll('svg')].filter(s => s.getAttribute('fill') === '#ffb81c').length
            : 0

          const dateEl = item.querySelector('div._a5f6uz')
          const date   = dateEl?.textContent?.trim() || ''

          results.push({ author, text, rating: filled || 5, date_raw: date })
        } catch {}
      })
      return results
    })

    console.log(`    [DOM] найдено блоков: ${items.length}`)
    return items
  } finally {
    await page.close()
  }
}

// ─── Яндекс.Карты DOM (как в parser.py) ──────────────────────────────────────
// Селекторы:
//   Контейнер: div.business-review-view
//   Автор:     a[href*="/maps/user/"]
//   Текст:     span.spoiler-view__text-container
//   Рейтинг:   aria-label="Оценка N Из 5"
//   Дата:      time

async function parseYandexDom(browser, url, attempt = 1) {
  if (!url) return []
  const page = await browser.newPage()
  await page.setUserAgent(UA)
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'ru-RU,ru;q=0.9' })

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await sleep(5000)

    await page.waitForSelector('div.business-review-view', { timeout: 30000 }).catch(() => {})
    await sleep(2000)

    // Прокрутка
    let prevHeight = 0
    for (let i = 0; i < 20; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await sleep(1500)
      const newHeight = await page.evaluate(() => document.body.scrollHeight)
      if (newHeight === prevHeight) break
      prevHeight = newHeight
    }

    const items = await page.evaluate(() => {
      const results = []
      document.querySelectorAll('div.business-review-view').forEach(item => {
        try {
          let author = 'Аноним'
          for (const a of item.querySelectorAll('a[href]')) {
            if (a.href.includes('/maps/user/') && a.textContent.trim()) {
              author = a.textContent.trim()
              break
            }
          }

          const textEl = item.querySelector('span.spoiler-view__text-container')
          const text   = textEl?.textContent?.trim() || ''
          if (!text) return

          let rating = 0
          for (const el of item.querySelectorAll('[aria-label]')) {
            const label = el.getAttribute('aria-label') || ''
            if (label.startsWith('Оценка')) {
              const parts = label.split(' ')
              rating = parseInt(parts[1]) || 0
              break
            }
          }

          const dateEl  = item.querySelector('time')
          const dateStr = dateEl?.getAttribute('datetime') || dateEl?.textContent?.trim() || ''

          results.push({ author, text, rating: rating || 5, date_raw: dateStr, _ya: true })
        } catch {}
      })
      return results
    })

    const limited = items.slice(0, 10)
    console.log(`    [Яндекс] найдено блоков: ${items.length}, берём: ${limited.length}`)

    // Если 0 и есть попытки — повторяем
    if (items.length === 0 && attempt < 3) {
      await page.close()
      console.log(`    [Яндекс] повтор ${attempt + 1}/3…`)
      await sleep(3000)
      return parseYandexDom(browser, url, attempt + 1)
    }

    return limited
  } finally {
    await page.close().catch(() => {})
  }
}

// ─── Нормализация ─────────────────────────────────────────────────────────────

function parseRuDate(raw) {
  if (!raw) return new Date().toISOString().slice(0, 10)
  // ISO datetime
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10)
  // «12 января 2025»
  const months = { января:1,февраля:2,марта:3,апреля:4,мая:5,июня:6,июля:7,августа:8,сентября:9,октября:10,ноября:11,декабря:12 }
  const m = raw.match(/(\d+)\s+(\S+)\s+(\d{4})/)
  if (m) {
    const mon = months[m[2].toLowerCase()]
    if (mon) return `${m[3]}-${String(mon).padStart(2,'0')}-${m[1].padStart(2,'0')}`
  }
  return new Date().toISOString().slice(0, 10)
}

function normalize(raw, idx, firmName) {
  const dateField = raw.date_edited ?? raw.date_created ?? raw.date_raw ?? ''
  return {
    id:     idx + 1,
    author: (raw.user?.name ?? raw.author ?? 'Аноним').trim(),
    rating: Math.min(5, Math.max(1, Math.round(Number(raw.rating) || 5))),
    date:   parseRuDate(dateField),
    text:   (raw.text ?? '').trim(),
    firm:   firmName,
    source: raw._ya ? 'Яндекс.Карты' : '2GIS',
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`🚀 Запускаем браузер (${SHOW ? 'видимый' : 'фоновый'})…\n`)

  const browser = await puppeteer.launch({
    headless: !SHOW,
    args: ['--lang=ru-RU', '--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  })

  let all = []

  for (const firm of FIRMS) {
    console.log(`\n📍 ${firm.name}`)

    // 1. 2GIS API
    if (firm.gis_id) {
      try {
        const apiItems = await fetch2gisApi(firm.gis_id)
        all = all.concat(apiItems.map(r => ({ ...r, _firm: firm.name })))
      } catch (e) {
        console.warn(`    [API] ошибка: ${e.message}`)
      }
    }

    // 2. 2GIS DOM (дополняем — может дать больше чем API)
    if (firm.gis_url) {
      try {
        const domItems = await parse2gisDom(browser, firm.gis_url)
        all = all.concat(domItems.map(r => ({ ...r, _firm: firm.name })))
      } catch (e) {
        console.warn(`    [DOM] ошибка: ${e.message}`)
      }
    }

    // 3. Яндекс.Карты DOM
    if (firm.ya_url) {
      try {
        const yaItems = await parseYandexDom(browser, firm.ya_url)
        all = all.concat(yaItems.map(r => ({ ...r, _firm: firm.name })))
      } catch (e) {
        console.warn(`    [Яндекс] ошибка: ${e.message}`)
      }
    }
  }

  await browser.close()

  if (all.length === 0) {
    console.error('\n❌ Отзывов не найдено.')
    process.exit(1)
  }

  // Дедупликация по тексту
  const seen  = new Set()
  const clean = all
    .filter(r => {
      const text = (r.text ?? '').trim()
      if (!text) return false
      const k = text.slice(0, 60)
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    .sort((a, b) => {
      const da = a.date_edited ?? a.date_created ?? a.date_raw ?? ''
      const db = b.date_edited ?? b.date_created ?? b.date_raw ?? ''
      return db.localeCompare(da)
    })
    .map((r, i) => normalize(r, i, r._firm ?? ''))

  writeFileSync(OUT, JSON.stringify(clean, null, 2), 'utf-8')
  console.log(`\n✅ Готово! Сохранено ${clean.length} отзывов → src/data/reviews.json`)
}

main().catch(err => { console.error(err); process.exit(1) })
