/**
 * An attempt's records in words, for «Для батьків» and its text copy: the
 * heading line with its minutes, the guided steps' hints and shown answers,
 * and the paper steps' and the fading's records, one line each. Pure, no UI
 * code.
 */
import { isMissed } from '../fading/learner'
import { lineText } from '../fading/plan'
import { STAGES, type StageId } from '../fading/stages'
import type { Attempt, HelpEvent, LogEvent } from '../lib/progress'
import { relationQuote, typePartName } from '../guided/typeStep/typeChecks'
import { variantLabel } from '../guided/typeStep/variants'
import { PROBLEM_TYPES, STEP_NAMES, type GuidedProblem, type StepId } from '../problems/types'

const typeName = (id: string) => PROBLEM_TYPES.find((t) => t.id === id)?.name ?? id
export const stepName = (id: StepId) => STEP_NAMES[id] ?? id
const yesNo = (right: boolean) => (right ? 'так' : 'ні')

// ---------- the guided steps' hints and shown answers ----------

const PART_NAMES: Record<string, string> = {
  question: 'питання в тексті',
  unknown: 'що шукаємо',
  why: '«Чому?»',
  types: 'типи',
  diagram: 'схема',
}

/** The part of a step in words: the number, the comparison or the action itself. */
function partName(problem: GuidedProblem, step: StepId, part: string): string {
  if (PART_NAMES[part]) return PART_NAMES[part]
  if (part.startsWith('hidden-')) return 'приховане'
  if (step === 'typeDiagram' && part.startsWith('pick-')) {
    const relation = problem.steps.typeDiagram?.relations[Number(part.slice(5)) - 1]
    return relation ? `схема до «${relationQuote(relation)}»` : part
  }
  if (step === 'typeDiagram') return typePartName(problem.steps.typeDiagram?.relations ?? [], part) ?? part
  if (step === 'given') return `«${problem.text.find((p) => p.number === part)?.text ?? part}»`
  if (step === 'decode') {
    const id = part.replace(/-flip$/, '')
    const sentence = problem.steps.decode?.comparisons.find((c) => c.id === id)?.sentence ?? id
    return part.endsWith('-flip') ? `«${sentence}», від шуканого` : `«${sentence}», хто більший`
  }
  if (step === 'compute') {
    const id = part.replace(/-direction$/, '')
    const explanation = problem.writeUp.plans.flatMap((p) => p.actions).find((a) => a.id === id)?.explanation ?? id
    return part.endsWith('-direction') ? `${explanation}, більше чи менше` : explanation
  }
  return part
}

function helpName(event: HelpEvent): string {
  if (event.slip) return event.help === 'shown' ? 'помилка в обчисленні, показано' : 'помилка в обчисленні'
  return event.help === 'shown' ? 'показано відповідь' : 'підказка'
}

/** The guided steps' hints, shown answers and slips of an attempt, on one line. */
export function describeHelp(problem: GuidedProblem, attempt: Attempt): string {
  if (!attempt.events.length) return 'без підказок'
  return attempt.events
    .map((event) => {
      const part = event.part ? ` (${partName(problem, event.step, event.part)})` : ''
      const sign = event.sign ? `, знак «${event.sign}»` : ''
      return `${STEP_NAMES[event.step]}${part}: ${helpName(event)}${sign}`
    })
    .join('; ')
}

// ---------- minutes and the attempt's heading ----------

/** Whole minutes from opening the problem to its Розбір, pauses included. Null while unfinished. */
export function attemptMinutes(attempt: Attempt): number | null {
  if (!attempt.finishedAt) return null
  const ms = Date.parse(attempt.finishedAt) - Date.parse(attempt.startedAt)
  return Number.isFinite(ms) ? Math.max(0, Math.round(ms / 60_000)) : null
}

/** Minutes in words: «12 хв», «1 год 5 хв», «менше 1 хв». */
export function minutesWords(minutes: number): string {
  if (minutes < 1) return 'менше 1 хв'
  if (minutes < 60) return `${minutes} хв`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} год ${rest} хв` : `${hours} год`
}

/** Dates and times in the parent's words, in the device's time zone (`timeZone` for tests). */
export function dateWords(timeZone?: string) {
  const zone = timeZone ? { timeZone } : {}
  const full = new Intl.DateTimeFormat('uk-UA', { dateStyle: 'medium', timeStyle: 'short', ...zone })
  const clock = new Intl.DateTimeFormat('uk-UA', { timeStyle: 'short', ...zone })
  const day = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'short', ...zone })
  const calendarDay = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', ...zone })
  return {
    /** «5 жовт. 2026 р., 16:02» */
    full: (iso: string) => full.format(new Date(iso)),
    /** «16:02» */
    clock: (iso: string) => clock.format(new Date(iso)),
    /** «5 жовт.» */
    day: (iso: string) => day.format(new Date(iso)),
    sameDay: (a: string, b: string) => calendarDay.format(new Date(a)) === calendarDay.format(new Date(b)),
  }
}

export type DateWords = ReturnType<typeof dateWords>

/**
 * An attempt's heading: when she opened it, and the rest of the line, such as
 * « — розв'язано о 16:14, 12 хв, план 1, етап 2.1–2.4».
 */
export function describeAttemptHeading(attempt: Attempt, dates: DateWords = dateWords()): { when: string; rest: string } {
  const parts: string[] = []
  const minutes = attemptMinutes(attempt)
  if (attempt.finishedAt) {
    const at = dates.sameDay(attempt.startedAt, attempt.finishedAt) ? dates.clock(attempt.finishedAt) : dates.full(attempt.finishedAt)
    parts.push(`розв'язано о ${at}${minutes === null ? '' : `, ${minutesWords(minutes)}`}`)
  } else parts.push('не завершено')
  if (attempt.plan !== undefined) parts.push(`план ${attempt.plan + 1}`)
  if (attempt.variants?.typeDiagram) parts.push(`«Тип і схема»: ${variantLabel(attempt.variants.typeDiagram)}`)
  parts.push(...describePlay(attempt))
  return { when: dates.full(attempt.startedAt), rest: ` — ${parts.join(', ')}` }
}

// ---------- the paper steps' and the fading's records ----------

function checkName(check: string): string {
  if (check === 'units') return 'Короткий запис, одиниці біля чисел'
  if (check.startsWith('asked-')) return 'Короткий запис, шукане з «?»'
  if (check.startsWith('restated-')) return 'Короткий запис, порівняння від шуканого'
  if (check === 'diagram') return '«?» на схемі там, де шукане'
  if (check === 'answer') return 'Відповідь повним реченням'
  return check
}

/** The step where she first needed help after switching from her solo try. */
export function firstMissAfter(log: readonly LogEvent[], from: number): StepId | null {
  for (const e of log.slice(from + 1)) {
    if (e.step === 'start') continue
    if ('right' in e && e.right === false) return e.step
    if (e.kind === 'selfCheck' && !e.yes) return e.step
    if (e.kind === 'hint') return e.step
  }
  return null
}

export function describeLogEvent(problem: GuidedProblem, e: LogEvent, log: readonly LogEvent[] = [], index = 0): string {
  const shown = 'shown' in e && e.shown ? ', показано' : ''
  switch (e.kind) {
    case 'hint':
      return `Підказка, «${stepName(e.step as StepId)}»${e.part?.startsWith('line-') ? `, дія ${e.part.slice(5)}` : ''}: ${e.tap === 1 ? 'питання' : 'зразок'}`
    case 'planLine': {
      const label = `План, дія ${e.line + 1}: «${e.picked === 'other' ? 'Інше' : lineText(problem, e.picked)}»`
      if (e.right) return e.shown ? `${label} — показано через «Підказку»` : label
      return e.shown ? `${label} — не з першого разу, показано правильний рядок` : `${label} — не з першого разу`
    }
    case 'actionCount':
      return `Скільки дій у плані: ${e.value}${e.right ? '' : ' — не так'}${shown}`
    case 'result': {
      const label = `Обчисли, дія ${e.line + 1}`
      if (e.right) return `${label}: ${e.value} — так`
      if (e.sign) return `${label}, перевір знак: результат ${e.value} (знак «${e.sign}»)${e.shown ? ', показано дію' : ''}`
      return `${label}: ${e.value} — не сходиться${e.shown ? ', показано дію' : ''}`
    }
    case 'sameAction':
      return `Обчисли, дія ${e.line + 1}, «У тебе така сама дія?»: ${e.slip ? 'так, помилка в обчисленні' : 'ні, інша дія'}`
    case 'direction':
      return `Обчисли, дія ${e.line + 1}, більше чи менше: «${e.picked}» — ${yesNo(e.right)}${e.viaHint ? ' (через «Підказку»)' : ''}${shown}`
    case 'fade':
      return e.faded
        ? `Перевірку «більше чи менше» для «${typeName(e.relationType)}» прибрано: двічі поспіль правильно`
        : `Перевірка «більше чи менше» для «${typeName(e.relationType)}» повернулася: помилка зі знаком`
    case 'nextStep':
      if (e.right) return `Який крок далі: «${stepName(e.picked)}»`
      if (e.missing) return `Який крок далі: «${stepName(e.picked)}» — у задачі його немає`
      return `Який крок далі: «${stepName(e.picked)}» замість «${stepName(e.due)}»`
    case 'selfCheck':
      return `${checkName(e.check)}: ${yesNo(e.yes)}`
    case 'diagramPick':
      return `Яка схема в тебе: ${yesNo(e.right)}${shown}`
    case 'bigger':
      return `Що більше: «${e.picked}» — ${yesNo(e.right)}${shown}`
    case 'name':
      return `Відповідь, хто: «${e.picked}» — ${yesNo(e.right)}${shown}`
    case 'solo':
      return `Вибрала: «${e.choice === 'solo' ? 'Спробую сама' : 'Крок за кроком'}»`
    case 'soloAnswer':
      return `Розв'язувала сама: відповідь ${e.value} — ${e.right ? 'зійшлася' : 'не зійшлася'}`
    case 'soloSwitch': {
      const how = e.reason === 'wrong' ? 'після неправильної відповіді перейшла на кроки' : 'натиснула «Розбий на кроки»'
      const where = firstMissAfter(log, index)
      return `Розв'язувала сама: ${how}${where ? `; перша помилка чи підказка на кроках — «${stepName(where)}»` : ''}`
    }
    case 'stepSize':
      return e.size === 'big' ? 'План: тепер великі кроки (спершу весь план)' : 'План: знову малі кроки (по одній дії)'
  }
}

/** Every log record of an attempt, in words. */
export function describeLog(problem: GuidedProblem, attempt: Attempt): string[] {
  const log = attempt.log ?? []
  return log.map((e, i) => describeLogEvent(problem, e, log, i))
}

/** How the attempt played, for its heading: «етап 3.1–3.8, малі кроки, повтор». */
export function describePlay(attempt: Attempt): string[] {
  const words: string[] = []
  if (attempt.stage && attempt.stage in STAGES) words.push(`етап ${STAGES[attempt.stage as StageId].label}`)
  if (attempt.stepSize) words.push(attempt.stepSize === 'big' ? 'великі кроки' : 'малі кроки')
  if (attempt.repeat) words.push('повтор пропущеної задачі')
  if (attempt.switched) words.push('перевірка з перемикачем етапів')
  if (isMissed(attempt)) words.push('довелося показати')
  return words
}
