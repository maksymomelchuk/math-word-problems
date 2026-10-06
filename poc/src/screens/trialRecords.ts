/**
 * The trial records at a glance, for the top of «Для батьків», and every
 * record as plain text for «Скопіювати записи» (ticket «Show the trial
 * records in «Для батьків»»):
 *
 * - «Де довелося показати»: by level, one line per missed problem (the app had
 *   to show a plan line or an action's result) saying what was shown, whether
 *   it was a slip, and how its repeat went;
 * - her solo tries: one line per play with the choice between «Крок за
 *   кроком» and «Спробую сама», how it went, and minutes.
 *
 * The summary reads her own attempts only (`ownAttempts`): the parent's
 * stage-switch plays and records from before the fading build stay out, and
 * the «Спробувати» tries are kept apart from the progress anyway. Everything is
 * derived from the records, never stored. Pure, no UI code.
 */
import { isMissed, ownAttempts, type OwnAttempt } from '../fading/learner'
import type { Attempt, LogEvent, Progress } from '../lib/progress'
import { compareSlots, parseSlot } from '../problems/slots'
import type { GuidedProblem, Sign } from '../problems/types'
import { attemptMinutes, dateWords, describeAttemptHeading, describeHelp, describeLog, firstMissAfter, minutesWords, stepName, type DateWords } from './logWords'

/** One line of the summary: «3.4 · Кавуни», «5 жовт.», «показано дію 1 (знак «−»); повтор — без показу». */
export type SummaryLine = { problemId: string; title: string; when: string; what: string }

export type LevelLines = { level: number; lines: SummaryLine[] }

/** A summary line as plain text: «3.4 · Кавуни, 5 жовт. — показано дію 1 (знак «−»); повтор — без показу». */
export function summaryText(line: SummaryLine): string {
  return `${line.title}, ${line.when} — ${line.what}`
}

const VIA_HINT = ' (через «Підказку»)'
const SLIP = 'помилка в обчисленні'
/** «знак «−»», kept on one line so the sign never starts a line alone. */
const signWords = (sign: Sign) => `знак\u00a0«${sign}»`
const actionWords = (n: number | null, detail?: string) => `${n === null ? 'дію' : `дію ${n}`}${detail ? ` (${detail})` : ''}`

function titleOf(id: string, problem: GuidedProblem | undefined): string {
  return problem ? `${id} · ${problem.story}` : id
}

/** The action's number in her plan: from the paper records of that action, else its place in the plan she followed. */
function actionNumber(problem: GuidedProblem | undefined, attempt: Attempt, actionId: string): number | null {
  for (const e of attempt.log ?? []) {
    if ((e.kind === 'result' || e.kind === 'direction') && e.action === actionId) return e.line + 1
  }
  const plans = problem?.writeUp.plans ?? []
  const followed = attempt.plan !== undefined ? plans[attempt.plan] : undefined
  for (const plan of followed ? [followed, ...plans] : plans) {
    const index = plan.actions.findIndex((a) => a.id === actionId)
    if (index >= 0) return index + 1
  }
  return null
}

/**
 * What the app had to show in an attempt, in order, as the parent reads it:
 * «план», «рядок плану 2 (через «Підказку»)», «дію 1 (знак «−»)», «дію 2
 * (помилка в обчисленні)», «дію 3 (інша дія)». The same as `isMissed`
 * counts: a plan card or action shown on a guided step, a plan line or typed
 * result shown, and a plan line or action shown by a second «Підказка» tap.
 */
export function shownItems(problem: GuidedProblem | undefined, attempt: Attempt): string[] {
  const items: { at: string; text: string }[] = []

  attempt.events.forEach((e, i) => {
    if (e.help !== 'shown') return
    if (e.step === 'plan' && e.part !== 'why') items.push({ at: e.at, text: 'план' })
    if (e.step === 'compute' && !e.part?.endsWith('-direction')) {
      const sign = [...attempt.events.slice(0, i + 1)].reverse().find((h) => h.step === 'compute' && h.part === e.part && h.sign)?.sign
      const detail = e.slip ? SLIP : sign ? signWords(sign) : undefined
      items.push({ at: e.at, text: actionWords(e.part ? actionNumber(problem, attempt, e.part) : null, detail) })
    }
  })

  const log = attempt.log ?? []
  log.forEach((e, i) => {
    if (e.kind === 'planLine' && e.shown) {
      // Right and shown: she picked her line from the valid ones a second «Підказка» showed.
      items.push({ at: e.at, text: `рядок плану ${e.line + 1}${e.right ? VIA_HINT : ''}` })
    } else if (e.kind === 'hint' && e.tap === 2 && e.step === 'plan') {
      const line = e.part?.startsWith('line-') ? e.part.slice(5) : null
      items.push({ at: e.at, text: line ? `рядок плану ${line}${VIA_HINT}` : `план${VIA_HINT}` })
    } else if (e.kind === 'result' && e.shown) {
      const tries = log.slice(0, i + 1).filter((r): r is Extract<LogEvent, { kind: 'result' }> => r.kind === 'result' && r.line === e.line)
      const sign = tries.reverse().find((r) => r.sign)?.sign
      const same = log.slice(i + 1).find((s): s is Extract<LogEvent, { kind: 'sameAction' }> => s.kind === 'sameAction' && s.line === e.line)
      const detail = sign ? signWords(sign) : same ? (same.slip ? SLIP : 'інша дія') : undefined
      items.push({ at: e.at, text: actionWords(e.line + 1, detail) })
    } else if (e.kind === 'hint' && e.tap === 2 && e.step === 'compute') {
      items.push({ at: e.at, text: `${actionWords(e.part ? actionNumber(problem, attempt, e.part) : null)}${VIA_HINT}` })
    }
  })

  const ordered = items.sort((a, b) => a.at.localeCompare(b.at)).map((item) => item.text)
  return [...new Set(ordered)]
}

function shownWords(items: readonly string[]): string {
  return items.length ? `показано ${items.join(', ')}` : 'без показу'
}

/** A problem's own attempts: the first pass (up to the first one she finished), its repeats, and the plays after it. */
function splitAttempts(attempts: readonly OwnAttempt[]) {
  const own = attempts.filter((a) => !a.repeat)
  const done = own.findIndex((a) => a.finishedAt)
  return {
    pass: done < 0 ? own : own.slice(0, done + 1),
    later: done < 0 ? [] : own.slice(done + 1),
    repeats: attempts.filter((a) => a.repeat),
  }
}

/** How the repeat of a missed problem went: still to come, without anything shown, or what was shown again. */
function repeatWords(problem: GuidedProblem | undefined, pass: readonly Attempt[], repeats: readonly Attempt[]): string {
  if (!pass.some((a) => a.finishedAt)) return 'задачу ще не завершено'
  if (!repeats.length) return 'повтор — ще попереду'
  const done = repeats.findIndex((a) => a.finishedAt)
  const played = done < 0 ? repeats : repeats.slice(0, done + 1)
  const items = [...new Set(played.flatMap((a) => shownItems(problem, a)))]
  if (done < 0) return items.length ? `повтор — ${shownWords(items)}, ще не завершено` : 'повтор — почато, ще не завершено'
  return items.length ? `повтор — знову ${shownWords(items)}` : 'повтор — без показу'
}

/** Her own attempts at the problem set, by problem. Homework is off the path, so it stays out of the summary. */
function byProblem(progress: Progress): [string, OwnAttempt[]][] {
  const groups = new Map<string, OwnAttempt[]>()
  for (const attempt of ownAttempts(progress)) {
    if (parseSlot(attempt.problemId)) groups.set(attempt.problemId, [...(groups.get(attempt.problemId) ?? []), attempt])
  }
  return [...groups].sort(([a], [b]) => compareSlots(a, b))
}

/**
 * «Де довелося показати», by level: one line per problem missed on its first
 * pass, with how its repeat went, and one per later play that was missed
 * («ще раз»), in problem-set order. Levels with nothing shown are left out.
 */
export function shownByLevel(progress: Progress, problems: readonly GuidedProblem[], dates: DateWords = dateWords()): LevelLines[] {
  const levels = new Map<number, SummaryLine[]>()
  for (const [id, attempts] of byProblem(progress)) {
    const problem = problems.find((p) => p.id === id)
    const title = titleOf(id, problem)
    const { pass, later, repeats } = splitAttempts(attempts)
    const lines: SummaryLine[] = []
    const missed = pass.filter(isMissed)
    if (missed.length) {
      const items = [...new Set(missed.flatMap((a) => shownItems(problem, a)))]
      lines.push({ problemId: id, title, when: dates.day(missed[0].startedAt), what: `${shownWords(items)}; ${repeatWords(problem, pass, repeats)}` })
    }
    for (const play of later.filter(isMissed)) {
      lines.push({ problemId: id, title, when: `${dates.day(play.startedAt)}, ще раз`, what: shownWords(shownItems(problem, play)) })
    }
    if (!lines.length) continue
    const level = parseSlot(id)?.level ?? problem?.level ?? 0
    levels.set(level, [...(levels.get(level) ?? []), ...lines])
  }
  return [...levels].sort(([a], [b]) => a - b).map(([level, lines]) => ({ level, lines }))
}

/** How a solo-choice play went, after her choice. */
function soloOutcome(problem: GuidedProblem | undefined, attempt: Attempt, choice: 'steps' | 'solo'): string[] {
  const log = attempt.log ?? []
  const shown = shownItems(problem, attempt)
  const parts: string[] = []
  if (choice === 'steps') {
    if (shown.length) parts.push(shownWords(shown))
    else if (attempt.finishedAt) parts.push('без показу')
    return parts
  }
  const switchAt = log.findIndex((e) => e.kind === 'soloSwitch')
  const switched = log[switchAt]
  if (switched?.kind !== 'soloSwitch') {
    if (attempt.finishedAt) parts.push('правильно')
    return parts
  }
  if (switched.reason === 'wrong') {
    const answer = log.find((e): e is Extract<LogEvent, { kind: 'soloAnswer' }> => e.kind === 'soloAnswer' && !e.right)
    parts.push(`відповідь ${answer ? `${answer.value} ` : ''}не зійшлася, далі крок за кроком`)
  } else {
    const ms = Date.parse(switched.at) - Date.parse(attempt.startedAt)
    const after = Number.isFinite(ms) ? ` через ${minutesWords(Math.max(0, Math.round(ms / 60_000)))}` : ''
    parts.push(`натиснула «Розбий на кроки»${after}`)
  }
  const stuck = firstMissAfter(log, switchAt)
  parts.push(stuck ? `на кроках перша підказка чи помилка — «${stepName(stuck)}»` : attempt.finishedAt ? 'на кроках без підказок і помилок' : '')
  if (shown.length) parts.push(shownWords(shown))
  return parts.filter(Boolean)
}

/**
 * Her solo tries: one line per play at 4.6, 4.7 or later where she chose
 * between «Крок за кроком» and «Спробую сама», oldest first, with how it
 * went and its minutes.
 */
export function soloLines(progress: Progress, problems: readonly GuidedProblem[], dates: DateWords = dateWords()): SummaryLine[] {
  return ownAttempts(progress).flatMap((attempt) => {
    const choice = attempt.log?.find((e) => e.kind === 'solo')
    if (choice?.kind !== 'solo') return []
    const problem = problems.find((p) => p.id === attempt.problemId)
    const name = choice.choice === 'solo' ? '«Спробую сама»' : '«Крок за кроком»'
    const outcome = soloOutcome(problem, attempt, choice.choice)
    const minutes = attemptMinutes(attempt)
    const what = [outcome.length ? `${name}: ${outcome[0]}` : name, ...outcome.slice(1), minutes === null ? 'не завершено' : minutesWords(minutes)]
    return [{ problemId: attempt.problemId, title: titleOf(attempt.problemId, problem), when: dates.day(attempt.startedAt), what: what.join('; ') }]
  })
}

export const SHOWN_TITLE = 'Де довелося показати'
export const SOLO_TITLE = 'Сама чи крок за кроком'
export const NO_OWN_ATTEMPTS = 'Її спроб ще немає.'
export const NOTHING_SHOWN = 'Поки немає: усе без показу.'
export const NO_SOLO = "Ще не було. Вибір з'являється в задачах 4.6 і 4.7, а після 4.7 — у кожній задачі."

/** True once she has an attempt of her own (not a stage-switch check, not from before the fading build). */
export function hasOwnAttempts(progress: Progress): boolean {
  return ownAttempts(progress).length > 0
}

/**
 * Every record as plain text, for the parent's weekly copy: the summary, then
 * each problem's attempts as «Для батьків» lists them. Problems never opened
 * are left out.
 */
export function recordsText(progress: Progress, problems: readonly GuidedProblem[], now: Date, dates: DateWords = dateWords()): string {
  const out: string[] = ['Тренажер задач — записи', `Скопійовано ${dates.full(now.toISOString())}. Записи зберігаються лише на тому пристрої, де вона грає.`, '']

  out.push(SHOWN_TITLE.toUpperCase())
  const levels = shownByLevel(progress, problems, dates)
  if (!hasOwnAttempts(progress)) out.push(NO_OWN_ATTEMPTS)
  else if (!levels.length) out.push(NOTHING_SHOWN)
  for (const { level, lines } of levels) out.push(`Рівень ${level}`, ...lines.map(summaryText))
  out.push('')

  out.push(SOLO_TITLE.toUpperCase())
  const solo = soloLines(progress, problems, dates)
  out.push(...(solo.length ? solo.map(summaryText) : [NO_SOLO]), '')

  out.push('УСІ СПРОБИ')
  const opened = Object.keys(progress.problems)
    .filter((id) => progress.problems[id]?.attempts.length)
    .sort(compareSlots)
  if (!opened.length) out.push('Ще жодної.')
  for (const id of opened) {
    const problem = problems.find((p) => p.id === id)
    out.push('', titleOf(id, problem))
    for (const attempt of progress.problems[id].attempts) {
      const heading = describeAttemptHeading(attempt, dates)
      out.push(`- ${heading.when}${heading.rest}`)
      if (!problem) continue
      if (attempt.events.length > 0 || !attempt.log?.length) out.push(`  ${describeHelp(problem, attempt)}`)
      out.push(...describeLog(problem, attempt).map((line) => `  ${line}`))
    }
  }
  return `${out.join('\n')}\n`
}
