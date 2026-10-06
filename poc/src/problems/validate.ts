/**
 * Checks a problem's data against itself, like `check-problem-set.py` does
 * for `problem-set.md`: the arithmetic, where each operand comes from, the
 * links between the text and the steps, the menus, the diagram slots and the
 * plan cards. Returns a list of what is off; empty means the data holds up.
 */
import { add, compare, divide, equals, formatDecimal, multiply, parseDecimal, subtract, type Decimal } from '../lib/decimal'
import { numbersIn } from './numbers'
import { checkRelationQuotes } from './validateRelations'
import { parseSlot } from './slots'
import { PROBLEM_TYPES, SIGNS, type Action, type Choice, type GuidedProblem, type Label, type Option, type ProblemTypeId, type SolutionPlan, type TableCell, type Writes } from './types'
import { planComplete, planWords, validNextLines } from '../fading/plan'
import { STAGES, stageOfSlot } from '../fading/stages'

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

/** An action's per-sign hints and its direction check. `types` are the problem's relations' types, when it lists them. */
function checkActionHelp(action: Action, where: string, errors: string[], types: readonly ProblemTypeId[]): void {
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
  if (!PROBLEM_TYPES.some((t) => t.id === check.relationType)) errors.push(`${where}: the direction check needs the relationType it belongs to`)
  else if (check.relationType === 'fraction') errors.push(`${where}: no direction check on «дріб від числа», where «менше» goes with multiplying`)
  else if (types.length && !types.includes(check.relationType)) errors.push(`${where}: the direction check's type «${check.relationType}» isn't one of the problem's relations`)
}

/** Her own plan, line by line: walking each plan in its own order, every line is a valid next line, and the last one ends a plan. */
function checkDerivedLines(plans: readonly SolutionPlan[], at: (where: string) => string, errors: string[]): void {
  plans.forEach((plan, p) => {
    const lines: string[] = []
    for (const action of plan.actions) {
      if (!validNextLines(plans, lines).includes(action.id)) {
        errors.push(at(`plan ${p + 1}: «${action.id}» isn't a valid next line after ${lines.join(', ') || 'nothing'}`))
        return
      }
      lines.push(action.id)
    }
    if (!planComplete(plans, lines)) errors.push(at(`plan ${p + 1}: its lines don't end a plan`))
  })
}

/** The short record's tags: the «?» line, and each comparison's two quantities for «Хто більший?». */
function checkTags(problem: GuidedProblem, at: (where: string) => string, errors: string[]): void {
  const lines = problem.writeUp.shortRecord
  if (!lines.some((line) => line.tag === 'asked')) errors.push(at("short record: no line is tagged 'asked'"))
  for (const line of lines) {
    if (line.tag === 'asked' && !line.text.includes('?')) errors.push(at(`short record «${line.id}»: tagged 'asked' but has no «?»`))
    if (line.tag === 'restated' && !line.compare) errors.push(at(`short record «${line.id}»: a restated line needs compare`))
    if (line.compare) {
      const { bigger, smaller } = line.compare
      if (!bigger?.trim() || !smaller?.trim()) errors.push(at(`short record «${line.id}»: compare needs both names`))
      else if (bigger.trim().toLowerCase() === smaller.trim().toLowerCase()) errors.push(at(`short record «${line.id}»: compare names the same quantity twice`))
    }
  }
}

/** The data covers every step its slot's stage prompts. */
function checkStageData(problem: GuidedProblem, comparisons: number, at: (where: string) => string, errors: string[]): void {
  const stage = STAGES[stageOfSlot(problem.id)]
  const { steps } = problem
  const has: Record<string, boolean> = {
    retell: !!steps.retell,
    asked: !!steps.asked,
    given: !!steps.given,
    decode: !!steps.decode || !comparisons,
    typeDiagram: !!steps.typeDiagram,
    plan: !!steps.plan,
    compute: true,
    answer: !!steps.answer,
  }
  for (const step of stage.prompted) {
    if (!has[step]) errors.push(at(`stage ${stage.label} prompts «${step}», but the problem has no data for it`))
  }
}

function slotsIn(label: Label | undefined | null): string[] {
  return label && typeof label === 'object' ? [label.slot] : []
}

function cellSlots(cell: TableCell): string[] {
  if (cell === null || typeof cell === 'string') return []
  return 'slot' in cell ? [cell.slot] : []
}

/** `homework`: one of her homework problems, which is off the path, so its id mustn't be a slot. */
export function validateProblem(problem: GuidedProblem, { homework = false } = {}): string[] {
  const errors: string[] = []
  const at = (where: string) => `${problem.id} ${where}`
  const { writeUp, steps } = problem

  // the slot, which gives the problem its stage
  const slot = parseSlot(problem.id)
  if (homework) {
    if (slot) errors.push(at('id: a homework problem must not take a problem-set slot'))
  } else if (!slot) errors.push(at('id: not a problem-set slot such as 2.3'))
  else if (slot.level !== problem.level) errors.push(at(`level ${problem.level} doesn't match the slot`))

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
  if (writeUp.plans.length) checkDerivedLines(writeUp.plans, at, errors)
  checkTags(problem, at, errors)
  const main = writeUp.plans[0]
  // A fraction's numerator 1 («1/4 усіх деталей») is never an action's term: dividing by 4 already finds a quarter.
  const unitNumerator = problem.text.some((part) => part.number && /(^|\D)1\/\d/.test(part.text))
  // A unit change uses the number it converts («2 кг = 2000 г» uses 2), as check-problem-set.py counts it.
  const converted = (writeUp.unitChanges ?? []).map((change) => numbersIn(change.line)[0] ?? '')
  for (const number of textNumbers) {
    if (unitNumerator && number === '1') continue
    if (converted.some((n) => sameNumber(n, number))) continue
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
  // A name in the answer («хто наловив більше») is hers to find: the plan line of the
  // action that finds the answer's number mustn't name either option before she computes.
  const names = writeUp.answerParts.flatMap((part) => (part.kind === 'name' ? part.options : []))
  const answerNumbers = writeUp.answerParts.flatMap((part) => (part.kind === 'number' ? [part.value] : []))
  for (const action of writeUp.plans.flatMap((plan) => plan.actions)) {
    if (!answerNumbers.some((n) => sameNumber(n, action.result))) continue
    const card = steps.plan?.cards.find((c) => c.id === action.id && !c.reason)
    const words = card?.text ?? planWords(action)
    const named = names.filter((name) => words.includes(name))
    if (named.length) errors.push(at(`plan line «${words}» names ${named.join(', ')} before she computes: give «${action.id}» its own \`line\``))
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
  const types = (steps.typeDiagram?.relations ?? []).map((relation) => relation.type)
  writeUp.plans.forEach((plan, p) => plan.actions.forEach((action, i) => checkActionHelp(action, at(`plan ${p + 1} ${i + 1})`), errors, types)))
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

  checkStageData(problem, comparisonIds.length, at, errors)

  if (problem.review.checks.length < 2 || problem.review.checks.length > 3) errors.push(at(`Розбір: ${problem.review.checks.length} checks, expected 2–3`))
  return errors
}
