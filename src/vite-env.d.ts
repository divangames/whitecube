/// <reference types="vite/client" />

declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}

interface ImportMetaEnv {
  readonly VITE_CONTACT_API?: string
  readonly VITE_TELEGRAM_BOT_TOKEN?: string
  readonly VITE_TELEGRAM_CHAT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
