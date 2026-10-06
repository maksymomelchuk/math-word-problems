import { describe, expect, it } from 'vitest'
import { formatDecimal } from '../lib/decimal'
import { WALKING_BOY as boy, TRIANGLE as triangle } from '../problems/problems'
import { checkResult, inferSign, wrongSignResults } from './results'

const byTimes = boy.writeUp.plans[1].actions[1] // 3000 : 3 = 1000
const perMinute = boy.writeUp.plans[0].actions[0] // 3000 : 60 = 50
const ac = triangle.writeUp.plans[0].actions[1] // 12,1 + 5,1 = 17,2
const perimeter = triangle.writeUp.plans[0].actions[2] // 8,4 + 12,1 + 17,2

describe('the results a wrong sign gives', () => {
  it('works each other sign out with the same numbers, and − and : swapped too', () => {
    expect(wrongSignResults(byTimes).map((r) => `${r.sign}${formatDecimal(r.value)}`)).toEqual(['+3003', '−2997', '·9000'])
    expect(wrongSignResults(ac).map((r) => `${r.sign}${formatDecimal(r.value)}`)).toEqual(['−7', '·61,71'])
    expect(wrongSignResults(perimeter).map((r) => r.sign)).toEqual(['·']) // 8,4 − 12,1 − 17,2 is below zero
  })

  it('finds the sign behind her result', () => {
    expect(inferSign(byTimes, '9000')).toBe('·')
    expect(inferSign(perMinute, '180000')).toBe('·')
    expect(inferSign(ac, '7')).toBe('−')
    expect(inferSign(byTimes, '1200')).toBeNull()
  })
})

describe('a typed result', () => {
  it("gives a wrong sign's result that sign's hint", () => {
    expect(checkResult(byTimes, '9000')).toEqual({ kind: 'wrong', hint: byTimes.signHints!['·'], sign: '·' })
    expect(checkResult(ac, '7')).toEqual({ kind: 'wrong', hint: ac.signHints!['−'], sign: '−' })
  })

  it("gives any other wrong result «Не сходиться» and the action's hint", () => {
    expect(checkResult(byTimes, '1001')).toEqual({ kind: 'wrong', hint: `Не сходиться. ${byTimes.hint}` })
  })

  it('accepts the result however it is written, and asks for one when empty', () => {
    expect(checkResult(ac, '17,20')).toEqual({ kind: 'right' })
    expect(checkResult(ac, '').kind).toBe('empty')
  })
})
