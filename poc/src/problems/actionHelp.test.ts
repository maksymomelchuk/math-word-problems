import { describe, expect, it } from 'vitest'
import { findProblem } from './problems'
import type { GuidedProblem } from './types'
import { validateProblem } from './validate'

/** A deep copy to break on purpose. */
function copy(id: string): GuidedProblem {
  const found = findProblem(id)
  if (!found) throw new Error(`no problem ${id}`)
  return structuredClone(found)
}

const errors = (p: GuidedProblem) => validateProblem(p).join('\n')

describe("the data check of an action's hints and direction check", () => {
  it('flags a hint for the right sign, and a missing wrong sign', () => {
    const own = copy('2.3')
    own.writeUp.plans[1].actions[1].signHints![':'] = 'x'
    expect(errors(own)).toMatch(/plan 2 2\): a sign hint for «:», the action's own sign/)

    const missing = copy('4.7')
    delete missing.writeUp.plans[0].actions[0].signHints!['·']
    expect(errors(missing)).toMatch(/plan 1 1\): no sign hint for «·»/)
  })

  it('confirms the direction against the result', () => {
    const flipped = copy('2.3')
    flipped.writeUp.plans[1].actions[1].direction!.answer = 'більше'
    expect(errors(flipped)).toMatch(/plan 2 2\): 1000 isn't «більше» than 3000/)

    const equal = copy('2.3')
    Object.assign(equal.writeUp.plans[1].actions[1].direction!, { comparedWith: '1000', question: 'За 20 хв він пройде більше чи менше, ніж 1000 м?' })
    expect(errors(equal)).toMatch(/equals 1000, so it is neither more nor less/)
  })

  it('needs the question to hold «більше чи менше», its number and a «?»', () => {
    const noChoice = copy('2.3')
    noChoice.writeUp.plans[1].actions[1].direction!.question = 'Скільки він пройде за 20 хв, якщо за годину 3000 м?'
    expect(errors(noChoice)).toMatch(/must hold «більше чи менше» and end with «\?»/)

    const otherNumber = copy('2.3')
    otherNumber.writeUp.plans[1].actions[1].direction!.comparedWith = '60'
    expect(errors(otherNumber)).toMatch(/the direction question doesn't hold 60/)

    const noHint = copy('2.3')
    noHint.writeUp.plans[0].actions[0].direction!.hint = ' '
    expect(errors(noHint)).toMatch(/needs a hint and an explanation/)
  })

  it('leaves both out when a problem has neither', () => {
    const plain = copy('4.7')
    for (const action of plain.writeUp.plans[0].actions) {
      delete action.signHints
      delete action.reason
      delete action.direction
    }
    expect(validateProblem(plain)).toEqual([])
  })
})
