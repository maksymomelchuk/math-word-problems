/**
 * Which version of Тип і схема she sees, a setting the parent switches under
 * «Для батьків». Kept on this device only, apart from her records, so
 * «Стерти записи» leaves it alone.
 */
import type { ProgressStorage } from '../../lib/progress'

export const TYPE_STEP_VARIANTS = [
  {
    id: 'examples',
    letter: 'А',
    name: 'Приклади',
    about: 'По одному виділеному місцю задачі на екран. Шість назв типів, під кожною короткий приклад. Вона шукає схожий приклад.',
  },
  {
    id: 'pictures',
    letter: 'Б',
    name: 'Схеми',
    about: 'По одному виділеному місцю задачі на екран. Шість маленьких схем, під кожною назва типу. Вона вибирає схему, яку можна намалювати.',
  },
  {
    id: 'questions',
    letter: 'В',
    name: 'Два питання',
    about: 'По одному виділеному місцю задачі на екран. Спершу «Що тут є?» з трьох схем, потім «Який саме тип?» з двох.',
  },
  {
    id: 'baseline',
    letter: '',
    name: 'Як було',
    about: 'Усе на одному екрані: переказані зв\'язки, біля кожного шість назв без пояснень.',
  },
] as const

export type TypeStepVariant = (typeof TYPE_STEP_VARIANTS)[number]['id']

/** The recommended version, used until the parent picks one. */
export const DEFAULT_TYPE_STEP_VARIANT: TypeStepVariant = 'pictures'

export const TYPE_VARIANT_KEY = 'word-problem-poc:type-step-variant'

function browserStorage(): ProgressStorage | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

export function isTypeStepVariant(value: unknown): value is TypeStepVariant {
  return TYPE_STEP_VARIANTS.some((variant) => variant.id === value)
}

export function loadTypeStepVariant(storage = browserStorage()): TypeStepVariant {
  try {
    const saved = storage?.getItem(TYPE_VARIANT_KEY)
    if (isTypeStepVariant(saved)) return saved
  } catch {
    // blocked storage: the default
  }
  return DEFAULT_TYPE_STEP_VARIANT
}

export function saveTypeStepVariant(variant: TypeStepVariant, storage = browserStorage()): void {
  try {
    storage?.setItem(TYPE_VARIANT_KEY, variant)
  } catch {
    // storage full or blocked: the choice lasts until the page reloads
  }
}

/** «Б «Схеми»», as the parent's page names a version. */
export function variantLabel(id: string): string {
  const variant = TYPE_STEP_VARIANTS.find((v) => v.id === id)
  if (!variant) return id
  return variant.letter ? `${variant.letter} «${variant.name}»` : `«${variant.name}»`
}
