import { describe, expect, it } from 'vitest'
import { emptyProgress, type Attempt, type Progress } from '../lib/progress'
import { finishedProblems, levelRepeats, levels, repeatsDone } from './loop'

let clock = 0
const at = () => new Date(Date.UTC(2026, 9, 4, 10, 0, clock++)).toISOString()
const attempt = (extra: Partial<Attempt> = {}): Attempt => ({ startedAt: at(), prompted: [], events: [], finishedAt: at(), stage: '1', ...extra })
const missed = () => attempt({ events: [{ at: at(), step: 'plan', help: 'shown' }] })

function progressOf(...entries: [string, Attempt][]): Progress {
  const progress = emptyProgress()
  for (const [id, a] of entries) progress.problems[id] = { attempts: [...(progress.problems[id]?.attempts ?? []), a] }
  return progress
}

const slots = ['1.1', '1.2', '1.3', '2.1']

describe('the repeats in a level', () => {
  it('lists the finished repeats in the order she finished them, then those still due', () => {
    let progress = progressOf(['1.1', missed()], ['1.2', attempt()], ['1.3', missed()])
    expect(levelRepeats(progress, slots, 1)).toEqual([
      { id: '1.1', done: false },
      { id: '1.3', done: false },
    ])
    // She replayed 1.3 from its node first: it plays as its repeat.
    progress = progressOf(['1.1', missed()], ['1.2', attempt()], ['1.3', missed()], ['1.3', attempt({ repeat: true })])
    expect(levelRepeats(progress, slots, 1)).toEqual([
      { id: '1.3', done: true },
      { id: '1.1', done: false },
    ])
    expect(repeatsDone(progress, slots, 1)).toEqual(['1.3'])
    expect(levelRepeats(progress, slots, 2)).toEqual([])
  })

  it("leaves out an unfinished repeat and the parent's checks", () => {
    const progress = progressOf(['1.1', missed()], ['1.1', attempt({ repeat: true, finishedAt: undefined })], ['1.2', attempt({ repeat: true, switched: true })])
    expect(repeatsDone(progress, slots, 1)).toEqual([])
    expect(levelRepeats(progress, slots, 1)).toEqual([{ id: '1.1', done: false }])
  })
})

describe('the set as a whole', () => {
  it('names its levels and the problems she has finished, in slot order', () => {
    expect(levels(['2.1', '1.2', '1.1'])).toEqual([1, 2])
    const progress = progressOf(['1.3', attempt()], ['1.1', attempt()], ['1.2', attempt({ finishedAt: undefined })])
    expect(finishedProblems(progress, slots)).toEqual(['1.1', '1.3'])
  })
})
