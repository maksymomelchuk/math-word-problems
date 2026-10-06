import { describe, expect, it } from 'vitest'
import { LEVEL_1 } from './level1'
import type { Action, GuidedProblem, Option, Sign } from './types'
import { validateProblem } from './validate'

/** problem-set.md, word for word: the text, the short record, «Розв'язання» and «Відповідь». */
const SOURCE: Record<string, { text: string; record: string[]; solution: string[]; answer: string }> = {
  '1.1': {
    text: 'Дарина зібрала в парку 28 каштанів. Тарас зібрав на 15 каштанів більше, ніж Дарина. Скільки каштанів зібрав Тарас?',
    record: ['Дарина — 28 кашт.', 'Тарас — ?, на 15 кашт. більше, ніж Дарина'],
    solution: ['1) 28 + 15 = 43 (кашт.) — кількість каштанів, які зібрав Тарас.'],
    answer: 'Відповідь: Тарас зібрав 43 каштани.',
  },
  '1.2': {
    text: 'У великому акваріумі Назара 96 л води. У малому акваріумі на 38 л води менше, ніж у великому. Скільки літрів води в малому акваріумі?',
    record: ['Великий акваріум — 96 л', 'Малий акваріум — ?, на 38 л менше, ніж великий'],
    solution: ['1) 96 − 38 = 58 (л) — кількість води в малому акваріумі.'],
    answer: 'Відповідь: у малому акваріумі 58 л води.',
  },
  '1.3': {
    text: 'Злата зліпила 16 вареників, а її бабуся — у 3 рази більше, ніж Злата. Скільки вареників зліпила бабуся?',
    record: ['Злата — 16 вар.', 'Бабуся — ?, у 3 рази більше, ніж Злата'],
    solution: ['1) 16 · 3 = 48 (вар.) — кількість вареників, які зліпила бабуся.'],
    answer: 'Відповідь: бабуся зліпила 48 вареників.',
  },
  '1.4': {
    text: 'У книжці 132 сторінки. Ярина вже прочитала 75 сторінок. Скільки сторінок їй залишилося прочитати?',
    record: ['Усього — 132 с.', 'Прочитала — 75 с.', 'Залишилося — ?'],
    solution: ['1) 132 − 75 = 57 (с.) — кількість сторінок, які Ярині залишилося прочитати.'],
    answer: 'Відповідь: Ярині залишилося прочитати 57 сторінок.',
  },
  '1.5': {
    text: 'Для шкільного ярмарку Іванко з однокласниками спекли 40 пирогів. До обіду продали 3/8 усіх пирогів. Скільки пирогів продали до обіду?',
    record: ['Усього — 40 пир.', 'Продали до обіду — ?, 3/8 усіх пирогів'],
    solution: ['1) 40 : 8 = 5 (пир.) — 1/8 усіх пирогів;', '2) 5 · 3 = 15 (пир.) — кількість пирогів, проданих до обіду.'],
    answer: 'Відповідь: до обіду продали 15 пирогів.',
  },
  '1.6': {
    text: 'Кирило з батьками їхали потягом до бабусі. Потяг рухався 3 год зі швидкістю 80 км/год. Яку відстань проїхав потяг?',
    record: ['Швидкість — 80 км/год', 'Час — 3 год', 'Відстань — ?'],
    solution: ['1) 80 · 3 = 240 (км) — відстань, яку проїхав потяг.'],
    answer: 'Відповідь: потяг проїхав 240 км.',
  },
  '1.7': {
    text: 'Уляна і Мирослава одночасно вийшли назустріч одна одній з протилежних кінців алеї в парку. Уляна йде зі швидкістю 70 м/хв, а Мирослава — зі швидкістю 65 м/хв. З якою швидкістю дівчата зближуються?',
    record: ['Уляна — 70 м/хв', 'Мирослава — 65 м/хв', 'Рух назустріч', 'Швидкість зближення — ?'],
    solution: ['1) 70 + 65 = 135 (м/хв) — швидкість зближення дівчат.'],
    answer: 'Відповідь: дівчата зближуються зі швидкістю 135 м/хв.',
  },
}

/** A fraction n/d, so a swapped division such as 8 : 40 stays exact. */
type Ratio = { n: number; d: number }

function apply(sign: Sign, terms: readonly number[]): Ratio | null {
  const [first, ...rest] = terms
  switch (sign) {
    case '+':
      return { n: terms.reduce((a, b) => a + b, 0), d: 1 }
    case '−':
      return { n: rest.reduce((a, b) => a - b, first), d: 1 }
    case '·':
      return { n: terms.reduce((a, b) => a * b, 1), d: 1 }
    case ':':
      return terms.length === 2 && terms[1] !== 0 ? { n: terms[0], d: terms[1] } : null
  }
}

const sameRatio = (a: Ratio, b: Ratio) => a.n * b.d === b.n * a.d

/** Every result a wrong sign gives with the same numbers, in either order for − and :. */
function wrongSignResults(action: Action): { sign: Sign; result: Ratio }[] {
  const terms = action.terms.map(Number)
  const orders = (sign: Sign) => (sign === '−' || sign === ':') && terms.length === 2 ? [terms, [...terms].reverse()] : [terms]
  return (['+', '−', '·', ':'] as const)
    .filter((sign) => sign !== action.sign)
    .flatMap((sign) => orders(sign).flatMap((order) => (apply(sign, order) ? [{ sign, result: apply(sign, order)! }] : [])))
}

const actions = (p: GuidedProblem) => p.writeUp.plans.flatMap((plan) => plan.actions)

function menus(p: GuidedProblem): { where: string; options: readonly Option[] }[] {
  const { steps } = p
  return [
    { where: 'Перекажи', options: steps.retell?.options ?? [] },
    { where: 'Знайти', options: steps.asked?.choice.options ?? [] },
    ...(steps.given?.numbers ?? []).map((n) => ({ where: `Відомо ${n.number}`, options: n.options })),
    ...(steps.given?.hidden ?? []).map((h, i) => ({ where: `Відомо, hidden ${i + 1}`, options: h.options })),
    ...(steps.decode?.why ? [{ where: 'Порівняння, Чому?', options: steps.decode.why.options }] : []),
    ...(steps.plan?.why ? [{ where: 'План, Чому?', options: steps.plan.why.options }] : []),
    { where: 'Відповідь', options: steps.answer?.options ?? [] },
  ]
}

describe('Level 1', () => {
  it('holds up in the data check', () => {
    for (const p of LEVEL_1) expect(validateProblem(p), p.id).toEqual([])
  })

  it('is slots 1.1–1.7 in order, each with every step and no guidance of its own', () => {
    expect(LEVEL_1.map((p) => p.id)).toEqual(['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7'])
    for (const p of LEVEL_1) {
      expect(p.level, p.id).toBe(1)
      expect(p.guidance, p.id).toBeUndefined()
      const { retell, asked, given, typeDiagram, plan, answer } = p.steps
      expect([retell, asked, given, typeDiagram, plan, answer].every(Boolean), p.id).toBe(true)
    }
  })

  it('has the texts, write-ups and answers of problem-set.md word for word', () => {
    for (const p of LEVEL_1) {
      const source = SOURCE[p.id]
      expect(p.text.map((part) => part.text).join(''), p.id).toBe(source.text)
      expect(p.writeUp.shortRecord.map((line) => line.text), p.id).toEqual(source.record)
      const [plan, ...others] = p.writeUp.plans
      expect(others, p.id).toEqual([])
      const lines = plan.actions.map((a, i) => `${i + 1}) ${a.terms.join(` ${a.sign} `)} = ${a.result} (${a.unit}) — ${a.explanation}${i === plan.actions.length - 1 ? '.' : ';'}`)
      expect(lines, p.id).toEqual(source.solution)
      expect(p.writeUp.answer, p.id).toBe(source.answer)
      // every number in the text can be tapped
      for (const part of p.text) if (!part.number) expect(part.text, p.id).not.toMatch(/\d/)
    }
  })

  it('tags the «?» line, and gives each comparison line the two sides «Хто більший?» names', () => {
    for (const p of LEVEL_1) {
      const record = p.writeUp.shortRecord
      expect(record.filter((line) => line.tag === 'asked').length, p.id).toBe(1)
      for (const line of record) {
        if (line.tag) expect(line.text, `${p.id} ${line.id}`).toContain('?')
        if (line.tag === 'restated') expect(line.compare, `${p.id} ${line.id}`).toBeDefined()
      }
      const compared = record.flatMap((line) => (line.compare ? [line.compare] : []))
      const comparisons = p.steps.decode?.comparisons ?? []
      expect(compared.length, p.id).toBe(comparisons.length)
      comparisons.forEach((c, i) => {
        const lower = (s: string) => s.toLowerCase()
        expect(lower(compared[i].bigger), p.id).toBe(lower(c.bigger.answer))
        expect(lower(compared[i].smaller), p.id).toBe(lower(c.bigger.options.find((o) => o !== c.bigger.answer)!))
      })
    }
  })

  it('computes every action exactly, in whole numbers, from numbers it has', () => {
    for (const p of LEVEL_1) {
      for (const a of actions(p)) {
        expect(a.terms.every((t) => /^\d+$/.test(t)) && /^\d+$/.test(a.result), `${p.id} ${a.id}`).toBe(true)
        const value = apply(a.sign, a.terms.map(Number))!
        expect(value.n % value.d, `${p.id} ${a.id}: ${a.terms.join(` ${a.sign} `)} isn't whole`).toBe(0)
        expect(value.n / value.d, `${p.id} ${a.id}`).toBe(Number(a.result))
        expect(Number(a.result), `${p.id} ${a.id}`).toBeGreaterThan(0)
      }
    }
  })

  it('has a hint, a reason and a hint for each wrong sign on every action, and each wrong sign gives another result', () => {
    for (const p of LEVEL_1) {
      for (const a of actions(p)) {
        const where = `${p.id} ${a.id}`
        expect(a.hint?.trim(), where).toBeTruthy()
        expect(a.reason?.trim(), where).toBeTruthy()
        expect(Object.keys(a.signHints ?? {}).sort(), where).toEqual((['+', '−', '·', ':'] as const).filter((s) => s !== a.sign).sort())
        const right = { n: Number(a.result), d: 1 }
        for (const wrong of wrongSignResults(a)) expect(sameRatio(wrong.result, right), `${where}: «${wrong.sign}» also gives ${a.result}`).toBe(false)
      }
    }
  })

  it('asks the direction check on у … разів and rate actions only, with the relation type it belongs to', () => {
    for (const p of LEVEL_1) {
      const types = p.steps.typeDiagram!.relations.map((r) => r.type)
      const checked = actions(p).filter((a) => a.direction)
      for (const a of checked) {
        expect(['ratio', 'threeQuantities', 'motion'], `${p.id} ${a.id}`).toContain(a.direction!.relationType)
        expect(types, `${p.id} ${a.id}`).toContain(a.direction!.relationType)
      }
      if (types.includes('fraction')) expect(checked, p.id).toEqual([])
      if (types.some((t) => t === 'ratio' || t === 'threeQuantities' || t === 'motion')) expect(checked.length, p.id).toBeGreaterThan(0)
    }
  })

  it('keeps every menu at three options and «Чому?» to at most one', () => {
    for (const p of LEVEL_1) {
      for (const menu of menus(p)) expect(menu.options.length, `${p.id} ${menu.where}`).toBe(3)
      expect([p.steps.decode?.why, p.steps.plan?.why].filter(Boolean).length, p.id).toBeLessThanOrEqual(1)
    }
  })

  it('never words help as a keyword rule', () => {
    const keywordRule = /(більш|менш|разом|залиш)\S*»?\s*(→|->|=>|означає|значить)\s*(дода|відн|множ|діл)/i
    for (const p of LEVEL_1) {
      const texts = [
        ...menus(p).flatMap((m) => m.options.flatMap((o) => ('hint' in o ? [o.hint] : []))),
        ...actions(p).flatMap((a) => [a.hint ?? '', a.reason ?? '', ...Object.values(a.signHints ?? {}), a.direction?.hint ?? '', a.direction?.explain ?? '']),
        ...p.steps.typeDiagram!.relations.map((r) => r.hint),
        p.review.keyIdea,
      ]
      for (const text of texts) expect(text, p.id).not.toMatch(keywordRule)
    }
  })
})
