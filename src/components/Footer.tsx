import logoCube from '../../images/logo_cube.svg'

export default function Footer() {
  return (
    <footer className="border-t border-edge py-10">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <img src={logoCube} alt="Whitecube logo" className="h-6 w-6" />
            <span className="font-display font-black text-base tracking-tight text-cream">
              WHITE<span className="text-fire">CUBE</span>
            </span>
          </div>
          <p className="text-dim text-xs mt-1">Агентство полного цикла</p>
        </div>
        <div className="flex flex-wrap gap-6 text-xs text-dim">
          <a href="#services" className="hover:text-cream transition-colors">Услуги</a>
          <a href="https://белая-коробка.рф/статьи" target="_blank" rel="noopener noreferrer" className="hover:text-cream transition-colors">Блог</a>
          <a href="#about" className="hover:text-cream transition-colors">О нас</a>
          <a href="#reviews" className="hover:text-cream transition-colors">Отзывы</a>
          <a href="#contact" className="hover:text-cream transition-colors">Контакты</a>
          <a href="mailto:manager@cdek-ozon.ru" className="hover:text-cream transition-colors">manager@cdek-ozon.ru</a>
        </div>
        <p className="text-dim text-xs">© {new Date().getFullYear()} Whitecube</p>
      </div>
    </footer>
  )
}
