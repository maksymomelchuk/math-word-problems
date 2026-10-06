import { describe, expect, it } from 'vitest'
import { WALKING_BOY as boy, TRIANGLE as triangle } from '../problems/problems'
import type { GuidedProblem } from '../problems/types'
import { validateProblem } from '../problems/validate'
import { describeLogEvent, describePlay } from '../screens/logWords'
import { answerSelfCheck, biggerQuestions, diagramPickAnswer, diagramPickHint, isPerson, recordSelfChecks, restatedSentences } from './paperChecks'
import { QUESTION_CHIP, placedValue, withQuestionSlots } from './questionSlots'

describe('the checks filled in from the write-up', () => {
  it('asks the short record about its «?» line, its units and each comparison from the unknown', () => {
    expect(recordSelfChecks(triangle.writeUp).map((c) => c.question)).toEqual([
      'Шукане записане зі знаком «?»: «P — ?»?',
      'Біля кожного числа є одиниця?',
      'Порівняння записане від шуканого: «BC — ?, на 3,7 см більша, ніж AB»?',
      'Порівняння записане від шуканого: «AC — ?, на 5,1 см більша, ніж BC»?',
    ])
    expect(recordSelfChecks(boy.writeUp).map((c) => c.id)).toEqual(['asked-twenty', 'units'])
    expect(answerSelfCheck(triangle).question).toBe('Відповідь записана повним реченням про те, що шукали (периметр трикутника)?')
  })

  it('makes «Що більше?» from every line with compare, in an order that hides the answer', () => {
    const [first, second] = biggerQuestions(triangle)
    expect(first).toMatchObject({ question: 'Що більше: AB чи BC?', options: ['AB', 'BC'], answer: 'BC' })
    expect(second).toMatchObject({ question: 'Що більше: AC чи BC?', options: ['AC', 'BC'], answer: 'AC', hint: triangle.steps.decode!.comparisons[1].bigger.hint })
    expect(biggerQuestions(boy)).toEqual([])
  })

  it('takes a line that is both asked and a comparison, and capitalises names for the buttons', () => {
    const tanks: GuidedProblem = structuredClone(boy)
    tanks.writeUp.shortRecord = [
      { id: 'small', text: 'Малий акваріум — 25 л' },
      { id: 'big', text: 'Великий акваріум — ?, на 8 л більше, ніж малий', tag: 'asked', compare: { bigger: 'великий акваріум', smaller: 'малий акваріум' } },
    ]
    const [q] = biggerQuestions(tanks)
    expect(q).toMatchObject({ question: 'Що більше: великий акваріум чи малий акваріум?', options: ['Великий акваріум', 'Малий акваріум'], answer: 'Великий акваріум' })
    expect(recordSelfChecks(tanks.writeUp).map((c) => c.id)).toEqual(['asked-big', 'units', 'restated-big'])
  })

  it('asks «Хто більше» when both quantities are people', () => {
    const chestnuts: GuidedProblem = structuredClone(boy)
    chestnuts.writeUp.shortRecord = [
      { id: 'daryna', text: 'Дарина — 28 кашт.' },
      { id: 'taras', text: 'Тарас — ?, на 15 кашт. більше, ніж Дарина', tag: 'asked', compare: { bigger: 'Тарас', smaller: 'Дарина' } },
    ]
    expect(biggerQuestions(chestnuts)[0]).toMatchObject({ question: 'Хто більше: Дарина чи Тарас?', options: ['Дарина', 'Тарас'], answer: 'Тарас' })
    expect(['бабуся', 'Злата', 'Левко'].every(isPerson)).toBe(true)
    expect(['I день', 'II посилка', 'BC', 'вишні', 'великий акваріум', 'швидкість автівки', 'I і II разом'].some(isPerson)).toBe(false)
  })

  it("keeps Level 3's restated sentence on screen for the short record", () => {
    expect(restatedSentences(triangle)).toEqual(['BC на 3,7 см більша за AB', 'AC на 5,1 см більша, ніж BC'])
  })

  it('knows the sketches her diagram should hold, by type or by family', () => {
    expect(diagramPickAnswer(triangle, true)).toEqual(['difference', 'partsWhole'])
    expect(diagramPickAnswer(triangle, false)).toEqual(['compare', 'parts'])
    expect(diagramPickAnswer(boy, true)).toEqual(['threeQuantities'])
    expect(diagramPickHint(['difference', 'partsWhole'], ['difference'])).toMatch(/Чого бракує/)
    expect(diagramPickHint(['difference'], ['difference', 'ratio'])).toMatch(/Чи є в задачі такий/)
  })
})

describe('the «?» as a chip from 3.1', () => {
  it('turns every label holding «?» into a slot that shows the label', () => {
    const q = withQuestionSlots(triangle.steps.typeDiagram!.diagram)
    expect(Object.values(q.questionSlots)).toEqual(['?', '?', 'P — ?'])
    expect(q.chips).toEqual(['8,4', '3,7', '5,1', QUESTION_CHIP])
    const total = Object.keys(q.questionSlots)[2]
    expect(placedValue(q, total, QUESTION_CHIP)).toBe('P — ?')
    expect(placedValue(q, 'ab', QUESTION_CHIP)).toBe('?')
    expect(q.slots[total]).toBe('P — ?')
  })

  it('covers table cells too', () => {
    const q = withQuestionSlots(boy.steps.typeDiagram!.diagram)
    expect(Object.values(q.questionSlots)).toEqual(['?'])
  })
})

describe('the data check of the contract', () => {
  const errors = (p: GuidedProblem) => validateProblem(p).join('\n')

  it("needs an 'asked' line, both names on a comparison, and a relation type on each direction check", () => {
    const noAsked = structuredClone(triangle)
    delete noAsked.writeUp.shortRecord[3].tag
    expect(errors(noAsked)).toMatch(/no line is tagged 'asked'/)

    const oneName = structuredClone(triangle)
    oneName.writeUp.shortRecord[1].compare = { bigger: 'BC', smaller: ' ' }
    expect(errors(oneName)).toMatch(/compare needs both names/)

    const untyped = structuredClone(boy) as GuidedProblem
    delete (untyped.writeUp.plans[0].actions[0].direction as { relationType?: string }).relationType
    expect(errors(untyped)).toMatch(/needs the relationType/)

    const fraction = structuredClone(boy)
    fraction.writeUp.plans[0].actions[0].direction!.relationType = 'fraction'
    expect(errors(fraction)).toMatch(/no direction check on «дріб від числа»/)

    const elsewhere = structuredClone(boy)
    elsewhere.writeUp.plans[0].actions[0].direction!.relationType = 'motion'
    expect(errors(elsewhere)).toMatch(/isn't one of the problem's relations/)
  })

  it('checks the slot and the data its stage prompts', () => {
    const noSlot = structuredClone(boy)
    noSlot.id = 'boy'
    expect(errors(noSlot)).toMatch(/not a problem-set slot/)
    const levelOne = structuredClone(boy)
    levelOne.id = '1.4'
    levelOne.level = 1
    delete levelOne.steps.answer
    expect(errors(levelOne)).toMatch(/stage 1.1–1.7 prompts «answer», but the problem has no data/)
    const levelThree = structuredClone(triangle)
    levelThree.id = '3.4'
    levelThree.level = 3
    delete levelThree.steps.given
    delete levelThree.steps.plan
    delete levelThree.steps.answer
    expect(validateProblem(levelThree)).toEqual([])
  })
})

describe('the records in words', () => {
  const at = '2026-10-03T10:00:00.000Z'
  it('reads as the trial plan words them', () => {
    expect(describeLogEvent(triangle, { at, step: 'plan', kind: 'planLine', line: 1, picked: 'other', right: false })).toBe('План, дія 2: «Інше» — не з першого разу')
    expect(describeLogEvent(boy, { at, step: 'compute', kind: 'result', line: 1, action: 'asked', value: '9000', right: false, sign: '·' })).toBe(
      'Обчисли, дія 2, перевір знак: результат 9000 (знак «·»)',
    )
    expect(describeLogEvent(triangle, { at, step: 'typeDiagram', kind: 'diagramPick', picked: ['difference'], right: true })).toBe('Яка схема в тебе: так')
    expect(describeLogEvent(triangle, { at, step: 'decode', kind: 'nextStep', picked: 'plan', due: 'decode', right: false })).toBe('Який крок далі: «План» замість «Порівняння»')
    const log = [
      { at, step: 'start', kind: 'soloSwitch', reason: 'wrong' },
      { at, step: 'plan', kind: 'nextStep', picked: 'plan', due: 'plan', right: true },
      { at, step: 'plan', kind: 'planLine', line: 0, picked: 'perimeter', right: false },
    ] as const
    expect(describeLogEvent(triangle, log[0], log, 0)).toBe("Розв'язувала сама: після неправильної відповіді перейшла на кроки; перша помилка чи підказка на кроках — «План»")
    expect(describePlay({ startedAt: at, prompted: [], events: [], stage: '3', stepSize: 'big', switched: true })).toEqual(['етап 3.1–3.8', 'великі кроки', 'перевірка з перемикачем етапів'])
  })
})
