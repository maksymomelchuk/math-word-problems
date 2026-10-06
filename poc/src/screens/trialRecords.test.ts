import { describe, expect, it } from 'vitest'
import { emptyProgress, type Attempt, type HelpEvent, type LogEvent, type LogEventInput, type Progress } from '../lib/progress'
import type { GuidedProblem } from '../problems/types'
import { attemptMinutes, dateWords, describeAttemptHeading, minutesWords } from './logWords'
import { recordsText, shownByLevel, shownItems, soloLines, summaryText } from './trialRecords'

const dates = dateWords('UTC')

/** Minutes after 5 Oct 2026, 10:00 UTC, as an ISO time. */
const t = (minutes: number) => new Date(Date.UTC(2026, 9, 5, 10, 0) + minutes * 60_000).toISOString()

let clock = 0
function attempt(start: number, end: number | null, extra: Omit<Partial<Attempt>, 'log'> & { log?: LogEventInput[] } = {}): Attempt {
  const { log, ...rest } = extra
  clock = start * 60
  const next = () => new Date(Date.parse(t(start)) + ++clock * 1000).toISOString()
  return {
    startedAt: t(start),
    ...(end === null ? {} : { finishedAt: t(end) }),
    prompted: [],
    events: [],
    stage: '3',
    ...rest,
    ...(log ? { log: log.map((e) => ({ ...e, at: next() }) as LogEvent) } : {}),
  }
}

function progressOf(...entries: [string, Attempt][]): Progress {
  const progress = emptyProgress()
  for (const [id, a] of entries) progress.problems[id] = { attempts: [...(progress.problems[id]?.attempts ?? []), a] }
  return progress
}

const problem = (id: string, story: string, actions: string[]): GuidedProblem =>
  ({
    id,
    story,
    level: Number(id[0]),
    text: [],
    writeUp: { shortRecord: [], plans: [{ actions: actions.map((a) => ({ id: a, explanation: a, terms: [], sign: '+', result: '1', unit: '' })) }] },
    review: {},
    steps: {},
  }) as unknown as GuidedProblem

const PROBLEMS = [problem('1.2', 'Акваріуми', ['a', 'b']), problem('3.4', 'Кавуни', ['x', 'y', 'z']), problem('4.6', 'Пазл', ['p', 'q']), problem('4.7', 'Трикутник', ['bc', 'ac', 'p'])]
const kavuny = PROBLEMS[1]

const result = (line: number, right: boolean, extra: Partial<Extract<LogEvent, { kind: 'result' }>> = {}): LogEventInput =>
  ({ kind: 'result', step: 'compute', line, action: `a${line}`, value: '9', right, ...extra }) as LogEventInput
const shownResult = (line: number, extra: Partial<Extract<LogEvent, { kind: 'result' }>> = {}) => result(line, false, { shown: true, ...extra })
const help = (at: number, extra: Partial<HelpEvent>): HelpEvent => ({ at: t(at), step: 'compute', help: 'shown', ...extra })

describe('what the app had to show, in words', () => {
  it('names a typed result shown, with the wrong sign behind it, or whether it was a slip', () => {
    expect(shownItems(kavuny, attempt(0, 9, { log: [result(0, false, { sign: '−' }), shownResult(0)] }))).toEqual(['дію 1 (знак\u00a0«−»)'])
    const slip = attempt(0, 9, { log: [result(1, false), shownResult(1), { kind: 'sameAction', step: 'compute', line: 1, action: 'a1', slip: true }] })
    expect(shownItems(kavuny, slip)).toEqual(['дію 2 (помилка в обчисленні)'])
    const other = attempt(0, 9, { log: [result(1, false), shownResult(1), { kind: 'sameAction', step: 'compute', line: 1, action: 'a1', slip: false }] })
    expect(shownItems(kavuny, other)).toEqual(['дію 2 (інша дія)'])
  })

  it('names plan lines shown, and what a second «Підказка» showed', () => {
    const plan = attempt(0, 9, {
      log: [
        { kind: 'planLine', step: 'plan', line: 0, picked: 'other', right: false },
        { kind: 'planLine', step: 'plan', line: 0, picked: 'other', right: false, shown: true },
        { kind: 'hint', step: 'plan', tap: 2, part: 'line-2' },
        { kind: 'planLine', step: 'plan', line: 1, picked: 'y', right: true, shown: true },
        { kind: 'hint', step: 'compute', tap: 2, part: 'z' },
      ],
    })
    expect(shownItems(kavuny, plan)).toEqual(['рядок плану 1', 'рядок плану 2 (через «Підказку»)', 'дію 3 (через «Підказку»)'])
    expect(shownItems(kavuny, attempt(0, 9, { log: [{ kind: 'hint', step: 'plan', tap: 2, part: 'whole' }] }))).toEqual(['план (через «Підказку»)'])
  })

  it('names a plan card or an action shown on a guided step, and leaves hints, «Чому?» and direction checks out', () => {
    const guided = attempt(0, 9, {
      stage: '1',
      events: [
        help(1, { step: 'plan', help: 'hint' }),
        help(2, { step: 'plan', part: 'why' }),
        help(3, { step: 'plan' }),
        help(4, { part: 'b-direction' }),
        help(5, { part: 'b', help: 'hint', sign: '·' }),
        help(6, { part: 'b' }),
        help(7, { part: 'a', slip: true }),
      ],
    })
    expect(shownItems(PROBLEMS[0], guided)).toEqual(['план', 'дію 2 (знак\u00a0«·»)', 'дію 1 (помилка в обчисленні)'])
    expect(shownItems(kavuny, attempt(0, 9, { log: [result(0, false), { kind: 'direction', step: 'compute', line: 0, action: 'x', relationType: 'ratio', picked: 'більше', right: false, shown: true }] }))).toEqual([])
  })
})

describe('«Де довелося показати»', () => {
  const missed = (start: number, extra: Omit<Partial<Attempt>, 'log'> = {}) => attempt(start, start + 9, { ...extra, log: [result(0, false, { sign: '−' }), shownResult(0)] })
  const clean = (start: number, extra: Omit<Partial<Attempt>, 'log'> = {}) => attempt(start, start + 7, { ...extra, log: [result(0, true)] })

  it('gives one line per missed problem, by level, with how its repeat went', () => {
    const progress = progressOf(['1.2', clean(0, { stage: '1' })], ['3.4', missed(20)], ['3.4', clean(60, { repeat: true })])
    const levels = shownByLevel(progress, PROBLEMS, dates)
    expect(levels).toHaveLength(1)
    expect(levels[0].level).toBe(3)
    expect(levels[0].lines.map(summaryText)).toEqual(['3.4 · Кавуни, 5 жовт. — показано дію 1 (знак\u00a0«−»); повтор — без показу'])
  })

  it('says when the repeat is still to come, unfinished, or missed again', () => {
    expect(shownByLevel(progressOf(['3.4', missed(0)]), PROBLEMS, dates)[0].lines[0].what).toBe('показано дію 1 (знак\u00a0«−»); повтор — ще попереду')
    expect(shownByLevel(progressOf(['3.4', { ...missed(0), finishedAt: undefined }]), PROBLEMS, dates)[0].lines[0].what).toBe('показано дію 1 (знак\u00a0«−»); задачу ще не завершено')
    const unfinished = progressOf(['3.4', missed(0)], ['3.4', attempt(30, null, { repeat: true })])
    expect(shownByLevel(unfinished, PROBLEMS, dates)[0].lines[0].what).toBe('показано дію 1 (знак\u00a0«−»); повтор — почато, ще не завершено')
    const again = progressOf(['3.4', missed(0)], ['3.4', attempt(30, 40, { repeat: true, log: [result(2, false), shownResult(2)] })])
    expect(shownByLevel(again, PROBLEMS, dates)[0].lines[0].what).toBe('показано дію 1 (знак\u00a0«−»); повтор — знову показано дію 3')
  })

  it('counts every attempt of the first pass, and gives a missed later play its own line', () => {
    const progress = progressOf(['3.4', attempt(0, null, { log: [{ kind: 'hint', step: 'plan', tap: 2, part: 'line-1' }] })], ['3.4', clean(10)], ['3.4', missed(24 * 60 * 3)])
    const lines = shownByLevel(progress, PROBLEMS, dates)[0].lines.map(summaryText)
    expect(lines).toEqual(['3.4 · Кавуни, 5 жовт. — показано рядок плану 1 (через «Підказку»); повтор — ще попереду', '3.4 · Кавуни, 8 жовт., ще раз — показано дію 1 (знак\u00a0«−»)'])
  })

  it("leaves out the parent's stage-switch checks and records from before the fading build", () => {
    const progress = progressOf(['3.4', missed(0, { switched: true })], ['4.7', { ...missed(10), stage: undefined }])
    expect(shownByLevel(progress, PROBLEMS, dates)).toEqual([])
  })
})

describe('her solo tries', () => {
  const solo = (choice: 'solo' | 'steps'): LogEventInput => ({ kind: 'solo', step: 'start', choice })
  const lines = (...entries: [string, Attempt][]) => soloLines(progressOf(...entries), PROBLEMS, dates).map(summaryText)

  it('gives her choice, how it went and the minutes, one line per play', () => {
    expect(lines(['4.6', attempt(0, 9, { stage: '4c', log: [solo('solo'), { kind: 'soloAnswer', step: 'start', value: '24', right: true }] })])).toEqual([
      '4.6 · Пазл, 5 жовт. — «Спробую сама»: правильно; 9 хв',
    ])
    expect(lines(['4.6', attempt(0, 12, { stage: '4c', log: [solo('steps'), result(0, true)] })])).toEqual(['4.6 · Пазл, 5 жовт. — «Крок за кроком»: без показу; 12 хв'])
    expect(lines(['4.6', attempt(0, null, { stage: '4c', log: [solo('steps')] })])).toEqual(['4.6 · Пазл, 5 жовт. — «Крок за кроком»; не завершено'])
  })

  it('says where she went step by step after a wrong answer or «Розбий на кроки»', () => {
    const wrong = attempt(0, 14, {
      stage: '4c',
      log: [solo('solo'), { kind: 'soloAnswer', step: 'start', value: '35,7', right: false }, { kind: 'soloSwitch', step: 'start', reason: 'wrong' }, { kind: 'nextStep', step: 'decode', picked: 'plan', due: 'decode', right: false }],
    })
    expect(lines(['4.7', wrong])).toEqual(['4.7 · Трикутник, 5 жовт. — «Спробую сама»: відповідь 35,7 не зійшлася, далі крок за кроком; на кроках перша підказка чи помилка — «Порівняння»; 14 хв'])
    const broke = attempt(0, 20, { stage: '4c', log: [solo('solo'), { kind: 'soloSwitch', step: 'start', reason: 'break' }, shownResult(1)] })
    broke.log![1] = { ...broke.log![1], at: t(4) }
    broke.log![2] = { ...broke.log![2], at: t(10) }
    expect(lines(['4.7', broke])).toEqual(['4.7 · Трикутник, 5 жовт. — «Спробую сама»: натиснула «Розбий на кроки» через 4 хв; на кроках перша підказка чи помилка — «Обчисли»; показано дію 2; 20 хв'])
  })

  it('leaves out plays without the choice and the stage-switch checks', () => {
    expect(lines(['3.4', attempt(0, 9)], ['4.7', attempt(10, 20, { stage: '4c', switched: true, log: [solo('solo')] })])).toEqual([])
  })
})

describe('minutes', () => {
  it('counts whole minutes from opening to the Розбір, pauses included', () => {
    expect(attemptMinutes(attempt(0, 12))).toBe(12)
    expect(attemptMinutes(attempt(0, null))).toBeNull()
    expect(minutesWords(0)).toBe('менше 1 хв')
    expect(minutesWords(59)).toBe('59 хв')
    expect(minutesWords(65)).toBe('1 год 5 хв')
    expect(minutesWords(120)).toBe('2 год')
  })

  it('puts them on each finished attempt', () => {
    expect(describeAttemptHeading(attempt(0, 12, { stage: '3', stepSize: 'small' }), dates)).toEqual({ when: '5 жовт. 2026 р., 10:00', rest: " — розв'язано о 10:12, 12 хв, етап 3.1–3.8, малі кроки" })
    expect(describeAttemptHeading(attempt(0, 24 * 60 + 5), dates).rest).toBe(" — розв'язано о 6 жовт. 2026 р., 10:05, 24 год 5 хв, етап 3.1–3.8")
    expect(describeAttemptHeading(attempt(0, null, { repeat: true }), dates).rest).toBe(' — не завершено, етап 3.1–3.8, повтор пропущеної задачі')
  })
})

describe('the text copy', () => {
  it('holds the summary and every attempt, problems never opened left out', () => {
    const progress = progressOf(['3.4', attempt(0, 9, { log: [result(0, false, { sign: '−' }), shownResult(0)] })], ['4.7', attempt(30, 40, { switched: true, stage: '4c' })])
    const text = recordsText(progress, PROBLEMS, new Date(t(60)), dates)
    expect(text).toContain('ДЕ ДОВЕЛОСЯ ПОКАЗАТИ\nРівень 3\n3.4 · Кавуни, 5 жовт. — показано дію 1 (знак\u00a0«−»); повтор — ще попереду\n')
    expect(text).toContain('САМА ЧИ КРОК ЗА КРОКОМ\nЩе не було.')
    expect(text).toContain("3.4 · Кавуни\n- 5 жовт. 2026 р., 10:00 — розв'язано о 10:09, 9 хв, етап 3.1–3.8, довелося показати\n")
    expect(text).toContain('  Обчисли, дія 1, перевір знак: результат 9 (знак «−»)\n')
    expect(text).toContain('4.7 · Трикутник\n- 5 жовт. 2026 р., 10:30 — розв\'язано о 10:40, 10 хв, етап 4.6–4.7, перевірка з перемикачем етапів')
    expect(text).not.toContain('1.2 · Акваріуми')
    expect(text.startsWith('Тренажер задач — записи\nСкопійовано 5 жовт. 2026 р., 11:00.')).toBe(true)
  })

  it('says when there is nothing yet', () => {
    const text = recordsText(emptyProgress(), PROBLEMS, new Date(t(0)), dates)
    expect(text).toContain('ДЕ ДОВЕЛОСЯ ПОКАЗАТИ\nЇї спроб ще немає.')
    expect(text).toContain('УСІ СПРОБИ\nЩе жодної.')
  })
})
