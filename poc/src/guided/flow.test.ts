import { describe, expect, it } from 'vitest'
import { findProblem } from '../problems/problems'
import type { GuidedProblem } from '../problems/types'
import { actionTokens } from './checks'
import { applyWrites, buildScreens, emptyNotebook, numberChips, planLines, plannedActions, shownSlotCount, stepsShown, writeUpSoFar, type Notebook } from './flow'

function problem(id: string): GuidedProblem {
  const found = findProblem(id)
  if (!found) throw new Error(`no problem ${id}`)
  return found
}

const boy = problem('2.3')
const triangle = problem('4.7')

const kinds = (p: GuidedProblem, chosen: Parameters<typeof buildScreens>[1] = null) =>
  buildScreens(p, chosen).map((s) => (s.kind === 'why' ? `why after ${s.step}` : s.kind))

describe('the screens of a guided problem', () => {
  it('runs the triangle through every step, with «Чому?» after the decode', () => {
    expect(kinds(triangle)).toEqual([
      'retell',
      'askedTap',
      'askedChoice',
      'given',
      'given',
      'given',
      'decode',
      'decode',
      'decode',
      'why after decode',
      'types',
      'diagram',
      'plan',
      'compute',
      'compute',
      'compute',
      'answer',
      'review',
    ])
  })

  it('skips Порівняння when there is no comparison, and puts «Чому?» after the plan', () => {
    const screens = buildScreens(boy, null)
    expect(stepsShown(screens)).toEqual(['retell', 'asked', 'given', 'typeDiagram', 'plan', 'compute', 'answer'])
    expect(kinds(boy)).toEqual(['retell', 'askedTap', 'askedChoice', 'given', 'given', 'hidden', 'types', 'diagram', 'plan', 'why after plan', 'compute', 'compute', 'answer', 'review'])
  })

  it('decodes the inverted comparison in two screens and the plain one in one', () => {
    const decode = buildScreens(triangle, null).filter((s) => s.kind === 'decode')
    expect(decode).toEqual([
      { kind: 'decode', step: 'decode', index: 0, stage: 'bigger' },
      { kind: 'decode', step: 'decode', index: 1, stage: 'bigger' },
      { kind: 'decode', step: 'decode', index: 1, stage: 'flip' },
    ])
  })

  it('computes along the plan she picked', () => {
    const uneven = structuredClone(boy)
    uneven.writeUp.plans[1].actions.push({ ...uneven.writeUp.plans[1].actions[1], id: 'extra' })
    expect(buildScreens(uneven, { plan: 1, order: [0, 1, 2] }).filter((s) => s.kind === 'compute')).toHaveLength(3)
    expect(buildScreens(uneven, null).filter((s) => s.kind === 'compute')).toHaveLength(2)
  })

  it('drops a step with no data, and «Чому?» with its step', () => {
    const noDecode = structuredClone(triangle)
    delete noDecode.steps.decode
    expect(kinds(noDecode)).not.toContain('decode')
    expect(kinds(noDecode)).not.toContain('why after decode')
  })

  it('hides the plan slot count when the guidance says so', () => {
    expect(shownSlotCount(triangle)).toBe(3)
    expect(shownSlotCount({ ...triangle, guidance: { plan: { mode: 'guided', hideSlotCount: true } } })).toBeNull()
  })
})

describe('the write-up', () => {
  function finished(p: GuidedProblem, plan = 0): Notebook {
    let record: Record<string, string> = {}
    const { steps } = p
    for (const writes of [
      steps.asked?.choice,
      ...(steps.given?.numbers ?? []),
      ...(steps.given?.hidden ?? []),
      ...(steps.decode?.comparisons ?? []),
    ]) {
      if (writes) record = applyWrites(p, record, writes)
    }
    const order = p.writeUp.plans[plan].actions.map((_, i) => i)
    const chosen = { plan, order }
    return {
      ...emptyNotebook(),
      record,
      plan: chosen,
      computed: plannedActions(p, chosen).map(actionTokens),
      answered: true,
    }
  }

  const lines = (p: GuidedProblem, notebook: Notebook) => {
    const w = writeUpSoFar(p, notebook)
    return [...w.record, '', "Розв'язання", ...(w.solution ?? []), w.answer].join('\n')
  }

  it('ends with the triangle exactly as problem-set.md writes it', () => {
    expect(lines(triangle, finished(triangle))).toBe(
      [
        'AB — 8,4 см',
        'BC — ?, на 3,7 см більша, ніж AB',
        'AC — ?, на 5,1 см більша, ніж BC',
        'P — ?',
        '',
        "Розв'язання",
        '1) 8,4 + 3,7 = 12,1 (см) — довжина сторони BC;',
        '2) 12,1 + 5,1 = 17,2 (см) — довжина сторони AC;',
        '3) 8,4 + 12,1 + 17,2 = 37,7 (см) — периметр трикутника.',
        'Відповідь: периметр трикутника дорівнює 37,7 см.',
      ].join('\n'),
    )
  })

  it('ends with the walking boy exactly as problem-set.md writes it, by either plan', () => {
    expect(lines(boy, finished(boy))).toBe(
      [
        'За 1 год (60 хв) — 3000 м',
        'За 20 хв — ? м',
        '',
        "Розв'язання",
        '1 год = 60 хв',
        '1) 3000 : 60 = 50 (м) — відстань, яку хлопчик проходить за 1 хв;',
        '2) 50 · 20 = 1000 (м) — відстань, яку хлопчик пройде за 20 хв.',
        'Відповідь: за 20 хв хлопчик пройде 1000 м.',
      ].join('\n'),
    )
    expect(writeUpSoFar(boy, finished(boy, 1)).solution).toEqual([
      '1 год = 60 хв',
      '1) 60 : 20 = 3 (рази) — у стільки разів 20 хв менше, ніж 1 год;',
      '2) 3000 : 3 = 1000 (м) — відстань, яку хлопчик пройде за 20 хв.',
    ])
  })

  it('writes the short record as the steps go, with drafts rewritten later', () => {
    let record = applyWrites(triangle, {}, triangle.steps.given!.numbers[2])
    expect(record).toEqual({ ac: 'AC — ?   (BC на 5,1 см менша від AC)' })
    record = applyWrites(triangle, record, triangle.steps.decode!.comparisons[1])
    expect(record).toEqual({ ac: 'AC — ?, на 5,1 см більша, ніж BC' })
  })

  it('shows the plan as a skeleton, as on paper, then fills each action in', () => {
    const chosen = { plan: 0, order: [0, 1, 2] }
    const planned = { ...emptyNotebook(), plan: chosen }
    expect(writeUpSoFar(triangle, planned).solution).toEqual([
      '1) … — довжина сторони BC;',
      '2) … — довжина сторони AC;',
      '3) … — периметр трикутника.',
    ])
    const firstDone = { ...planned, computed: [['3,7', '+', '8,4']] }
    expect(writeUpSoFar(triangle, firstDone).solution?.[0]).toBe('1) 3,7 + 8,4 = 12,1 (см) — довжина сторони BC;')
  })

  it('writes the other plan out in full for the closing screen', () => {
    expect(planLines(boy, 1)).toEqual([
      '1) 60 : 20 = 3 (рази) — у стільки разів 20 хв менше, ніж 1 год;',
      '2) 3000 : 3 = 1000 (м) — відстань, яку хлопчик пройде за 20 хв.',
    ])
  })

  it('offers the text numbers, the unit change and earlier results as chips', () => {
    expect(numberChips(boy, [])).toEqual(['3000', '20', '60'])
    expect(numberChips(triangle, ['12,1', '17,2'])).toEqual(['8,4', '3,7', '5,1', '12,1', '17,2'])
  })
})
