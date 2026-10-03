import { describe, expect, it } from 'vitest'
import { findProblem } from '../problems/problems'
import type { Action, GuidedProblem, PlanStep, SolutionPlan } from '../problems/types'
import {
  LAST_ACTION_HINT,
  MISSING_ACTION_HINT,
  SLIP_HINT,
  actionMatches,
  appendToken,
  checkAction,
  checkOption,
  checkSlots,
  checkTypes,
  matchPlan,
  slotCount,
} from './checks'
import { numbersIn } from '../problems/numbers'

function problem(id: string): GuidedProblem {
  const found = findProblem(id)
  if (!found) throw new Error(`no problem ${id}`)
  return found
}

const boy = problem('2.3')
const triangle = problem('4.7')
const boyPlan = boy.steps.plan as PlanStep
const trianglePlan = triangle.steps.plan as PlanStep

function action(terms: string[], sign: Action['sign'], result: string): Action {
  return { id: 'x', terms, sign, result, unit: 'см', explanation: 'x', hint: 'action hint' }
}

describe('menus', () => {
  const options = [
    { text: 'a', hint: 'not a' },
    { text: 'b', right: true as const },
  ]

  it('asks for a pick first, then gives the wrong option its own hint', () => {
    expect(checkOption(options, null)).toEqual({ kind: 'empty', message: 'Вибери відповідь.' })
    expect(checkOption(options, 0)).toEqual({ kind: 'wrong', hint: 'not a' })
    expect(checkOption(options, 1)).toEqual({ kind: 'right' })
  })

  it('checks the type of every relation and marks the wrong ones', () => {
    const relations = triangle.steps.typeDiagram!.relations
    expect(checkTypes(relations, ['difference', undefined, 'partsWhole']).kind).toBe('empty')
    const wrong = checkTypes(relations, ['difference', 'ratio', 'fraction'])
    expect(wrong).toMatchObject({ kind: 'wrong', hint: relations[1].hint, wrong: [1, 2] })
    expect(checkTypes(relations, ['difference', 'difference', 'partsWhole']).kind).toBe('right')
  })

  it('checks every diagram slot and marks the wrong ones', () => {
    const { slots, hint } = boy.steps.typeDiagram!.diagram
    expect(checkSlots(slots, { knownTime: '60 хв' }, hint).kind).toBe('empty')
    expect(checkSlots(slots, { knownTime: '1 год', knownDistance: '3000 м', askedTime: '20 хв' }, hint)).toMatchObject({
      kind: 'wrong',
      wrong: ['knownTime'],
    })
    expect(checkSlots(slots, { knownTime: '60 хв', knownDistance: '3000 м', askedTime: '20 хв' }, hint).kind).toBe('right')
  })
})

describe('plan acceptance', () => {
  it('shows a slot count only when every plan has the same length and it is not hidden', () => {
    expect(slotCount(triangle.writeUp.plans)).toBe(3)
    expect(slotCount(boy.writeUp.plans)).toBe(2)
    expect(slotCount(boy.writeUp.plans, true)).toBeNull()
    const uneven: SolutionPlan[] = [{ actions: [action(['1', '2'], '+', '3')] }, { actions: [action(['1', '2'], '+', '3'), action(['3', '1'], '+', '4')] }]
    expect(slotCount(uneven)).toBeNull()
  })

  it('accepts every valid plan, and computing follows the one she picks', () => {
    expect(matchPlan(boy.writeUp.plans, boyPlan, ['perMinute', 'asked'], 2)).toEqual({ kind: 'right', plan: 0, order: [0, 1] })
    expect(matchPlan(boy.writeUp.plans, boyPlan, ['times', 'asked'], 2)).toEqual({ kind: 'right', plan: 1, order: [0, 1] })
    expect(matchPlan(triangle.writeUp.plans, trianglePlan, ['bc', 'ac', 'perimeter'], 3)).toEqual({ kind: 'right', plan: 0, order: [0, 1, 2] })
  })

  it('asks for every slot to be filled', () => {
    expect(matchPlan(triangle.writeUp.plans, trianglePlan, ['bc', 'ac'], 3)).toEqual({ kind: 'empty', message: 'Заповни всі дії плану.' })
    expect(matchPlan(triangle.writeUp.plans, trianglePlan, [], null)).toEqual({ kind: 'empty', message: 'Постав картки в план.' })
  })

  it('gives the distractor its own reason', () => {
    const reason = boyPlan.cards.find((card) => card.id === 'hourAnd20')?.reason
    expect(matchPlan(boy.writeUp.plans, boyPlan, ['perMinute', 'hourAnd20'], 2)).toEqual({ kind: 'wrong', hint: reason })
  })

  it('says the last action must find what is asked', () => {
    expect(matchPlan(boy.writeUp.plans, boyPlan, ['asked', 'perMinute'], 2)).toEqual({ kind: 'wrong', hint: LAST_ACTION_HINT })
    expect(matchPlan(boy.writeUp.plans, boyPlan, ['perMinute', 'times'], 2)).toEqual({ kind: 'wrong', hint: LAST_ACTION_HINT })
    expect(matchPlan(triangle.writeUp.plans, trianglePlan, ['bc', 'perimeter', 'ac'], 3)).toEqual({ kind: 'wrong', hint: LAST_ACTION_HINT })
  })

  it("gives the problem's order hint for a wrong order", () => {
    expect(matchPlan(triangle.writeUp.plans, trianglePlan, ['ac', 'bc', 'perimeter'], 3)).toEqual({ kind: 'wrong', hint: trianglePlan.orderHint })
  })

  it('without a slot count, says when an action is missing', () => {
    expect(matchPlan(triangle.writeUp.plans, trianglePlan, ['bc', 'perimeter'], null)).toEqual({ kind: 'wrong', hint: MISSING_ACTION_HINT })
  })

  // 4.6 in problem-set.md: «Order: 1) is independent of 2)–3), so it can also come after them.»
  describe('swappable actions from an Order: line', () => {
    const puzzle: SolutionPlan[] = [
      {
        actions: [
          { ...action(['360', '4'], ':', '90'), id: 'ostap' },
          { ...action(['360', '5'], ':', '72'), id: 'fifth', needs: [] },
          { ...action(['72', '2'], '·', '144'), id: 'marichka', needs: [2] },
          { ...action(['90', '144'], '+', '234'), id: 'both' },
          { ...action(['360', '234'], '−', '126'), id: 'yakym' },
        ],
      },
    ]
    const step: PlanStep = { cards: puzzle[0].actions.map((a) => ({ id: a.id, text: a.id })), orderHint: 'order hint' }

    it('accepts the independent action before, between or after the others, without a separate plan', () => {
      for (const order of [
        ['ostap', 'fifth', 'marichka', 'both', 'yakym'],
        ['fifth', 'ostap', 'marichka', 'both', 'yakym'],
        ['fifth', 'marichka', 'ostap', 'both', 'yakym'],
      ]) {
        expect(matchPlan(puzzle, step, order, 5)).toMatchObject({ kind: 'right', plan: 0 })
      }
      expect(matchPlan(puzzle, step, ['fifth', 'marichka', 'ostap', 'both', 'yakym'], 5)).toEqual({ kind: 'right', plan: 0, order: [1, 2, 0, 3, 4] })
    })

    it('still rejects an action placed before what it needs', () => {
      expect(matchPlan(puzzle, step, ['marichka', 'fifth', 'ostap', 'both', 'yakym'], 5)).toEqual({ kind: 'wrong', hint: 'order hint' })
      expect(matchPlan(puzzle, step, ['ostap', 'fifth', 'both', 'marichka', 'yakym'], 5)).toEqual({ kind: 'wrong', hint: 'order hint' })
    })
  })
})

describe('building an action from chips', () => {
  it('alternates numbers and signs', () => {
    let tokens: string[] = []
    tokens = appendToken(tokens, '+') // a sign can't come first
    expect(tokens).toEqual([])
    tokens = appendToken(tokens, '8,4')
    tokens = appendToken(tokens, '3,7') // a number right after a number replaces it
    expect(tokens).toEqual(['3,7'])
    tokens = appendToken(tokens, '−')
    tokens = appendToken(tokens, '+') // a second sign replaces the first
    expect(tokens).toEqual(['3,7', '+'])
    tokens = appendToken(tokens, '8,4')
    expect(tokens).toEqual(['3,7', '+', '8,4'])
  })

  it('stops at four numbers', () => {
    let tokens: string[] = []
    for (const token of ['1', '+', '2', '+', '3', '+', '4', '+']) tokens = appendToken(tokens, token)
    expect(tokens).toEqual(['1', '+', '2', '+', '3', '+', '4'])
  })
})

describe('checking an action', () => {
  const bc = triangle.writeUp.plans[0].actions[0]
  const perimeter = triangle.writeUp.plans[0].actions[2]

  it('asks for a whole action and a result first', () => {
    expect(checkAction(['8,4', '+'], '12,1', bc).kind).toBe('empty')
    expect(checkAction(['8,4'], '12,1', bc).kind).toBe('empty')
    expect(checkAction(['8,4', '+', '3,7'], '', bc)).toEqual({ kind: 'empty', message: 'Введи результат.' })
  })

  it('accepts a right action and result, however the result is written', () => {
    expect(checkAction(['8,4', '+', '3,7'], '12,1', bc)).toEqual({ kind: 'right' })
    expect(checkAction(['3,7', '+', '8,4'], '12,10', bc)).toEqual({ kind: 'right' })
    expect(checkAction(['17,2', '+', '8,4', '+', '12,1'], '37,7', perimeter)).toEqual({ kind: 'right' })
  })

  it("gives a wrong action the action's hint, even with the right result", () => {
    expect(checkAction(['8,4', '−', '3,7'], '4,7', bc)).toEqual({ kind: 'wrong', hint: bc.signHints!['−'], sign: '−' })
    expect(checkAction(['8,4', '+', '5,1'], '12,1', bc)).toEqual({ kind: 'wrong', hint: bc.hint })
    expect(checkAction(['8,4', '+', '12,1'], '20,5', perimeter)).toEqual({ kind: 'wrong', hint: perimeter.hint })
  })

  it('tells an arithmetic slip apart from a wrong action', () => {
    expect(checkAction(['8,4', '+', '3,7'], '11,1', bc)).toEqual({ kind: 'wrong', hint: SLIP_HINT, slip: true })
    // decimal arithmetic is exact: 0,1 + 0,2 is 0,3
    expect(checkAction(['0,1', '+', '0,2'], '0,3', action(['0,1', '0,2'], '+', '0,3'))).toEqual({ kind: 'right' })
  })

  it('keeps the order of − and : but not of + and ·', () => {
    expect(actionMatches(['20', '·', '50'], action(['50', '20'], '·', '1000'))).toBe(true)
    expect(actionMatches(['60', ':', '3000'], action(['3000', '60'], ':', '50'))).toBe(false)
    expect(actionMatches(['3000', ':', '60'], action(['3000', '60'], ':', '50'))).toBe(true)
    expect(actionMatches(['2,45', '−', '5,3'], action(['5,3', '2,45'], '−', '2,85'))).toBe(false)
    expect(actionMatches(['10', '−', '2', '−', '3'], action(['10', '3', '2'], '−', '5'))).toBe(true)
  })

  it('needs one sign per action', () => {
    expect(actionMatches(['8,4', '+', '12,1', '−', '17,2'], perimeter)).toBe(false)
  })
})

describe('numbers in the text', () => {
  it('reads decimals, whole numbers and both parts of a fraction', () => {
    expect(numbersIn('8,4 см')).toEqual(['8,4'])
    expect(numbersIn('3000 м')).toEqual(['3000'])
    expect(numbersIn('3/8 усіх пирогів')).toEqual(['3', '8'])
    expect(numbersIn('у 3 рази')).toEqual(['3'])
  })
})
