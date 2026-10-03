import { describe, expect, it } from 'vitest'
import { findProblem } from '../problems/problems'
import type { Action, DirectionCheck, GuidedProblem } from '../problems/types'
import { SLIP_HINT, checkAction, checkDirection, directionStatement, shownAction } from './checks'

function problem(id: string): GuidedProblem {
  const found = findProblem(id)
  if (!found) throw new Error(`no problem ${id}`)
  return found
}

const boy = problem('2.3')
const triangle = problem('4.7')
/** The walking boy's «у скільки разів» plan, action 2: 3000 : 3 = 1000. */
const byTimes = boy.writeUp.plans[1].actions[1]
const perimeter = triangle.writeUp.plans[0].actions[2]

describe('a hint for each wrong sign', () => {
  it('answers the sign she used', () => {
    expect(checkAction(['3000', '+', '3'], '3003', byTimes)).toEqual({ kind: 'wrong', hint: byTimes.signHints!['+'], sign: '+' })
    expect(checkAction(['3000', '·', '3'], '9000', byTimes)).toEqual({ kind: 'wrong', hint: byTimes.signHints!['·'], sign: '·' })
    expect(checkAction(['3000', '−', '3'], '2997', byTimes)).toEqual({ kind: 'wrong', hint: byTimes.signHints!['−'], sign: '−' })
  })

  it("gives the right sign with wrong numbers the action's own hint", () => {
    expect(checkAction(['3', ':', '3000'], '1000', byTimes)).toEqual({ kind: 'wrong', hint: byTimes.hint })
    expect(checkAction(['3000', ':', '20'], '150', byTimes)).toEqual({ kind: 'wrong', hint: byTimes.hint })
  })

  it('answers the first wrong sign when she mixes signs', () => {
    expect(checkAction(['8,4', '+', '12,1', '−', '17,2'], '3,3', perimeter)).toMatchObject({ hint: perimeter.signHints!['−'], sign: '−' })
  })

  it("falls back to the action's hint for a sign with no hint of its own", () => {
    const bare: Action = { ...byTimes, signHints: undefined }
    expect(checkAction(['3000', '+', '3'], '3003', bare)).toEqual({ kind: 'wrong', hint: bare.hint, sign: '+' })
  })

  it('still tells an arithmetic slip apart', () => {
    expect(checkAction(['3000', ':', '3'], '100', byTimes)).toEqual({ kind: 'wrong', hint: SLIP_HINT, slip: true })
    expect(checkAction(['3000', ':', '3'], '1000', byTimes)).toEqual({ kind: 'right' })
  })

  it('shows the action with its reason', () => {
    expect(shownAction(byTimes)).toBe(`3000 : 3 = 1000 (м). ${byTimes.reason}`)
    expect(shownAction({ ...byTimes, reason: undefined })).toBe('3000 : 3 = 1000 (м).')
  })
})

describe('the direction check', () => {
  const check = byTimes.direction as DirectionCheck

  it('asks for a pick, then hints at a wrong one', () => {
    expect(checkDirection(check, null).kind).toBe('empty')
    expect(checkDirection(check, 'більше')).toEqual({ kind: 'wrong', hint: check.hint })
    expect(checkDirection(check, 'менше')).toEqual({ kind: 'right' })
  })

  it('keeps its answer in view as a sentence', () => {
    expect(directionStatement(check)).toBe('За 20 хв він пройде менше, ніж 3000 м.')
  })
})

describe('the sample problems', () => {
  const actions = [boy, triangle].flatMap((p) => p.writeUp.plans.flatMap((plan) => plan.actions))

  it('give every action a hint for each wrong sign and a reason', () => {
    for (const action of actions) {
      expect(Object.keys(action.signHints ?? {}).sort(), action.explanation).toHaveLength(3)
      expect(action.reason, action.explanation).toBeTruthy()
    }
  })

  it('check the direction before the rate and «у … разів» actions of the walking boy only', () => {
    const checked = (p: GuidedProblem) => p.writeUp.plans.map((plan) => plan.actions.map((a) => a.direction?.answer ?? null))
    expect(checked(boy)).toEqual([
      ['менше', 'більше'],
      [null, 'менше'],
    ])
    expect(checked(triangle)).toEqual([[null, null, null]])
  })

  it('never turn a word into an operation', () => {
    const texts = actions.flatMap((a) => [a.hint, a.reason, ...Object.values(a.signHints ?? {}), a.direction?.hint, a.direction?.explain]).filter(Boolean) as string[]
    for (const text of texts) expect(text, text).not.toMatch(/(більш|менш)\S*\s*(→|=>|—\s*(діли|множ|дода|відні))/i)
  })
})
