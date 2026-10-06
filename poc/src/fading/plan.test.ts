import { describe, expect, it } from 'vitest'
import { WALKING_BOY as boy, TRIANGLE as triangle, findProblem } from '../problems/problems'
import type { Action, GuidedProblem, SolutionPlan } from '../problems/types'
import { OTHER_LINE, actionCounts, askedWords, checkActionCount, countWords, lineOptions, lineText, planComplete, planFromLines, validNextLines } from './plan'

const act = (id: string, needs?: number[]): Action => ({ id, terms: ['1', '1'], sign: '+', result: '2', unit: 'уч.', explanation: id, ...(needs ? { needs } : {}) })

/** 3.3 Хор: plan A finds the whole choir, then the boys; plan B the boys first, and its 2) needs nothing (`Order: 1) is independent of 2)`). */
const choir: SolutionPlan[] = [
  { actions: [act('fifth'), act('all'), act('boys')] },
  { actions: [act('fifth'), act('parts', []), act('boys'), act('all')] },
]

describe('the valid plan lines at each point', () => {
  it('follows the triangle one line at a time', () => {
    const { plans } = triangle.writeUp
    expect(validNextLines(plans, [])).toEqual(['bc'])
    expect(validNextLines(plans, ['bc'])).toEqual(['ac'])
    expect(validNextLines(plans, ['bc', 'ac'])).toEqual(['perimeter'])
    expect(planComplete(plans, ['bc', 'ac'])).toBe(false)
    expect(planComplete(plans, ['bc', 'ac', 'perimeter'])).toBe(true)
  })

  it('accepts every valid plan: the walking boy can start either way', () => {
    const { plans } = boy.writeUp
    expect(validNextLines(plans, []).sort()).toEqual(['perMinute', 'times'])
    expect(validNextLines(plans, ['times'])).toEqual(['asked'])
    expect(planFromLines(plans, ['times'])).toEqual({ plan: 1, order: [0] })
    expect(planFromLines(plans, ['perMinute', 'asked'])).toEqual({ plan: 0, order: [0, 1] })
    expect(planFromLines(plans, ['asked'])).toBeNull()
  })

  it('reads swappable actions from `needs`, across plans', () => {
    expect(validNextLines(choir, []).sort()).toEqual(['fifth', 'parts'])
    expect(validNextLines(choir, ['fifth']).sort()).toEqual(['all', 'parts'])
    expect(validNextLines(choir, ['parts'])).toEqual(['fifth'])
    expect(validNextLines(choir, ['parts', 'fifth'])).toEqual(['boys'])
    expect(planComplete(choir, ['fifth', 'all', 'boys'])).toBe(true)
    expect(planComplete(choir, ['parts', 'fifth', 'boys'])).toBe(false)
    expect(planComplete(choir, ['parts', 'fifth', 'boys', 'all'])).toBe(true)
  })
})

describe('the line options', () => {
  const ids = (p: GuidedProblem, lines: string[]) => lineOptions(p, lines).map((o) => `${o.id}${o.right ? '+' : ''}`)

  it('offers the valid lines, the asked quantity while it is too early, and «Інше» last', () => {
    expect(ids(triangle, [])).toEqual(['bc+', 'perimeter', OTHER_LINE])
    expect(ids(triangle, ['bc'])).toEqual(['ac+', 'perimeter', OTHER_LINE])
    expect(ids(triangle, ['bc', 'ac'])).toEqual(['perimeter+', OTHER_LINE])
    expect(lineOptions(triangle, []).at(-1)?.text).toBe('Інше')
  })

  it('names a line by its plan card when the problem has cards', () => {
    const texts = lineOptions(boy, []).map((o) => o.text)
    expect(texts).toContain('у скільки разів 20 хв менше, ніж 1 год')
    expect(texts).toContain('відстань, яку хлопчик пройде за 20 хв')
  })
})

describe('the action count', () => {
  it('is right if any valid plan has that many actions', () => {
    expect(actionCounts(choir)).toEqual([3, 4])
    expect(checkActionCount(choir, '4')).toEqual({ kind: 'right' })
    expect(checkActionCount(triangle.writeUp.plans, '2').kind).toBe('wrong')
    expect(checkActionCount(triangle.writeUp.plans, '').kind).toBe('empty')
    expect(countWords([3])).toBe('3 дії')
    expect(countWords([3, 4])).toBe('3 або 4 дії')
    expect(countWords([5])).toBe('5 дій')
  })
})

it('names what the problem asks from the answer', () => {
  expect(askedWords(triangle)).toBe('периметр трикутника')
  expect(askedWords(boy)).toBe('відстань, яку хлопчик пройде за 20 хв')
})

it('reads a plan line in its own words where the explanation would give the answer away', () => {
  const fishing = findProblem('3.7')!
  const line = 'на скільки кілограмів один брат наловив більше, ніж інший'
  expect(lineText(fishing, 'diff')).toBe(line)
  expect(askedWords(fishing)).toBe(line)
  for (const lines of [[], ['denys']]) {
    for (const option of lineOptions(fishing, lines)) expect(option.text).not.toMatch(/більше риби наловив Денис/)
  }
  // The write-up keeps the school's explanation.
  expect(fishing.writeUp.plans[0].actions[1].explanation).toBe('на стільки більше риби наловив Денис, ніж Марко')
})
