import { describe, expect, it } from 'vitest'
import { emptyProgress, type Attempt, type HelpEvent, type LogEvent, type LogEventInput, type Progress } from '../lib/progress'
import { directionActive, fadeChanges, isMissed, learnerState, planOutcome } from './learner'
import { handoverDue, isRepeatDue, levelFinished, nextProblem, repeatQueue, setFinished } from './loop'
import { resolvePlay } from './play'
import { playAt } from './stages'

let clock = 0
const at = () => new Date(Date.UTC(2026, 9, 3, 10, 0, clock++)).toISOString()

type LogInput = LogEventInput
function attempt(extra: Omit<Partial<Attempt>, 'log'> & { log?: LogInput[] } = {}): Attempt {
  const { log, ...rest } = extra
  return { startedAt: at(), prompted: [], events: [], finishedAt: at(), stage: '3', ...rest, ...(log ? { log: log.map((e) => ({ ...e, at: at() }) as LogEvent) } : {}) }
}

function progressOf(...entries: [string, Attempt][]): Progress {
  const progress = emptyProgress()
  for (const [id, a] of entries) progress.problems[id] = { attempts: [...(progress.problems[id]?.attempts ?? []), a] }
  return progress
}

const line = (n: number, right: boolean, shown?: true): LogInput => ({ kind: 'planLine', step: 'plan', line: n, picked: right ? 'x' : 'other', right, ...(shown ? { shown } : {}) })
const allRight = () => attempt({ stepSize: 'small', log: [line(0, true), line(1, true)] })
const oneWrong = () => attempt({ stepSize: 'small', log: [line(0, false), line(0, true), line(1, true)] })

describe('her plan step size', () => {
  it('reads each attempt: every line right first time, a line not right, or no plan of her own', () => {
    expect(planOutcome(allRight())).toBe('right')
    expect(planOutcome(oneWrong())).toBe('wrong')
    expect(planOutcome(attempt())).toBeNull()
    expect(planOutcome(attempt({ log: [line(0, true)], finishedAt: undefined }))).toBeNull()
    expect(planOutcome(attempt({ log: [line(0, true), { kind: 'hint', step: 'plan', tap: 2 }] }))).toBe('wrong')
    expect(planOutcome(attempt({ log: [{ kind: 'actionCount', step: 'plan', value: '2', right: false }, line(0, true)] }))).toBe('wrong')
  })

  it('moves to big steps after two right plans in a row, and back after a line not right first time', () => {
    expect(learnerState(progressOf(['3.1', allRight()])).stepSize).toBe('small')
    const big = learnerState(progressOf(['3.1', allRight()], ['3.2', allRight()]))
    expect(big).toMatchObject({ stepSize: 'big', justMoved: 'big' })
    expect(learnerState(progressOf(['3.1', allRight()], ['3.2', oneWrong()], ['3.3', allRight()])).stepSize).toBe('small')
    const back = learnerState(progressOf(['3.1', allRight()], ['3.2', allRight()], ['3.3', oneWrong()]))
    expect(back).toMatchObject({ stepSize: 'small', justMoved: 'small' })
  })

  it("clears the move once its line was shown, and leaves results and the parent's checks out", () => {
    const first = allRight()
    const second = allRight()
    const told = attempt({ log: [{ kind: 'stepSize', step: 'start', size: 'big' }] })
    expect(learnerState(progressOf(['3.1', first], ['3.2', second], ['3.3', told])).justMoved).toBeNull()
    const results = attempt({ log: [line(0, true), line(1, true), { kind: 'result', step: 'compute', line: 0, action: 'a', value: '1', right: false }] })
    expect(learnerState(progressOf(['3.1', allRight()], ['3.2', results])).stepSize).toBe('big')
    expect(learnerState(progressOf(['3.1', allRight()], ['3.2', { ...allRight(), switched: true }])).stepSize).toBe('small')
  })
})

describe('the direction check fades per relation type', () => {
  const direction = (n: number, right: boolean, extra: Partial<LogInput> = {}): LogInput =>
    ({ kind: 'direction', step: 'compute', line: n, action: `a${n}`, relationType: 'threeQuantities', picked: right ? 'менше' : 'більше', right, ...extra }) as LogInput
  const result = (n: number, right: boolean, sign?: '·'): LogInput =>
    ({ kind: 'result', step: 'compute', line: n, action: `a${n}`, value: '1', right, relationType: 'threeQuantities', ...(sign ? { sign } : {}) }) as LogInput

  it('stops after two right answers in a row, each followed by a right result', () => {
    const state = learnerState(progressOf(['2.3', attempt({ log: [direction(0, true), result(0, true), direction(1, true), result(1, true)] })]))
    expect(directionActive(state, 'threeQuantities')).toBe(false)
    expect(directionActive(state, 'ratio')).toBe(true)
  })

  it("doesn't count a right answer whose result was wrong, or a wrong answer", () => {
    const wrongResult = learnerState(progressOf(['2.3', attempt({ log: [direction(0, true), result(0, false), result(0, true), direction(1, true), result(1, true)] })]))
    expect(wrongResult.direction.threeQuantities).toEqual({ streak: 1, faded: false })
    const wrongAnswer = learnerState(progressOf(['2.3', attempt({ log: [direction(0, true), result(0, true), direction(1, false), direction(1, true), result(1, true)] })]))
    expect(wrongAnswer.direction.threeQuantities?.streak).toBe(0)
  })

  it('comes back after a wrong sign on that type, and «Підказка» answers never count', () => {
    const faded = [direction(0, true), result(0, true), direction(1, true), result(1, true)]
    const before = learnerState(progressOf(['2.3', attempt({ log: faded })]))
    const after = learnerState(progressOf(['2.3', attempt({ log: faded })], ['2.8', attempt({ log: [result(0, false, '·'), result(0, true)] })]))
    expect(directionActive(after, 'threeQuantities')).toBe(true)
    expect(fadeChanges(before, after)).toEqual([{ relationType: 'threeQuantities', faded: false }])
    const viaHint = learnerState(progressOf(['2.3', attempt({ log: [direction(0, true, { viaHint: true }), result(0, true), direction(1, true, { viaHint: true }), result(1, true)] })]))
    expect(directionActive(viaHint, 'threeQuantities')).toBe(true)
  })
})

describe('missed problems', () => {
  const shown = (step: HelpEvent['step'], part?: string): HelpEvent => ({ at: at(), step, help: 'shown', ...(part ? { part } : {}) })

  it('counts a plan line or a result the app had to show, never a direction check or a «Ні»', () => {
    expect(isMissed(attempt({ events: [shown('plan')] }))).toBe(true)
    expect(isMissed(attempt({ events: [shown('compute', 'asked')] }))).toBe(true)
    expect(isMissed(attempt({ events: [shown('compute', 'asked-direction'), shown('plan', 'why'), shown('decode', 'bcAc')] }))).toBe(false)
    expect(isMissed(attempt({ log: [line(0, false, true)] }))).toBe(true)
    expect(isMissed(attempt({ log: [{ kind: 'result', step: 'compute', line: 0, action: 'a', value: '9', right: false, shown: true }] }))).toBe(true)
    expect(isMissed(attempt({ log: [{ kind: 'hint', step: 'compute', tap: 2 }] }))).toBe(true)
    expect(isMissed(attempt({ log: [{ kind: 'hint', step: 'given', tap: 2 }, { kind: 'selfCheck', step: 'given', check: 'units', yes: false }] }))).toBe(false)
  })

  it('queues a first-pass miss once, until its repeat is finished', () => {
    const missed = attempt({ events: [shown('plan')] })
    const slots = ['2.1', '2.3', '3.1']
    let progress = progressOf(['2.1', attempt()], ['2.3', missed])
    expect(isRepeatDue(progress, '2.3')).toBe(true)
    expect(repeatQueue(progress, slots, 2)).toEqual(['2.3'])
    expect(levelFinished(progress, slots, 2)).toBe(false)
    expect(nextProblem(progress, slots)).toEqual({ id: '2.3', repeat: true })
    progress = progressOf(['2.1', attempt()], ['2.3', missed], ['2.3', attempt({ repeat: true, events: [shown('plan')] })])
    expect(isRepeatDue(progress, '2.3')).toBe(false)
    expect(levelFinished(progress, slots, 2)).toBe(true)
    expect(nextProblem(progress, slots)).toEqual({ id: '3.1', repeat: false })
  })

  it('waits until she has finished the problem', () => {
    expect(isRepeatDue(progressOf(['2.3', attempt({ finishedAt: undefined, events: [shown('plan')] })]), '2.3')).toBe(false)
  })

  it("doesn't queue a miss in a replay after the first pass", () => {
    const progress = progressOf(['2.3', attempt()], ['2.3', attempt({ events: [shown('compute', 'asked')] })])
    expect(isRepeatDue(progress, '2.3')).toBe(false)
  })
})

describe('the loop', () => {
  const slots = ['1.1', '1.2', '2.1']

  it('takes the first unfinished problem, and is done once every level and repeat is', () => {
    expect(nextProblem(emptyProgress(), slots)).toEqual({ id: '1.1', repeat: false })
    expect(nextProblem(progressOf(['1.1', attempt()]), slots)).toEqual({ id: '1.2', repeat: false })
    const done = progressOf(['1.1', attempt()], ['1.2', attempt()], ['2.1', attempt()])
    expect(nextProblem(done, slots)).toBeNull()
    expect(setFinished(done, slots)).toBe(true)
    expect(setFinished(progressOf(['1.1', attempt()]), slots)).toBe(false)
  })

  it('opens a stage with its handover the first time only', () => {
    expect(handoverDue(emptyProgress(), '2.1')).toMatch(/^Тепер дії/)
    expect(handoverDue(progressOf(['2.1', attempt({ finishedAt: undefined })]), '2.1')).toBeNull()
    expect(handoverDue(emptyProgress(), '2.3')).toBeNull()
  })
})

describe('how a problem plays when she opens it', () => {
  it('plays at its own stage, or at her furthest stage when it is a replay', () => {
    expect(resolvePlay('2.3', emptyProgress(), null)).toMatchObject({ stage: '2a', solo: false })
    expect(resolvePlay('4.7', emptyProgress(), null)).toMatchObject({ stage: '4c', solo: true })
    const atThree = progressOf(['3.4', attempt({ finishedAt: undefined })])
    expect(resolvePlay('2.3', atThree, null)).toMatchObject({ stage: '3' })
    expect(resolvePlay('2.1', atThree, null).handover).toBeUndefined()
    expect(resolvePlay('2.3', progressOf(['4.7', attempt()]), null)).toMatchObject({ stage: '4c', solo: true })
    expect(resolvePlay('4.4', progressOf(['4.6', attempt()]), null)).toMatchObject({ stage: '4c', solo: false })
  })

  it('leaves out the attempts from before fading', () => {
    const before = progressOf(['4.7', { startedAt: at(), finishedAt: at(), prompted: [], events: [] }])
    expect(resolvePlay('2.3', before, null)).toMatchObject({ stage: '2a', solo: false })
  })

  it("follows the parent's stage switch, and keeps those plays out of her progress", () => {
    const play = resolvePlay('4.7', emptyProgress(), { stage: '3', stepSize: 'big' })
    expect(play).toMatchObject({ stage: '3', stepSize: 'big', switched: true, solo: false })
    expect(play.handover).toMatch(/^Тепер короткий запис/)
    const checked = progressOf(['4.7', attempt({ switched: true })])
    expect(resolvePlay('2.3', checked, null)).toMatchObject({ stage: '2a' })
  })

  it('plays homework with every step prompted, and keeps it out of her furthest slot', () => {
    const missed = attempt({ stage: '1', events: [{ at: at(), step: 'plan', help: 'shown' }] })
    const ahead = progressOf(['4.7', attempt()], ['hw-6.2', missed])
    expect(resolvePlay('hw-6.2', ahead, { stage: '3', stepSize: 'big' })).toEqual(playAt('1'))
    expect(learnerState(ahead).furthest).toBe('4.7')
    expect(resolvePlay('4.4', ahead, null)).toMatchObject({ stage: '4c' })
  })

  it('opens with the step-size line after a move, and marks a repeat', () => {
    const moved = progressOf(['3.1', allRight()], ['3.2', allRight()])
    expect(resolvePlay('3.3', moved, null)).toMatchObject({ stepSize: 'big', stepMove: 'big' })
    const missed = progressOf(['2.3', attempt({ events: [{ at: at(), step: 'plan', help: 'shown' }] })])
    expect(resolvePlay('2.3', missed, null).repeat).toBe(true)
  })
})
