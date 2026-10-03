import { describe, expect, it } from 'vitest'
import { PROBLEMS, findProblem } from './problems'
import type { GuidedProblem } from './types'
import { validateProblem } from './validate'

function problem(id: string): GuidedProblem {
  const found = findProblem(id)
  if (!found) throw new Error(`no problem ${id}`)
  return found
}

/** A deep copy to break on purpose. */
function copy(id: string): GuidedProblem {
  return structuredClone(problem(id))
}

describe('the problem data', () => {
  it('holds up for every problem', () => {
    for (const p of PROBLEMS) expect(validateProblem(p), p.id).toEqual([])
  })

  it('has the walking boy and the triangle word for word from problem-set.md', () => {
    const text = (id: string) => problem(id).text.map((part) => part.text).join('')
    expect(text('2.3')).toBe('Хлопчик пройшов 3000 м за годину. Яку відстань він пройде за 20 хвилин?')
    expect(text('4.7')).toBe(
      'Сторона AB трикутника ABC дорівнює 8,4 см. Сторона BC на 3,7 см більша за AB, але на 5,1 см менша від AC. Знайди периметр трикутника.',
    )
  })

  it('flags broken copies', () => {
    const wrongResult = copy('4.7')
    wrongResult.writeUp.plans[0].actions[1].result = '17,3'
    expect(validateProblem(wrongResult).join('\n')).toMatch(/is 17,2, not 17,3/)

    const strayOperand = copy('4.7')
    strayOperand.writeUp.plans[0].actions[0].terms = ['8,4', '3,8']
    expect(validateProblem(strayOperand).join('\n')).toMatch(/3,8 is not a number from the text/)

    const resultTooEarly = copy('2.3')
    resultTooEarly.writeUp.plans[0].actions[1].needs = []
    expect(validateProblem(resultTooEarly).join('\n')).toMatch(/50 is not a number from the text/)

    const twoRight = copy('2.3')
    twoRight.steps.retell!.options[0] = { text: 'x', right: true }
    expect(validateProblem(twoRight).join('\n')).toMatch(/Перекажи: 2 right options/)

    const missingChip = copy('2.3')
    missingChip.steps.typeDiagram!.diagram.chips = ['3000 м', '1 год', '20 хв']
    expect(validateProblem(missingChip).join('\n')).toMatch(/needs «60 хв», which isn't a chip/)

    const noCard = copy('4.7')
    noCard.steps.plan!.cards = noCard.steps.plan!.cards.filter((card) => card.id !== 'ac')
    expect(validateProblem(noCard).join('\n')).toMatch(/no plan card for «ac»/)

    const unlabelled = copy('4.7')
    unlabelled.steps.given!.numbers.pop()
    expect(validateProblem(unlabelled).join('\n')).toMatch(/Відомо: labels n1, n2 but the text has n1, n2, n3/)

    const undecoded = copy('4.7')
    undecoded.steps.decode!.comparisons[1].writes = []
    expect(validateProblem(undecoded).join('\n')).toMatch(/the steps end with «AC — \?   \(BC на 5,1 см менша від AC\)»/)

    const otherAnswer = copy('4.7')
    otherAnswer.writeUp.answerParts = [{ kind: 'number', value: '37,8', unit: 'см' }]
    expect(validateProblem(otherAnswer).join('\n')).toMatch(/never finds the answer 37,8/)
  })

  it('needs guided data only for the steps a problem has', () => {
    const paperOnly = copy('4.7')
    paperOnly.steps = {}
    paperOnly.writeUp.plans[0].actions.forEach((action) => delete action.hint)
    expect(validateProblem(paperOnly).join('\n')).toMatch(/Обчисли is prompted but the action has no hint/)
    paperOnly.writeUp.plans[0].actions.forEach((action) => (action.hint = 'hint'))
    expect(validateProblem(paperOnly)).toEqual([])
  })
})
