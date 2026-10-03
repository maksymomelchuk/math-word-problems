/**
 * What each of the six problem types means, in her words, for the versions
 * of Тип і схема that explain the types (ticket «How does the Тип і схема
 * step ask for the type so that it's clear to her?»). Like `types.ts`, no UI
 * code. Never a keyword rule: a type says how the quantities are linked,
 * never which operation to do.
 */
import type { ProblemTypeId } from './types'

/** The three diagram families: the six types pair into three diagrams (guided-flow.md, «Diagrams per type»). */
export const TYPE_FAMILIES = ['compare', 'parts', 'table'] as const
export type TypeFamily = (typeof TYPE_FAMILIES)[number]

export type TypeGuide = {
  family: TypeFamily
  /** One line: what the relation says. */
  meaning: string
  /** One short example from outside the problem set. */
  example: string
}

export const TYPE_GUIDE: Record<ProblemTypeId, TypeGuide> = {
  difference: {
    family: 'compare',
    meaning: 'Одне число більше чи менше за інше на кілька одиниць.',
    example: 'У Марти 7 наліпок, а в Олі — на 3 більше.',
  },
  ratio: {
    family: 'compare',
    meaning: 'Одне число більше чи менше за інше в кілька разів.',
    example: 'У Марти 4 наліпки, а в Олі — у 3 рази більше.',
  },
  partsWhole: {
    family: 'parts',
    meaning: 'Ціле складається з частин.',
    example: 'Стрічку розрізали на два шматки: 12 см і 14 см.',
  },
  fraction: {
    family: 'parts',
    meaning: 'Частину числа задано дробом.',
    example: 'Оля прочитала 2/5 книжки, а в ній 100 сторінок.',
  },
  threeQuantities: {
    family: 'table',
    meaning: 'Швидкість, час і відстань. Або ціна, кількість і вартість.',
    example: 'Велосипедист їхав 3 год зі швидкістю 12 км/год.',
  },
  motion: {
    family: 'table',
    meaning: 'Двоє рухаються назустріч чи в різні боки, і відстань між ними змінюється.',
    example: 'Два велосипедисти виїхали одночасно назустріч одне одному.',
  },
}

/**
 * The «Два питання» version: first what the words hold (one of three
 * families, each with its diagram), then which of its two types.
 */
export const FAMILY_GUIDE: Record<TypeFamily, { option: string; title: string; options: { type: ProblemTypeId; text: string }[] }> = {
  compare: {
    option: 'Два числа порівнюють між собою',
    title: 'Як саме порівнюють?',
    options: [
      { type: 'difference', text: 'На кілька одиниць: «на 3 см довша»' },
      { type: 'ratio', text: 'У кілька разів: «утричі довша»' },
    ],
  },
  parts: {
    option: 'Є ціле і його частини',
    title: 'Яка тут частина?',
    options: [
      { type: 'partsWhole', text: 'Ціле складається з частин' },
      { type: 'fraction', text: 'Частину задано дробом: «2/5 книжки»' },
    ],
  },
  table: {
    option: 'Є швидкість, час і відстань. Або ціна, кількість і вартість',
    title: 'Один чи двоє?',
    options: [
      { type: 'threeQuantities', text: 'Один рухається, або одна покупка, або одна робота' },
      { type: 'motion', text: 'Двоє рухаються назустріч чи в різні боки' },
    ],
  },
}

export function familyOf(type: ProblemTypeId): TypeFamily {
  return TYPE_GUIDE[type].family
}
