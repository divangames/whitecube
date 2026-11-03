# План оптимизации сайта

> Создан 7 мая 2026. Сайт «Белая коробка». Текущая проблема: высокое потребление CPU/RAM в браузере.

---

## Кто тратит ресурсы (главные виновники)

### 1. `src/components/ParticleCube.tsx` (Hero) — ~5170 частиц на canvas каждый кадр
В `buildParticles()`:
- 12 рёбер × 81 точка = 972
- 8 углов
- **4200** частиц на гранях (`for (let i = 0; i < 4200; i++)`)
- Итого ~5180. На каждый кадр: `rotateY` × 5180, `rotateX` × 5180, `pts.sort()`, `ctx.arc()` + `fill()` × 5180, физика × 5180.
- `ctx.arc + beginPath + fill` для каждой точки + `fillStyle = rgba(...)` (создание новой строки) — самая горячая точка.
- Анимация работает всегда, даже когда Hero уехал из вьюпорта.

### 2. `SectionedMeshShaderBg` (Hero, через `paper-design/shaders-react`)
- WebGL-шейдер `MeshGradient` рендерится **в два слоя** одновременно (палитра A + палитра B), каждый full-screen, постоянно.
- На Hero `progress=0.45` фиксирован — второй слой не нужен, но рендерится.
- Тоже работает всегда, даже когда блок не виден.

### 3. Liquid Aurora — `filter: blur(50px) saturate(1.3)` × 4 круга
- 4 элемента с морфом + `blur(50px)` — самое дорогое для GPU из всего CSS. Включается, как только карточка появляется в DOM, и крутится вечно (`infinite`).

### 4. `src/components/Waves.tsx` (карточка Логистика)
- При gap=8px и ширине ~600px → ~100 SVG-path × ~52 точки = **5200 точек, пересчитываются и пишутся в `setAttribute('d')` каждый кадр**.
- `window.addEventListener('mousemove')` навешан **глобально** — отрабатывает на любое движение мыши по странице, даже если карточка вне экрана.

### 5. `src/components/CodeTypingBg.tsx` (карточка `object8.io`)
- `setCount(pos)` — react-стейт пересчитывается каждые 25–200мс (на пробелах ~25–35мс ≈ 30–40 ре-рендеров/сек).
- На каждом ре-рендере проходит `tokenizeLine` по всем строкам с регулярками.
- Не паузится, когда не виден.

### 6. Spline в `package.json`
- `@splinetool/react-spline ^4.1.0` ещё в зависимостях, хотя в коде уже не используется — тянет тяжёлый WebGL-runtime.

### 7. Прочее по мелочи
- Неиспользуемые keyframes (`atlas-drift`, `atlas-drift2`) в `src/index.css`.
- `pochta_rus.svg` ~43KB — можно прогнать через SVGO.
- `images/cart/*.png` — конвертировать в webp/avif.

---

## План действий по приоритету

### P0 — даст самый быстрый эффект, минимум риска

1. **Сократить плотность частиц куба.**
   - 4200 → 1200 face-particles, 80 → 40 на ребро. Визуально остаётся плотным, но draw-loop легче в ~3–4×. −30–50% CPU.
   - Заменить `ctx.arc()` на `ctx.fillRect()` (квадратные «пиксели» — реалистичнее под бренд «Whitecube») или **рисовать в один проход** через `Path2D`. Альтернатива — `OffscreenCanvas` + `drawImage` спрайтом.

2. **Поставить тяжёлые анимации на паузу, когда блок не виден** (IntersectionObserver):
   - `ParticleCube` — отменять `requestAnimationFrame`, когда Hero уехал.
   - `MeshGradient` (Hero) — обернуть в обёртку, ставить `display: none` или передавать `speed={0}` когда не виден.
   - `Liquid Aurora` — добавить класс `.paused` → `animation-play-state: paused` для всех `.liquid-shape`.
   - `Waves` — отменять RAF, навесить `mousemove` на `document` только когда видим.
   - `CodeTypingBg` — ставить таймер на паузу.

3. **`SectionedMeshShaderBg` на Hero — оставить только один слой.**
   - На Hero нужна одна статичная палитра. Второй `MeshGradient` — мёртвый груз. −50% GPU. Добавить пропс `single?: boolean`.

4. **Уменьшить blur у Liquid Aurora.**
   - `blur(50px) → blur(28–32px)` + `saturate(1.3) → saturate(1.15)` (или убрать). На GPU blur стоит O(radius²), уменьшение в полтора раза = ~2× экономия.
   - Можно убрать 4-й (фиолетовый) круг — визуально остаются 3 пятна как на референсе.

### P1 — заметно ускоряет загрузку и общий рендер

5. **Удалить `@splinetool/react-spline` и `spline`-связку из бандла.**
   - `npm uninstall @splinetool/react-spline` + удалить `src/components/ui/interactive-3d-robot.tsx`. −0.5…1MB в бандле.
   - Удалить CSS-правило `#hero-robot a[href*="spline"]` в `src/index.css`.

6. **Lazy-load всех ниже-первого-экрана компонентов.**
   - `React.lazy` + `Suspense` для `Services`, `Stats`, `WhyUs`, `Contact`, `Footer`. Hero + Navbar в первом чанке.
   - Снизит TTI и first paint.

7. **`CodeTypingBg`:**
   - Кэшировать `tokenizeLine` для всего `CODE` один раз через `useMemo`, в рендере брать срезы.
   - Поднять минимальную задержку до ~50мс вместо 25 — ре-рендеров в 2× меньше.
   - Ставить на паузу через IO.

8. **`Waves`:**
   - `xGap`/`yGap` 8 → 14 (количество элементов / N², ~3× меньше DOM-мутаций).
   - Ленить через IO.

### P2 — финальная полировка

9. **Уважать `prefers-reduced-motion`.**
   - В CSS — `@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }`.
   - В `ParticleCube`/`Waves`/`CodeTypingBg`/`MeshGradient` — статичный фолбэк.

10. **`contain: layout paint style;`** на крупных карточках с фоновыми эффектами — изолирует repaint и помогает компоновщику.

11. **Удалить мёртвый CSS** (`atlas-drift`, `atlas-drift2`, `aurora`, `aurora-pulse` если не используются).

12. **Картинки:**
    - `pochta_rus.svg` через SVGO (43KB → ~10–15KB).
    - `cart/*.png` → webp/avif.

---

## Ожидаемый эффект

| Область | До | После | Прирост |
|---|---|---|---|
| CPU на Hero | 100% | ~40–60% | **−40–60%** |
| GPU на Hero | 100% | ~50% | **−50%** |
| GPU на Services | 100% | ~60–70% | **−30–40%** |
| JS-бандл | базовый | −0.5…1MB | удаление Spline + lazy |
| RAM | базовая | −1–2 MB | меньше частиц/кеша |

---

## Чек-лист для будущих правок

- [ ] P0.1 — частицы куба (плотность + draw)
- [ ] P0.2 — IntersectionObserver на все RAF-анимации
- [ ] P0.3 — один слой `MeshGradient` на Hero
- [ ] P0.4 — blur Liquid Aurora 50→30
- [ ] P1.5 — удалить `@splinetool/react-spline`
- [ ] P1.6 — lazy-load компонентов
- [ ] P1.7 — `CodeTypingBg` (memo + замедление)
- [ ] P1.8 — `Waves` (gap 8→14)
- [ ] P2.9 — `prefers-reduced-motion`
- [ ] P2.10 — `contain` на тяжёлых карточках
- [ ] P2.11 — чистка мёртвых CSS-keyframes
- [ ] P2.12 — `pochta_rus.svg` через SVGO + `cart/*.png` в webp
