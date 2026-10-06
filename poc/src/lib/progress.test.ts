import { describe, expect, it } from 'vitest'
import {
  PROGRESS_VERSION,
  STORAGE_KEY,
  emptyProgress,
  finishAttempt,
  isSolved,
  loadProgress,
  recordHelp,
  recordLevelEndSeen,
  recordPlan,
  recordSetEndSeen,
  resetProgress,
  saveProgress,
  startAttempt,
  withLog,
  type ProgressStorage,
} from './progress'

function memoryStorage(initial: Record<string, string> = {}): ProgressStorage & { data: Record<string, string> } {
  const data = { ...initial }
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value
    },
    removeItem: (key) => {
      delete data[key]
    },
  }
}

describe('progress', () => {
  it('starts empty', () => {
    expect(loadProgress(memoryStorage())).toEqual(emptyProgress())
  })

  it('saves, loads and resets', () => {
    const storage = memoryStorage()
    const progress = emptyProgress()
    progress.problems['2.3'] = { attempts: [{ startedAt: '2026-10-03T10:00:00.000Z', prompted: ['retell'], events: [] }] }

    expect(saveProgress(progress, storage)).toBe(true)
    expect(loadProgress(storage)).toEqual(progress)

    resetProgress(storage)
    expect(storage.data[STORAGE_KEY]).toBeUndefined()
    expect(loadProgress(storage)).toEqual(emptyProgress())
  })

  it('drops corrupt data and data from another version', () => {
    expect(loadProgress(memoryStorage({ [STORAGE_KEY]: '{not json' }))).toEqual(emptyProgress())
    expect(loadProgress(memoryStorage({ [STORAGE_KEY]: '{"version":1,"problems":{}}' }))).toEqual(emptyProgress())
    expect(loadProgress(memoryStorage({ [STORAGE_KEY]: `{"version":${PROGRESS_VERSION},"problems":[]}` }))).toEqual(emptyProgress())
  })

  it('reports a failed save instead of throwing', () => {
    const full = memoryStorage()
    full.setItem = () => {
      throw new DOMException('quota', 'QuotaExceededError')
    }
    expect(saveProgress(emptyProgress(), full)).toBe(false)
    expect(saveProgress(emptyProgress(), null)).toBe(false)
  })
})

describe('recording an attempt', () => {
  it('records hints, shown answers and slips per step, with times, and the finish', () => {
    const storage = memoryStorage()
    const startedAt = startAttempt('4.7', ['retell', 'compute'], new Date('2026-10-03T10:00:00Z'), storage)
    recordHelp('4.7', startedAt, { at: '2026-10-03T10:01:00.000Z', step: 'retell', help: 'hint' }, storage)
    recordHelp('4.7', startedAt, { at: '2026-10-03T10:02:00.000Z', step: 'compute', part: 'bc', help: 'hint', slip: true }, storage)
    recordHelp('4.7', startedAt, { at: '2026-10-03T10:03:00.000Z', step: 'compute', part: 'bc', help: 'shown' }, storage)
    recordPlan('4.7', startedAt, 0, storage)
    expect(isSolved(loadProgress(storage), '4.7')).toBe(false)

    finishAttempt('4.7', startedAt, new Date('2026-10-03T10:05:00Z'), storage)

    const [attempt] = loadProgress(storage).problems['4.7'].attempts
    expect(attempt).toEqual({
      startedAt: '2026-10-03T10:00:00.000Z',
      finishedAt: '2026-10-03T10:05:00.000Z',
      prompted: ['retell', 'compute'],
      plan: 0,
      events: [
        { at: '2026-10-03T10:01:00.000Z', step: 'retell', help: 'hint' },
        { at: '2026-10-03T10:02:00.000Z', step: 'compute', part: 'bc', help: 'hint', slip: true },
        { at: '2026-10-03T10:03:00.000Z', step: 'compute', part: 'bc', help: 'shown' },
      ],
    })
    expect(isSolved(loadProgress(storage), '4.7')).toBe(true)
  })

  it('keeps attempts apart and ignores events for unknown attempts', () => {
    const storage = memoryStorage()
    const first = startAttempt('2.3', ['retell'], new Date('2026-10-03T10:00:00Z'), storage)
    const second = startAttempt('2.3', ['retell'], new Date('2026-10-04T10:00:00Z'), storage)
    recordHelp('2.3', second, { at: '2026-10-04T10:01:00.000Z', step: 'retell', help: 'hint' }, storage)
    recordHelp('2.3', 'no such attempt', { at: '2026-10-04T10:02:00.000Z', step: 'retell', help: 'shown' }, storage)

    const attempts = loadProgress(storage).problems['2.3'].attempts
    expect(attempts.map((a) => [a.startedAt, a.events.length])).toEqual([
      [first, 0],
      [second, 1],
    ])
  })

  it('records the wrong sign of an action and a missed direction check in Обчисли', () => {
    const storage = memoryStorage()
    const startedAt = startAttempt('2.3', ['compute'], new Date('2026-10-03T10:00:00Z'), storage)
    recordHelp('2.3', startedAt, { at: '2026-10-03T10:01:00.000Z', step: 'compute', part: 'asked-direction', help: 'hint' }, storage)
    recordHelp('2.3', startedAt, { at: '2026-10-03T10:02:00.000Z', step: 'compute', part: 'asked', help: 'hint', sign: '+' }, storage)
    expect(loadProgress(storage).problems['2.3'].attempts[0].events).toEqual([
      { at: '2026-10-03T10:01:00.000Z', step: 'compute', part: 'asked-direction', help: 'hint' },
      { at: '2026-10-03T10:02:00.000Z', step: 'compute', part: 'asked', help: 'hint', sign: '+' },
    ])
  })
})

describe('the fading records', () => {
  it('reads records saved before them, and adds the log and play notes alongside', () => {
    const storage = memoryStorage()
    const old = { version: PROGRESS_VERSION, problems: { '2.3': { attempts: [{ startedAt: '2026-10-02T10:00:00.000Z', prompted: ['retell'], plan: 1, events: [{ at: '2026-10-02T10:01:00.000Z', step: 'compute', part: 'asked', help: 'hint', sign: '+' }] }] } } }
    storage.setItem(STORAGE_KEY, JSON.stringify(old))
    expect(loadProgress(storage)).toEqual(old)
    const startedAt = startAttempt('4.7', [], new Date('2026-10-03T10:00:00.000Z'), storage, { stage: '3', stepSize: 'small', switched: true })
    expect(loadProgress(storage).problems['4.7'].attempts[0]).toMatchObject({ stage: '3', stepSize: 'small', switched: true, events: [] })
    const logged = withLog(loadProgress(storage), '4.7', startedAt, { at: startedAt, step: 'plan', kind: 'planLine', line: 0, picked: 'bc', right: true })
    expect(logged.problems['4.7'].attempts[0].log).toHaveLength(1)
    expect(logged.problems['2.3']).toEqual(old.problems['2.3'])
  })
})

describe('the game layer state', () => {
  it('reads records saved before it, and notes each level-end and the set-end screen once, beside the attempts', () => {
    const storage = memoryStorage()
    const old = { version: PROGRESS_VERSION, problems: { '1.1': { attempts: [{ startedAt: '2026-10-03T10:00:00.000Z', finishedAt: '2026-10-03T10:05:00.000Z', prompted: [], events: [], stage: '1' }] } } }
    storage.setItem(STORAGE_KEY, JSON.stringify(old))
    expect(loadProgress(storage).game).toBeUndefined()
    recordLevelEndSeen(1, storage)
    recordLevelEndSeen(1, storage)
    expect(loadProgress(storage)).toEqual({ ...old, game: { levelEnds: [1] } })
    recordSetEndSeen(4, storage)
    expect(loadProgress(storage).game).toEqual({ levelEnds: [1, 4], setEnd: true })
    resetProgress(storage)
    expect(loadProgress(storage).game).toBeUndefined()
  })
})
