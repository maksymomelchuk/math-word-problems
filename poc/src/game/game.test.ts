import { describe, expect, it } from 'vitest'
import { emptyProgress, withLevelEndSeen, withSetEndSeen, type Attempt, type HelpEvent, type LogEvent, type LogEventInput, type Progress } from '../lib/progress'
import { PROBLEMS, WALKING_BOY } from '../problems/problems'
import type { Homework } from '../problems/types'
import { homeworkShown, homeworkState } from './homework'
import { attemptOutcome, countWords, shownLine } from './outcome'
import { celebrationDue, endOfProblem, levelSummary, pathOf, problemNumber } from './path'
import { goalMetToday, xpTotal } from './score'

let clock = 0
const at = () => new Date(Date.UTC(2026, 9, 4, 10, 0, clock++)).toISOString()

function attempt(extra: Omit<Partial<Attempt>, 'log'> & { log?: LogEventInput[] } = {}): Attempt {
  const { log, ...rest } = extra
  return { startedAt: at(), prompted: [], events: [], finishedAt: at(), stage: '1', ...rest, ...(log ? { log: log.map((e) => ({ ...e, at: at() }) as LogEvent) } : {}) }
}

function progressOf(...entries: [string, Attempt][]): Progress {
  const progress = emptyProgress()
  for (const [id, a] of entries) progress.problems[id] = { attempts: [...(progress.problems[id]?.attempts ?? []), a] }
  return progress
}

const shown = (step: HelpEvent['step'], part?: string): HelpEvent => ({ at: at(), step, help: 'shown', ...(part ? { part } : {}) })
const hint = (step: HelpEvent['step']): HelpEvent => ({ at: at(), step, help: 'hint' })
const missed = () => attempt({ events: [shown('plan')] })

const SLOTS = PROBLEMS.map((p) => p.id)
const slots = ['1.1', '1.2', '2.1', '2.2']

describe('XP and the daily goal', () => {
  it('gives 10 XP for every finished problem, however it went, repeats and replays included', () => {
    expect(xpTotal(emptyProgress())).toBe(0)
    const progress = progressOf(['1.1', missed()], ['1.2', attempt({ events: [hint('retell')] })], ['1.1', attempt({ repeat: true })], ['1.2', attempt()])
    expect(xpTotal(progress)).toBe(40)
  })

  it("counts no unfinished attempt, no parent's check and nothing from before the fading build", () => {
    const progress = progressOf(['1.1', attempt({ finishedAt: undefined })], ['4.7', attempt({ switched: true })], ['2.3', { startedAt: at(), finishedAt: at(), prompted: [], events: [] }])
    expect(xpTotal(progress)).toBe(0)
  })

  it('meets the goal with one problem finished today, on her own clock, and says nothing of other days', () => {
    const progress = progressOf(['1.1', attempt({ finishedAt: new Date(2026, 9, 3, 23, 50).toISOString() })])
    expect(goalMetToday(progress, new Date(2026, 9, 3, 23, 59))).toBe(true)
    expect(goalMetToday(progress, new Date(2026, 9, 4, 0, 5))).toBe(false)
    expect(goalMetToday(progressOf(['1.1', attempt({ finishedAt: undefined })]), new Date())).toBe(false)
  })
})

describe('how a problem went', () => {
  it('tells a solo success, all right first time, hints and something shown apart', () => {
    expect(attemptOutcome(attempt({ log: [{ kind: 'solo', step: 'start', choice: 'solo' }, { kind: 'soloAnswer', step: 'start', value: '37,7', right: true }] }))).toEqual({ kind: 'solo' })
    expect(attemptOutcome(attempt({ log: [{ kind: 'planLine', step: 'plan', line: 0, picked: 'a', right: true }, { kind: 'selfCheck', step: 'answer', check: 'units', yes: true }] }))).toEqual({ kind: 'clean' })
    expect(attemptOutcome(attempt({ events: [hint('retell')] }))).toEqual({ kind: 'hints' })
    expect(attemptOutcome(attempt({ log: [{ kind: 'hint', step: 'given', tap: 1 }] }))).toEqual({ kind: 'hints' })
    expect(attemptOutcome(attempt({ log: [{ kind: 'selfCheck', step: 'answer', check: 'units', yes: false }] }))).toEqual({ kind: 'hints' })
    expect(attemptOutcome(attempt({ events: [shown('compute', 'a-direction')] }))).toEqual({ kind: 'hints' })
    expect(attemptOutcome(missed())).toEqual({ kind: 'shown', shown: { wholePlan: true, planLines: 0, actions: 0 } })
  })

  it('counts a wrong solo answer as a try, and goes by the steps after it', () => {
    const wrong = attempt({ log: [{ kind: 'soloAnswer', step: 'start', value: '30', right: false }, { kind: 'soloSwitch', step: 'start', reason: 'wrong' }] })
    expect(attemptOutcome(wrong)).toEqual({ kind: 'hints' })
    const broke = attempt({ log: [{ kind: 'soloSwitch', step: 'start', reason: 'break' }] })
    expect(attemptOutcome(broke)).toEqual({ kind: 'clean' })
  })

  it('names what was shown, each plan line and action once, and never the hints', () => {
    const paper = attempt({
      log: [
        { kind: 'planLine', step: 'plan', line: 1, picked: 'other', right: false, shown: true },
        { kind: 'hint', step: 'plan', tap: 2, part: 'line-2' },
        { kind: 'result', step: 'compute', line: 0, action: 'bc', value: '9', right: false, shown: true },
        { kind: 'hint', step: 'compute', tap: 2, part: 'perimeter' },
        { kind: 'hint', step: 'compute', tap: 2, part: 'bc' },
      ],
    })
    const outcome = attemptOutcome(paper)
    expect(outcome).toEqual({ kind: 'shown', shown: { wholePlan: false, planLines: 1, actions: 2 } })
    expect(shownLine({ wholePlan: false, planLines: 1, actions: 2 })).toBe('Довелося показати рядок плану і дві дії.')
    expect(shownLine({ wholePlan: true, planLines: 2, actions: 0 })).toBe('Довелося показати план.')
    expect(shownLine({ wholePlan: false, planLines: 0, actions: 1 })).toBe('Довелося показати дію.')
    expect(shownLine({ wholePlan: false, planLines: 5, actions: 3 })).toBe('Довелося показати 5 рядків плану і три дії.')
  })

  it('says counts in Ukrainian', () => {
    const problems = ['задача', 'задачі', 'задач'] as const
    expect([1, 3, 7, 8, 11, 21, 30].map((n) => countWords(n, problems))).toEqual(['1 задача', '3 задачі', '7 задач', '8 задач', '11 задач', '21 задача', '30 задач'])
    expect(countWords(2, ['повтор', 'повтори', 'повторів'])).toBe('2 повтори')
  })
})

describe('the path', () => {
  it('numbers the problems 1–30 through the set', () => {
    expect(['1.1', '1.7', '2.1', '2.3', '3.1', '4.6', '4.7'].map((id) => problemNumber(SLOTS, id))).toEqual([1, 7, 8, 10, 16, 29, 30])
  })

  it('opens only the next problem, keeps finished ones open, and puts repeats inside their level', () => {
    const progress = progressOf(['1.1', missed()], ['1.2', attempt()])
    const path = pathOf(progress, slots)
    const [one, two] = path.levels
    expect(one.items.map((i) => [i.id, i.repeat, i.state])).toEqual([
      ['1.1', false, 'done'],
      ['1.2', false, 'done'],
      ['1.1', true, 'next'],
    ])
    expect(one).toMatchObject({ state: 'current', problems: 2, problemsDone: 2, repeatsDone: 0, notebook: false })
    expect(two).toMatchObject({ state: 'locked', notebook: true })
    expect(two.items.every((i) => i.state === 'locked' && i.notebook)).toBe(true)
    expect(path).toMatchObject({ next: { id: '1.1', repeat: true }, finished: false, done: 2, total: 4 })
  })

  it('reads a level as done once its repeats are, and opens everything once the set is finished', () => {
    const levelDone = progressOf(['1.1', missed()], ['1.2', attempt()], ['1.1', attempt({ repeat: true })])
    const path = pathOf(levelDone, slots)
    expect(path.levels.map((l) => l.state)).toEqual(['done', 'current'])
    expect(path.levels[0]).toMatchObject({ repeatsDone: 1 })
    expect(path.levels[1].items[0]).toMatchObject({ id: '2.1', state: 'next' })
    const all = progressOf(['1.1', attempt()], ['1.2', attempt()], ['2.1', attempt()], ['2.2', attempt()])
    const finished = pathOf(all, slots)
    expect(finished.finished).toBe(true)
    expect(finished.levels.flatMap((l) => l.items).every((i) => i.state === 'done')).toBe(true)
    // A miss in a replay after the set queues nothing.
    const replayMissed = progressOf(['1.1', attempt()], ['1.2', attempt()], ['2.1', attempt()], ['2.2', attempt()], ['1.1', missed()])
    expect(pathOf(replayMissed, slots).levels[0].items).toHaveLength(2)
  })
})

describe('level-end and set-end screens', () => {
  it('shows each level end once, after its last problem or repeat, then the set end in place of the last one', () => {
    const repeatDue = progressOf(['1.1', missed()], ['1.2', attempt()])
    expect(celebrationDue(repeatDue, slots)).toBeNull()
    const levelDone = progressOf(['1.1', missed()], ['1.2', attempt()], ['1.1', attempt({ repeat: true })])
    expect(celebrationDue(levelDone, slots)).toEqual({ kind: 'level', level: 1 })
    expect(levelSummary(levelDone, slots, 1)).toEqual({ problems: 2, repeats: 1 })
    expect(celebrationDue(withLevelEndSeen(levelDone, 1), slots)).toBeNull()
    const all = withLevelEndSeen(progressOf(['1.1', attempt()], ['1.2', attempt()], ['2.1', attempt()], ['2.2', attempt()]), 1)
    expect(celebrationDue(all, slots)).toEqual({ kind: 'set' })
    expect(celebrationDue(withSetEndSeen(all, 2), slots)).toBeNull()
  })
})

describe('the end of a problem', () => {
  it('counts the problem as finished, and notes the repeat only for a first-pass miss', () => {
    const open = attempt({ finishedAt: undefined, events: [shown('compute', 'asked')] })
    const end = endOfProblem(progressOf(['1.1', attempt()], ['1.2', open]), slots, '1.2', new Date())
    expect(end).toMatchObject({ outcome: { kind: 'shown' }, repeatAtLevel: 1, done: 2, total: 4 })
    const repeatMissed = endOfProblem(progressOf(['1.2', missed()], ['1.2', { ...missed(), repeat: true, finishedAt: undefined }]), slots, '1.2')
    expect(repeatMissed).toMatchObject({ outcome: { kind: 'shown' }, repeatAtLevel: null })
    const check = endOfProblem(progressOf(['1.2', { ...missed(), switched: true, finishedAt: undefined }]), slots, '1.2')
    expect(check).toMatchObject({ repeatAtLevel: null, done: 0 })
    expect(endOfProblem(emptyProgress(), slots, '1.1')).toBeNull()
  })
})

describe('her homework on the home screen', () => {
  const hw = (id: string, added: string): Homework => ({ title: id, added, problem: { ...WALKING_BOY, id } })
  // Newest first, as `HOMEWORK` lists them.
  const homework = [hw('hw-c', '2026-10-05'), hw('hw-b', '2026-10-01'), hw('hw-a', '2026-09-20')]
  const now = new Date(2026, 9, 6, 18)
  const ids = (list: Homework[]) => list.map((h) => h.problem.id)

  it('shows the unsolved ones first, newest first, then the ones solved in the last week, at most two', () => {
    expect(ids(homeworkShown(emptyProgress(), homework, null, now))).toEqual(['hw-c', 'hw-b'])
    const solvedC = progressOf(['hw-c', attempt()])
    expect(ids(homeworkShown(solvedC, homework, null, now))).toEqual(['hw-b', 'hw-a'])
    const allSolved = progressOf(['hw-c', attempt()], ['hw-b', attempt()], ['hw-a', attempt()])
    expect(ids(homeworkShown(allSolved, homework, null, now))).toEqual(['hw-c', 'hw-b'])
    expect(ids(homeworkShown(allSolved, homework, null, new Date(2026, 9, 8, 9)))).toEqual(['hw-c'])
  })

  it('says whether each is new, open now, or solved', () => {
    const progress = progressOf(['hw-b', attempt()])
    expect(homeworkState(progress, null, 'hw-c')).toBe('new')
    expect(homeworkState(progress, 'hw-c', 'hw-c')).toBe('open')
    expect(homeworkState(progress, null, 'hw-b')).toBe('done')
    expect(homeworkState(progress, 'hw-b', 'hw-b')).toBe('open')
  })
})
