/**
 * Checks a problem's data against itself, like `check-problem-set.py` does
 * for `problem-set.md`: the arithmetic, where each operand comes from, the
 * links between the text and the steps, the menus, the diagram slots and the
 * plan cards. Returns a list of what is off; empty means the data holds up.
 */
import { add, compare, divide, equals, formatDecimal, multiply, parseDecimal, subtract, type Decimal } from '../lib/decimal'
import { numbersIn } from './numbers'
import { checkRelationQuotes } from './validateRelations'
import { SIGNS, type Action, type Choice, type GuidedProblem, type Label, type Option, type SolutionPlan, type TableCell, type Writes } from './types'

function oneRight(options: readonly Option[], where: string, errors: string[]): void {
  const right = options.filter((option) => 'right' in option).length
  if (right !== 1) errors.push(`${where}: ${right} right options, expected exactly 1`)
}

function compute(action: Action): Decimal | null {
  const values = action.terms.map(parseDecimal)
  if (values.some((v) => v === null) || values.length < 2) return null
  const [first, ...rest] = values as Decimal[]
  switch (action.sign) {
    case '+':
      return rest.reduce(add, first)
    case '−':
      return rest.reduce(subtract, first)
    case '·':
      return rest.reduce(multiply, first)
    case ':':
      return values.length === 2 ? divide(first, rest[0]) : null
  }
}

function sameNumber(a: string, b: string): boolean {
  const x = parseDecimal(a)
  const y = parseDecimal(b)
  return x !== null && y !== null && equals(x, y)
}

/** True if both lists hold the same items, in any order. */
function sameItems(a: readonly string[], b: readonly string[]): boolean {
  return [...a].sort().join() === [...b].sort().join()
}

/** The indexes of every action that must come before `index`, directly or not. */
function allPrerequisites(actions: readonly Action[], index: number): Set<number> {
  const found = new Set<number>()
  const visit = (i: number) => {
    const direct = actions[i].needs?.map((n) => n - 1) ?? Array.from({ length: i }, (_, k) => k)
    for (const d of direct) {
      if (!found.has(d)) {
        found.add(d)
        visit(d)
      }
    }
  }
  visit(index)
  return found
}

function checkPlan(problem: GuidedProblem, plan: SolutionPlan, label: string, base: string[], errors: string[]): void {
  const ids = plan.actions.map((a) => a.id)
  if (new Set(ids).size !== ids.length) errors.push(`${label}: two actions find the same quantity (${ids.join(', ')})`)
  plan.actions.forEach((action, i) => {
    const where = `${label} ${i + 1})`
    for (const n of action.needs ?? []) {
      if (n < 1 || n > i) errors.push(`${where}: needs ${n}), which isn't an earlier action`)
    }
    const value = compute(action)
    const expression = action.terms.join(` ${action.sign} `)
    if (!value) {
      errors.push(`${where}: ${expression} doesn't give an exact result`)
    } else {
      const written = formatDecimal(value)
      if (!sameNumber(written, action.result)) errors.push(`${where}: ${expression} is ${written}, not ${action.result}`)
      else if (written !== action.result) errors.push(`${where}: write the result as ${written}`)
    }
    const available = [...base, ...[...allPrerequisites(plan.actions, i)].map((k) => plan.actions[k].result)]
    for (const term of action.terms) {
      if (!available.some((a) => sameNumber(a, term))) errors.push(`${where}: ${term} is not a number from the text, a unit change, or a result it needs`)
    }
    if (problem.steps.plan && !problem.steps.plan.cards.some((card) => card.id === action.id)) errors.push(`${where}: no plan card for «${action.id}»`)
  })
}

/** An action's per-sign hints and its direction check. */
function checkActionHelp(action: Action, where: string, errors: string[]): void {
  if (action.signHints) {
    if (action.signHints[action.sign] !== undefined) errors.push(`${where}: a sign hint for «${action.sign}», the action's own sign`)
    const missing = SIGNS.filter((sign) => sign !== action.sign && !action.signHints![sign]?.trim())
    if (missing.length) errors.push(`${where}: no sign hint for ${missing.map((sign) => `«${sign}»`).join(', ')}`)
  }
  const check = action.direction
  if (!check) return
  if (!check.question.includes('більше чи менше') || !check.question.endsWith('?')) errors.push(`${where}: the direction question must hold «більше чи менше» and end with «?»`)
  if (!numbersIn(check.question).some((n) => sameNumber(n, check.comparedWith))) errors.push(`${where}: the direction question doesn't hold ${check.comparedWith}`)
  const result = parseDecimal(action.result)
  const than = parseDecimal(check.comparedWith)
  if (result && than) {
    const truth = compare(result, than)
    if (truth === 0) errors.push(`${where}: the result ${action.result} equals ${check.comparedWith}, so it is neither more nor less`)
    else if ((truth > 0 ? 'більше' : 'менше') !== check.answer) errors.push(`${where}: ${action.result} isn't «${check.answer}» than ${check.comparedWith}`)
  }
  if (!check.hint.trim() || !check.explain.trim()) errors.push(`${where}: the direction check needs a hint and an explanation`)
}

function slotsIn(label: Label | undefined | null): string[] {
  return label && typeof label === 'object' ? [label.slot] : []
}

function cellSlots(cell: TableCell): string[] {
  if (cell === null || typeof cell === 'string') return []
  return 'slot' in cell ? [cell.slot] : []
}

export function validateProblem(problem: GuidedProblem): string[] {
  const errors: string[] = []
  const at = (where: string) => `${problem.id} ${where}`
  const { writeUp, steps } = problem

  // the text
  const numberIds = problem.text.flatMap((part) => (part.number ? [part.number] : []))
  if (new Set(numberIds).size !== numberIds.length) errors.push(at('text: a number id is used twice'))
  const textNumbers = problem.text.flatMap((part) => (part.number ? numbersIn(part.text) : []))
  const base = [...textNumbers, ...(writeUp.unitChanges ?? []).map((change) => change.value)]

  // the write-up
  const lineIds = writeUp.shortRecord.map((line) => line.id)
  if (new Set(lineIds).size !== lineIds.length) errors.push(at('short record: a line id is used twice'))
  if (!writeUp.plans.length) errors.push(at('write-up: no plans'))
  writeUp.plans.forEach((plan, p) => checkPlan(problem, plan, at(`plan ${p + 1}`), base, errors))
  const main = writeUp.plans[0]
  for (const number of textNumbers) {
    if (main && !main.actions.some((a) => a.terms.some((t) => sameNumber(t, number)))) errors.push(at(`plan 1: doesn't use ${number} from the text`))
  }
  for (const part of writeUp.answerParts) {
    if (part.kind === 'number') {
      writeUp.plans.forEach((plan, p) => {
        if (!plan.actions.some((a) => sameNumber(a.result, part.value))) errors.push(at(`plan ${p + 1}: never finds the answer ${part.value}`))
      })
      if (!writeUp.answer.includes(part.value)) errors.push(at(`«${writeUp.answer}» doesn't hold ${part.value}`))
    } else if (!part.options.includes(part.value)) errors.push(at(`answer: «${part.value}» isn't one of its options`))
  }
  if (!writeUp.answer.startsWith('Відповідь: ')) errors.push(at('the answer line must start with «Відповідь: »'))

  // menus and writes
  const record: Record<string, string> = {}
  const write = (writes: Writes, where: string) => {
    for (const id of [...Object.keys(writes.drafts ?? {}), ...(writes.writes ?? [])]) {
      if (!lineIds.includes(id)) errors.push(at(`${where}: writes «${id}», which isn't a short-record line`))
    }
    Object.assign(record, writes.drafts)
    for (const id of writes.writes ?? []) record[id] = writeUp.shortRecord.find((l) => l.id === id)?.text ?? ''
  }
  const choice = (c: Choice | undefined, where: string) => {
    if (!c) return
    oneRight(c.options, at(where), errors)
    write(c, where)
  }

  choice(steps.retell, 'Перекажи')
  if (steps.asked) {
    if (!problem.text.some((part) => part.question)) errors.push(at('Знайти: no part of the text is marked as the question'))
    choice(steps.asked.choice, 'Знайти')
  }
  if (steps.given) {
    const labelled = steps.given.numbers.map((n) => n.number)
    if (!sameItems(labelled, numberIds)) errors.push(at(`Відомо: labels ${labelled.join(', ')} but the text has ${numberIds.join(', ')}`))
    for (const n of steps.given.numbers) {
      oneRight(n.options, at(`Відомо ${n.number}`), errors)
      write(n, `Відомо ${n.number}`)
    }
    steps.given.hidden?.forEach((h, i) => choice(h, `Відомо, hidden ${i + 1}`))
  }
  const comparisonIds = [...new Set(problem.text.flatMap((part) => part.comparisons ?? []))]
  if (steps.decode) {
    const decoded = steps.decode.comparisons.map((c) => c.id)
    if (!sameItems(decoded, comparisonIds)) errors.push(at(`Порівняння: decodes ${decoded.join(', ')} but the text marks ${comparisonIds.join(', ')}`))
    for (const c of steps.decode.comparisons) {
      if (!c.bigger.options.includes(c.bigger.answer)) errors.push(at(`Порівняння ${c.id}: «${c.bigger.answer}» isn't an option`))
      if (c.flip && !c.flip.options.includes(c.flip.answer)) errors.push(at(`Порівняння ${c.id}: «${c.flip.answer}» isn't an option`))
      if (c.flip && !c.flip.frame.includes('___')) errors.push(at(`Порівняння ${c.id}: the frame has no ___`))
      write(c, `Порівняння ${c.id}`)
    }
    choice(steps.decode.why, 'Порівняння, Чому?')
  }
  if (steps.typeDiagram) {
    const { relations, diagram } = steps.typeDiagram
    if (!relations.length) errors.push(at('Тип і схема: no relations'))
    errors.push(...checkRelationQuotes(problem.text, relations).map((error) => at(`Тип і схема: ${error}`)))
    const used = diagram.diagrams.flatMap((d) => {
      switch (d.family) {
        case 'bars':
          return [...d.rows.flatMap((row) => [...row.pieces.flatMap((piece) => slotsIn(piece.label)), ...slotsIn(row.end)]), ...slotsIn(d.total)]
        case 'parts':
          return [...d.above.flatMap((a) => slotsIn(a.label)), ...slotsIn(d.whole.label)]
        case 'table':
          return d.rows.flatMap((row) => row.cells.flatMap(cellSlots))
      }
    })
    if (!sameItems(used, Object.keys(diagram.slots))) errors.push(at(`Тип і схема: the diagrams use slots ${used.join(', ')} but the answers cover ${Object.keys(diagram.slots).join(', ')}`))
    for (const [slot, chip] of Object.entries(diagram.slots)) {
      if (!diagram.chips.includes(chip)) errors.push(at(`Тип і схема: slot ${slot} needs «${chip}», which isn't a chip`))
    }
  }
  if (steps.plan) {
    const cardIds = steps.plan.cards.map((c) => c.id)
    if (new Set(cardIds).size !== cardIds.length) errors.push(at('План: a card id is used twice'))
    const actionIds = new Set(writeUp.plans.flatMap((p) => p.actions.map((a) => a.id)))
    for (const card of steps.plan.cards) {
      if (!card.reason && !actionIds.has(card.id)) errors.push(at(`План: card «${card.id}» is no plan's action and has no reason`))
      if (card.reason && actionIds.has(card.id)) errors.push(at(`План: card «${card.id}» is an action but has a reason`))
    }
    if (!steps.plan.cards.some((card) => card.reason)) errors.push(at('План: no distractor card'))
    choice(steps.plan.why, 'План, Чому?')
  }
  const computeGuided = (problem.guidance?.compute?.mode ?? 'guided') === 'guided'
  if (computeGuided) {
    writeUp.plans.forEach((plan, p) =>
      plan.actions.forEach((action, i) => {
        if (!action.hint) errors.push(at(`plan ${p + 1} ${i + 1}): Обчисли is prompted but the action has no hint`))
      }),
    )
  }
  writeUp.plans.forEach((plan, p) => plan.actions.forEach((action, i) => checkActionHelp(action, at(`plan ${p + 1} ${i + 1})`), errors)))
  choice(steps.answer, 'Відповідь')
  const answerSentence = writeUp.answer.replace(/^Відповідь: /, '').toLowerCase()
  if (steps.answer && !steps.answer.options.some((o) => 'right' in o && o.text.toLowerCase() === answerSentence)) {
    errors.push(at('Відповідь: the right sentence differs from the write-up\'s «Відповідь»'))
  }

  // the steps that are there write the whole short record
  if (steps.asked && steps.given && (steps.decode || !comparisonIds.length)) {
    for (const line of writeUp.shortRecord) {
      if (record[line.id] !== line.text) errors.push(at(`short record: the steps end with «${record[line.id] ?? '(nothing)'}» for «${line.text}»`))
    }
  }

  if (problem.review.checks.length < 2 || problem.review.checks.length > 3) errors.push(at(`Розбір: ${problem.review.checks.length} checks, expected 2–3`))
  return errors
}
