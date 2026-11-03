import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'

const app = express()
app.use(cors({ origin: true }))
app.use(express.json({ limit: '32kb' }))

const escapeHtml = (s = '') =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

async function sendTelegram({ name, phone, message }) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) return { ok: false, skipped: true, reason: 'missing TELEGRAM_*' }

  const text = [
    '🔔 <b>Новая заявка с сайта</b>',
    '',
    `<b>Имя:</b> ${escapeHtml(name)}`,
    `<b>Телефон:</b> ${escapeHtml(phone)}`,
    `<b>Задача:</b> ${escapeHtml(message || '—')}`,
  ].join('\n')

  const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  })

  const tgData = await tgRes.json().catch(() => ({}))
  if (!tgRes.ok || tgData?.ok === false) {
    throw new Error(`Telegram send failed: ${JSON.stringify(tgData)}`)
  }
  return { ok: true }
}

async function sendEmailIfConfigured({ name, phone, message }) {
  const host = process.env.NOTISEND_SMTP_HOST
  const user = process.env.NOTISEND_SMTP_USER
  const pass = process.env.NOTISEND_SMTP_PASS

  if (!host || !user || !pass) return { ok: false, skipped: true, reason: 'missing NOTISEND_SMTP_*' }

  const port = Number(process.env.NOTISEND_SMTP_PORT || 587)
  const secure = process.env.NOTISEND_SMTP_SECURE === 'true' || port === 465

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure && port === 587,
    auth: { user, pass },
  })

  const to = process.env.MAIL_TO || 'manager@cdek-ozon.ru'
  const from = process.env.MAIL_FROM || user

  await transporter.sendMail({
    from: `"Сайт Whitecube" <${from}>`,
    to,
    subject: `Заявка с сайта: ${name}`,
    text: [`Имя: ${name}`, `Телефон: ${phone}`, '', 'Задача:', message || '—', ''].join('\n'),
  })

  return { ok: true }
}

app.post('/api/contact', async (req, res) => {
  try {
    const { name, phone, message } = req.body || {}
    const n = String(name || '').trim()
    const p = String(phone || '').trim()
    const msg = String(message || '').trim()

    if (!n || !p) {
      return res.status(400).json({ ok: false, error: 'Укажите имя и телефон' })
    }

    const tg = await sendTelegram({ name: n, phone: p, message: msg })
    const smtp = await sendEmailIfConfigured({ name: n, phone: p, message: msg })

    if (!tg.ok && !smtp.ok) {
      return res.status(500).json({
        ok: false,
        error: 'Сервер не настроен: укажите TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID или SMTP.',
      })
    }

    return res.json({ ok: true })
  } catch (e) {
    console.error('[contact-api]', e)
    return res.status(500).json({
      ok: false,
      error: 'Не удалось отправить. Попробуйте позже.',
    })
  }
})

const port = Number(process.env.PORT || 3001)
app.listen(port, () => {
  console.log(`Contact API: http://localhost:${port}  (POST /api/contact)`)
})
