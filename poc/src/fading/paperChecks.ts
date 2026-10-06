/**
 * The checks on paper parts that need no data beyond the write-up's tags:
 * the short record's and the answer's yes/no self-checks, «Хто більший: X чи
 * Y?» from each restated comparison, and «Яка схема в тебе?» from the
 * relations' types. Pure functions, no UI code.
 */
import { familyOf, type TypeFamily } from '../problems/typeGuide'
import type { GuidedProblem, ProblemTypeId, RecordLine, WriteUp } from '../problems/types'
import { askedWords } from './plan'

/** A yes/no question beside the model. `id` names it in her records. */
export type SelfCheck = { id: string; question: string }

export const UNITS_CHECK: SelfCheck = { id: 'units', question: 'Біля кожного числа є одиниця?' }
export const DIAGRAM_CHECK: SelfCheck = { id: 'diagram', question: '«?» стоїть там, де шукане?' }

/** The short record's lines with the «?» of what the problem asks. */
export function askedLines(writeUp: WriteUp): RecordLine[] {
  return writeUp.shortRecord.filter((line) => line.tag === 'asked')
}

/**
 * The short record's comparisons, as written from the unknown's side, with
 * their two quantities: every line with `compare`. A line can be the asked line
 * and a comparison at once (1.1–1.3), so the tag alone doesn't say.
 */
export function restatedLines(writeUp: WriteUp): (RecordLine & { compare: { bigger: string; smaller: string } })[] {
  return writeUp.shortRecord.flatMap((line) => (line.compare ? [{ ...line, compare: line.compare }] : []))
}

/** A quantity's name as a button says it: «великий акваріум» becomes «Великий акваріум». */
export function capitalised(name: string): string {
  return name.charAt(0).toLocaleUpperCase('uk') + name.slice(1)
}

/** The short record's self-checks: the «?» line, the units, and each comparison from the unknown's side. */
export function recordSelfChecks(writeUp: WriteUp): SelfCheck[] {
  return [
    ...askedLines(writeUp).map((line) => ({ id: `asked-${line.id}`, question: `Шукане записане зі знаком «?»: «${line.text}»?` })),
    UNITS_CHECK,
    ...restatedLines(writeUp).map((line) => ({ id: `restated-${line.id}`, question: `Порівняння записане від шуканого: «${line.text}»?` })),
  ]
}

/** The answer's self-check. The asked quantity stays in the write-up's own words (nominative), so no case ending can go wrong. */
export function answerSelfCheck(problem: GuidedProblem): SelfCheck {
  return { id: 'answer', question: `Відповідь записана повним реченням про те, що шукали (${askedWords(problem)})?` }
}

export type BiggerQuestion = {
  /** The restated line's id. */
  line: string
  question: string
  /** The two quantities as the buttons say them, in a fixed order that doesn't give the answer away. */
  options: [string, string]
  /** One of `options`. */
  answer: string
  hint: string
  /** Said with the answer: the line as written from the unknown's side. */
  explain: string
}

const BIGGER_HINT = 'Знайди це порівняння в тексті задачі й перечитай його: хто з двох більший?'

/** Family words her problems use for people, besides names. */
const KIN = ['бабуся', 'дідусь', 'мама', 'тато', 'брат', 'сестра', 'онук', 'онука']

/** A person, as the short record names one: a name («Тарас») or a family word («бабуся»). Not «I день», «BC» or «вишні». */
export function isPerson(name: string): boolean {
  return /^[А-ЯІЇЄҐ][а-яіїєґ'’]+$/u.test(name) || KIN.includes(name.toLocaleLowerCase('uk'))
}

/**
 * «Що більше: AC чи BC?» for each comparison, once the decode is on paper
 * (4.4 on). The schedule's «Хто більший?» reads oddly for days, parcels and
 * masses, so the generated question asks «Що більше», and «Хто більше» when
 * both are people («Хто більше: Дарина чи Тарас?»), as 3.7's short record says it.
 */
export function biggerQuestions(problem: GuidedProblem): BiggerQuestion[] {
  return restatedLines(problem.writeUp).map((line) => {
    const { bigger, smaller } = line.compare
    const names = [bigger, smaller].sort((a, b) => a.localeCompare(b, 'uk'))
    const options = names.map(capitalised) as [string, string]
    const same = (a: readonly string[], b: readonly string[]) => [...a].map((x) => x.toLowerCase()).sort().join() === [...b].map((x) => x.toLowerCase()).sort().join()
    const decoded = problem.steps.decode?.comparisons.find((c) => same(c.bigger.options, names))
    return {
      line: line.id,
      question: `${names.every(isPerson) ? 'Хто' : 'Що'} більше: ${names[0]} чи ${names[1]}?`,
      options,
      answer: capitalised(bigger),
      hint: decoded?.bigger.hint ?? BIGGER_HINT,
      explain: `У короткому записі: «${line.text}».`,
    }
  })
}

/**
 * The comparisons as said from the unknown's side, for her short record in
 * Level 3, where the decode runs first: an inverted one restated, a plain one
 * as it reads.
 */
export function restatedSentences(problem: GuidedProblem): string[] {
  return (problem.steps.decode?.comparisons ?? []).map((c) => (c.flip ? c.flip.frame.replace('___', c.flip.answer) : c.sentence))
}

/**
 * «Яка схема в тебе?»: the sketches her diagram should hold, from the types of
 * the problem's relations. By type with the «Схеми» version of Тип і схема,
 * whose six sketches she knows; by family (three sketches) with the others.
 */
export function diagramPickAnswer(problem: GuidedProblem, byType: boolean): (ProblemTypeId | TypeFamily)[] {
  const types = (problem.steps.typeDiagram?.relations ?? []).map((relation) => relation.type)
  return [...new Set(byType ? types : types.map(familyOf))]
}

/** Her picks against the right sketches: the hint says whether one is missing or one is extra. */
export function diagramPickHint(right: readonly string[], picked: readonly string[]): string {
  if (right.some((r) => !picked.includes(r))) return 'Подивись на кожен зв\'язок у задачі: на схемі має бути видно кожен. Чого бракує?'
  return 'Чи є в задачі такий зв\'язок? Перечитай її.'
}
