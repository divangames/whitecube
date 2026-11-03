/**
 * Мобильный РФ: только +7 (9XX) XXX-XX-XX, в позициях номера допустимы только цифры.
 * Полный номер = 11 цифр: 79 + 9 цифр (код 9XX и остальное).
 */

/** Из строки ввода оставляем только цифры и приводим к виду 79… (не более 11). */
export function normalizeRuPhoneDigits(raw: string): string {
  let d = raw.replace(/\D/g, '')
  if (d.startsWith('8')) d = '7' + d.slice(1)
  if (d.length === 0) return ''

  if (!d.startsWith('7')) {
    if (d[0] === '9') d = '7' + d
    else d = '7' + d.replace(/^7+/, '')
  }

  /* После кода страны 7 мобильный РФ начинается с 9 */
  if (d.length >= 2 && d[1] !== '9') {
    d = ('79' + d.slice(2)).slice(0, 11)
  }

  return d.slice(0, 11)
}

/** Отображение строго по шаблону +7 (9XX) XXX-XX-XX */
export function formatRuPhoneMask(digits: string): string {
  const d = (digits || '').slice(0, 11)
  if (d.length === 0 || d === '7') return '+7 (9'

  const n = d.slice(1)
  if (n.length === 0) return '+7 (9'

  let out = '+7 ('
  const g1 = n.slice(0, 3)
  out += g1
  if (n.length <= 3) return n.length === 3 ? `${out}) ` : out

  out += ') ' + n.slice(3, 6)
  if (n.length <= 6) return out
  out += '-' + n.slice(6, 8)
  if (n.length <= 8) return out
  out += '-' + n.slice(8, 10)
  return out
}

export function isRuMobilePhoneComplete(digits: string): boolean {
  return /^79\d{9}$/.test(digits)
}

/** Сколько цифр не хватает до полного номера (11). */
export function ruMobileDigitsRemaining(digits: string): number {
  return Math.max(0, 11 - (digits || '').length)
}

/** Склонение для «N цифр» */
export function ruDigitsWord(n: number): string {
  const k = n % 10
  const k100 = n % 100
  if (k100 >= 11 && k100 <= 14) return 'цифр'
  if (k === 1) return 'цифру'
  if (k >= 2 && k <= 4) return 'цифры'
  return 'цифр'
}
