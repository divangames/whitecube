////////////////////////////////////////////////////////
//
// Типы карточек блока «Услуги»
//
////////////////////////////////////////////////////////

/** Вариант визуала карточки в bento-сетке услуг. */
export type ServiceAllVariant =
  | 'ai'
  | 'zebra'
  | 'arrow'
  | 'logistics'
  | 'designer'
  | 'accounting'
  | 'serm'
  | 'it'

/** Данные одной услуги в секции «Услуги». */
export type ServiceAllItem = {
  n: string
  tag: string
  title: string
  price: string
  desc: string
  size: string
  variant: ServiceAllVariant
  link?: string
  accent?: boolean
}
