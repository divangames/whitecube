# WhiteCube — сайт агентства

Корпоративный сайт агентства полного цикла **Белая Коробка** / **White Cube**.

**Живой сайт:** [w-cube.ru](https://w-cube.ru)

---

## Стек

| Слой | Технология |
|------|-----------|
| Фреймворк | React 18 + TypeScript |
| Сборщик | Vite |
| Стили | Tailwind CSS |
| Анимации | Framer Motion |
| Роутинг | React Router v6 |
| Шейдеры | @paper-design/shaders-react |
| Иконки | Lucide React |

---

## Быстрый старт

```bash
# Установить зависимости
npm install

# Запустить dev-сервер (или двойной клик на start.bat)
npm run dev
```

Сайт откроется на `http://localhost:5173`

### Переменные окружения

Создайте `.env` в корне проекта:

```env
VITE_TELEGRAM_BOT_TOKEN=ваш_токен
VITE_TELEGRAM_CHAT_ID=ваш_chat_id
```

---

## Сборка для деплоя

Двойной клик на **`build-for-deploy.bat`** — создаст папку `deploy/` и архив `deploy.zip`.

Содержимое `deploy/` заливайте в корень сайта на хостинге.

**Apache** — `.htaccess` генерируется автоматически (нужен для роутинга `/privacy`, `/terms`).  
**Nginx** — добавьте в server-блок:
```nginx
location / { try_files $uri $uri/ /index.html; }
```

Форма заявок отправляет через `/php/send.php` — на хостинге должен быть PHP.

### GitHub Pages

Превью: https://divangames.github.io/whitecube/

Публикация из `main` настроена в `.github/workflows/pages.yml`.
Сборка использует базовый путь `/whitecube/`. PHP-файлы исключены из артефакта Pages.
Для PHP-хостинга задайте `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` через переменные окружения сервера.

### GitVerse Pages

Превью из ветки `main` публикуется workflow `.gitverse/workflows/pages.yml`.

Адрес: [https://delbraun.gitverse.site/WhiteCube](https://delbraun.gitverse.site/WhiteCube)

Один раз в репозитории: **Настройки → Страницы** → включить Pages → источник **Воркфлоу**. Репозиторий должен быть публичным, CI/CD включён.

Форма заявок на Pages не работает (нет PHP) — для заявок используйте боевой хостинг [w-cube.ru](https://w-cube.ru).

---

## Структура проекта

```
src/
├── components/       # UI-компоненты
│   ├── Hero.tsx      # Главный экран + счётчики
│   ├── Services.tsx  # Карточки продуктов и сетка услуг
│   ├── services/     # Карточка «Продвижение в ИИ»
│   ├── Reviews.tsx   # Виджет отзывов (2ГИС + Яндекс.Карты)
│   ├── Contact.tsx   # Форма заявки
│   ├── Navbar.tsx    # Шапка
│   └── Footer.tsx    # Подвал
├── pages/
│   ├── PrivacyPolicy.tsx   # /privacy
│   └── TermsOfService.tsx  # /terms
├── data/
│   └── reviews.json  # Отзывы (обновляются парсером)
├── types/            # Типы карточек услуг и др.
├── context/          # PerfTierContext
└── lib/              # Утилиты

scripts/
└── fetch-reviews.mjs # Парсер отзывов
```

---

## Обновление отзывов

Двойной клик на **`update-reviews.bat`** — откроет браузер, соберёт свежие отзывы с **2ГИС** и **Яндекс.Карт** и сохранит в `src/data/reviews.json`.

Источники настраиваются в `scripts/fetch-reviews.mjs`:

```js
const FIRMS = [
  { name: 'Твоя Бухгалтерия', gis_id: '...', gis_url: '...', ya_url: '...' },
  // ...
]
```

---

## Страницы

| Путь | Описание |
|------|----------|
| `/` | Главная |
| `/privacy` | Политика конфиденциальности |
| `/terms` | Условия соглашения |

---

## Производительность

Сайт автоматически подстраивается под устройство посетителя:

- **full** — все эффекты и анимации
- **reduced** — облегчённые анимации
- **minimal** — только статика

Логика: `src/context/PerfTierContext.tsx`

---

## Контакты

**Email:** manager@cdek-ozon.ru  
**ИП Зотов Иван Владимирович** · ОГРНИП 319246800138804 · ИНН 246113569495
