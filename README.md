# Инструкция: карточки услуг и кастомизация

Этот файл — источник правды по блоку услуг в `index.html`.
Если в коде блока услуг что-то меняется, этот файл нужно обновлять в том же изменении.

## Где находится блок

- HTML секция: `#services` в `index.html`
- Основные CSS-правила карточек: селекторы `#services .service-card*` в верхнем `<style>`

## Быстрый чек-лист добавления новой карточки

1. Скопируйте существующую карточку внутри сетки `services-grid`.
2. Обновите индекс (например, `09`) в `.service-card-index`.
3. Задайте акцент через `data-hover="..."` на корневом `div.service-card`.
4. Подставьте иконку в `.service-card-float img`.
5. Заполните:
   - `.service-card-tag`
   - `.service-card-title`
   - `.service-card-price-label` / `.service-card-price-value`
   - описание (`.service-card-copy`) или список (`.service-card-list`)
   - кнопку/ссылку `.service-card-cta`

## Шаблон карточки

```html
<div class="glass-card service-card px-5 py-6 sm:px-7 sm:py-8 flex flex-col h-full group relative" data-hover="green">
  <span class="service-card-index" aria-hidden="true">09</span>
  <div class="service-card-float" aria-hidden="true">
    <img src="URL_ИКОНКИ" alt="">
  </div>
  <div class="service-card-top">
    <span class="service-card-tag">Категория</span>
  </div>
  <div class="service-card-inner">
    <h3 class="service-card-title font-unbounded">Название услуги</h3>
    <div class="service-card-price">
      <span class="service-card-price-label">Старт</span>
      <span class="service-card-price-value">от 10 000 ₽</span>
    </div>
    <p class="service-card-copy">Короткое описание услуги.</p>
    <a href="#" target="_blank" rel="noopener noreferrer" class="service-card-cta">
      Подробнее <i class="ph ph-arrow-right" aria-hidden="true"></i>
    </a>
  </div>
</div>
```

## Акценты `data-hover`

Карточки используют акцентные переменные:

- `--svc-accent-1`
- `--svc-accent-2`

Они влияют на:

- hover-контур карточки (анимационный градиент по периметру),
- цвет тега,
- левую линию цены,
- hover-стиль кнопки.

Текущие пресеты:

- `green`
- `pink-cyan`
- `orange`
- `red-yellow`
- `yellow`
- `yellow-white`
- `cyan-blue`
- `red-white`

## Как добавить новый цветовой пресет

В CSS рядом с другими пресетами добавьте:

```css
#services .service-card[data-hover="violet-lime"] {
  --svc-accent-1: #a855f7;
  --svc-accent-2: #84cc16;
  --svc-accent-rgb: 168, 85, 247;
}
```

И затем поставьте карточке:

```html
data-hover="violet-lime"
```

## Анимация контура (важно)

Сейчас анимируется только **градиент контура** на `hover`.
Сам контур не вращается как слой.

Ключевые части:

- `#services .service-card::after` — рисует контур через `conic-gradient` + `mask`
- `@property --svc-border-angle` — анимируемый угол градиента
- `#services .service-card:hover::after` — включает анимацию
- `@keyframes service-accent-spin` — меняет `--svc-border-angle` от `0deg` до `360deg`

## Список в карточке «Твоя бухгалтерия»

В списке используются иконки:

```html
<i class="ph ph-arrow-right service-card-list-mark" aria-hidden="true"></i>
```

Цвет стрелок:

- `#f74200` (задаётся в `.service-card-list-mark`)

## Вынесенная иконка и индекс

- Вынесенная иконка карточки: `.service-card-float`
- Индекс фоном внутри карточки: `.service-card-index`

Если иконка/индекс начинают пересекаться с текстом:

1. сначала корректируйте `padding-right` у `.service-card-top` и `.service-card-inner`,
2. потом размеры/позицию `.service-card-float`,
3. затем размер/позицию `.service-card-index`.

## Правило поддержки

При любом изменении блока услуг в `index.html`:

1. обновить этот файл;
2. проверить, что названия классов/атрибутов и поведение совпадают с кодом.
